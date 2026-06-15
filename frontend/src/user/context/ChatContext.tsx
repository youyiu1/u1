import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Message, ChatPartner } from '../types';
import { chatApi, userApi } from '../services/api';
import { useAuth } from './AuthContext';
import { getToken } from '../services/api';

interface ChatContextType {
  isChatOpen: boolean;
  openChat: (partner?: ChatPartner) => void;
  closeChat: () => void;
  activePartner: ChatPartner | null;
  partners: ChatPartner[];
  messages: Record<string, Message[]>;
  sendMessage: (partnerId: string, text: string, messageType?: string, mediaUrl?: string) => Promise<void>;
  unreadCount: number;
  unreadMessages: Record<string, number>;
  markChatRead: (partnerId: string) => void;
  refreshConversations: () => void;
  receiveMessage: (message: Message) => void;
  chatOpenTick: number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activePartner, setActivePartner] = useState<ChatPartner | null>(null);
  const [partners, setPartners] = useState<ChatPartner[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [unreadMessages, setUnreadMessages] = useState<Record<string, number>>({});
  const [chatOpenTick, setChatOpenTick] = useState(0);

  // 计算总未读数
  const unreadCount = Object.values(unreadMessages).reduce((a: number, b: number) => a + b, 0);

  const buildLastMessagePreview = useCallback((msg?: Message) => {
    if (!msg) {
      return '';
    }
    if (msg.messageType === 'image') {
      return '[图片]';
    }
    return (msg.content || msg.text || '').trim();
  }, []);

  // 加载指定会话
  const loadConversation = useCallback(async (partnerId: string) => {
    if (!user?.id) return;
    try {
      const msgs = await chatApi.getConversation(partnerId);
      setMessages(prev => ({ ...prev, [partnerId]: msgs }));
    } catch (err) {
      console.error('Failed to load conversation:', err);
    }
  }, [user?.id]);

  // 标记会话已读
  const markChatRead = useCallback(async (partnerId: string) => {
    if (!user?.id) return;
    try {
      await chatApi.markConversationRead(partnerId);
      setUnreadMessages(prev => ({ ...prev, [partnerId]: 0 }));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  }, [user?.id]);

  // 加载会话列表
  const refreshConversations = useCallback(async () => {
    if (!user?.id) return;
    try {
      const allMessages = await chatApi.getConversations();
      const conversationMap = new Map<string, { partner: ChatPartner; lastMsg: Message; unread: number }>();

      allMessages.forEach((msg: Message) => {
        const partnerId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
        if (!partnerId) return;
        const existing = conversationMap.get(partnerId);
        if (!existing || new Date(msg.createTime) > new Date(existing.lastMsg.createTime)) {
          const isUnread = msg.receiverId === user.id && !msg.isRead;
          conversationMap.set(partnerId, {
            partner: { id: partnerId, name: '', avatar: '' },
            lastMsg: msg,
            unread: isUnread ? 1 : 0,
          });
        } else if (msg.receiverId === user.id && !msg.isRead) {
          existing.unread += 1;
        }
      });

      const conversationEntries = Array.from(conversationMap.values());
      const partnerList = await Promise.all(
        conversationEntries.map(async (conv) => {
          const partner = { ...conv.partner };
          try {
            let partnerUser;
            try {
              partnerUser = await userApi.getUser(partner.id);
            } catch {
              // 如果按 ID 查不到，就尝试把 ID 当用户名查询，兼容旧数据
              partnerUser = await userApi.getUserByName(partner.id);
            }
            partner.name = partnerUser.name;
            partner.avatar = partnerUser.avatar;
            partner.isOnline = partnerUser.isOnline || false;
            partner.lastMessage = buildLastMessagePreview(conv.lastMsg);
          } catch (e) {
            console.error('Failed to get partner info:', e);
            partner.lastMessage = buildLastMessagePreview(conv.lastMsg);
          }
          return partner;
        })
      );
      const unreadMap: Record<string, number> = {};
      conversationEntries.forEach((conv) => {
        unreadMap[conv.partner.id] = conv.unread;
      });

      setPartners(partnerList);
      setUnreadMessages(unreadMap);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  }, [buildLastMessagePreview, user?.id]);

  const receiveMessage = useCallback((message: Message) => {
    if (!user?.id) {
      return;
    }

    const partnerId = message.senderId === user.id ? message.receiverId : message.senderId;
    if (!partnerId) {
      return;
    }

    setMessages((prev) => {
      const current = prev[partnerId] || [];
      if (current.some((item) => item.id === message.id)) {
        return prev;
      }
      return {
        ...prev,
        [partnerId]: [...current, message],
      };
    });

    if (message.receiverId === user.id) {
      const isActiveConversation = isChatOpen && activePartner?.id === partnerId;
      if (!isActiveConversation) {
        setUnreadMessages((prev) => ({
          ...prev,
          [partnerId]: (prev[partnerId] || 0) + 1,
        }));
      } else {
        void chatApi.markConversationRead(partnerId).catch(() => {
          // Ignore mark-read failures; the message is still visible locally.
        });
      }
    }

    setPartners((prev) => {
      const preview = buildLastMessagePreview(message);
      const existing = prev.find((partner) => partner.id === partnerId);
      if (existing) {
        return [
          {
            ...existing,
            lastMessage: preview,
          },
          ...prev.filter((partner) => partner.id !== partnerId),
        ];
      }
      return [
        {
          id: partnerId,
          name: partnerId,
          avatar: '',
          isOnline: true,
          lastMessage: preview,
        },
        ...prev,
      ];
    });

    void refreshConversations();
  }, [activePartner?.id, buildLastMessagePreview, isChatOpen, refreshConversations, user?.id]);

  const getOrCreateConversation = useCallback(async (partner: ChatPartner): Promise<ChatPartner | null> => {
    if (!user?.id) return null;
    try {
      const allMessages = await chatApi.getConversations();
      const existingConv = allMessages.find((msg: Message) => {
        const partnerId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
        return partnerId === partner.id;
      });

      let partnerUser;
      try {
        partnerUser = await userApi.getUser(partner.id);
      } catch {
        partnerUser = await userApi.getUserByName(partner.id);
      }

      const fullPartner: ChatPartner = {
        id: partner.id,
        name: partnerUser.name || partner.name,
        avatar: partnerUser.avatar || partner.avatar,
        isOnline: partnerUser.isOnline || false,
        lastMessage: buildLastMessagePreview(existingConv),
      };

      return fullPartner;
    } catch (err) {
      console.error('Failed to get or create conversation:', err);
      return partner;
    }
  }, [buildLastMessagePreview, user?.id]);

  // 打开聊天
  const openChat = useCallback(async (partner?: ChatPartner) => {
    if (!getToken()) return; // 未登录不打开聊天
    setIsChatOpen(true);
    setActivePartner(partner || null);
    setChatOpenTick(prev => prev + 1);

    if (!partner) {
      await refreshConversations();
      return;
    }

    if (partner) {
      setMessages(prev => ({ ...prev, [partner.id]: prev[partner.id] || [] }));
      const convPartner = await getOrCreateConversation(partner);
      if (convPartner) {
        setActivePartner(convPartner);
        markChatRead(convPartner.id);
        loadConversation(convPartner.id);
      }
    }
  }, [markChatRead, loadConversation, getOrCreateConversation, refreshConversations]);

  const closeChat = () => {
    setIsChatOpen(false);
    setActivePartner(null);
  };

  useEffect(() => {
    if (activePartner && isChatOpen && getToken()) {
      loadConversation(activePartner.id);
    }
  }, [activePartner, isChatOpen, loadConversation]);

  const sendMessage = async (partnerId: string, text: string, messageType = 'text', mediaUrl = '') => {
    if (!user?.id) return;
    try {
      const newMsg = await chatApi.sendMessage(partnerId, text, messageType, mediaUrl);
      setMessages(prev => ({
        ...prev,
        [partnerId]: [...(prev[partnerId] || []), newMsg]
      }));
      refreshConversations();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <ChatContext.Provider value={{
      isChatOpen,
      openChat,
      closeChat,
      activePartner,
      partners,
      messages,
      sendMessage,
      unreadCount,
      unreadMessages,
      markChatRead,
      refreshConversations,
      receiveMessage,
      chatOpenTick,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

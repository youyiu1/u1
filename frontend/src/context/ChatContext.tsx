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

  const scheduleBackgroundRefresh = useCallback((task: () => void) => {
    if (typeof globalThis === 'undefined') {
      task();
      return () => {};
    }
    const scope = globalThis as typeof globalThis & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
      setTimeout: (handler: () => void, timeout?: number) => ReturnType<typeof setTimeout>;
      clearTimeout: (id: ReturnType<typeof setTimeout>) => void;
    };
    if (typeof scope.requestIdleCallback === 'function') {
      const idleId = scope.requestIdleCallback(() => task(), { timeout: 1800 });
      return () => scope.cancelIdleCallback?.(idleId);
    }
    const timer = scope.setTimeout(task, 300);
    return () => scope.clearTimeout(timer);
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
            partner.lastMessage = conv.lastMsg.content;
          } catch (e) {
            console.error('Failed to get partner info:', e);
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
  }, [user?.id]);

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
        lastMessage: existingConv?.content || '',
      };

      return fullPartner;
    } catch (err) {
      console.error('Failed to get or create conversation:', err);
      return partner;
    }
  }, [user?.id]);

  // 打开聊天
  const openChat = useCallback(async (partner?: ChatPartner) => {
    if (!getToken()) return; // 未登录不打开聊天
    setIsChatOpen(true);
    setActivePartner(partner || null);
    setChatOpenTick(prev => prev + 1);

    if (partner) {
      setMessages(prev => ({ ...prev, [partner.id]: prev[partner.id] || [] }));
      const convPartner = await getOrCreateConversation(partner);
      if (convPartner) {
        setActivePartner(convPartner);
        markChatRead(convPartner.id);
        loadConversation(convPartner.id);
      }
    }
  }, [markChatRead, loadConversation, getOrCreateConversation]);

  const closeChat = () => {
    setIsChatOpen(false);
    setActivePartner(null);
  };

  // 初始化加载会话列表，仅在用户已登录且存在 token 时执行
  useEffect(() => {
    if (!user?.id || !getToken()) return;
    const cancel = scheduleBackgroundRefresh(() => {
      refreshConversations();
    });
    return cancel;
  }, [user?.id, refreshConversations, scheduleBackgroundRefresh]);

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

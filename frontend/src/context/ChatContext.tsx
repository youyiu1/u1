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
  sendMessage: (partnerId: string, text: string) => void;
  unreadCount: number;
  unreadMessages: Record<string, number>;
  markChatRead: (partnerId: string) => void;
  refreshConversations: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activePartner, setActivePartner] = useState<ChatPartner | null>(null);
  const [partners, setPartners] = useState<ChatPartner[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [unreadMessages, setUnreadMessages] = useState<Record<string, number>>({});

  // 计算总未读数
  const unreadCount = Object.values(unreadMessages).reduce((a: number, b: number) => a + b, 0);

  // 加载指定对话
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

      // 获取每个伙伴的用户信息
      const partnerList: ChatPartner[] = [];
      const unreadMap: Record<string, number> = {};
      for (const conv of conversationMap.values()) {
        try {
          const partnerUser = await userApi.getUser(conv.partner.id);
          conv.partner.name = partnerUser.name;
          conv.partner.avatar = partnerUser.avatar;
          conv.partner.lastMessage = conv.lastMsg.content;
        } catch (e) {
          console.error('Failed to get partner info:', e);
        }
        partnerList.push(conv.partner);
        unreadMap[conv.partner.id] = conv.unread;
      }

      setPartners(partnerList);
      setUnreadMessages(unreadMap);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  }, [user?.id]);

  // 打开聊天
  const openChat = useCallback((partner?: ChatPartner) => {
    if (!getToken()) return; // 未登录不打开聊天
    if (partner) {
      setActivePartner(partner);
      markChatRead(partner.id);
      setIsChatOpen(true);
      loadConversation(partner.id);
    } else if (partners.length > 0) {
      // 无参数时自动选择第一个会话
      const firstPartner = partners[0];
      setActivePartner(firstPartner);
      markChatRead(firstPartner.id);
      setIsChatOpen(true);
      loadConversation(firstPartner.id);
    } else {
      setIsChatOpen(true);
    }
  }, [partners, markChatRead, loadConversation]);

  const closeChat = () => {
    setIsChatOpen(false);
    setActivePartner(null);
  };

  // 初始加载会话列表（仅当用户已登录且有token时）
  useEffect(() => {
    if (user?.id && getToken()) {
      refreshConversations();
    }
  }, [user?.id, refreshConversations]);

  // 当 activePartner 改变时加载对话
  useEffect(() => {
    if (activePartner && isChatOpen && getToken()) {
      loadConversation(activePartner.id);
    }
  }, [activePartner, isChatOpen, loadConversation]);

  const sendMessage = async (partnerId: string, text: string) => {
    if (!user?.id) return;
    try {
      const newMsg = await chatApi.sendMessage(partnerId, text);
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
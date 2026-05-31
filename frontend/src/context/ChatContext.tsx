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

  // 璁＄畻鎬绘湭璇绘暟
  const unreadCount = Object.values(unreadMessages).reduce((a: number, b: number) => a + b, 0);

  // 鍔犺浇鎸囧畾瀵硅瘽
  const loadConversation = useCallback(async (partnerId: string) => {
    if (!user?.id) return;
    try {
      const msgs = await chatApi.getConversation(partnerId);
      setMessages(prev => ({ ...prev, [partnerId]: msgs }));
    } catch (err) {
      console.error('Failed to load conversation:', err);
    }
  }, [user?.id]);

  // 鏍囪浼氳瘽宸茶
  const markChatRead = useCallback(async (partnerId: string) => {
    if (!user?.id) return;
    try {
      await chatApi.markConversationRead(partnerId);
      setUnreadMessages(prev => ({ ...prev, [partnerId]: 0 }));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  }, [user?.id]);

  // 鍔犺浇浼氳瘽鍒楄〃
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

      const partnerList: ChatPartner[] = [];
      const unreadMap: Record<string, number> = {};
      for (const conv of conversationMap.values()) {
        try {
          let partnerUser;
          try {
            partnerUser = await userApi.getUser(conv.partner.id);
          } catch {
            // 濡傛灉鐢↖D鏌ヤ笉鍒帮紝灏濊瘯鐢↖D褰撶敤鎴峰悕鏌ワ紙鍏煎鏃ф暟鎹級
            partnerUser = await userApi.getUserByName(conv.partner.id);
          }
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
  }, [user?.id, refreshConversations]);

  // 鎵撳紑鑱婂ぉ
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
  }, [partners, markChatRead, loadConversation, getOrCreateConversation, refreshConversations]);

  const closeChat = () => {
    setIsChatOpen(false);
    setActivePartner(null);
  };

  // 鍒濆鍔犺浇浼氳瘽鍒楄〃锛堜粎褰撶敤鎴峰凡鐧诲綍涓旀湁token鏃讹級
  useEffect(() => {
    if (user?.id && getToken()) {
      refreshConversations();
    }
  }, [user?.id, refreshConversations]);

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

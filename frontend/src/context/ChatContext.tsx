import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Message, ChatPartner } from '../types';

interface ChatContextType {
  isChatOpen: boolean;
  openChat: (partner?: ChatPartner) => void;
  closeChat: () => void;
  activePartner: ChatPartner | null;
  partners: ChatPartner[];
  messages: Record<string, Message[]>; // Key is partner ID
  sendMessage: (partnerId: string, text: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activePartner, setActivePartner] = useState<ChatPartner | null>(null);
  
  // Mock partners data
  const [partners] = useState<ChatPartner[]>([
    { id: '1', name: '王阿姨', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wang', lastMessage: '那件衣服还有吗？', isOnline: true },
    { id: '2', name: '小李', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=li', lastMessage: '谢谢你的帮助！', isOnline: false },
    { id: '3', name: '装修张师傅', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhang', lastMessage: '明天上门可以吗？', isOnline: true },
  ]);

  const [messages, setMessages] = useState<Record<string, Message[]>>({
    '1': [
      { id: 'm1', senderId: '1', text: '你好，请问那件自拍相机还在吗？', timestamp: '10:30' },
      { id: 'm2', senderId: 'me', text: '你好，还在的。', timestamp: '10:32' },
    ]
  });

  const openChat = (partner?: ChatPartner) => {
    if (partner) {
      setActivePartner(partner);
    } else if (!activePartner && partners.length > 0) {
      setActivePartner(partners[0]);
    }
    setIsChatOpen(true);
  };

  const closeChat = () => setIsChatOpen(false);

  const sendMessage = (partnerId: string, text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => ({
      ...prev,
      [partnerId]: [...(prev[partnerId] || []), newMessage]
    }));

    // Mock auto-reply
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        senderId: partnerId,
        text: '收到，由于是演示环境，我会假装在回复你。😉',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => ({
        ...prev,
        [partnerId]: [...(prev[partnerId] || []), reply]
      }));
    }, 1500);
  };

  return (
    <ChatContext.Provider value={{
      isChatOpen,
      openChat,
      closeChat,
      activePartner,
      partners,
      messages,
      sendMessage
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

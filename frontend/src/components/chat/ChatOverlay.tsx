import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Send,
  Smile,
  Image as ImageIcon,
  Search,
  MessageSquare,
  ChevronLeft
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';

export const ChatOverlay: React.FC = () => {
  const { isChatOpen, closeChat, activePartner, partners, messages, sendMessage, openChat, unreadMessages } = useChat();
  const { user } = useContext(AuthContext);
  const [inputText, setInputText] = useState('');
  const [showContacts, setShowContacts] = useState(true);
  const [switchingPartnerId, setSwitchingPartnerId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 每次打开聊天面板时重置为会话列表
  useEffect(() => {
    if (isChatOpen) {
      setShowContacts(true);
    }
  }, [isChatOpen]);

  const currentMessages = useMemo(
    () => (activePartner ? (messages[activePartner.id] || []) : []),
    [activePartner, messages]
  );

  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [currentMessages.length, isChatOpen]);

  useEffect(() => {
    if (activePartner?.id && switchingPartnerId === activePartner.id && Object.prototype.hasOwnProperty.call(messages, activePartner.id)) {
      setSwitchingPartnerId(null);
    }
  }, [activePartner?.id, messages, switchingPartnerId]);

  const handleSend = () => {
    if (inputText.trim() && activePartner) {
      sendMessage(activePartner.id, inputText);
      setInputText('');
    }
  };

  const handleSelectContact = (partner: typeof partners[0]) => {
    setSwitchingPartnerId(partner.id);
    openChat(partner);
    setShowContacts(false);
  };

  const handleBack = () => {
    setShowContacts(true);
  };

  return (
    <AnimatePresence>
      {isChatOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-end p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="absolute inset-0 bg-ink/25"
            onClick={closeChat}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full sm:max-w-md h-[72vh] max-h-[580px] sm:h-[560px] bg-white rounded-[32px] sm:rounded-[40px] shadow-2xl overflow-hidden pointer-events-auto border border-hairline flex flex-col transform-gpu will-change-transform contain-layout"
          >
        {/* Header */}
        <header className="p-6 border-b border-hairline flex items-center justify-between bg-white/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {(!showContacts && activePartner) && (
              <button
                onClick={handleBack}
                className="p-2 hover:bg-surface-soft rounded-xl transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            {activePartner && !showContacts && (
              <img src={activePartner.avatar || undefined} className="w-8 h-8 rounded-xl object-cover border border-hairline" alt="" />
            )}
            <div>
              <h3 className="text-xl font-black text-ink">
                {showContacts ? '消息' : activePartner?.name}
              </h3>
              {!showContacts && activePartner && (
                <p className={`text-[10px] font-black uppercase tracking-widest ${activePartner.isOnline ? 'text-green-500' : 'text-muted'}`}>
                  {activePartner.isOnline ? '当前在线' : '离线'}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={closeChat}
            className="p-2 hover:bg-surface-soft rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Content */}
        {showContacts ? (
          <>
            {/* Search */}
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  placeholder="搜索邻里..."
                  className="w-full bg-stone-50 border-none rounded-2xl py-2.5 pl-10 pr-4 text-xs font-medium focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Contact List */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1 overscroll-contain">
              {partners.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
                  <div className="w-16 h-16 bg-surface-soft rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 text-muted" />
                  </div>
                  <p className="text-sm font-black text-ink mb-1">暂无消息</p>
                  <p className="text-[11px] text-muted font-medium">点击沟通按钮即可开始对话</p>
                </div>
              ) : (
                partners.slice(0, 60).map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectContact(p)}
                    className="w-full flex items-center gap-4 p-4 rounded-3xl transition-all hover:bg-stone-50"
                  >
                    <div className="relative">
                      <img src={p.avatar || undefined} className="w-12 h-12 rounded-2xl object-cover border border-hairline" alt="" />
                      {p.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-sm font-black truncate">{p.name}</p>
                      <p className="text-[10px] text-muted font-medium truncate mt-0.5">
                        {p.lastMessage}
                      </p>
                    </div>
                    {unreadMessages[p.id] > 0 && (
                      <span className="w-5 h-5 bg-accent-green text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                        {unreadMessages[p.id]}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            {/* Message List */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-5 overscroll-contain">
              {switchingPartnerId ? (
                <div className="h-full flex items-center justify-center text-xs font-bold text-muted">
                  加载对话中...
                </div>
              ) : currentMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs font-bold text-muted">
                  暂无聊天记录
                </div>
              ) : currentMessages.slice(-80).map((msg) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] space-y-1 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className={`px-5 py-3.5 rounded-[24px] text-sm font-medium shadow-sm leading-relaxed ${
                        isMe
                          ? 'bg-primary text-white rounded-tr-none'
                          : 'bg-stone-100 text-ink rounded-tl-none'
                      }`}>
                        {msg.content || msg.text}
                      </div>
                      <span className="text-[9px] font-black text-muted uppercase tracking-widest px-2">
                        {msg.createTime ? new Date(msg.createTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <footer className="p-6 pt-2">
              <div className="bg-stone-50 rounded-[32px] border border-hairline focus-within:bg-white focus-within:shadow-premium focus-within:border-primary/20 transition-all p-4">
                <div className="flex items-center gap-2 mb-2 px-2">
                  <button className="p-2 text-muted hover:text-primary transition-colors">
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-muted hover:text-primary transition-colors">
                    <Smile className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-end gap-3">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="发送你的邻里温情..."
                    className="flex-1 bg-transparent border-none p-2 focus:ring-0 text-sm font-medium placeholder:text-muted/40 min-h-[44px] max-h-32 resize-none no-scrollbar"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputText.trim()}
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                      inputText.trim()
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'bg-hairline text-muted opacity-50'
                    }`}
                  >
                    <Send className="w-5 h-5 ml-0.5" />
                  </button>
                </div>
              </div>
            </footer>
          </>
        )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

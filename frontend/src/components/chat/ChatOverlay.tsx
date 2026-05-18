import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Send, 
  Smile, 
  Image as ImageIcon, 
  MoreHorizontal, 
  Search,
  MessageSquare,
  ChevronLeft
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';

export const ChatOverlay: React.FC = () => {
  const { isChatOpen, closeChat, activePartner, partners, messages, sendMessage, openChat } = useChat();
  const [inputText, setInputText] = useState('');
  const [showContacts, setShowContacts] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [messages, isChatOpen]);

  const handleSend = () => {
    if (inputText.trim() && activePartner) {
      sendMessage(activePartner.id, inputText);
      setInputText('');
    }
  };

  if (!isChatOpen) return null;

  const currentMessages = activePartner ? (messages[activePartner.id] || []) : [];

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none flex items-end justify-center sm:items-center sm:justify-end p-4 sm:p-8">
      <div className="absolute inset-0 bg-ink/10 backdrop-blur-[2px] pointer-events-auto" onClick={closeChat} />
      
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        className="relative w-full max-w-lg h-[85vh] sm:h-[600px] bg-white rounded-[40px] shadow-2xl overflow-hidden pointer-events-auto border border-hairline flex flex-col sm:flex-row"
      >
        {/* Mobile Contact Sidebar Overlay (Simplified as state-driven component) */}
        <AnimatePresence>
          {(showContacts || !activePartner) && (
            <motion.div 
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="absolute inset-0 z-20 bg-white sm:relative sm:w-64 sm:border-r sm:border-hairline flex flex-col"
            >
              <div className="p-6 border-b border-hairline flex items-center justify-between">
                <h3 className="text-xl font-black text-ink">消息</h3>
                <button 
                  onClick={closeChat}
                  className="p-2 hover:bg-surface-soft rounded-full transition-colors sm:hidden"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
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
              <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
                {partners.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      openChat(p);
                      setShowContacts(false);
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all ${
                      activePartner?.id === p.id 
                        ? 'bg-primary/5 border border-primary/10' 
                        : 'hover:bg-stone-50 border border-transparent'
                    }`}
                  >
                    <div className="relative">
                      <img src={p.avatar} className="w-12 h-12 rounded-2xl object-cover border border-hairline" alt="" />
                      {p.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className={`text-sm font-black truncate ${activePartner?.id === p.id ? 'text-primary' : 'text-ink'}`}>
                        {p.name}
                      </p>
                      <p className="text-[10px] text-muted font-medium truncate mt-0.5">
                        {p.lastMessage}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {activePartner ? (
            <>
              {/* Chat Header */}
              <header className="p-6 border-b border-hairline flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setShowContacts(true)}
                    className="sm:hidden p-2 hover:bg-stone-50 rounded-xl transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-3">
                    <img src={activePartner.avatar} className="w-10 h-10 rounded-xl object-cover border border-hairline" alt="" />
                    <div>
                      <h4 className="text-sm font-black text-ink">{activePartner.name}</h4>
                      <p className="text-[10px] text-green-500 font-black uppercase tracking-widest">
                        {activePartner.isOnline ? '当前在线' : '离线'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                   <button className="p-2.5 text-muted hover:bg-surface-soft rounded-xl transition-colors">
                     <MoreHorizontal className="w-5 h-5" />
                   </button>
                   <button 
                    onClick={closeChat}
                    className="hidden sm:flex p-2.5 text-muted hover:bg-surface-soft rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </header>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
                {currentMessages.map((msg, idx) => {
                  const isMe = msg.senderId === 'me';
                  return (
                    <motion.div 
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] space-y-1 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div className={`px-5 py-3.5 rounded-[24px] text-sm font-medium shadow-sm leading-relaxed ${
                          isMe 
                            ? 'bg-primary text-white rounded-tr-none' 
                            : 'bg-stone-100 text-ink rounded-tl-none'
                        }`}>
                          {msg.text}
                        </div>
                        <span className="text-[9px] font-black text-muted uppercase tracking-widest px-2">
                          {msg.timestamp}
                        </span>
                      </div>
                    </motion.div>
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
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSend}
                      disabled={!inputText.trim()}
                      className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                        inputText.trim() 
                          ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                          : 'bg-hairline text-muted opacity-50'
                      }`}
                    >
                      <Send className="w-5 h-5 ml-0.5" />
                    </motion.button>
                  </div>
                </div>
              </footer>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-6">
              <div className="w-20 h-20 bg-surface-soft rounded-full flex items-center justify-center text-primary/30">
                <MessageSquare className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-ink">你的消息中心</h3>
                <p className="text-sm text-secondary font-medium">选择一位邻里开始一段有温度的对话</p>
              </div>
              <button 
                onClick={() => setShowContacts(true)}
                className="px-8 py-3 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20"
              >
                查看联系人
              </button>
              <button 
                onClick={closeChat}
                className="p-2 text-muted hover:text-ink font-black text-[10px] uppercase tracking-widest"
              >
                退出聊天
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

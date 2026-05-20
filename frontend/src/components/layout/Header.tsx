/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Store,
  Plus,
  ChevronRight,
  X,
  MessageSquare,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useChat } from '../../context/ChatContext';
import { PublishOverlay } from '../publish/PublishOverlay';
import { HeaderSearch } from './HeaderSearch';
import { HeaderNotifications } from './HeaderNotifications';
import { HeaderUserMenu } from './HeaderUserMenu';
import { useAuthCheck } from '../../context/useAuthCheck';

const NAV_ITEMS = [
  { name: '首页', path: '/' },
  { name: '生活服务', path: '/service' },
  { name: '闲置交易', path: '/market' },
  { name: '同城动态', path: '/news' },
];

export default function Header() {
  const location = useLocation();
  const { openChat, unreadCount } = useChat();
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { requireAuth } = useAuthCheck();

  const handlePublish = () => {
    requireAuth(() => setIsPublishModalOpen(true));
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-hairline shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 md:px-12 h-16 md:h-20 flex items-center justify-between gap-4 md:gap-8">
          {/* Left: Logo & Nav Together */}
          <div className="flex items-center gap-8 shrink-0">
            <Link to="/" className="flex items-center gap-2 text-primary font-bold">
              <div className="w-9 h-9 md:w-10 md:h-10 bg-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center">
                <Store className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <span className="text-lg md:xl tracking-tight hidden xs:block font-extrabold text-ink">同城生活</span>
            </Link>

            {/* Nav: Progressive disclosure */}
            <nav className="hidden lg:flex items-center gap-1 transition-all duration-300">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative px-4 h-10 flex items-center text-sm font-bold transition-all rounded-xl group ${
                      isActive ? 'text-primary' : 'text-secondary hover:text-ink'
                    }`}
                  >
                    <span className="relative z-10 transition-colors duration-300 group-hover:scale-105 active:scale-95 inline-block">
                      {item.name}
                    </span>
                    
                    {/* Hover Background Pill */}
                    <div className="absolute inset-0 bg-surface-soft rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 pointer-events-none" />

                    {/* Active Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 30,
                          mass: 1
                        }}
                        className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full z-20 shadow-[0_2px_8px_rgba(255,54,92,0.4)]"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-1 items-center justify-end gap-2 md:gap-4 h-full min-w-0">
            <HeaderSearch />

            <button
              onClick={handlePublish}
              className="shrink-0 flex items-center gap-1.5 px-4 md:px-5 py-2 md:py-2.5 bg-primary text-white rounded-xl md:rounded-2xl text-[11px] md:text-xs font-bold hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden lg:inline">发布</span>
            </button>

            <div className="h-6 w-px bg-hairline hidden sm:block" />

            <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
              <button
                onClick={() => openChat()}
                className="hidden sm:flex p-2.5 rounded-2xl text-secondary hover:bg-surface-soft hover:text-primary transition-all relative"
              >
                <MessageSquare className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-accent-green text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              <div className="hidden sm:block">
                <HeaderNotifications />
              </div>
              <HeaderUserMenu />

              {/* Mobile menu toggle */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-2xl text-secondary hover:bg-surface-soft transition-all active:scale-90"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isMobileMenuOpen ? 'close' : 'open'}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </motion.div>
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 top-[64px] md:top-[80px] bg-ink/20 backdrop-blur-sm z-40 lg:hidden"
              />
              
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute top-full left-0 right-0 bg-white border-t border-hairline shadow-2xl z-50 lg:hidden"
              >
                <nav className="p-4 md:p-6 space-y-1">
                  {NAV_ITEMS.map((item, idx) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <motion.div
                        key={item.path}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Link
                          to={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center justify-between px-6 py-4 rounded-2xl transition-all ${
                            isActive ? 'bg-primary/5 text-primary' : 'text-secondary active:bg-surface-soft'
                          }`}
                        >
                          <span className="text-sm font-black uppercase tracking-widest">{item.name}</span>
                          <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'translate-x-1' : ''}`} />
                        </Link>
                      </motion.div>
                    );
                  })}
                  
                  <div className="pt-4 mt-4 border-t border-hairline/50 grid grid-cols-2 gap-3">
                    <motion.button 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      onClick={() => { openChat(); setIsMobileMenuOpen(false); }}
                      className="flex flex-col items-center justify-center p-4 bg-surface-soft rounded-2xl gap-2 hover:bg-hairline transition-colors active:scale-95"
                    >
                      <MessageSquare className="w-5 h-5 text-secondary" />
                      <span className="text-[10px] font-black uppercase text-secondary tracking-widest">消息</span>
                    </motion.button>
                    
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.25 }}
                      className="flex flex-col items-center justify-center p-4 bg-surface-soft rounded-2xl gap-2 hover:bg-hairline transition-colors"
                    >
                      <HeaderNotifications />
                      <span className="text-[10px] font-black uppercase text-secondary tracking-widest">通知中心</span>
                    </motion.div>
                  </div>
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>
      <PublishOverlay isOpen={isPublishModalOpen} onClose={() => setIsPublishModalOpen(false)} />
    </>
  );
}

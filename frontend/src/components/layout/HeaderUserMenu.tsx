import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User as UserIcon, Settings, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { getToken } from '../../services/api';
import { getFallbackAvatar } from '../../utils/avatar';

export const HeaderUserMenu: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const fallbackAvatar = getFallbackAvatar(user?.name);

  // 同时检查 user 和 token
  const isLoggedIn = isAuthenticated && !!getToken();

  if (!isLoggedIn) {
    return (
      <div className="flex items-center gap-2">
        <Link to="/login">
          <button className="px-4 py-2.5 text-xs font-black uppercase tracking-widest text-secondary hover:text-primary transition-colors">
            登录
          </button>
        </Link>
        <Link to="/register">
          <button className="px-5 py-2.5 bg-ink text-white rounded-2xl text-xs font-bold hover:bg-primary transition-all active:scale-95 shadow-lg shadow-ink/10">
            开启旅程
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        onClick={() => setShowUserMenu(!showUserMenu)}
        className="flex items-center gap-3 p-1 pr-3 rounded-2xl hover:bg-surface-soft transition-all cursor-pointer group border border-transparent hover:border-hairline"
      >
        <div className="w-10 h-10 rounded-xl bg-surface-soft border border-hairline overflow-hidden shadow-sm">
          <img
            src={user?.avatar || fallbackAvatar}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = fallbackAvatar;
            }}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            alt="Profile"
          />
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-black text-ink leading-tight">{user?.name || '用户'}</span>
          <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{user?.tag || '新邻里'}</span>
        </div>
      </div>
      
      <AnimatePresence>
        {showUserMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-56 bg-white border border-hairline rounded-[32px] shadow-premium z-20 p-3 overflow-hidden"
            >
              <div className="px-4 py-3 mb-2 border-b border-hairline">
                <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Account</p>
                <p className="text-sm font-black text-ink truncate">{user?.email}</p>
              </div>

              <Link 
                to="/profile"
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-soft rounded-2xl transition-colors text-sm font-bold text-secondary hover:text-ink group"
                onClick={() => setShowUserMenu(false)}
              >
                <UserIcon className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                个人中心
              </Link>

              <Link 
                to="/profile?tab=settings"
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-soft rounded-2xl transition-colors text-sm font-bold text-secondary hover:text-ink group"
                onClick={() => setShowUserMenu(false)}
              >
                <Settings className="w-4 h-4 text-muted group-hover:rotate-45 transition-transform" />
                系统设置
              </Link>

              <div className="my-2 h-px bg-hairline" />

              <button 
                onClick={() => {
                  logout();
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 rounded-2xl transition-colors text-sm font-bold text-red-500 group"
              >
                <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                安全退出
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

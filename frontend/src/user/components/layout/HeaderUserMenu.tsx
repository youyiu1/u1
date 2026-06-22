import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User as UserIcon, Settings, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { getFallbackAvatar } from '../../utils/avatar';

export const HeaderUserMenu: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const fallbackAvatar = getFallbackAvatar(user?.name);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-2">
        <Link to="/login">
          <button className="px-4 py-2.5 text-xs font-black uppercase tracking-widest text-secondary transition-colors hover:text-primary">
            登录
          </button>
        </Link>
        <Link to="/register">
          <button className="rounded-2xl bg-ink px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-ink/10 transition-all hover:bg-primary active:scale-95">
            立即注册
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        onClick={() => setShowUserMenu(!showUserMenu)}
        className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-transparent p-1 pr-3 transition-all hover:border-hairline hover:bg-surface-soft"
      >
        <div className="h-10 w-10 overflow-hidden rounded-xl border border-hairline bg-surface-soft shadow-sm">
          <img
            src={user.avatar || fallbackAvatar}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = fallbackAvatar;
            }}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            alt="Profile"
          />
        </div>
        <div className="hidden flex-col text-left sm:flex">
          <span className="text-xs font-black leading-tight text-ink">{user.name || '用户'}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted">{user.tag || '同城居民'}</span>
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
              className="theme-card absolute right-0 z-20 mt-3 w-56 overflow-hidden rounded-[32px] p-3 shadow-premium"
            >
              <div className="mb-2 border-b border-hairline px-4 py-3">
                <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted">Account</p>
                <p className="truncate text-sm font-black text-ink">{user.email}</p>
              </div>

              <Link
                to="/profile"
                className="group flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-bold text-secondary transition-colors hover:bg-surface-soft hover:text-ink"
                onClick={() => setShowUserMenu(false)}
              >
                <UserIcon className="h-4 w-4 text-primary transition-transform group-hover:scale-110" />
                个人中心
              </Link>

              <Link
                to="/profile?tab=settings"
                className="group flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-bold text-secondary transition-colors hover:bg-surface-soft hover:text-ink"
                onClick={() => setShowUserMenu(false)}
              >
                <Settings className="h-4 w-4 text-muted transition-transform group-hover:rotate-45" />
                系统设置
              </Link>

              <div className="my-2 h-px bg-hairline" />

              <button
                onClick={() => {
                  void logout();
                  setShowUserMenu(false);
                }}
                className="group flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-bold text-red-500 transition-colors hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                安全退出
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

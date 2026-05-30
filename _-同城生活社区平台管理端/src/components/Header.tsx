/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NotificationItem, User, Dynamic, Goods, Service, Order } from '../types';

interface HeaderProps {
  username: string;
  notifications: NotificationItem[];
  onToggleNotificationRead: (id: string) => void;
  onLogout: () => void;
  onNavigateToNotifications: () => void;
  onNavigate?: (path: string, filter?: string) => void;
  users?: User[];
  dynamics?: Dynamic[];
  goods?: Goods[];
  services?: Service[];
  orders?: Order[];
  onRefresh?: () => void;
}

export default function Header({
  username,
  notifications,
  onToggleNotificationRead,
  onLogout,
  onNavigateToNotifications,
  onNavigate,
  users = [],
  dynamics = [],
  goods = [],
  services = [],
  orders = [],
  onRefresh
}: HeaderProps) {
  const [showNoticeMenu, setShowNoticeMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Calculate unread count automatically
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Search filtering logic across data registries
  const matchedUsers = searchQuery.trim()
    ? users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const matchedDynamics = searchQuery.trim()
    ? dynamics.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()) || d.author.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const matchedGoods = searchQuery.trim()
    ? goods.filter(g => g.title.toLowerCase().includes(searchQuery.toLowerCase()) || g.sellerName.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const matchedServices = searchQuery.trim()
    ? services.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.providerName.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const matchedOrders = searchQuery.trim()
    ? orders.filter(o => o.id.toLowerCase().includes(searchQuery.toLowerCase()) || o.buyerName.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const hasResults = matchedUsers.length > 0 || matchedDynamics.length > 0 || matchedGoods.length > 0 || matchedServices.length > 0 || matchedOrders.length > 0;

  const handleRefreshClick = () => {
    setIsRotating(true);
    if (onRefresh) {
      onRefresh();
    }
    setTimeout(() => {
      setIsRotating(false);
    }, 800);
  };

  return (
    <header className="bg-surface-container-lowest h-16 border-b border-outline-variant/30 flex items-center justify-between px-6 sticky top-0 z-30 select-none">
      
      {/* Connection Indicator Badge */}
      <div className="flex items-center gap-3">
        <span className="text-secondary/60 text-xs font-semibold select-none bg-surface-background border border-outline-variant/15 px-2.5 py-1 rounded font-data-mono hidden sm:inline-block">
          IP: LOCALHOST:3000
        </span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* Search Input Box & Refresh Page Button */}
        <div className="relative">
          <div className="relative flex items-center w-64 md:w-80">
            <span className="material-symbols-outlined absolute left-3 text-secondary/60 text-[18px] pointer-events-none">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              placeholder="搜索用户、动态、商品、服务..."
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-full py-1.5 pl-9 pr-8 text-xs text-on-surface placeholder-outline focus:outline-none focus:border-primary/50 focus:bg-surface-container-lowest transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-outline hover:text-on-surface cursor-pointer border-none bg-transparent flex items-center justify-center p-0"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Search Dropdown Popover */}
          <AnimatePresence>
            {showSearchDropdown && (
              <>
                <div className="fixed inset-0 z-40 cursor-default" onClick={() => setShowSearchDropdown(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  className="absolute right-0 mt-2 w-[340px] md:w-[420px] bg-surface-container-lowest border border-outline-variant/30 shadow-2xl rounded-xl max-h-[360px] overflow-y-auto z-50 p-3 text-on-surface text-left"
                >
                  {!searchQuery.trim() ? (
                    <div className="space-y-2">
                      <p className="text-[10px] text-outline font-bold uppercase tracking-wider px-2 select-none">快速导航</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { name: '控制台概览', path: '/admin/dashboard', icon: 'dashboard' },
                          { name: '用户管理', path: '/admin/users', icon: 'group' },
                          { name: '动态内容管理', path: '/admin/posts', icon: 'chat' },
                          { name: '市民市场商品', path: '/admin/market', icon: 'shopping_bag' },
                          { name: '同城便民服务', path: '/admin/services', icon: 'handyman' },
                          { name: '交易订单核账', path: '/admin/orders', icon: 'receipt_long' },
                        ].map((link) => (
                          <button
                            key={link.path}
                            onClick={() => {
                              if (onNavigate) onNavigate(link.path);
                              setShowSearchDropdown(false);
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs hover:bg-primary/5 text-secondary hover:text-primary transition-all text-left w-full border-none bg-transparent cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[15px]">{link.icon}</span>
                            <span>{link.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {/* Search results */}
                      {!hasResults && (
                        <p className="text-center text-xs text-outline py-4 select-none">无匹配的搜索结果</p>
                      )}

                      {/* Matched Users */}
                      {matchedUsers.length > 0 && (
                        <div>
                          <p className="text-[10px] text-primary font-bold uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1 select-none">
                            <span className="material-symbols-outlined text-[12px]">group</span>
                            匹配用户 ({matchedUsers.length})
                          </p>
                          <div className="space-y-0.5">
                            {matchedUsers.slice(0, 3).map(u => (
                              <button
                                key={u.id}
                                onClick={() => {
                                  if (onNavigate) onNavigate('/admin/users');
                                  setShowSearchDropdown(false);
                                  setSearchQuery('');
                                }}
                                className="w-full text-left px-2 py-1 rounded-lg text-xs hover:bg-surface-container-low flex justify-between items-center transition-all cursor-pointer border-none bg-transparent"
                              >
                                <span className="font-semibold text-on-surface truncate">{u.name}</span>
                                <span className="text-[10px] text-outline font-data-mono truncate max-w-[150px]">{u.email}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Matched Dynamics */}
                      {matchedDynamics.length > 0 && (
                        <div>
                          <p className="text-[10px] text-primary font-bold uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1 select-none">
                            <span className="material-symbols-outlined text-[12px]">chat</span>
                            匹配社区动态 ({matchedDynamics.length})
                          </p>
                          <div className="space-y-0.5">
                            {matchedDynamics.slice(0, 3).map(d => (
                              <button
                                key={d.id}
                                onClick={() => {
                                  if (onNavigate) onNavigate('/admin/posts');
                                  setShowSearchDropdown(false);
                                  setSearchQuery('');
                                }}
                                className="w-full text-left px-2 py-1 rounded-lg text-xs hover:bg-surface-container-low flex flex-col transition-all cursor-pointer border-none bg-transparent text-left"
                              >
                                <span className="text-on-surface truncate w-full">{d.title}</span>
                                <span className="text-[9px] text-outline mt-0.5">作者: {d.author}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Matched Goods */}
                      {matchedGoods.length > 0 && (
                        <div>
                          <p className="text-[10px] text-primary font-bold uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1 select-none">
                            <span className="material-symbols-outlined text-[12px]">shopping_bag</span>
                            匹配市民商品 ({matchedGoods.length})
                          </p>
                          <div className="space-y-0.5">
                            {matchedGoods.slice(0, 3).map(g => (
                              <button
                                key={g.id}
                                onClick={() => {
                                  if (onNavigate) onNavigate('/admin/market');
                                  setShowSearchDropdown(false);
                                  setSearchQuery('');
                                }}
                                className="w-full text-left px-2 py-1 rounded-lg text-xs hover:bg-surface-container-low flex justify-between items-center transition-all cursor-pointer border-none bg-transparent"
                              >
                                <span className="text-on-surface truncate mr-2 flex-1">{g.title}</span>
                                <span className="text-[10px] text-status-normal font-bold font-data-mono">¥{g.price}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Matched Services */}
                      {matchedServices.length > 0 && (
                        <div>
                          <p className="text-[10px] text-primary font-bold uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1 select-none">
                            <span className="material-symbols-outlined text-[12px]">handyman</span>
                            匹配便民服务 ({matchedServices.length})
                          </p>
                          <div className="space-y-0.5">
                            {matchedServices.slice(0, 3).map(s => (
                              <button
                                key={s.id}
                                onClick={() => {
                                  if (onNavigate) onNavigate('/admin/services');
                                  setShowSearchDropdown(false);
                                  setSearchQuery('');
                                }}
                                className="w-full text-left px-2 py-1 rounded-lg text-xs hover:bg-surface-container-low flex flex-col transition-all cursor-pointer border-none bg-transparent text-left"
                              >
                                <span className="text-on-surface truncate w-full">{s.title}</span>
                                <span className="text-[9px] text-outline mt-0.5">提供者: {s.providerName}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Matched Orders */}
                      {matchedOrders.length > 0 && (
                        <div>
                          <p className="text-[10px] text-primary font-bold uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1 select-none">
                            <span className="material-symbols-outlined text-[12px]">receipt_long</span>
                            匹配交易订单 ({matchedOrders.length})
                          </p>
                          <div className="space-y-0.5">
                            {matchedOrders.slice(0, 3).map(o => (
                              <button
                                key={o.id}
                                onClick={() => {
                                  if (onNavigate) onNavigate('/admin/orders', o.id);
                                  setShowSearchDropdown(false);
                                  setSearchQuery('');
                                }}
                                className="w-full text-left px-2 py-1 rounded-lg text-xs hover:bg-surface-container-low flex justify-between items-center transition-all cursor-pointer border-none bg-transparent"
                              >
                                <span className="text-on-surface font-data-mono truncate mr-2">{o.id}</span>
                                <span className="text-[10px] text-outline truncate">{o.buyerName} | ¥{o.price}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic rotating refresh button */}
        <button
          onClick={handleRefreshClick}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-outline-variant/15 text-secondary hover:text-on-surface transition-colors cursor-pointer border-none bg-transparent focus:outline-none"
          title="刷新数据"
        >
          <span className={`material-symbols-outlined text-[20px] ${isRotating ? 'animate-spin' : ''}`}>
            refresh
          </span>
        </button>

        {/* Interactive Notification Alert Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNoticeMenu(!showNoticeMenu)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-outline-variant/15 text-secondary hover:text-on-surface transition-colors cursor-pointer relative focus:outline-none"
          >
            <span className="material-symbols-outlined text-[23px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-4 h-4 bg-status-error text-white font-data-mono text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Alert Dropdown content menu drawer */}
          <AnimatePresence>
            {showNoticeMenu && (
              <>
                {/* Close handler shield */}
                <div className="fixed inset-0 z-40 cursor-default" onClick={() => setShowNoticeMenu(false)} />
                
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.95 }}
                  className="absolute right-0 mt-2.5 w-80 bg-surface-container-lowest border border-outline-variant/30 shadow-2xl rounded-xl overflow-hidden z-50 text-on-surface"
                >
                  <div className="px-4 py-3 bg-surface-container-low/50 border-b border-outline-variant/15 flex items-center justify-between">
                    <span className="font-headline-sm text-headline-sm font-bold flex items-center gap-1">
                      <span>通知提醒</span>
                      <span className="font-data-mono text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                        {unreadCount} 条未读
                      </span>
                    </span>
                    <button
                      onClick={() => {
                        onNavigateToNotifications();
                        setShowNoticeMenu(false);
                      }}
                      className="text-primary font-semibold text-xs hover:underline cursor-pointer border-none bg-transparent"
                    >
                      查看全部
                    </button>
                  </div>

                  {/* Bulletins lists query */}
                  <div className="max-h-[260px] overflow-y-auto divide-y divide-outline-variant/10">
                    {notifications.length === 0 ? (
                      <p className="p-6 text-center text-xs text-outline">暂无系统通知</p>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          className={`p-3.5 hover:bg-surface-container-low transition-colors text-left flex gap-2.5 relative ${
                            !item.read ? 'bg-primary-fixed/15 font-semibold' : ''
                          }`}
                        >
                          <span className={`material-symbols-outlined text-[16px] mt-0.5 ${
                            !item.read ? 'text-primary fill' : 'text-outline'
                          }`}>
                            info
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-on-surface truncate pr-4">{item.title}</p>
                            <p className="text-[11px] text-on-surface-variant/75 truncate mt-0.5">{item.content}</p>
                            <p className="font-data-mono text-[9px] text-outline mt-1">{item.time.slice(5, 16)}</p>
                          </div>
                          {!item.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleNotificationRead(item.id);
                              }}
                              className="absolute top-3 right-3 text-outline hover:text-primary cursor-pointer border-none bg-transparent p-0"
                              title="标为已读"
                            >
                              <span className="material-symbols-outlined text-[14px]">done</span>
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Administrator identity profile and session controller */}
        <div className="h-8 w-[1px] bg-outline-variant/30" />

        <div className="flex items-center gap-2.5 select-none">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAutf8uw-UP_WcJF6DedJ7BJ-58j6AAoLLsPj5uet4SuxCOsbEVOsOt8J5Q8cq0EcOJjh94kvPemlbPGCcdd89_oNXUsQRyuMWCsUQlagzBJhnOTUtw94XVV1AIw494VL8MRVgRwo0k2vWHujUJ-JYDSlLcvmZOOau40QddlzoeAwLsvEYy0BeAyExWOUQIL9zD8ULX6ruVNErCoPp9-hFCH6zrLtpvJwLdnaYJ1EBsCdh4kv_Dyp_5tUU8mZI1XzDOqNQ03ZcnPHZ4"
            alt="Admin"
            className="w-8 h-8 rounded-full border border-outline-variant/60 object-cover object-center bg-slate-100"
          />
          <div className="hidden md:block text-left">
            <p className="font-semibold text-xs text-on-surface leading-none">{username}</p>
            <p className="font-data-mono text-[9px] text-outline mt-0.5 uppercase tracking-wider font-semibold">Superadmin</p>
          </div>
        </div>

        {/* Log-out */}
        <div className="relative">
          <button
            onClick={() => setShowLogoutConfirm(!showLogoutConfirm)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer border-none bg-transparent focus:outline-none ${
              showLogoutConfirm 
                ? 'bg-status-error/15 text-status-error ring-2 ring-status-error/30' 
                : 'hover:bg-red-500/10 text-outline hover:text-status-error'
            }`}
            title="退出控制后台"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>

          <AnimatePresence>
            {showLogoutConfirm && (
              <>
                {/* Click outside shield */}
                <div 
                  className="fixed inset-0 z-40 cursor-default bg-black/5 dark:bg-black/20" 
                  onClick={() => setShowLogoutConfirm(false)} 
                />
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 250 }}
                  className="absolute right-0 mt-3 w-64 bg-surface-container-lowest border border-outline-variant/30 shadow-2xl rounded-xl p-4 z-50 text-left text-on-surface"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-status-error text-[20px] mt-0.5 animate-pulse">
                      error
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-on-surface">确定退出登录？</h4>
                      <p className="text-[10.5px] text-on-surface-variant/80 mt-1 leading-relaxed">
                        系统将立即清空当前管理员会话缓存，安全注销并返回登录大厅。
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end gap-2 mt-4 pt-2.5 border-t border-outline-variant/10">
                    <button
                      onClick={() => setShowLogoutConfirm(false)}
                      className="px-2.5 py-1.5 hover:bg-outline-variant/10 text-on-surface-variant hover:text-on-surface text-[11px] font-bold rounded-lg cursor-pointer border-none bg-transparent transition-colors focus:outline-none"
                    >
                      取消
                    </button>
                    <button
                      onClick={() => {
                        setShowLogoutConfirm(false);
                        onLogout();
                      }}
                      className="px-3 py-1.5 bg-status-error text-white text-[11px] font-bold rounded-lg hover:bg-status-error/95 hover:shadow-md cursor-pointer border-none transition-all focus:outline-none"
                    >
                      安全注销
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

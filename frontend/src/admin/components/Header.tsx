/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu } from 'lucide-react';
import { NotificationItem, User, Dynamic, Goods, Service, Order } from '../types';
import { getPrimaryImage } from '../utils/images';
import { matchesAnyKeyword, normalizeSearchTerm } from '../utils/search';

interface HeaderProps {
  username: string;
  adminRole?: string;
  adminTag?: string;
  adminAvatar?: string;
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
  onToggleSidebar?: () => void;
  isDesktopLayout?: boolean;
}

interface SearchSectionItem {
  id: string;
  primary: string;
  secondary?: string;
  secondaryRight?: string;
}

interface SearchSectionConfig {
  key: string;
  title: string;
  icon: string;
  items: SearchSectionItem[];
  onClick: (item: SearchSectionItem) => void;
  variant?: 'stacked' | 'split';
}

const QUICK_LINKS = [
  { name: '控制台概览', path: '/admin/dashboard', icon: 'dashboard' },
  { name: '用户管理', path: '/admin/users', icon: 'group' },
  { name: '动态管理', path: '/admin/posts', icon: 'chat' },
  { name: '闲置商品管理', path: '/admin/market', icon: 'shopping_bag' },
  { name: '生活服务管理', path: '/admin/services', icon: 'handyman' },
  { name: '订单管理', path: '/admin/orders', icon: 'receipt_long' },
];

export default function Header({
  username,
  adminRole,
  adminTag,
  adminAvatar,
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
  onRefresh,
  onToggleSidebar,
  isDesktopLayout = true,
}: HeaderProps) {
  const [showNoticeMenu, setShowNoticeMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const adminAvatarSrc = getPrimaryImage(adminAvatar);
  const adminRoleLabel =
    adminRole === 'SUPER_ADMIN'
      ? '超级管理员'
      : adminRole === 'READONLY_ADMIN'
        ? '只读管理员'
        : '管理员';
  const adminMeta = adminTag?.trim() ? `${adminRoleLabel} · ${adminTag}` : adminRoleLabel;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const normalizedQuery = normalizeSearchTerm(searchQuery);
  const matchedUsers = useMemo(
    () => (normalizedQuery ? users.filter((u) => matchesAnyKeyword(normalizedQuery, [u.name, u.email])) : []),
    [normalizedQuery, users]
  );
  const matchedDynamics = useMemo(
    () => (normalizedQuery ? dynamics.filter((d) => matchesAnyKeyword(normalizedQuery, [d.title, d.author])) : []),
    [dynamics, normalizedQuery]
  );
  const matchedGoods = useMemo(
    () => (normalizedQuery ? goods.filter((g) => matchesAnyKeyword(normalizedQuery, [g.title, g.sellerName])) : []),
    [goods, normalizedQuery]
  );
  const matchedServices = useMemo(
    () => (normalizedQuery ? services.filter((s) => matchesAnyKeyword(normalizedQuery, [s.title, s.providerName])) : []),
    [normalizedQuery, services]
  );
  const matchedOrders = useMemo(
    () => (normalizedQuery ? orders.filter((o) => matchesAnyKeyword(normalizedQuery, [o.id, o.buyerName])) : []),
    [normalizedQuery, orders]
  );

  const hasResults =
    matchedUsers.length > 0 ||
    matchedDynamics.length > 0 ||
    matchedGoods.length > 0 ||
    matchedServices.length > 0 ||
    matchedOrders.length > 0;

  const handleRefreshClick = () => {
    setIsRotating(true);
    onRefresh?.();
    setTimeout(() => setIsRotating(false), 800);
  };

  const closeSearchDropdown = (clearQuery = false) => {
    setShowSearchDropdown(false);
    if (clearQuery) setSearchQuery('');
  };

  const searchSections = useMemo<SearchSectionConfig[]>(
    () => [
      {
        key: 'users',
        title: `匹配用户 (${matchedUsers.length})`,
        icon: 'group',
        items: matchedUsers.slice(0, 3).map((user) => ({
          id: user.id,
          primary: user.name,
          secondary: user.email,
        })),
        onClick: () => {
          onNavigate?.('/admin/users');
          closeSearchDropdown(true);
        },
      },
      {
        key: 'dynamics',
        title: `匹配动态 (${matchedDynamics.length})`,
        icon: 'chat',
        variant: 'stacked',
        items: matchedDynamics.slice(0, 3).map((dynamic) => ({
          id: dynamic.id,
          primary: dynamic.title,
          secondary: `作者: ${dynamic.author}`,
        })),
        onClick: () => {
          onNavigate?.('/admin/posts');
          closeSearchDropdown(true);
        },
      },
      {
        key: 'goods',
        title: `匹配商品 (${matchedGoods.length})`,
        icon: 'shopping_bag',
        items: matchedGoods.slice(0, 3).map((goodsItem) => ({
          id: goodsItem.id,
          primary: goodsItem.title,
          secondaryRight: `¥${goodsItem.price}`,
        })),
        onClick: () => {
          onNavigate?.('/admin/market');
          closeSearchDropdown(true);
        },
      },
      {
        key: 'services',
        title: `匹配服务 (${matchedServices.length})`,
        icon: 'handyman',
        variant: 'stacked',
        items: matchedServices.slice(0, 3).map((service) => ({
          id: service.id,
          primary: service.title,
          secondary: `服务者: ${service.providerName}`,
        })),
        onClick: () => {
          onNavigate?.('/admin/services');
          closeSearchDropdown(true);
        },
      },
      {
        key: 'orders',
        title: `匹配订单 (${matchedOrders.length})`,
        icon: 'receipt_long',
        items: matchedOrders.slice(0, 3).map((order) => ({
          id: order.id,
          primary: order.id,
          secondaryRight: `${order.buyerName} | ¥${order.price}`,
        })),
        onClick: (item) => {
          onNavigate?.('/admin/orders', item.id);
          closeSearchDropdown(true);
        },
      },
    ].filter((section) => section.items.length > 0),
    [matchedDynamics, matchedGoods, matchedOrders, matchedServices, matchedUsers, onNavigate]
  );

  return (
    <header className="bg-surface-container-lowest min-h-16 border-b border-outline-variant/30 flex items-center justify-between gap-3 px-3 sm:px-4 lg:px-6 py-2 sticky top-0 z-30 select-none">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {!isDesktopLayout && (
          <button
            onClick={onToggleSidebar}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-outline-variant/15 text-secondary hover:text-on-surface transition-colors cursor-pointer border-none bg-transparent focus:outline-none lg:hidden"
            title="展开菜单"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <span className="text-secondary/60 text-[11px] sm:text-xs font-semibold select-none bg-surface-background border border-outline-variant/15 px-2.5 py-1 rounded font-data-mono hidden sm:inline-block whitespace-nowrap">
          前端: 5173 / 接口: 8080
        </span>
      </div>

      <div className="flex items-center justify-end gap-2 sm:gap-3 lg:gap-4 min-w-0 flex-1">
        <div className="relative flex-1 max-w-[13rem] sm:max-w-xs md:max-w-sm">
          <div className="relative flex items-center w-full">
            <span className="material-symbols-outlined absolute left-3 text-secondary/60 text-[18px] pointer-events-none">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              placeholder="搜索用户、动态、商品、服务、订单"
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

          <AnimatePresence>
            {showSearchDropdown && (
              <>
                <div className="fixed inset-0 z-40 cursor-default" onClick={() => setShowSearchDropdown(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  className="absolute right-0 mt-2 w-[min(92vw,420px)] bg-surface-container-lowest border border-outline-variant/30 shadow-2xl rounded-xl max-h-[360px] overflow-y-auto z-50 p-3 text-on-surface text-left"
                >
                  {!normalizedQuery ? (
                    <div className="space-y-2">
                      <p className="text-[10px] text-outline font-bold uppercase tracking-wider px-2 select-none">快捷导航</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {QUICK_LINKS.map((link) => (
                          <button
                            key={link.path}
                            onClick={() => {
                              onNavigate?.(link.path);
                              closeSearchDropdown();
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
                      {!hasResults && <p className="text-center text-xs text-outline py-4 select-none">没有匹配的搜索结果</p>}
                      {searchSections.map((section) => (
                        <React.Fragment key={section.key}>
                          <SearchResultSection section={section} />
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={handleRefreshClick}
          className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center hover:bg-outline-variant/15 text-secondary hover:text-on-surface transition-colors cursor-pointer border-none bg-transparent focus:outline-none"
          title="刷新数据"
        >
          <span className={`material-symbols-outlined text-[20px] ${isRotating ? 'animate-spin' : ''}`}>refresh</span>
        </button>

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

          <AnimatePresence>
            {showNoticeMenu && (
              <>
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
                      <span className="font-data-mono text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{unreadCount} 条未读</span>
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

                  <div className="max-h-[260px] overflow-y-auto divide-y divide-outline-variant/10">
                    {notifications.length === 0 ? (
                      <p className="p-6 text-center text-xs text-outline">暂无系统通知</p>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          className={`p-3.5 hover:bg-surface-container-low transition-colors text-left flex gap-2.5 relative ${!item.read ? 'bg-primary-fixed/15 font-semibold' : ''}`}
                        >
                          <span className={`material-symbols-outlined text-[16px] mt-0.5 ${!item.read ? 'text-primary fill' : 'text-outline'}`}>info</span>
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
                              title="标记为已读"
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

        <div className="hidden sm:block h-8 w-[1px] bg-outline-variant/30" />

        <div className="flex items-center gap-2 sm:gap-2.5 select-none min-w-0">
          {adminAvatarSrc ? (
            <img src={adminAvatarSrc} alt={username} className="w-8 h-8 rounded-full border border-outline-variant/60 object-cover object-center bg-slate-100" />
          ) : (
            <div className="w-8 h-8 rounded-full border border-outline-variant/60 bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">
              {username.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="hidden md:block text-left min-w-0">
            <p className="font-semibold text-xs text-on-surface leading-none">{username}</p>
            <p className="font-data-mono text-[9px] text-outline mt-0.5 tracking-wider font-semibold truncate max-w-[160px]">{adminMeta}</p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowLogoutConfirm(!showLogoutConfirm)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer border-none bg-transparent focus:outline-none ${
              showLogoutConfirm ? 'bg-status-error/15 text-status-error ring-2 ring-status-error/30' : 'hover:bg-red-500/10 text-outline hover:text-status-error'
            }`}
            title="退出管理端"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>

          <AnimatePresence>
            {showLogoutConfirm && (
              <>
                <div className="fixed inset-0 z-40 cursor-default bg-black/5 dark:bg-black/20" onClick={() => setShowLogoutConfirm(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 250 }}
                  className="absolute right-0 mt-3 w-64 bg-surface-container-lowest border border-outline-variant/30 shadow-2xl rounded-xl p-4 z-50 text-left text-on-surface"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-status-error text-[20px] mt-0.5 animate-pulse">error</span>
                    <div>
                      <h4 className="text-xs font-bold text-on-surface">确定退出登录吗？</h4>
                      <p className="text-[10.5px] text-on-surface-variant/80 mt-1 leading-relaxed">
                        系统将清空当前管理员会话缓存，并安全返回登录页。
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
                      安全退出
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

function SearchResultSection({ section }: { section: SearchSectionConfig }) {
  return (
    <div>
      <p className="text-[10px] text-primary font-bold uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1 select-none">
        <span className="material-symbols-outlined text-[12px]">{section.icon}</span>
        {section.title}
      </p>
      <div className="space-y-0.5">
        {section.items.map((item) => (
          <button
            key={item.id}
            onClick={() => section.onClick(item)}
            className={`w-full px-2 py-1 rounded-lg text-xs hover:bg-surface-container-low transition-all cursor-pointer border-none bg-transparent text-left ${
              section.variant === 'stacked' ? 'flex flex-col' : 'flex justify-between items-center'
            }`}
          >
            <span className={`truncate ${section.variant === 'stacked' ? 'w-full text-on-surface' : 'font-semibold text-on-surface'}`}>
              {item.primary}
            </span>
            {section.variant === 'stacked' ? (
              item.secondary ? <span className="text-[9px] text-outline mt-0.5">{item.secondary}</span> : null
            ) : (
              <span className="text-[10px] text-outline font-data-mono truncate max-w-[150px]">
                {item.secondaryRight || item.secondary}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

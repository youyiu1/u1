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
  { name: '控制台总览', path: '/admin/dashboard', icon: 'dashboard' },
  { name: '用户管理', path: '/admin/users', icon: 'group' },
  { name: '动态管理', path: '/admin/posts', icon: 'chat' },
  { name: '闲置商品管理', path: '/admin/market', icon: 'shopping_bag' },
  { name: '生活服务管理', path: '/admin/services', icon: 'handyman' },
  { name: '订单管理', path: '/admin/orders', icon: 'receipt_long' },
];

function getAdminRoleLabel(adminRole?: string) {
  switch (adminRole) {
    case 'SUPER_ADMIN':
      return '超级管理员';
    case 'READONLY_ADMIN':
      return '只读管理员';
    default:
      return '管理员';
  }
}

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
  const adminRoleLabel = getAdminRoleLabel(adminRole);
  const adminMeta = adminTag?.trim() ? `${adminRoleLabel} · ${adminTag}` : adminRoleLabel;
  const unreadCount = notifications.filter((item) => !item.read).length;

  const normalizedQuery = normalizeSearchTerm(searchQuery);
  const matchedUsers = useMemo(
    () => (normalizedQuery ? users.filter((item) => matchesAnyKeyword(normalizedQuery, [item.name, item.email])) : []),
    [normalizedQuery, users]
  );
  const matchedDynamics = useMemo(
    () => (normalizedQuery ? dynamics.filter((item) => matchesAnyKeyword(normalizedQuery, [item.title, item.author])) : []),
    [dynamics, normalizedQuery]
  );
  const matchedGoods = useMemo(
    () => (normalizedQuery ? goods.filter((item) => matchesAnyKeyword(normalizedQuery, [item.title, item.sellerName])) : []),
    [goods, normalizedQuery]
  );
  const matchedServices = useMemo(
    () =>
      normalizedQuery ? services.filter((item) => matchesAnyKeyword(normalizedQuery, [item.title, item.providerName])) : [],
    [normalizedQuery, services]
  );
  const matchedOrders = useMemo(
    () => (normalizedQuery ? orders.filter((item) => matchesAnyKeyword(normalizedQuery, [item.id, item.buyerName])) : []),
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
    if (clearQuery) {
      setSearchQuery('');
    }
  };

  const searchSections = useMemo<SearchSectionConfig[]>(
    () =>
      [
        {
          key: 'users',
          title: `匹配用户 (${matchedUsers.length})`,
          icon: 'group',
          items: matchedUsers.slice(0, 3).map((item) => ({
            id: item.id,
            primary: item.name,
            secondary: item.email,
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
          items: matchedDynamics.slice(0, 3).map((item) => ({
            id: item.id,
            primary: item.title,
            secondary: `作者：${item.author}`,
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
          items: matchedGoods.slice(0, 3).map((item) => ({
            id: item.id,
            primary: item.title,
            secondaryRight: `¥${item.price}`,
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
          items: matchedServices.slice(0, 3).map((item) => ({
            id: item.id,
            primary: item.title,
            secondary: `服务者：${item.providerName}`,
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
          items: matchedOrders.slice(0, 3).map((item) => ({
            id: item.id,
            primary: item.id,
            secondaryRight: `${item.buyerName} | ¥${item.price}`,
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
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-outline-variant/30 bg-surface-container-lowest px-3 py-2 select-none sm:px-4 lg:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {!isDesktopLayout && (
          <button
            onClick={onToggleSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-xl border-none bg-transparent text-secondary transition-colors hover:bg-outline-variant/15 hover:text-on-surface focus:outline-none lg:hidden"
            title="展开菜单"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3 lg:gap-4">
        <div className="relative max-w-[13rem] flex-1 sm:max-w-xs md:max-w-sm">
          <div className="relative flex w-full items-center">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 text-[18px] text-secondary/60">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              placeholder="搜索用户、动态、商品、服务、订单"
              className="w-full rounded-full border border-outline-variant/30 bg-surface-container-low py-1.5 pl-9 pr-8 text-xs text-on-surface placeholder-outline transition-all focus:border-primary/50 focus:bg-surface-container-lowest focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 flex items-center justify-center border-none bg-transparent p-0 text-outline hover:text-on-surface"
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
                  className="absolute right-0 z-50 mt-2 max-h-[360px] w-[min(92vw,420px)] overflow-y-auto rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3 text-left text-on-surface shadow-2xl"
                >
                  {!normalizedQuery ? (
                    <div className="space-y-2">
                      <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-outline select-none">快捷导航</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {QUICK_LINKS.map((link) => (
                          <button
                            key={link.path}
                            onClick={() => {
                              onNavigate?.(link.path);
                              closeSearchDropdown();
                            }}
                            className="flex w-full cursor-pointer items-center gap-2 rounded-lg border-none bg-transparent px-3 py-1.5 text-left text-xs text-secondary transition-all hover:bg-primary/5 hover:text-primary"
                          >
                            <span className="material-symbols-outlined text-[15px]">{link.icon}</span>
                            <span>{link.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {!hasResults && <p className="py-4 text-center text-xs text-outline select-none">没有匹配的搜索结果</p>}
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
          className="hidden h-9 w-9 items-center justify-center rounded-full border-none bg-transparent text-secondary transition-colors hover:bg-outline-variant/15 hover:text-on-surface focus:outline-none sm:flex"
          title="刷新数据"
        >
          <span className={`material-symbols-outlined text-[20px] ${isRotating ? 'animate-spin' : ''}`}>refresh</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowNoticeMenu(!showNoticeMenu)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-secondary transition-colors hover:bg-outline-variant/15 hover:text-on-surface focus:outline-none"
          >
            <span className="material-symbols-outlined text-[23px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-status-error text-[9px] font-bold text-white animate-bounce">
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
                  className="absolute right-0 z-50 mt-2.5 w-80 overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-on-surface shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-outline-variant/15 bg-surface-container-low/50 px-4 py-3">
                    <span className="flex items-center gap-1 font-headline-sm text-headline-sm font-bold">
                      <span>通知提醒</span>
                      <span className="rounded-full bg-primary/10 px-1.5 py-0.5 font-data-mono text-[10px] text-primary">
                        {unreadCount} 条未读
                      </span>
                    </span>
                    <button
                      onClick={() => {
                        onNavigateToNotifications();
                        setShowNoticeMenu(false);
                      }}
                      className="cursor-pointer border-none bg-transparent text-xs font-semibold text-primary hover:underline"
                    >
                      查看全部
                    </button>
                  </div>

                  <div className="max-h-[260px] divide-y divide-outline-variant/10 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-6 text-center text-xs text-outline">暂无系统通知</p>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          className={`relative flex gap-2.5 p-3.5 text-left transition-colors hover:bg-surface-container-low ${
                            !item.read ? 'bg-primary-fixed/15 font-semibold' : ''
                          }`}
                        >
                          <span
                            className={`material-symbols-outlined mt-0.5 text-[16px] ${
                              !item.read ? 'fill text-primary' : 'text-outline'
                            }`}
                          >
                            info
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate pr-4 text-xs text-on-surface">{item.title}</p>
                            <p className="mt-0.5 truncate text-[11px] text-on-surface-variant/75">{item.content}</p>
                            <p className="mt-1 font-data-mono text-[9px] text-outline">{item.time.slice(5, 16)}</p>
                          </div>
                          {!item.read && (
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                onToggleNotificationRead(item.id);
                              }}
                              className="absolute right-3 top-3 cursor-pointer border-none bg-transparent p-0 text-outline hover:text-primary"
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

        <div className="hidden h-8 w-[1px] bg-outline-variant/30 sm:block" />

        <div className="flex min-w-0 items-center gap-2 select-none sm:gap-2.5">
          {adminAvatarSrc ? (
            <img
              src={adminAvatarSrc}
              alt={username}
              className="h-8 w-8 rounded-full border border-outline-variant/60 bg-slate-100 object-cover object-center"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant/60 bg-slate-100 text-xs font-bold text-slate-600">
              {username.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="hidden min-w-0 text-left md:block">
            <p className="text-xs font-semibold leading-none text-on-surface">{username}</p>
            <p className="mt-0.5 max-w-[160px] truncate font-data-mono text-[9px] font-semibold tracking-wider text-outline">
              {adminMeta}
            </p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowLogoutConfirm(!showLogoutConfirm)}
            className={`flex h-8 w-8 items-center justify-center rounded-full border-none bg-transparent transition-all focus:outline-none ${
              showLogoutConfirm
                ? 'bg-status-error/15 text-status-error ring-2 ring-status-error/30'
                : 'text-outline hover:bg-red-500/10 hover:text-status-error'
            }`}
            title="退出管理端"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>

          <AnimatePresence>
            {showLogoutConfirm && (
              <>
                <div
                  className="fixed inset-0 z-40 cursor-default bg-black/5 dark:bg-black/20"
                  onClick={() => setShowLogoutConfirm(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 250 }}
                  className="absolute right-0 z-50 mt-3 w-64 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4 text-left text-on-surface shadow-2xl"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined mt-0.5 text-[20px] text-status-error animate-pulse">
                      error
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-on-surface">确定退出登录吗？</h4>
                      <p className="mt-1 text-[10.5px] leading-relaxed text-on-surface-variant/80">
                        系统将清空当前管理员会话缓存，并安全返回登录页。
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-end gap-2 border-t border-outline-variant/10 pt-2.5">
                    <button
                      onClick={() => setShowLogoutConfirm(false)}
                      className="cursor-pointer rounded-lg border-none bg-transparent px-2.5 py-1.5 text-[11px] font-bold text-on-surface-variant transition-colors hover:bg-outline-variant/10 hover:text-on-surface focus:outline-none"
                    >
                      取消
                    </button>
                    <button
                      onClick={() => {
                        setShowLogoutConfirm(false);
                        onLogout();
                      }}
                      className="cursor-pointer rounded-lg bg-status-error px-3 py-1.5 text-[11px] font-bold text-white transition-all hover:bg-status-error/95 hover:shadow-md focus:outline-none"
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
      <p className="mb-1.5 flex items-center gap-1 px-2 text-[10px] font-bold uppercase tracking-wider text-primary select-none">
        <span className="material-symbols-outlined text-[12px]">{section.icon}</span>
        {section.title}
      </p>
      <div className="space-y-0.5">
        {section.items.map((item) => (
          <button
            key={item.id}
            onClick={() => section.onClick(item)}
            className={`w-full cursor-pointer rounded-lg border-none bg-transparent px-2 py-1 text-left text-xs transition-all hover:bg-surface-container-low ${
              section.variant === 'stacked' ? 'flex flex-col' : 'flex items-center justify-between'
            }`}
          >
            <span
              className={`truncate ${
                section.variant === 'stacked' ? 'w-full text-on-surface' : 'font-semibold text-on-surface'
              }`}
            >
              {item.primary}
            </span>
            {section.variant === 'stacked' ? (
              item.secondary ? <span className="mt-0.5 text-[9px] text-outline">{item.secondary}</span> : null
            ) : (
              <span className="max-w-[150px] truncate font-data-mono text-[10px] text-outline">
                {item.secondaryRight || item.secondary}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

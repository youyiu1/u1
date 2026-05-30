/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Dynamic, Goods, Service, Order } from '../types';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  unreadCount?: number;
}

interface MenuSubItem {
  id: string;
  name: string;
  icon: string;
  fill?: boolean;
}

interface MenuGroup {
  id: string;
  name: string;
  icon: string;
  items: MenuSubItem[];
}

export default function Sidebar({
  currentTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  unreadCount = 0
}: SidebarProps) {
  const homeItem = { id: '/admin/dashboard', name: '首页', icon: 'home', fill: true };

  const menuGroups: MenuGroup[] = [
    {
      id: 'users',
      name: '用户风控',
      icon: 'admin_panel_settings',
      items: [
        { id: '/admin/users', name: '用户管理', icon: 'group', fill: true },
        { id: '/admin/blacklist', name: '风控黑名单', icon: 'gavel', fill: true },
      ]
    },
    {
      id: 'content',
      name: '内容运营',
      icon: 'forum',
      items: [
        { id: '/admin/posts', name: '动态管理', icon: 'explore', fill: false },
        { id: '/admin/comments', name: '评论管理', icon: 'chat_bubble', fill: true },
        { id: '/admin/images', name: '图片管理', icon: 'photo_library', fill: true },
      ]
    },
    {
      id: 'services',
      name: '生活服务',
      icon: 'storefront',
      items: [
        { id: '/admin/market', name: '闲置商品管理', icon: 'shopping_bag', fill: true },
        { id: '/admin/services', name: '服务管理', icon: 'home_repair_service', fill: true },
        { id: '/admin/orders', name: '订单管理', icon: 'receipt_long', fill: false },
      ]
    },
    {
      id: 'system',
      name: '系统设置',
      icon: 'settings_suggest',
      items: [
        { id: '/admin/notifications', name: '通知管理', icon: 'campaign', fill: true },
        { id: '/admin/categories', name: '分类管理', icon: 'category', fill: true },
        { id: '/admin/menus', name: '菜单管理', icon: 'menu', fill: false },
        { id: '/admin/roles', name: '角色管理', icon: 'badge', fill: true },
        { id: '/admin/permissions', name: '权限管理', icon: 'key', fill: true },
      ]
    },
    {
      id: 'logs',
      name: '系统安全',
      icon: 'security',
      items: [
        { id: '/admin/login-logs', name: '登录日志', icon: 'fingerprint', fill: true },
        { id: '/admin/op-logs', name: '操作日志', icon: 'receipt_long', fill: false },
      ]
    }
  ];

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    users: true,
    content: true,
    services: true,
    system: true,
    logs: true,
  });

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  useEffect(() => {
    const activeGroup = menuGroups.find(group =>
      group.items.some(item => item.id === currentTab)
    );
    if (activeGroup) {
      setExpandedGroups(prev => ({
        ...prev,
        [activeGroup.id]: true
      }));
    }
  }, [currentTab]);

  const renderHomeButton = () => {
    const isActive = currentTab === homeItem.id;
    return (
      <button
        onClick={() => onTabChange(homeItem.id)}
        className={`w-full flex items-center rounded-lg py-2.5 px-3 transition-all text-xs font-semibold border-none cursor-pointer text-left relative focus:outline-none mb-1 ${
          isActive
            ? 'bg-primary text-white font-bold shadow-md'
            : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-100'
        }`}
        title={isCollapsed ? homeItem.name : undefined}
      >
        {/* Active indicator bar */}
        {isActive && (
          <motion.div
            layoutId="sidebarActiveIndicator"
            className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-white rounded-r-md"
          />
        )}

        <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'gap-3'}`}>
          <span className={`material-symbols-outlined text-[20px] flex-shrink-0 ${homeItem.fill ? 'fill' : ''}`}>
            {homeItem.icon}
          </span>

          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="truncate font-sans text-[12.5px] tracking-normal"
            >
              {homeItem.name}
            </motion.span>
          )}
        </div>
      </button>
    );
  };

  return (
    <motion.aside
      animate={{ width: isCollapsed ? '72px' : '260px' }}
      transition={{ type: 'spring', damping: 25, stiffness: 210 }}
      className="bg-surface-sidebar min-h-screen text-slate-300 flex flex-col justify-between sticky top-0 left-0 border-r border-slate-800/60 z-30 select-none overflow-hidden"
    >
      <div>
        {/* Logo and Brand */}
        <div className={`h-16 border-b border-slate-800/60 flex items-center px-4 ${isCollapsed ? 'justify-center' : 'justify-start gap-3'}`}>
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white flex-shrink-0 shadow-[0_0_15px_rgba(30,58,138,0.4)]">
            <span className="material-symbols-outlined text-[24px] fill">leak_add</span>
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-left font-sans"
            >
              <h2 className="font-extrabold text-sm text-white leading-none uppercase tracking-wide">乐居同城</h2>
              <p className="font-data-mono text-[9px] text-slate-500 mt-1 select-none font-bold">COMMUNITY PORTAL</p>
            </motion.div>
          )}
        </div>

        {/* Link navigation index list */}
        <nav className="p-3 space-y-1 mt-4 max-h-[calc(100vh-140px)] overflow-y-auto">
          {renderHomeButton()}

          {!isCollapsed && <div className="border-t border-slate-800/20 my-3 opacity-40" />}

          {isCollapsed ? (
            menuGroups.map((group, groupIdx) => (
              <React.Fragment key={group.id}>
                {groupIdx > 0 && <div className="border-t border-slate-800/20 my-2 mx-1 opacity-50" />}
                <div className="space-y-1.5">
                  {group.items.map((item) => {
                    const isActive = currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={`w-full flex items-center justify-center rounded-lg py-2.5 transition-all cursor-pointer relative focus:outline-none ${
                          isActive
                            ? 'bg-primary text-white shadow-md'
                            : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-100'
                        }`}
                        title={`${group.name} - ${item.name}`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="sidebarActiveCollapsedIndicator"
                            className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-white rounded-r-md"
                          />
                        )}
                        <span className={`material-symbols-outlined text-[20px] flex-shrink-0 ${item.fill ? 'fill' : ''}`}>
                          {item.icon}
                        </span>
                        {item.id === '/admin/notifications' && unreadCount > 0 && (
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-slate-900" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </React.Fragment>
            ))
          ) : (
            menuGroups.map((group) => {
              const isGroupExpanded = expandedGroups[group.id];
              const hasActiveChild = group.items.some(item => item.id === currentTab);
              return (
                <div key={group.id} className="mb-2">
                  {/* Category Header (Level 1) */}
                  <div
                    onClick={() => toggleGroup(group.id)}
                    className={`flex items-center justify-between font-bold text-[11px] tracking-wider uppercase py-2 px-2.5 rounded-lg cursor-pointer group select-none transition-all duration-150 ${
                      hasActiveChild 
                        ? 'text-slate-200 bg-slate-800/30' 
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] opacity-75">
                        {group.icon}
                      </span>
                      <span>{group.name}</span>
                    </div>
                    <span 
                      className="material-symbols-outlined text-[15px] opacity-60 transition-transform duration-200"
                      style={{ transform: isGroupExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                    >
                      expand_more
                    </span>
                  </div>

                  {/* Level 2 Submenu Items */}
                  <AnimatePresence initial={false}>
                    {isGroupExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div className="pl-3.5 border-l border-slate-800/60 ml-4.5 my-1.5 space-y-1">
                          {group.items.map((item) => {
                            const isActive = currentTab === item.id;
                            return (
                              <button
                                key={item.id}
                                onClick={() => onTabChange(item.id)}
                                className={`w-full flex items-center rounded-lg py-1.5 px-2.5 transition-all text-xs font-semibold border-none cursor-pointer text-left relative focus:outline-none ${
                                  isActive
                                    ? 'bg-primary text-white font-bold shadow-md'
                                    : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-100'
                                }`}
                              >
                                {isActive && (
                                  <motion.div
                                    layoutId="sidebarActiveSubIndicator"
                                    className="absolute -left-[18.25px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full ring-2 ring-slate-900"
                                  />
                                )}

                                <span className={`material-symbols-outlined text-[17px] flex-shrink-0 ${item.fill ? 'fill' : ''}`}>
                                  {item.icon}
                                </span>

                                <span className="ml-2 truncate font-sans text-[12px] tracking-normal">
                                  {item.name}
                                </span>

                                {item.id === '/admin/notifications' && unreadCount > 0 && (
                                  <span className="ml-auto font-data-mono text-[9px] bg-slate-700/60 text-sky-400 border border-sky-500/20 font-black px-1.5 py-0.5 rounded-full">
                                    {unreadCount}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </nav>
      </div>

      {/* Collapse Bottom command bar */}
      <div className="p-3 border-t border-slate-800/60 text-center select-none bg-slate-900/40">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center hover:bg-slate-800/80 rounded-lg py-2.5 transition-all cursor-pointer text-slate-400 hover:text-slate-100 border-none bg-transparent focus:outline-none"
        >
          <span className="material-symbols-outlined text-[20px] transition-transform duration-300">
            {isCollapsed ? 'chevron_right' : 'chevron_left'}
          </span>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="ml-2 font-headline-sm text-xs font-semibold"
            >
              收缩侧边菜单
            </motion.span>
          )}
        </button>
      </div>
    </motion.aside>
  );
}

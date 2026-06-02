/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Store } from 'lucide-react';
import { SystemMenu } from '../types';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  unreadCount?: number;
  menus?: SystemMenu[];
  isDesktopLayout?: boolean;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
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
  unreadCount = 0,
  menus = [],
  isDesktopLayout = true,
  isMobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const homeItem = { id: '/admin/dashboard', name: '首页', icon: 'home', fill: true };

  const menuGroups = useMemo<MenuGroup[]>(() => {
    const activeMenus = menus.filter((menu) => menu.status === 'active');
    const visiblePages = activeMenus.filter((menu) => menu.type === 'menu');

    return activeMenus
      .filter((menu) => menu.type === 'directory')
      .map((directory) => ({
        id: directory.id,
        name: directory.name,
        icon: directory.icon || 'folder',
        items: visiblePages
          .filter((item) => item.parentId === directory.id)
          .sort((a, b) => a.order - b.order)
          .map((item) => ({
            id: item.path,
            name: item.name,
            icon: item.icon || 'article',
            fill: false,
          })),
      }))
      .filter((group) => group.items.length > 0)
      .sort((a, b) => {
        const leftOrder = activeMenus.find((item) => item.id === a.id)?.order || 0;
        const rightOrder = activeMenus.find((item) => item.id === b.id)?.order || 0;
        return leftOrder - rightOrder;
      });
  }, [menus]);

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!menuGroups.length) return;
    setExpandedGroups((prev) => {
      const next = { ...prev };
      menuGroups.forEach((group) => {
        if (typeof next[group.id] !== 'boolean') {
          next[group.id] = true;
        }
      });
      return next;
    });
  }, [menuGroups]);

  useEffect(() => {
    const activeGroup = menuGroups.find((group) => group.items.some((item) => item.id === currentTab));
    if (activeGroup) {
      setExpandedGroups((prev) => ({
        ...prev,
        [activeGroup.id]: true,
      }));
    }
  }, [currentTab, menuGroups]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const renderHomeButton = () => {
    const isActive = currentTab === homeItem.id;
    return (
      <button
        onClick={() => onTabChange(homeItem.id)}
        className={`w-full flex items-center rounded-lg py-2.5 px-3 transition-all text-xs font-semibold border-none cursor-pointer text-left relative focus:outline-none mb-1 ${
          isActive ? 'bg-primary text-white font-bold shadow-md' : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-100'
        }`}
        title={isCollapsed ? homeItem.name : undefined}
      >
        {isActive && <motion.div layoutId="sidebarActiveIndicator" className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-white rounded-r-md" />}
        <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'gap-3'}`}>
          <span className={`material-symbols-outlined text-[20px] flex-shrink-0 ${homeItem.fill ? 'fill' : ''}`}>{homeItem.icon}</span>
          {!isCollapsed && (
            <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="truncate font-sans text-[12.5px] tracking-normal">
              {homeItem.name}
            </motion.span>
          )}
        </div>
      </button>
    );
  };

  const sidebarContent = (
    <motion.aside
      animate={
        isDesktopLayout
          ? { width: isCollapsed ? '72px' : '260px', x: 0 }
          : { width: 'min(82vw, 300px)', x: isMobileOpen ? 0 : '-100%' }
      }
      transition={{ type: 'spring', damping: 25, stiffness: 210 }}
      className={`bg-surface-sidebar text-slate-300 flex flex-col justify-between border-r border-slate-800/60 z-50 select-none overflow-hidden ${
        isDesktopLayout ? 'sticky top-0 left-0 min-h-screen' : 'fixed top-0 left-0 h-screen shadow-2xl'
      }`}
    >
      <div>
        <div className={`h-16 border-b border-slate-800/60 flex items-center px-4 ${isCollapsed ? 'justify-center' : 'justify-start gap-3'}`}>
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
            <Store className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-left font-sans">
              <h2 className="font-extrabold text-sm text-white leading-none uppercase tracking-wide">乐居同城</h2>
              <p className="font-data-mono text-[9px] text-slate-500 mt-1 select-none font-bold">同城生活 · 管理端</p>
            </motion.div>
          )}
        </div>

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
                          isActive ? 'bg-primary text-white shadow-md' : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-100'
                        }`}
                        title={`${group.name} - ${item.name}`}
                      >
                        {isActive && <motion.div layoutId="sidebarActiveCollapsedIndicator" className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-white rounded-r-md" />}
                        <span className={`material-symbols-outlined text-[20px] flex-shrink-0 ${item.fill ? 'fill' : ''}`}>{item.icon}</span>
                        {item.id === '/admin/notifications' && unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-slate-900" />}
                      </button>
                    );
                  })}
                </div>
              </React.Fragment>
            ))
          ) : (
            menuGroups.map((group) => {
              const isGroupExpanded = expandedGroups[group.id] ?? true;
              const hasActiveChild = group.items.some((item) => item.id === currentTab);
              return (
                <div key={group.id} className="mb-2">
                  <div
                    onClick={() => toggleGroup(group.id)}
                    className={`flex items-center justify-between font-bold text-[11px] tracking-wider uppercase py-2 px-2.5 rounded-lg cursor-pointer group select-none transition-all duration-150 ${
                      hasActiveChild ? 'text-slate-200 bg-slate-800/30' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] opacity-75">{group.icon}</span>
                      <span>{group.name}</span>
                    </div>
                    <span className="material-symbols-outlined text-[15px] opacity-60 transition-transform duration-200" style={{ transform: isGroupExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                      expand_more
                    </span>
                  </div>

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
                                  isActive ? 'bg-primary text-white font-bold shadow-md' : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-100'
                                }`}
                              >
                                {isActive && <motion.div layoutId="sidebarActiveSubIndicator" className="absolute -left-[18.25px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full ring-2 ring-slate-900" />}
                                <span className={`material-symbols-outlined text-[17px] flex-shrink-0 ${item.fill ? 'fill' : ''}`}>{item.icon}</span>
                                <span className="ml-2 truncate font-sans text-[12px] tracking-normal">{item.name}</span>
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

      <div className="p-3 border-t border-slate-800/60 text-center select-none bg-slate-900/40">
        {isDesktopLayout ? (
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center hover:bg-slate-800/80 rounded-lg py-2.5 transition-all cursor-pointer text-slate-400 hover:text-slate-100 border-none bg-transparent focus:outline-none"
          >
            <span className="material-symbols-outlined text-[20px] transition-transform duration-300">{isCollapsed ? 'chevron_right' : 'chevron_left'}</span>
            {!isCollapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-2 font-headline-sm text-xs font-semibold">
                收起侧边菜单
              </motion.span>
            )}
          </button>
        ) : (
          <button
            onClick={onCloseMobile}
            className="w-full flex items-center justify-center hover:bg-slate-800/80 rounded-lg py-2.5 transition-all cursor-pointer text-slate-400 hover:text-slate-100 border-none bg-transparent focus:outline-none"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
            <span className="ml-2 text-xs font-semibold">关闭菜单</span>
          </button>
        )}
      </div>
    </motion.aside>
  );

  if (isDesktopLayout) {
    return sidebarContent;
  }

  return (
    <>
      <AnimatePresence>
        {isMobileOpen && (
          <motion.button
            type="button"
            aria-label="关闭侧边菜单"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseMobile}
            className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[2px] border-none p-0 cursor-default"
          />
        )}
      </AnimatePresence>
      {sidebarContent}
    </>
  );
}

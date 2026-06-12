/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
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

interface MenuItem {
  id: string;
  name: string;
  icon: string;
  fill?: boolean;
}

interface MenuGroup {
  id: string;
  name: string;
  icon: string;
  items: MenuItem[];
}

const HOME_ITEM: MenuItem = { id: '/admin/dashboard', name: '首页', icon: 'home', fill: true };

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
  const menuGroups = useMemo<MenuGroup[]>(() => {
    const activeMenus = menus.filter((menu) => menu.status === 'active');
    const directories = activeMenus.filter((menu) => menu.type === 'directory');
    const pages = activeMenus.filter((menu) => menu.type === 'menu');

    return directories
      .map((directory) => ({
        id: directory.id,
        name: directory.name,
        icon: directory.icon || 'folder',
        items: pages
          .filter((page) => page.parentId === directory.id)
          .sort((left, right) => left.order - right.order)
          .map((page) => ({
            id: page.path,
            name: page.name,
            icon: page.icon || 'article',
            fill: false,
          })),
      }))
      .filter((group) => group.items.length > 0)
      .sort((left, right) => {
        const leftOrder = activeMenus.find((item) => item.id === left.id)?.order || 0;
        const rightOrder = activeMenus.find((item) => item.id === right.id)?.order || 0;
        return leftOrder - rightOrder;
      });
  }, [menus]);

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!menuGroups.length) {
      return;
    }

    setExpandedGroups((current) => {
      const next = { ...current };
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
    if (!activeGroup) {
      return;
    }

    setExpandedGroups((current) => ({
      ...current,
      [activeGroup.id]: true,
    }));
  }, [currentTab, menuGroups]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((current) => ({
      ...current,
      [groupId]: !current[groupId],
    }));
  };

  const sidebarContent = (
    <motion.aside
      animate={
        isDesktopLayout
          ? { width: isCollapsed ? '72px' : '260px', x: 0 }
          : { width: 'min(82vw, 300px)', x: isMobileOpen ? 0 : '-100%' }
      }
      transition={{ type: 'spring', damping: 25, stiffness: 210 }}
      className={`z-50 flex flex-col justify-between overflow-hidden border-r border-slate-800/60 bg-surface-sidebar text-slate-300 ${
        isDesktopLayout ? 'sticky left-0 top-0 min-h-screen' : 'fixed left-0 top-0 h-screen shadow-2xl'
      }`}
    >
      <div>
        <SidebarBrand isCollapsed={isCollapsed} />

        <nav className="mt-4 max-h-[calc(100vh-140px)] space-y-1 overflow-y-auto p-3">
          <SidebarItem
            item={HOME_ITEM}
            isActive={currentTab === HOME_ITEM.id}
            isCollapsed={isCollapsed}
            unreadCount={unreadCount}
            indicatorId="sidebarActiveHomeIndicator"
            onClick={() => onTabChange(HOME_ITEM.id)}
          />

          {!isCollapsed ? <div className="my-3 border-t border-slate-800/20 opacity-40" /> : null}

          {isCollapsed ? (
            <CollapsedGroups groups={menuGroups} currentTab={currentTab} unreadCount={unreadCount} onTabChange={onTabChange} />
          ) : (
            <ExpandedGroups
              groups={menuGroups}
              currentTab={currentTab}
              unreadCount={unreadCount}
              expandedGroups={expandedGroups}
              onTabChange={onTabChange}
              onToggleGroup={toggleGroup}
            />
          )}
        </nav>
      </div>

      <div className="border-t border-slate-800/60 bg-slate-900/40 p-3 text-center">
        {isDesktopLayout ? (
          <button
            onClick={onToggleCollapse}
            className="flex w-full items-center justify-center rounded-lg bg-transparent py-2.5 text-slate-400 transition-all hover:bg-slate-800/80 hover:text-slate-100 focus:outline-none"
          >
            <span className="material-symbols-outlined text-[20px] transition-transform duration-300">
              {isCollapsed ? 'chevron_right' : 'chevron_left'}
            </span>
            {!isCollapsed ? (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-2 text-xs font-semibold">
                收起侧边菜单
              </motion.span>
            ) : null}
          </button>
        ) : (
          <button
            onClick={onCloseMobile}
            className="flex w-full items-center justify-center rounded-lg bg-transparent py-2.5 text-slate-400 transition-all hover:bg-slate-800/80 hover:text-slate-100 focus:outline-none"
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
        {isMobileOpen ? (
          <motion.button
            type="button"
            aria-label="关闭侧边菜单"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseMobile}
            className="fixed inset-0 z-40 cursor-default border-none bg-slate-950/45 p-0 backdrop-blur-[2px]"
          />
        ) : null}
      </AnimatePresence>
      {sidebarContent}
    </>
  );
}

function SidebarBrand({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <div className={`flex h-16 items-center border-b border-slate-800/60 px-4 ${isCollapsed ? 'justify-center' : 'justify-start gap-3'}`}>
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
        <Store className="h-5 w-5" />
      </div>
      {!isCollapsed ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-left">
          <h2 className="text-sm font-extrabold uppercase leading-none tracking-wide text-white">乐居同城</h2>
          <p className="mt-1 text-[9px] font-bold text-slate-500">同城生活 · 管理端</p>
        </motion.div>
      ) : null}
    </div>
  );
}

function CollapsedGroups({
  groups,
  currentTab,
  unreadCount,
  onTabChange,
}: {
  groups: MenuGroup[];
  currentTab: string;
  unreadCount: number;
  onTabChange: (tab: string) => void;
}) {
  return (
    <>
          {groups.map((group, groupIndex) => (
            <React.Fragment key={group.id}>
          {groupIndex > 0 ? <div className="mx-1 my-2 border-t border-slate-800/20 opacity-50" /> : null}
                <div className="space-y-1.5">
                  {group.items.map((item) => (
                    <React.Fragment key={item.id}>
                      <SidebarItem
                        item={item}
                        isActive={currentTab === item.id}
                        isCollapsed
                        unreadCount={unreadCount}
                        title={`${group.name} - ${item.name}`}
                        indicatorId="sidebarActiveCollapsedIndicator"
                        onClick={() => onTabChange(item.id)}
                      />
                    </React.Fragment>
                  ))}
                </div>
              </React.Fragment>
      ))}
    </>
  );
}

function ExpandedGroups({
  groups,
  currentTab,
  unreadCount,
  expandedGroups,
  onTabChange,
  onToggleGroup,
}: {
  groups: MenuGroup[];
  currentTab: string;
  unreadCount: number;
  expandedGroups: Record<string, boolean>;
  onTabChange: (tab: string) => void;
  onToggleGroup: (groupId: string) => void;
}) {
  return (
    <>
      {groups.map((group) => {
        const isExpanded = expandedGroups[group.id] ?? true;
        const hasActiveChild = group.items.some((item) => item.id === currentTab);

        return (
          <div key={group.id} className="mb-2">
            <div
              onClick={() => onToggleGroup(group.id)}
              className={`flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-[11px] font-bold uppercase tracking-wider transition-all ${
                hasActiveChild ? 'bg-slate-800/30 text-slate-200' : 'text-slate-500 hover:bg-slate-800/10 hover:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] opacity-75">{group.icon}</span>
                <span>{group.name}</span>
              </div>
              <span className="material-symbols-outlined text-[15px] opacity-60 transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                expand_more
              </span>
            </div>

            <AnimatePresence initial={false}>
              {isExpanded ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <div className="my-1.5 ml-[18px] space-y-1 border-l border-slate-800/60 pl-3.5">
                    {group.items.map((item) => (
                      <React.Fragment key={item.id}>
                        <SidebarItem
                          item={item}
                          isActive={currentTab === item.id}
                          unreadCount={unreadCount}
                          indicatorId="sidebarActiveSubIndicator"
                          onClick={() => onTabChange(item.id)}
                        />
                      </React.Fragment>
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </>
  );
}

function SidebarItem({
  item,
  isActive,
  isCollapsed = false,
  unreadCount,
  title,
  indicatorId,
  onClick,
}: {
  item: MenuItem;
  isActive: boolean;
  isCollapsed?: boolean;
  unreadCount: number;
  title?: string;
  indicatorId: string;
  onClick: () => void;
}) {
  const showNotificationBadge = item.id === '/admin/notifications' && unreadCount > 0;

  return (
    <button
      onClick={onClick}
      title={title || (isCollapsed ? item.name : undefined)}
      className={`relative w-full rounded-lg border-none text-left transition-all focus:outline-none ${
        isCollapsed
          ? `flex items-center justify-center py-2.5 ${isActive ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'}`
          : `flex items-center px-2.5 py-1.5 text-xs font-semibold ${isActive ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-100'}`
      }`}
    >
      {isActive ? (
        <motion.div
          layoutId={indicatorId}
          className={
            isCollapsed
              ? 'absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-white'
              : indicatorId === 'sidebarActiveSubIndicator'
                ? 'absolute -left-[18.25px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-blue-400 ring-2 ring-slate-900'
                : 'absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-white'
          }
        />
      ) : null}

      <span className={`material-symbols-outlined flex-shrink-0 ${isCollapsed ? 'text-[20px]' : 'text-[17px]'} ${item.fill ? 'fill' : ''}`}>{item.icon}</span>

      {!isCollapsed ? <span className="ml-2 truncate text-[12px]">{item.name}</span> : null}

      {showNotificationBadge ? (
        isCollapsed ? (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-slate-900" />
        ) : (
          <span className="ml-auto rounded-full border border-sky-500/20 bg-slate-700/60 px-1.5 py-0.5 text-[9px] font-black text-sky-400">
            {unreadCount}
          </span>
        )
      ) : null}
    </button>
  );
}

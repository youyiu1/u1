/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FolderPlus, Plus, Edit2, Trash2, ArrowUp, ArrowDown, Search, 
  Settings, Folder, FileText, CheckCircle, XCircle, RefreshCw, Key
} from 'lucide-react';
import { SystemMenu } from '../types';
import { adminApi } from '../services/adminApi';

// Predefined default menus reflecting current sidebar & workspace features
const DEFAULT_MENUS: SystemMenu[] = [
  // Directories (Level 1)
  { id: 'dir-users', name: '用户风控', path: '', icon: 'admin_panel_settings', order: 10, status: 'active', type: 'directory' },
  { id: 'dir-content', name: '内容运营', path: '', icon: 'forum', order: 20, status: 'active', type: 'directory' },
  { id: 'dir-services', name: '生活服务', path: '', icon: 'storefront', order: 30, status: 'active', type: 'directory' },
  { id: 'dir-system', name: '分类系统', path: '', icon: 'settings_suggest', order: 40, status: 'active', type: 'directory' },
  { id: 'dir-logs', name: '系统安全', path: '', icon: 'security', order: 50, status: 'active', type: 'directory' },

  // Level 2 Menu Items under Users
  { id: 'menu-users', parentId: 'dir-users', name: '用户管理', path: '/admin/users', icon: 'group', order: 11, status: 'active', type: 'menu', permissionCode: 'user:view' },
  { id: 'menu-blacklist', parentId: 'dir-users', name: '风控黑名单', path: '/admin/blacklist', icon: 'gavel', order: 12, status: 'active', type: 'menu', permissionCode: 'blacklist:view' },

  // Level 2 Menu Items under Content
  { id: 'menu-posts', parentId: 'dir-content', name: '动态管理', path: '/admin/posts', icon: 'explore', order: 21, status: 'active', type: 'menu', permissionCode: 'posts:view' },
  { id: 'menu-comments', parentId: 'dir-content', name: '评论管理', path: '/admin/comments', icon: 'chat_bubble', order: 22, status: 'active', type: 'menu', permissionCode: 'comments:view' },
  { id: 'menu-images', parentId: 'dir-content', name: '图片管理', path: '/admin/images', icon: 'photo_library', order: 23, status: 'active', type: 'menu', permissionCode: 'images:view' },

  // Level 2 Menu Items under Services
  { id: 'menu-market', parentId: 'dir-services', name: '闲置商品管理', path: '/admin/market', icon: 'shopping_bag', order: 31, status: 'active', type: 'menu', permissionCode: 'goods:view' },
  { id: 'menu-services', parentId: 'dir-services', name: '服务管理', path: '/admin/services', icon: 'home_repair_service', order: 32, status: 'active', type: 'menu', permissionCode: 'services:view' },
  { id: 'menu-orders', parentId: 'dir-services', name: '订单管理', path: '/admin/orders', icon: 'receipt_long', order: 33, status: 'active', type: 'menu', permissionCode: 'orders:view' },

  // Level 2 Menu Items under System
  { id: 'menu-notifications', parentId: 'dir-system', name: '通知管理', path: '/admin/notifications', icon: 'campaign', order: 41, status: 'active', type: 'menu', permissionCode: 'notifications:view' },
  { id: 'menu-categories', parentId: 'dir-system', name: '分类管理', path: '/admin/categories', icon: 'category', order: 42, status: 'active', type: 'menu', permissionCode: 'categories:view' },

  // Level 2 Menu Items under Logs
  { id: 'menu-login-logs', parentId: 'dir-logs', name: '登录日志', path: '/admin/login-logs', icon: 'fingerprint', order: 51, status: 'active', type: 'menu', permissionCode: 'logs:login' },
  { id: 'menu-op-logs', parentId: 'dir-logs', name: '操作日志', path: '/admin/op-logs', icon: 'receipt_long', order: 52, status: 'active', type: 'menu', permissionCode: 'logs:operation' },
];

export default function MenuManagementView() {
  const [menus, setMenus] = useState<SystemMenu[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'directory' | 'menu'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit / Add modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<SystemMenu | null>(null);
  const [formData, setFormData] = useState<{
    id: string;
    parentId: string;
    name: string;
    path: string;
    icon: string;
    order: number;
    status: 'active' | 'disabled';
    type: 'directory' | 'menu';
    permissionCode: string;
  }>({
    id: '',
    parentId: '',
    name: '',
    path: '',
    icon: '',
    order: 10,
    status: 'active',
    type: 'menu',
    permissionCode: '',
  });

  useEffect(() => {
    adminApi.getMenus().then((res) => {
      setMenus(res.success ? res.data : DEFAULT_MENUS);
    });
  }, []);

  const saveMenus = (updated: SystemMenu[]) => {
    // Sort primarily by order value
    const sorted = [...updated].sort((a, b) => a.order - b.order);
    setMenus(sorted);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleToggleStatus = (menuId: string) => {
    const updated = menus.map(m => {
      if (m.id === menuId) {
        const nextStatus = m.status === 'active' ? 'disabled' : 'active';
        showToast(`菜单“${m.name}”已变为${nextStatus === 'active' ? '【激活】' : '【禁用】'}`);
        return { ...m, status: nextStatus };
      }
      return m;
    });
    saveMenus(updated);
  };

  const handleDeleteMenu = (menuId: string, menuName: string) => {
    if (window.confirm(`确定要物理卸载并删除 “${menuName}” 菜单配置吗？ under-node 等关联将会失效。`)) {
      // Also delete children if it's a directory
      const children = menus.filter(m => m.parentId === menuId);
      let updated = menus.filter(m => m.id !== menuId);
      if (children.length > 0) {
        if (window.confirm(`该菜单属于目录节点，删除它会自动将其下的 ${children.length} 个子菜单一并注销。确认清除吗？`)) {
          updated = updated.filter(m => m.parentId !== menuId);
        } else {
          return;
        }
      }
      saveMenus(updated);
      showToast(`菜单 “${menuName}” 及其所有配套依赖已从系统数据库清除。`);
    }
  };

  const handleOpenAddModal = (parentId: string = '', type: 'directory' | 'menu' = 'menu') => {
    setEditingMenu(null);
    setFormData({
      id: `menu-${Math.floor(1000 + Math.random() * 9000)}`,
      parentId,
      name: '',
      path: '',
      icon: type === 'directory' ? 'folder' : 'article',
      order: menus.length ? Math.max(...menus.map(m => m.order)) + 10 : 10,
      status: 'active',
      type,
      permissionCode: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (menu: SystemMenu) => {
    setEditingMenu(menu);
    setFormData({
      id: menu.id,
      parentId: menu.parentId || '',
      name: menu.name,
      path: menu.path,
      icon: menu.icon,
      order: menu.order,
      status: menu.status,
      type: menu.type as 'directory' | 'menu',
      permissionCode: menu.permissionCode || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingMenu) {
      // edit update
      const updated = menus.map(m => {
        if (m.id === editingMenu.id) {
          return {
            ...m,
            parentId: formData.parentId ? formData.parentId : undefined,
            name: formData.name.trim(),
            path: formData.path.trim(),
            icon: formData.icon.trim(),
            order: Number(formData.order) || 0,
            status: formData.status,
            type: formData.type,
            permissionCode: formData.permissionCode.trim() || undefined,
          };
        }
        return m;
      });
      saveMenus(updated);
      showToast(`菜单 [${formData.name.trim()}] 配置修改已成功同步！`);
    } else {
      // add create
      const exists = menus.some(m => m.id === formData.id);
      let targetId = formData.id;
      if (exists) {
        targetId = `menu-${Math.floor(10000 + Math.random() * 90000)}`;
      }

      const newItem: SystemMenu = {
        id: targetId,
        parentId: formData.parentId ? formData.parentId : undefined,
        name: formData.name.trim(),
        path: formData.path.trim(),
        icon: formData.icon.trim(),
        order: Number(formData.order) || 0,
        status: formData.status,
        type: formData.type,
        permissionCode: formData.permissionCode.trim() || undefined,
      };

      saveMenus([...menus, newItem]);
      showToast(`成功注册新菜单 [${formData.name.trim()}] 至系统导航。`);
    }
    setIsModalOpen(false);
  };

  const handleOrderChange = (menuId: string, direction: 'up' | 'down') => {
    const idx = menus.findIndex(m => m.id === menuId);
    if (idx === -1) return;

    const targetList = [...menus];
    if (direction === 'up' && idx > 0) {
      // swap orders
      const temp = targetList[idx].order;
      targetList[idx].order = targetList[idx - 1].order;
      targetList[idx - 1].order = temp;
    } else if (direction === 'down' && idx < targetList.length - 1) {
      // swap orders
      const temp = targetList[idx].order;
      targetList[idx].order = targetList[idx + 1].order;
      targetList[idx + 1].order = temp;
    }
    saveMenus(targetList);
    showToast('菜单排序权值重置成功！已调换次序。');
  };

  const resetToDefault = () => {
    if (window.confirm('您确定要还原所有菜单选项吗？此举将清空您的自定义菜单结构。')) {
      saveMenus(DEFAULT_MENUS);
      showToast('成功回滚至出厂默认路由菜单架构。');
    }
  };

  // Directories list for selection
  const directoriesOnly = menus.filter(m => m.type === 'directory');

  // Filter and group menu list
  const filteredList = menus.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (m.path && m.path.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (m.permissionCode && m.permissionCode.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'all' ? true : m.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-500 uppercase tracking-wider select-none">
            <Settings className="w-3.5 h-3.5 text-indigo-500 animate-spin" style={{ animationDuration: '6s' }} />
            <span>系统控制台基础建设</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 mt-0.5">
            菜单管理配置 
            <span className="font-mono text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-normal">
              routes_config
            </span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            管理员可在该视图灵活更改或增减左侧导航栏的菜单模块，设置所属文件夹层次，绑定相应的权限字符来进行页面级访问鉴权。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetToDefault}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-705/80 text-slate-700 dark:text-slate-350 font-bold text-xs rounded-xl transition-all cursor-pointer border-none flex items-center gap-1 focus:outline-none"
            title="一键还原出厂默认设置"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>还原默认</span>
          </button>
          
          <button
            onClick={() => handleOpenAddModal('', 'directory')}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-xl transition-all cursor-pointer border border-indigo-200/50 dark:border-indigo-900/30 flex items-center gap-1 focus:outline-none"
          >
            <FolderPlus className="w-3.5 h-3.5 text-indigo-500" />
            <span>新建目录</span>
          </button>

          <button
            onClick={() => handleOpenAddModal('', 'menu')}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl transition-all cursor-pointer border-none flex items-center gap-1 shadow-sm focus:outline-none"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>注册子菜单</span>
          </button>
        </div>
      </div>

      {/* Global Toast Notification inside View */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 animate-bounce" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter and search bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/85 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-950/30 outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all font-semibold"
            placeholder="按 菜单名、后台路由、ID编码、绑定权限字符 快速检索..."
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 select-none uppercase tracking-wider">类型筛选:</span>
          <div className="flex border border-slate-200 dark:border-slate-800 p-0.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 select-none">
            {[
              { value: 'all', label: '全部菜单' },
              { value: 'directory', label: '大类目录' },
              { value: 'menu', label: '叶子页面' }
            ].map(b => (
              <button
                key={b.value}
                onClick={() => setFilterType(b.value as any)}
                className={`px-3 py-1.5 rounded-lg border-none text-[11px] font-bold cursor-pointer transition-all focus:outline-none ${
                  filterType === b.value
                    ? 'bg-white dark:bg-slate-805 text-indigo-600 dark:text-indigo-400 shadow-xs ring-1 ring-slate-100 dark:ring-slate-800'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 bg-transparent'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Tree Grid Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 select-none text-[10.5px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider h-11">
                <th className="pl-5 w-56">菜单大名称 / ID</th>
                <th className="w-24">路由节点类型</th>
                <th className="w-20">图标标识</th>
                <th className="w-48 font-mono">前端挂载路由地址 (Path)</th>
                <th className="w-44">挂载鉴权项 (Permission)</th>
                <th className="w-20 text-center">排序权</th>
                <th className="w-24 text-center">状态</th>
                <th className="pr-5 text-right w-44">管理操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 dark:text-slate-500 font-semibold">
                    没有找到符合筛选条件的菜单项配置。
                  </td>
                </tr>
              ) : (
                filteredList.map((menu, menuIndex) => {
                  const isDir = menu.type === 'directory';
                  const parentName = menu.parentId 
                    ? menus.find(m => m.id === menu.parentId)?.name 
                    : null;

                  return (
                    <tr 
                      key={menu.id} 
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all ${
                        isDir ? 'bg-slate-50/15 dark:bg-slate-950/5 font-semibold' : ''
                      }`}
                    >
                      {/* Name / ID */}
                      <td className="pl-5 py-3.5">
                        <div className="flex items-start gap-2 max-w-xs">
                          {isDir ? (
                            <Folder className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0 fill-indigo-500/10" />
                          ) : (
                            <FileText className="w-4 h-4 text-slate-450 text-slate-400 mt-0.5 flex-shrink-0" />
                          )}
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                              <span>{menu.name}</span>
                              {parentName && (
                                <span className="inline-block px-1.5 py-0.5 rounded text-[8px] bg-slate-100 dark:bg-slate-800/80 text-slate-500">
                                  属「{parentName}」
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-[9px] text-slate-400 block mt-0.5 select-all">{menu.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Type badge */}
                      <td>
                        {isDir ? (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/10">
                            一级目录
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 border border-slate-200/40 dark:border-slate-700/40">
                            子级菜单
                          </span>
                        )}
                      </td>

                      {/* Icon */}
                      <td>
                        <div className="flex items-center gap-1.5 font-sans">
                          {menu.icon ? (
                            <>
                              <span className="material-symbols-outlined text-[18px] text-indigo-500/80 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-md">
                                {menu.icon}
                              </span>
                              <span className="font-mono text-[10px] text-slate-400 select-all">{menu.icon}</span>
                            </>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </div>
                      </td>

                      {/* Path route */}
                      <td className="font-mono text-[11px] text-slate-600 dark:text-slate-300">
                        {menu.path ? (
                          <span className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 px-2 py-0.5 rounded select-all font-bold text-indigo-600 dark:text-indigo-400">
                            {menu.path}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic font-sans text-[10px]">一级占位目录</span>
                        )}
                      </td>

                      {/* Auth/Permission Code */}
                      <td>
                        {menu.permissionCode ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-500/5 px-2 py-0.5 rounded-md border border-amber-500/10 select-all">
                            <Key className="w-2.5 h-2.5 text-amber-500" />
                            {menu.permissionCode}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[10px]">公开页 / 无需权限</span>
                        )}
                      </td>

                      {/* Sorting order */}
                      <td className="text-center font-mono">
                        <div className="flex items-center justify-center gap-1 text-[10.5px]">
                          <span className="font-bold text-slate-600 dark:text-slate-300 w-6 block text-center bg-slate-50 dark:bg-slate-800 py-0.5 rounded border border-slate-100 dark:border-slate-800/80">
                            {menu.order}
                          </span>
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={() => handleOrderChange(menu.id, 'up')}
                              disabled={menuIndex === 0}
                              className="p-0 border-none bg-transparent hover:text-indigo-500 cursor-pointer text-slate-400 disabled:opacity-30 disabled:hover:text-slate-400 focus:outline-none"
                              title="往上跳位"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleOrderChange(menu.id, 'down')}
                              disabled={menuIndex === filteredList.length - 1}
                              className="p-0 border-none bg-transparent hover:text-indigo-500 cursor-pointer text-slate-400 disabled:opacity-30 disabled:hover:text-slate-400 focus:outline-none"
                              title="往后挪位"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="text-center select-none">
                        <button
                          onClick={() => handleToggleStatus(menu.id)}
                          className="border-none bg-transparent cursor-pointer p-0 focus:outline-none"
                          title="点击快速启用/隐藏该菜单"
                        >
                          {menu.status === 'active' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              展示中
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              已隐藏
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Operations */}
                      <td className="pr-5 text-right py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(menu)}
                            className="bg-transparent border border-slate-200 hover:border-slate-350 dark:border-slate-800 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 p-1.5 rounded-lg transition-colors cursor-pointer focus:outline-none flex items-center justify-center"
                            title="修改菜单细节"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-indigo-500" />
                          </button>
                          <button
                            onClick={() => handleDeleteMenu(menu.id, menu.name)}
                            className="bg-transparent border border-rose-100 hover:border-rose-200 dark:border-rose-900/40 dark:hover:border-rose-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 p-1.5 rounded-lg transition-colors cursor-pointer focus:outline-none flex items-center justify-center"
                            title="卸载废除此菜单"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Dialog Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl p-5 text-left text-slate-800 dark:text-slate-250 z-10"
            >
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
                <Settings className="w-4 h-4 text-indigo-500" />
                <span>{editingMenu ? '修改菜单指令参数' : '增补新导航菜单'}</span>
              </h3>

              <form onSubmit={handleSaveForm} className="space-y-4 mt-4">
                {/* Type Selection */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 select-none">节点类型 *</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {[
                      { value: 'directory', label: '一级目录', desc: '不承载路径，折叠其下子项' },
                      { value: 'menu', label: '叶子二级菜单', desc: '挂载前端展示页面' }
                    ].map(n => (
                      <button
                        type="button"
                        key={n.value}
                        onClick={() => setFormData({ ...formData, type: n.value as any })}
                        className={`p-2 rounded-lg border text-left cursor-pointer transition-colors flex flex-col ${
                          formData.type === n.value
                            ? 'border-indigo-500 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 font-bold'
                            : 'border-slate-200 dark:border-slate-800 bg-transparent text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xs">{n.label}</span>
                        <span className="text-[8px] text-slate-400 block mt-0.5 line-clamp-1">{n.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Parent Menu Folder Selector (Only if it is a secondary menu) */}
                {formData.type === 'menu' && (
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 select-none" htmlFor="parentId">
                      所属一级分类目录 *
                    </label>
                    <select
                      id="parentId"
                      value={formData.parentId}
                      onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                      className="block w-full border border-slate-200 dark:border-slate-800 rounded-lg p-2 mt-1 text-xs text-slate-800 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-950/40 outline-none focus:border-indigo-500"
                      required
                    >
                      <option value="">-- 请选择上级大类目录 --</option>
                      {directoriesOnly.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* ID Prefix */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 select-none" htmlFor="menu-id">
                    系统唯一识别 ID * (不可复写)
                  </label>
                  <input
                    id="menu-id"
                    type="text"
                    value={formData.id}
                    disabled={!!editingMenu}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="block w-full border border-slate-200 dark:border-slate-800 rounded-lg p-2 mt-1 text-xs text-slate-800 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-950/40 outline-none focus:border-indigo-500 disabled:opacity-50 font-mono font-bold"
                    placeholder="例如: menu-marketing"
                    required
                  />
                </div>

                {/* Menu Name & Icon SideBySide */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 select-none" htmlFor="menu-name">
                      菜单显示名字 *
                    </label>
                    <input
                      id="menu-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="block w-full border border-slate-200 dark:border-slate-800 rounded-lg p-2 mt-1 text-xs text-slate-800 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-950/40 outline-none focus:border-indigo-500 font-bold"
                      placeholder="例如: 财务审计"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 select-none" htmlFor="menu-icon">
                      图标标识 (Icon Symbol)
                    </label>
                    <input
                      id="menu-icon"
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="block w-full border border-slate-200 dark:border-slate-800 rounded-lg p-2 mt-1 text-xs text-slate-800 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-950/40 outline-none focus:border-indigo-500 font-mono"
                      placeholder="如: campaign, shopping_bag, folder"
                    />
                  </div>
                </div>

                {/* Route Path (Only for menu type) */}
                {formData.type === 'menu' && (
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 select-none" htmlFor="menu-path">
                      前端挂载路径 (Path) *
                    </label>
                    <input
                      id="menu-path"
                      type="text"
                      value={formData.path}
                      onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                      className="block w-full border border-slate-200 dark:border-slate-800 rounded-lg p-2 mt-1 text-xs text-slate-800 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-950/40 outline-none focus:border-indigo-500 font-mono text-indigo-505 font-bold"
                      placeholder="例如: /admin/finance"
                      required
                    />
                  </div>
                )}

                {/* Auth Check permissionCode (Only for menu type) */}
                {formData.type === 'menu' && (
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 select-none" htmlFor="permissionCode">
                      绑定制约的权限代码 (无则公开展示)
                    </label>
                    <input
                      id="permissionCode"
                      type="text"
                      value={formData.permissionCode}
                      onChange={(e) => setFormData({ ...formData, permissionCode: e.target.value })}
                      className="block w-full border border-slate-200 dark:border-slate-800 rounded-lg p-2 mt-1 text-xs text-slate-800 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-950/40 outline-none focus:border-indigo-500 font-mono"
                      placeholder="例如: finance:audit"
                    />
                  </div>
                )}

                {/* Sort Order and Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 select-none" htmlFor="menu-order">
                      排序权值 (Order值)
                    </label>
                    <input
                      id="menu-order"
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                      className="block w-full border border-slate-200 dark:border-slate-800 rounded-lg p-2 mt-1 text-xs text-slate-800 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-950/40 outline-none focus:border-indigo-500 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 select-none">默认是否展示中</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="block w-full border border-slate-200 dark:border-slate-800 rounded-lg p-2 mt-1 text-xs text-slate-850 bg-slate-50/50 dark:bg-slate-950/40 outline-none focus:border-indigo-50"
                    >
                      <option value="active">展示在主导航</option>
                      <option value="disabled">隐藏/禁用此项</option>
                    </select>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-850 mt-5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 font-bold text-xs rounded-xl cursor-pointer transition-colors border-none focus:outline-none"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-primary text-white font-bold text-xs rounded-xl cursor-pointer transition-colors border-none shadow-md focus:outline-none"
                  >
                    保存配置项
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

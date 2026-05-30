/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert, ShieldCheck, Plus, Search, Edit3, Trash2, Key, CheckCircle,
  XCircle, ToggleLeft, ToggleRight, Settings, Users, Folder, Check, AlertTriangle, RefreshCw
} from 'lucide-react';
import { SystemRole, SystemMenu, SystemPermission } from '../types';
import { adminApi } from '../services/adminApi';

const DEFAULT_ROLES: SystemRole[] = [
  {
    id: 'role-super',
    name: '超级管理员',
    code: 'SUPER_ADMIN',
    description: '拥有管理端全部菜单和操作权限',
    status: 'active',
    createTime: '2026-01-01 08:00:00',
    memberCount: 1,
    menuIds: [],
    permissionCodes: []
  },
  {
    id: 'role-readonly',
    name: '只读管理员',
    code: 'READONLY_ADMIN',
    description: '只能查看后台数据，不能新增、修改或删除',
    status: 'active',
    createTime: '2026-01-02 08:00:00',
    memberCount: 1,
    menuIds: [],
    permissionCodes: []
  }
];

interface Props {
  readonly?: boolean;
  adminRole?: string;
}

export default function RoleManagementView({ readonly = false, adminRole = 'USER' }: Props) {
  const [roles, setRoles] = useState<SystemRole[]>([]);
  const [menus, setMenus] = useState<SystemMenu[]>([]);
  const [permissions, setPermissions] = useState<SystemPermission[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'info' | 'menus' | 'permissions'>('info');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isNewRoleModalOpen, setIsNewRoleModalOpen] = useState(false);
  const [newRoleForm, setNewRoleForm] = useState({ name: '', code: '', description: '', status: 'active' as 'active' | 'disabled' });

  useEffect(() => {
    Promise.all([adminApi.getRoles(), adminApi.getMenus(), adminApi.getPermissions()]).then(([rolesRes, menusRes, permsRes]) => {
      const loadedRoles = rolesRes.success ? rolesRes.data : DEFAULT_ROLES;
      setRoles(loadedRoles);
      setMenus(menusRes.success ? menusRes.data : []);
      setPermissions(permsRes.success ? permsRes.data : []);
      setSelectedRoleId((prev) => prev || loadedRoles[0]?.id || null);
    });
  }, []);

  const isSuperAdmin = adminRole === 'SUPER_ADMIN';
  const isReadonly = readonly || adminRole === 'READONLY_ADMIN';
  const currentRole = roles.find((r) => r.id === selectedRoleId) || null;
  const filteredRoles = roles.filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.code.toLowerCase().includes(searchQuery.toLowerCase()) || r.description.toLowerCase().includes(searchQuery.toLowerCase()));

  const saveRolesList = (updated: SystemRole[]) => setRoles(updated);
  const showToast = (msg: string) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 3000); };

  const mutateRole = (updater: (role: SystemRole) => SystemRole) => {
    if (isReadonly) {
      showToast('当前账号为只读管理员，只能查看不能操作');
      return;
    }
    setRoles((prev) => prev.map((role) => (role.id === currentRole?.id ? updater(role) : role)));
  };

  const handleSelectAllMenus = () => {
    if (!currentRole || isReadonly) return;
    saveRolesList(roles.map((r) => r.id === currentRole.id ? { ...r, menuIds: menus.map((m) => m.id) } : r));
    showToast('菜单权限已更新');
  };

  const handleClearAllMenus = () => {
    if (!currentRole || isReadonly) return;
    saveRolesList(roles.map((r) => r.id === currentRole.id ? { ...r, menuIds: [] } : r));
    showToast('菜单权限已清空');
  };

  const handleSelectAllPermissions = () => {
    if (!currentRole || isReadonly) return;
    saveRolesList(roles.map((r) => r.id === currentRole.id ? { ...r, permissionCodes: permissions.map((p) => p.code) } : r));
    showToast('权限已更新');
  };

  const renderReadonlyBadge = () => (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
      <ShieldAlert className="w-3.5 h-3.5" /> 只读模式
    </span>
  );

  return (
    <div className="space-y-4 sm:space-y-6 pb-8">
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-amber-600 uppercase tracking-wider select-none">
            <Key className="w-3.5 h-3.5" /> 角色与权限中心
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-2 flex-wrap">
            管理端角色管理
            {isReadonly ? renderReadonlyBadge() : <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200"><ShieldCheck className="w-3.5 h-3.5" />可操作</span>}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 max-w-2xl">
            {isSuperAdmin ? '超级管理员可查看和编辑全部角色、菜单和权限。' : '只读管理员只能查看角色和权限配置，不能新增、修改或删除。'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button disabled={isReadonly} onClick={() => setIsNewRoleModalOpen(true)} className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border-none ${isReadonly ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-800 text-white hover:bg-slate-700 cursor-pointer'}`}>
            <Plus className="w-4 h-4" /> 新建角色
          </button>
          <button onClick={() => adminApi.getRoles().then((res) => res.success && saveRolesList(res.data))} className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border-none bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" /> 刷新
          </button>
        </div>
      </div>

      <AnimatePresence>
        {toastMessage && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">{toastMessage}</motion.div>}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 min-h-[420px]">
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-sm outline-none" placeholder="搜索角色名或编码" />
          </div>
          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {filteredRoles.map((role) => {
              const active = role.id === selectedRoleId;
              return (
                <button key={role.id} onClick={() => setSelectedRoleId(role.id)} className={`w-full text-left rounded-xl border p-3 transition-all ${active ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/40'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-sm truncate">{role.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono truncate">{role.code}</div>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full ${role.code === 'SUPER_ADMIN' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{role.code === 'SUPER_ADMIN' ? '最高权限' : '只读'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 min-h-[420px]">
          {currentRole ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">{currentRole.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{currentRole.description}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button disabled={isReadonly} onClick={handleSelectAllMenus} className={`px-3 py-2 rounded-xl text-xs font-bold ${isReadonly ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>全选菜单</button>
                  <button disabled={isReadonly} onClick={handleClearAllMenus} className={`px-3 py-2 rounded-xl text-xs font-bold ${isReadonly ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>清空菜单</button>
                  <button disabled={isReadonly} onClick={handleSelectAllPermissions} className={`px-3 py-2 rounded-xl text-xs font-bold ${isReadonly ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}>全选权限</button>
                </div>
              </div>

              <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
                {['info', 'menus', 'permissions'].map((tab) => (
                  <button key={tab} onClick={() => setActiveWorkspaceTab(tab as any)} className={`px-3 py-2 text-sm font-bold border-b-2 -mb-px ${activeWorkspaceTab === tab ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500'}`}>{tab === 'info' ? '基础信息' : tab === 'menus' ? '菜单权限' : '功能权限'}</button>
                ))}
              </div>

              {activeWorkspaceTab === 'info' && <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm"><div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40"><div className="text-slate-500 text-xs">角色编码</div><div className="font-mono font-bold mt-1">{currentRole.code}</div></div><div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40"><div className="text-slate-500 text-xs">成员数</div><div className="font-bold mt-1">{currentRole.memberCount}</div></div></div>}

              {activeWorkspaceTab === 'menus' && <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{menus.map((menu) => <div key={menu.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between"><div><div className="font-semibold text-sm">{menu.name}</div><div className="text-[11px] text-slate-500 font-mono">{menu.id}</div></div><div className="text-xs text-slate-500">{currentRole.menuIds.includes(menu.id) ? '已授权' : '未授权'}</div></div>)}</div>}

              {activeWorkspaceTab === 'permissions' && <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{permissions.map((perm) => <div key={perm.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between"><div><div className="font-semibold text-sm">{perm.name}</div><div className="text-[11px] text-slate-500 font-mono">{perm.code}</div></div><div className="text-xs text-slate-500">{currentRole.permissionCodes.includes(perm.code) ? '已授权' : '未授权'}</div></div>)}</div>}
            </div>
          ) : <div className="text-center text-slate-400 py-16">暂无角色数据</div>}
        </div>
      </div>

      <AnimatePresence>
        {isNewRoleModalOpen && !isReadonly && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsNewRoleModalOpen(false)} className="absolute inset-0 bg-slate-900/50" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
              <h3 className="font-bold text-base">新建角色</h3>
              <div className="space-y-3">
                <input value={newRoleForm.name} onChange={(e) => setNewRoleForm({ ...newRoleForm, name: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40" placeholder="角色名称" />
                <input value={newRoleForm.code} onChange={(e) => setNewRoleForm({ ...newRoleForm, code: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 font-mono" placeholder="角色编码" />
                <textarea value={newRoleForm.description} onChange={(e) => setNewRoleForm({ ...newRoleForm, description: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40" placeholder="描述" rows={3} />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setIsNewRoleModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold">取消</button>
                  <button type="button" onClick={() => {
                    if (isReadonly) return;
                    const code = newRoleForm.code.trim().toUpperCase();
                    if (!newRoleForm.name.trim() || !code) return;
                    const next: SystemRole = { id: `role-${Date.now()}`, name: newRoleForm.name.trim(), code, description: newRoleForm.description.trim(), status: newRoleForm.status, createTime: new Date().toISOString().slice(0, 19).replace('T', ' '), memberCount: 0, menuIds: [], permissionCodes: [] };
                    setRoles([...roles, next]);
                    setSelectedRoleId(next.id);
                    setIsNewRoleModalOpen(false);
                  }} className="px-4 py-2 rounded-xl bg-slate-800 text-white text-sm font-bold">保存</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

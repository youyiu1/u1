/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Edit2, Key, Plus, RefreshCw, Search, ShieldAlert, ShieldCheck, Trash2 } from 'lucide-react';
import { SystemPermission } from '../types';
import { adminApi } from '../services/adminApi';

const CATEGORIES = ['全部', '用户风控', '内容运营', '生活服务', '系统设置'];

interface Props {
  readonly?: boolean;
  adminRole?: string;
}

export default function PermissionManagementView({ readonly = false, adminRole = 'USER' }: Props) {
  const [permissions, setPermissions] = useState<SystemPermission[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [editingPerm, setEditingPerm] = useState<SystemPermission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', category: '用户风控', description: '', status: 'active' as 'active' | 'disabled' });

  const isReadonly = readonly || adminRole === 'READONLY_ADMIN';

  const loadPermissions = () => {
    adminApi.getPermissions().then((res) => {
      if (res.success) setPermissions(res.data);
    });
  };

  useEffect(loadPermissions, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const guardReadonly = () => {
    if (!isReadonly) return false;
    showToast('当前账号为只读管理员，只能查看不能操作');
    return true;
  };

  const openAddModal = () => {
    if (guardReadonly()) return;
    setEditingPerm(null);
    setFormData({ name: '', code: '', category: activeCategory === '全部' ? '用户风控' : activeCategory, description: '', status: 'active' });
    setIsModalOpen(true);
  };

  const openEditModal = (perm: SystemPermission) => {
    if (guardReadonly()) return;
    setEditingPerm(perm);
    setFormData({ name: perm.name, code: perm.code, category: perm.category, description: perm.description, status: perm.status });
    setIsModalOpen(true);
  };

  const savePermission = (event: React.FormEvent) => {
    event.preventDefault();
    if (guardReadonly()) return;
    if (!formData.name.trim() || !formData.code.trim()) return;

    if (editingPerm) {
      setPermissions((prev) => prev.map((item) => item.id === editingPerm.id ? { ...item, ...formData, name: formData.name.trim(), code: formData.code.trim(), description: formData.description.trim() } : item));
      showToast('权限已更新');
    } else {
      setPermissions((prev) => [...prev, {
        id: `perm-${Date.now()}`,
        name: formData.name.trim(),
        code: formData.code.trim(),
        category: formData.category,
        description: formData.description.trim(),
        status: formData.status,
        createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
      }]);
      showToast('权限已新增');
    }
    setIsModalOpen(false);
  };

  const toggleStatus = (permId: string) => {
    if (guardReadonly()) return;
    setPermissions((prev) => prev.map((item) => item.id === permId ? { ...item, status: item.status === 'active' ? 'disabled' : 'active' } : item));
    showToast('权限状态已切换');
  };

  const deletePermission = (permId: string) => {
    if (guardReadonly()) return;
    if (!window.confirm('确定删除这个权限吗？')) return;
    setPermissions((prev) => prev.filter((item) => item.id !== permId));
    showToast('权限已删除');
  };

  const filteredPermissions = permissions.filter((perm) => {
    const keyword = searchQuery.toLowerCase();
    const matchesSearch = perm.name.toLowerCase().includes(keyword) || perm.code.toLowerCase().includes(keyword) || perm.description.toLowerCase().includes(keyword);
    const matchesCategory = activeCategory === '全部' || perm.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4 sm:space-y-6 pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-amber-600 uppercase tracking-wider select-none">
            <Key className="w-3.5 h-3.5" /> 权限中心
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-2 flex-wrap">
            管理端权限管理
            {isReadonly ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 border border-amber-200"><ShieldAlert className="w-3.5 h-3.5" />只读模式</span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200"><ShieldCheck className="w-3.5 h-3.5" />可操作</span>
            )}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 max-w-2xl">权限码用于控制后台敏感功能。只读管理员只能查看，超级管理员可维护。</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={loadPermissions} className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border-none bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" /> 刷新
          </button>
          <button disabled={isReadonly} onClick={openAddModal} className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border-none ${isReadonly ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-800 text-white hover:bg-slate-700 cursor-pointer'}`}>
            <Plus className="w-4 h-4" /> 新建权限
          </button>
        </div>
      </div>

      <AnimatePresence>
        {toastMessage && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">{toastMessage}</motion.div>}
      </AnimatePresence>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {CATEGORIES.map((category) => {
          const active = activeCategory === category;
          const count = category === '全部' ? permissions.length : permissions.filter((item) => item.category === category).length;
          return (
            <button key={category} onClick={() => setActiveCategory(category)} className={`p-3 rounded-xl border text-left ${active ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 text-slate-600'}`}>
              <div className="text-xs font-bold">{category}</div>
              <div className="text-lg font-black mt-1">{count}</div>
            </button>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-sm outline-none" placeholder="搜索权限名、权限码或描述" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredPermissions.map((perm) => (
          <motion.div key={perm.id} layout className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 shadow-sm ${perm.status === 'disabled' ? 'border-slate-200 opacity-70' : 'border-slate-200 dark:border-slate-800'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{perm.name}</h4>
                <p className="text-[11px] font-mono text-indigo-600 break-all mt-1">{perm.code}</p>
              </div>
              <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold shrink-0">{perm.category}</span>
            </div>
            <p className="text-xs text-slate-500 mt-3 line-clamp-2 min-h-[36px]">{perm.description || '暂无说明'}</p>
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 mt-4 pt-3">
              <button disabled={isReadonly} onClick={() => toggleStatus(perm.id)} className={`text-xs font-bold border-none bg-transparent ${isReadonly ? 'text-slate-400 cursor-not-allowed' : perm.status === 'active' ? 'text-emerald-600 cursor-pointer' : 'text-rose-500 cursor-pointer'}`}>
                {perm.status === 'active' ? '已启用' : '已停用'}
              </button>
              <div className="flex items-center gap-1">
                <button disabled={isReadonly} onClick={() => openEditModal(perm)} className={`p-2 rounded-lg border-none ${isReadonly ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 cursor-pointer'}`} title="编辑">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button disabled={isReadonly} onClick={() => deletePermission(perm.id)} className={`p-2 rounded-lg border-none ${isReadonly ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer'}`} title="删除">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && !isReadonly && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/50" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
              <h3 className="font-bold text-base mb-4">{editingPerm ? '编辑权限' : '新建权限'}</h3>
              <form onSubmit={savePermission} className="space-y-3">
                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40" placeholder="权限名称" required />
                <input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 font-mono" placeholder="权限码，如 user:ban" required />
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
                  {CATEGORIES.filter((item) => item !== '全部').map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40" rows={3} placeholder="权限说明" />
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold">取消</button>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-slate-800 text-white text-sm font-bold">保存</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

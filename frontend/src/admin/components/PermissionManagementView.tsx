/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Key, RefreshCw, Search } from 'lucide-react';
import { SystemPermission } from '../types';
import { adminApi } from '../services/adminApi';

const ALL_CATEGORY = '全部';

export default function PermissionManagementView() {
  const [permissions, setPermissions] = useState<SystemPermission[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);

  const loadPermissions = async () => {
    const res = await adminApi.getPermissions();
    setPermissions(res.success ? res.data : []);
  };

  useEffect(() => {
    loadPermissions();
  }, []);

  const categories = useMemo(() => {
    return [ALL_CATEGORY, ...Array.from(new Set(permissions.map((item) => item.category).filter(Boolean)))];
  }, [permissions]);

  const filteredPermissions = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    return permissions.filter((perm) => {
      const matchesSearch =
        !keyword ||
        perm.name.toLowerCase().includes(keyword) ||
        perm.code.toLowerCase().includes(keyword) ||
        perm.description.toLowerCase().includes(keyword);
      const matchesCategory = activeCategory === ALL_CATEGORY || perm.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [permissions, searchQuery, activeCategory]);

  return (
    <div className="space-y-4 sm:space-y-6 pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-amber-600 uppercase tracking-wider select-none">
            <Key className="w-3.5 h-3.5" /> 权限中心
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">管理端权限管理</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 max-w-2xl">
            权限由后端统一返回并用于说明当前后台能力边界。本页不做本地假新增、假编辑或假删除。
          </p>
        </div>
        <button onClick={loadPermissions} className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border-none bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer">
          <RefreshCw className="w-3.5 h-3.5" /> 刷新
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {categories.map((category) => {
          const active = activeCategory === category;
          const count = category === ALL_CATEGORY ? permissions.length : permissions.filter((item) => item.category === category).length;
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
          <div key={perm.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{perm.name}</h4>
                <p className="text-[11px] font-mono text-indigo-600 break-all mt-1">{perm.code}</p>
              </div>
              <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold shrink-0">{perm.category}</span>
            </div>
            <p className="text-xs text-slate-500 mt-3 line-clamp-2 min-h-[36px]">{perm.description || '暂无说明'}</p>
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 mt-4 pt-3">
              <span className={`text-xs font-bold ${perm.status === 'active' ? 'text-emerald-600' : 'text-rose-500'}`}>
                {perm.status === 'active' ? '已启用' : '已停用'}
              </span>
              <span className="text-[11px] text-slate-400">后端配置</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

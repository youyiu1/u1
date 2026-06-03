/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Search, Settings, RefreshCw, Folder, FileText, Key } from 'lucide-react';
import { SystemMenu } from '../types';
import { adminApi } from '../services/adminApi';
import { matchesAnyKeyword, normalizeSearchTerm } from '../utils/search';

export default function MenuManagementView() {
  const [menus, setMenus] = useState<SystemMenu[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'directory' | 'menu'>('all');

  const loadMenus = async () => {
    const res = await adminApi.getMenus();
    setMenus(res.success ? res.data : []);
  };

  useEffect(() => {
    loadMenus();
  }, []);

  const filteredMenus = useMemo(() => {
    const keyword = normalizeSearchTerm(searchQuery);
    return menus.filter((menu) => {
      const matchesSearch = matchesAnyKeyword(keyword, [
        menu.name,
        menu.id,
        menu.path,
        menu.permissionCode,
      ]);
      const matchesType = filterType === 'all' || menu.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [menus, searchQuery, filterType]);

  const directoriesOnly = useMemo(() => menus.filter((menu) => menu.type === 'directory'), [menus]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-500 uppercase tracking-wider select-none">
            <Settings className="w-3.5 h-3.5 text-indigo-500" />
            <span>系统控制台基础建设</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 mt-0.5">
            菜单管理配置
            <span className="font-mono text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-normal">routes_config</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            菜单结构由后端统一返回，本页仅用于查看当前导航结构与权限映射，不提供本地虚假编辑。
          </p>
        </div>
        <button onClick={loadMenus} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer border-none flex items-center gap-1 focus:outline-none">
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>刷新</span>
        </button>
      </div>

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
            placeholder="搜索菜单名、路由、ID 或权限码"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 select-none uppercase tracking-wider">类型筛选</span>
          <div className="flex border border-slate-200 dark:border-slate-800 p-0.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 select-none">
            {[
              { value: 'all', label: '全部菜单' },
              { value: 'directory', label: '目录' },
              { value: 'menu', label: '页面' },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setFilterType(item.value as 'all' | 'directory' | 'menu')}
                className={`px-3 py-1.5 rounded-lg border-none text-[11px] font-bold cursor-pointer transition-all focus:outline-none ${
                  filterType === item.value
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs ring-1 ring-slate-100 dark:ring-slate-800'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 bg-transparent'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-xs p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
            <div className="text-[11px] text-slate-500">菜单总数</div>
            <div className="mt-1 text-xl font-black text-slate-800 dark:text-slate-100">{menus.length}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
            <div className="text-[11px] text-slate-500">目录数量</div>
            <div className="mt-1 text-xl font-black text-slate-800 dark:text-slate-100">{directoriesOnly.length}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
            <div className="text-[11px] text-slate-500">页面数量</div>
            <div className="mt-1 text-xl font-black text-slate-800 dark:text-slate-100">{menus.filter((item) => item.type === 'menu').length}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
            <div className="text-[11px] text-slate-500">带权限码</div>
            <div className="mt-1 text-xl font-black text-slate-800 dark:text-slate-100">{menus.filter((item) => item.permissionCode).length}</div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 select-none text-[10.5px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider h-11">
                <th className="pl-5 w-56">菜单名称 / ID</th>
                <th className="w-24">节点类型</th>
                <th className="w-20">图标</th>
                <th className="w-48 font-mono">路由地址</th>
                <th className="w-44">权限码</th>
                <th className="w-20 text-center">排序</th>
                <th className="w-24 text-center">状态</th>
                <th className="pr-5 text-right w-44">上级目录</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredMenus.map((menu) => {
                const isDir = menu.type === 'directory';
                const parentName = menu.parentId ? menus.find((item) => item.id === menu.parentId)?.name : null;
                return (
                  <tr key={menu.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all ${isDir ? 'bg-slate-50/15 dark:bg-slate-950/5 font-semibold' : ''}`}>
                    <td className="pl-5 py-3.5">
                      <div className="flex items-start gap-2 max-w-xs">
                        {isDir ? <Folder className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0 fill-indigo-500/10" /> : <FileText className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />}
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-100">{menu.name}</div>
                          <span className="font-mono text-[9px] text-slate-400 block mt-0.5 select-all">{menu.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>{isDir ? <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/10">一级目录</span> : <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/40 dark:border-slate-700/40">子页面</span>}</td>
                    <td>
                      <div className="flex items-center gap-1.5 font-sans">
                        {menu.icon ? <><span className="material-symbols-outlined text-[18px] text-indigo-500/80 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-md">{menu.icon}</span><span className="font-mono text-[10px] text-slate-400 select-all">{menu.icon}</span></> : <span className="text-slate-400">-</span>}
                      </div>
                    </td>
                    <td className="font-mono text-[11px] text-slate-600 dark:text-slate-300">{menu.path ? <span className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 px-2 py-0.5 rounded select-all font-bold text-indigo-600 dark:text-indigo-400">{menu.path}</span> : <span className="text-slate-400 italic font-sans text-[10px]">一级目录占位</span>}</td>
                    <td>{menu.permissionCode ? <span className="inline-flex items-center gap-1 font-mono text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-500/5 px-2 py-0.5 rounded-md border border-amber-500/10 select-all"><Key className="w-2.5 h-2.5 text-amber-500" />{menu.permissionCode}</span> : <span className="text-slate-400 italic text-[10px]">公开页面 / 无需权限</span>}</td>
                    <td className="text-center font-mono"><span className="font-bold text-slate-600 dark:text-slate-300 w-6 block text-center bg-slate-50 dark:bg-slate-800 py-0.5 rounded border border-slate-100 dark:border-slate-800/80">{menu.order}</span></td>
                    <td className="text-center select-none"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${menu.status === 'active' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-500'}`}>{menu.status === 'active' ? '展示中' : '已隐藏'}</span></td>
                    <td className="pr-5 text-right py-3.5 text-slate-500">{parentName || '无'}</td>
                  </tr>
                );
              })}
              {filteredMenus.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 dark:text-slate-500 font-semibold">没有找到符合筛选条件的菜单配置。</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Key, RefreshCw, ShieldAlert, ShieldCheck } from 'lucide-react';
import { SystemPermission, SystemRole } from '../types';
import { adminApi } from '../services/adminApi';

interface Props {
  readonly?: boolean;
  adminRole?: string;
}

export default function RoleManagementView({ readonly = false, adminRole = 'USER' }: Props) {
  const [roles, setRoles] = useState<SystemRole[]>([]);
  const [permissions, setPermissions] = useState<SystemPermission[]>([]);
  const isReadonly = readonly || adminRole === 'READONLY_ADMIN';

  const loadData = async () => {
    const [roleRes, permRes] = await Promise.all([adminApi.getRoles(), adminApi.getPermissions()]);
    setRoles(roleRes.success ? roleRes.data : []);
    setPermissions(permRes.success ? permRes.data : []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const currentRole = useMemo(() => roles[0], [roles]);

  return (
    <div className="space-y-4 sm:space-y-6 pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-amber-600 uppercase tracking-wider select-none">
            <Key className="w-3.5 h-3.5" /> 角色与权限中心
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-2 flex-wrap">
            管理端角色管理
            {isReadonly ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                <ShieldAlert className="w-3.5 h-3.5" />只读模式
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />可查看
              </span>
            )}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 max-w-2xl">
            当前系统只保留真实的系统级角色配置。角色、权限和菜单由后端统一定义，前端不提供假新增、假编辑或假删除。
          </p>
        </div>
        <button onClick={loadData} className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border-none bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer">
          <RefreshCw className="w-3.5 h-3.5" /> 刷新
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
          <div className="text-xs text-slate-500">系统角色</div>
          <div className="mt-3 rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-950/40">
            {currentRole ? (
              <>
                <div className="font-bold text-slate-800 dark:text-slate-100">{currentRole.name}</div>
                <div className="mt-1 text-[11px] text-slate-500 font-mono">{currentRole.code}</div>
                <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-400">{currentRole.description}</div>
                <div className="mt-2 text-[11px] text-emerald-600">成员数：{currentRole.memberCount}</div>
              </>
            ) : (
              <div className="text-sm text-slate-500">暂无角色数据</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">权限映射</h3>
              <p className="text-xs text-slate-500 mt-1">仅展示系统预置权限，不在此页面编辑。</p>
            </div>
            <span className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-600">{permissions.length} 项权限</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {permissions.map((perm) => (
              <div key={perm.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm">{perm.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{perm.code}</div>
                </div>
                <div className="text-xs text-slate-500">{perm.category}</div>
              </div>
            ))}
            {!permissions.length && <div className="text-sm text-slate-500">暂无权限数据</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

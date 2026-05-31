import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Key, RefreshCw, Search, ShieldCheck, ShieldAlert } from 'lucide-react';
import { SystemMenu, SystemPermission, SystemRole } from '../types';
import { adminApi } from '../services/adminApi';

const DEFAULT_ROLE: SystemRole = {
  id: 'role-super',
  name: '超级管理员',
  code: 'SUPER_ADMIN',
  description: '拥有管理端全部菜单和操作权限',
  status: 'active',
  createTime: '2026-01-01 08:00:00',
  memberCount: 1,
  menuIds: [],
  permissionCodes: [],
};

interface Props {
  readonly?: boolean;
  adminRole?: string;
}

export default function RoleManagementView({ readonly = false, adminRole = 'USER' }: Props) {
  const [roles, setRoles] = useState<SystemRole[]>([DEFAULT_ROLE]);
  const [menus, setMenus] = useState<SystemMenu[]>([]);
  const [permissions, setPermissions] = useState<SystemPermission[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState(DEFAULT_ROLE.id);
  const [activeTab, setActiveTab] = useState<'info' | 'menus' | 'permissions'>('info');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isReadonly = readonly || adminRole === 'READONLY_ADMIN';
  const isSuperAdmin = adminRole === 'SUPER_ADMIN';
  const currentRole = roles[0] || DEFAULT_ROLE;

  useEffect(() => {
    Promise.all([adminApi.getRoles(), adminApi.getMenus(), adminApi.getPermissions()]).then(([rolesRes, menusRes, permsRes]) => {
      setRoles(rolesRes.success && rolesRes.data.length ? rolesRes.data.filter((role) => role.code === 'SUPER_ADMIN') : [DEFAULT_ROLE]);
      setMenus(menusRes.success ? menusRes.data : []);
      setPermissions(permsRes.success ? permsRes.data : []);
      setSelectedRoleId(DEFAULT_ROLE.id);
    });
  }, []);

  const filteredMenus = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    return menus.filter((item) => !term || item.name.toLowerCase().includes(term) || item.id.toLowerCase().includes(term) || item.path.toLowerCase().includes(term));
  }, [menus, searchQuery]);

  const filteredPermissions = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    return permissions.filter((item) => !term || item.name.toLowerCase().includes(term) || item.code.toLowerCase().includes(term) || item.description.toLowerCase().includes(term));
  }, [permissions, searchQuery]);

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 2500);
  };

  const visibleRoleCount = roles.filter((role) => role.code === 'SUPER_ADMIN').length || 1;

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
                <ShieldCheck className="w-3.5 h-3.5" />可操作
              </span>
            )}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 max-w-2xl">
            这里仅保留系统级超级管理员角色。普通用户的后台权限分配请在用户管理中完成。
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => adminApi.getRoles().then((res) => setRoles(res.success && res.data.length ? res.data.filter((role) => role.code === 'SUPER_ADMIN') : [DEFAULT_ROLE]))}
            className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border-none bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> 刷新
          </button>
          <button disabled className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border-none bg-slate-200 text-slate-500 cursor-not-allowed">
            仅保留超级管理员
          </button>
        </div>
      </div>

      <AnimatePresence>
        {toastMessage && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 min-h-[420px]">
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-sm outline-none"
              placeholder="搜索菜单或权限"
            />
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-950/40">
              <div className="text-xs text-slate-500">系统角色</div>
              <div className="mt-1 font-bold text-slate-800 dark:text-slate-100">超级管理员</div>
              <div className="mt-1 text-[11px] text-slate-500">编码：SUPER_ADMIN</div>
              <div className="mt-2 text-[11px] text-emerald-600">数量：{visibleRoleCount}</div>
            </div>
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              <button
                onClick={() => setSelectedRoleId(DEFAULT_ROLE.id)}
                className="w-full text-left rounded-xl border p-3 transition-all border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-bold text-sm truncate">{DEFAULT_ROLE.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono truncate">{DEFAULT_ROLE.code}</div>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">最高权限</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 min-h-[420px]">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">{currentRole.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{currentRole.description}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-600">仅查看超级管理员</span>
              </div>
            </div>

            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
              {['info', 'menus', 'permissions'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as 'info' | 'menus' | 'permissions')}
                  className={`px-3 py-2 text-sm font-bold border-b-2 -mb-px ${activeTab === tab ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500'}`}
                >
                  {tab === 'info' ? '基础信息' : tab === 'menus' ? '菜单权限' : '功能权限'}
                </button>
              ))}
            </div>

            {activeTab === 'info' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40">
                  <div className="text-slate-500 text-xs">角色编码</div>
                  <div className="font-mono font-bold mt-1">{currentRole.code}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40">
                  <div className="text-slate-500 text-xs">成员数</div>
                  <div className="font-bold mt-1">{currentRole.memberCount}</div>
                </div>
              </div>
            )}

            {activeTab === 'menus' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredMenus.map((menu) => (
                  <div key={menu.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm">{menu.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{menu.id}</div>
                    </div>
                    <div className="text-xs text-slate-500">已授权</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'permissions' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredPermissions.map((perm) => (
                  <div key={perm.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm">{perm.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{perm.code}</div>
                    </div>
                    <div className="text-xs text-slate-500">已授权</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

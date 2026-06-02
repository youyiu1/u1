/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Key, RefreshCw, Save, ShieldAlert, ShieldCheck } from 'lucide-react';
import { SystemMenu, SystemPermission, SystemRole } from '../types';
import { adminApi } from '../services/adminApi';

type RoleDraft = Pick<SystemRole, 'id' | 'name' | 'description' | 'status' | 'menuIds' | 'permissionCodes'>;

interface Props {
  readonly?: boolean;
  adminRole?: string;
}

export default function RoleManagementView({ readonly = false, adminRole = 'USER' }: Props) {
  const [roles, setRoles] = useState<SystemRole[]>([]);
  const [permissions, setPermissions] = useState<SystemPermission[]>([]);
  const [menus, setMenus] = useState<SystemMenu[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [draft, setDraft] = useState<RoleDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const canEdit = adminRole === 'SUPER_ADMIN' && !readonly;

  const loadData = async () => {
    const [roleRes, permRes, menuRes] = await Promise.all([adminApi.getRoles(), adminApi.getPermissions(), adminApi.getMenus()]);
    const nextRoles = roleRes.success ? roleRes.data : [];
    setRoles(nextRoles);
    setPermissions(permRes.success ? permRes.data : []);
    setMenus(menuRes.success ? menuRes.data : []);
    if (!selectedRoleId && nextRoles[0]) {
      setSelectedRoleId(nextRoles[0].id);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === selectedRoleId) || roles[0] || null,
    [roles, selectedRoleId]
  );

  useEffect(() => {
    if (!selectedRole) {
      setDraft(null);
      return;
    }
    setDraft({
      id: selectedRole.id,
      name: selectedRole.name,
      description: selectedRole.description,
      status: selectedRole.status,
      menuIds: [...selectedRole.menuIds],
      permissionCodes: [...selectedRole.permissionCodes],
    });
  }, [selectedRole]);

  const menuGroups = useMemo(() => {
    const directories = menus.filter((menu) => menu.type === 'directory');
    const pages = menus.filter((menu) => menu.type === 'menu');
    return directories
      .map((directory) => ({
        id: directory.id,
        name: directory.name,
        items: pages.filter((item) => item.parentId === directory.id).sort((a, b) => a.order - b.order),
      }))
      .filter((group) => group.items.length > 0);
  }, [menus]);

  const permissionGroups = useMemo(() => {
    return Array.from(new Set(permissions.map((item) => item.category))).map((category) => ({
      category,
      items: permissions.filter((item) => item.category === category),
    }));
  }, [permissions]);

  const roleIsReadonly = selectedRole?.code === 'READONLY_ADMIN';
  const roleIsUser = selectedRole?.code === 'USER';

  const toggleMenu = (menuId: string) => {
    if (!draft) return;
    setDraft((current) => {
      if (!current) return current;
      return {
        ...current,
        menuIds: current.menuIds.includes(menuId)
          ? current.menuIds.filter((item) => item !== menuId)
          : [...current.menuIds, menuId],
      };
    });
  };

  const togglePermission = (code: string) => {
    if (!draft) return;
    setDraft((current) => {
      if (!current) return current;
      return {
        ...current,
        permissionCodes: current.permissionCodes.includes(code)
          ? current.permissionCodes.filter((item) => item !== code)
          : [...current.permissionCodes, code],
      };
    });
  };

  const handleSave = async () => {
    if (!draft || !selectedRole || !canEdit) return;
    setSaving(true);
    setNotice('');
    const res = await adminApi.updateRole(selectedRole.id, {
      name: draft.name,
      description: draft.description,
      status: draft.status,
      menuIds: draft.menuIds,
      permissionCodes: draft.permissionCodes,
    });
    setSaving(false);
    if (!res.success) {
      setNotice(res.message || '保存失败');
      return;
    }
    setNotice('角色权限已更新');
    await loadData();
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-amber-600 uppercase tracking-wider select-none">
            <Key className="w-3.5 h-3.5" /> 角色与权限中心
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-2 flex-wrap">
            管理端角色管理
            {canEdit ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />可编辑
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                <ShieldAlert className="w-3.5 h-3.5" />只读查看
              </span>
            )}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 max-w-3xl">
            角色、菜单和权限现在由后端真实驱动。超级管理员可以调整各角色的可见菜单和操作能力，保存后会直接影响接口放行规则。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => void loadData()} className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border-none bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" /> 刷新
          </button>
          <button
            onClick={handleSave}
            disabled={!canEdit || !draft || saving || roleIsUser}
            className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border-none bg-primary text-white disabled:bg-slate-200 disabled:text-slate-400 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" /> {saving ? '保存中' : '保存角色'}
          </button>
        </div>
      </div>

      {notice ? <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{notice}</div> : null}

      <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="text-xs text-slate-500">系统角色</div>
          {roles.map((role) => {
            const active = selectedRole?.id === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRoleId(role.id)}
                className={`w-full text-left rounded-2xl border p-3 transition-all ${active ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-800 hover:border-primary/30'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-100">{role.name}</div>
                    <div className="mt-1 text-[11px] text-slate-500 font-mono">{role.code}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${role.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {role.status === 'active' ? '启用中' : '已停用'}
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-500 line-clamp-2">{role.description}</div>
                <div className="mt-2 text-[11px] text-indigo-600">成员数：{role.memberCount}</div>
              </button>
            );
          })}
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-4">
            {draft && selectedRole ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">角色名称</div>
                    <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} disabled={!canEdit || roleIsUser} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-sm disabled:bg-slate-100" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">角色状态</div>
                    <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as 'active' | 'disabled' })} disabled={!canEdit || roleIsUser || selectedRole.code === 'SUPER_ADMIN'} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-sm disabled:bg-slate-100">
                      <option value="active">启用</option>
                      <option value="disabled">停用</option>
                    </select>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">角色说明</div>
                  <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} disabled={!canEdit || roleIsUser} rows={3} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-sm disabled:bg-slate-100" />
                </div>
                {roleIsReadonly ? <p className="text-xs text-amber-600">只读管理员即使勾选了写权限，后端也会保持只读限制。</p> : null}
                {roleIsUser ? <p className="text-xs text-slate-500">普通用户仅作为前台账号角色存在，不参与管理端菜单和权限配置。</p> : null}
              </>
            ) : (
              <div className="text-sm text-slate-500">暂无角色数据</div>
            )}
          </div>

          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">菜单开放</h3>
                  <p className="text-xs text-slate-500 mt-1">控制侧边栏和页面入口可见范围。</p>
                </div>
                <span className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-600">{draft?.menuIds.length || 0} 项</span>
              </div>
              <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
                {menuGroups.map((group) => (
                  <div key={group.id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-3">
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">{group.name}</div>
                    <div className="space-y-2">
                      {group.items.map((item) => (
                        <label key={item.id} className="flex items-start gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!draft?.menuIds.includes(item.id)}
                            disabled={!canEdit || roleIsUser}
                            onChange={() => toggleMenu(item.id)}
                            className="mt-0.5"
                          />
                          <span>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">{item.name}</span>
                            <span className="block text-[11px] text-slate-400">{item.path}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">接口权限</h3>
                  <p className="text-xs text-slate-500 mt-1">控制后台接口的真实访问能力。</p>
                </div>
                <span className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-600">{draft?.permissionCodes.length || 0} 项</span>
              </div>
              <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
                {permissionGroups.map((group) => (
                  <div key={group.category} className="rounded-xl border border-slate-200 dark:border-slate-800 p-3">
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">{group.category}</div>
                    <div className="space-y-2">
                      {group.items.map((item) => (
                        <label key={item.id} className="flex items-start gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!draft?.permissionCodes.includes(item.code)}
                            disabled={!canEdit || roleIsUser}
                            onChange={() => togglePermission(item.code)}
                            className="mt-0.5"
                          />
                          <span>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">{item.name}</span>
                            <span className="block text-[11px] text-indigo-600 font-mono">{item.code}</span>
                            <span className="block text-[11px] text-slate-400">{item.description}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

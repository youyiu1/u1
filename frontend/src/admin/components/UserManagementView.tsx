import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { User } from '../types';

type AdminRole = 'USER' | 'READONLY_ADMIN' | 'SUPER_ADMIN';

interface UserManagementViewProps {
  users: User[];
  onUpdateUserStatus: (userId: string, newStatus: 'normal' | 'disabled') => void;
  onUpdateUserVerified?: (userId: string, isVerified: 'verified' | 'unverified') => void;
  onUpdateUserAdminRole: (userId: string, adminRole: AdminRole) => void;
  canManageRoles: boolean;
}

const ROLE_LABELS: Record<AdminRole, string> = {
  USER: '普通用户',
  READONLY_ADMIN: '只读管理员',
  SUPER_ADMIN: '超级管理员',
};

const ROLE_STYLES: Record<AdminRole, string> = {
  USER: 'bg-slate-100 text-slate-700 border-slate-200',
  READONLY_ADMIN: 'bg-amber-100 text-amber-700 border-amber-200',
  SUPER_ADMIN: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export default function UserManagementView({
  users,
  onUpdateUserStatus,
  onUpdateUserAdminRole,
  canManageRoles,
}: UserManagementViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'normal' | 'disabled'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return users.filter((u) => {
      const matchSearch =
        !term ||
        u.name.toLowerCase().includes(term) ||
        u.id.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.region.toLowerCase().includes(term);
      const matchStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [users, searchTerm, statusFilter]);

  const applyRoleChange = (role: AdminRole) => {
    if (!selectedUser) return;
    onUpdateUserAdminRole(selectedUser.id, role);
    setSelectedUser({ ...selectedUser, adminRole: role });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索用户名、ID、邮箱、地区"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'normal' | 'disabled')}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
        >
          <option value="all">全部状态</option>
          <option value="normal">正常</option>
          <option value="disabled">已禁用</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">用户</th>
                <th className="px-4 py-3 text-left">邮箱</th>
                <th className="px-4 py-3 text-left">地区</th>
                <th className="px-4 py-3 text-left">账号状态</th>
                <th className="px-4 py-3 text-left">管理端角色</th>
                <th className="px-4 py-3 text-left">注册时间</th>
                <th className="px-4 py-3 text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800">{user.name}</div>
                    <div className="text-xs text-slate-500 font-mono">{user.id}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{user.email}</td>
                  <td className="px-4 py-3 text-slate-700">{user.region || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${user.status === 'normal' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {user.status === 'normal' ? '正常' : '禁用'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${ROLE_STYLES[user.adminRole]}`}>
                      {ROLE_LABELS[user.adminRole]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-mono text-xs">{user.registerTime}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-semibold"
                      onClick={() => setSelectedUser(user)}
                    >
                      管理
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
            />
            <motion.div
              className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white border-l border-slate-200 p-5 overflow-y-auto"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold">用户管理</h3>
                <button className="text-slate-500" onClick={() => setSelectedUser(null)}>关闭</button>
              </div>

              <div className="space-y-3 text-sm">
                <div><span className="text-slate-500">用户名：</span>{selectedUser.name}</div>
                <div><span className="text-slate-500">邮箱：</span>{selectedUser.email}</div>
                <div><span className="text-slate-500">地区：</span>{selectedUser.region || '-'}</div>
                <div>
                  <span className="text-slate-500">管理端角色：</span>
                  <div className="mt-2">
                    <select
                      value={selectedUser.adminRole}
                      disabled={!canManageRoles}
                      onChange={(e) => applyRoleChange(e.target.value as AdminRole)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="USER">普通用户</option>
                      <option value="READONLY_ADMIN">只读管理员</option>
                      <option value="SUPER_ADMIN">超级管理员</option>
                    </select>
                    {!canManageRoles && <p className="text-xs text-amber-600 mt-1">当前账号不是超级管理员，无法修改角色</p>}
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <button
                  className={`w-full px-3 py-2 rounded-lg text-sm font-semibold ${selectedUser.status === 'normal' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}
                  onClick={() => {
                    const next = selectedUser.status === 'normal' ? 'disabled' : 'normal';
                    onUpdateUserStatus(selectedUser.id, next);
                    setSelectedUser({ ...selectedUser, status: next });
                  }}
                >
                  {selectedUser.status === 'normal' ? '禁用用户' : '恢复用户'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

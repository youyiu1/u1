/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { AVATARS } from '../mockData';

interface UserManagementViewProps {
  users: User[];
  onUpdateUserStatus: (userId: string, newStatus: 'normal' | 'disabled') => void;
  onUpdateUserVerified?: (userId: string, isVerified: 'verified' | 'unverified') => void; // Unused but kept for App.tsx prop signature compatibility
}

export default function UserManagementView({ 
  users, 
  onUpdateUserStatus 
}: UserManagementViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'normal' | 'disabled'>('all');

  // Drawer detail card state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Skeletal loader delay when searching
  const [isSearchingLoad, setIsSearchingLoad] = useState(false);

  // Inline feedback alert inside the drawer
  const [drawerFeedback, setDrawerFeedback] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  useEffect(() => {
    setIsSearchingLoad(true);
    const timer = setTimeout(() => {
      setIsSearchingLoad(false);
    }, 350); // Fluid 350ms loading simulation
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter]);

  // Dismiss feedback automatically after 3.5 seconds
  useEffect(() => {
    if (drawerFeedback) {
      const timer = setTimeout(() => {
        setDrawerFeedback(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [drawerFeedback]);

  // Combined real interaction filter
  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term ? true : (
      u.name.toLowerCase().includes(term) ||
      u.id.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.region.toLowerCase().includes(term)
    );

    const matchesStatus = statusFilter === 'all' ? true : u.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleToggleStatusInDrawer = (user: User) => {
    const nextStatus = user.status === 'normal' ? 'disabled' : 'normal';
    onUpdateUserStatus(user.id, nextStatus);

    // Sync selected drawer details immediately
    setSelectedUser({
      ...user,
      status: nextStatus,
    });

    setDrawerFeedback({
      message: nextStatus === 'normal' ? '账号已成功恢复正常运行状态！' : '该账号已被立即停用，相关内容已被限制显示。',
      type: nextStatus === 'normal' ? 'success' : 'info'
    });
  };

  const handleResetPassword = (user: User) => {
    setDrawerFeedback({
      message: `密码重置成功！预设初始登入密码已同步。通知信已递派至市民箱：${user.email}`,
      type: 'success'
    });
  };

  const handleForceDeviceLogout = () => {
    setDrawerFeedback({
      message: '已成功注销该用户当前所有的活跃设备会话，用户下次使用将被要求重新登录。',
      type: 'info'
    });
  };

  // High level aggregated statistics
  const totalCount = users.length;
  const normalCount = users.filter((u) => u.status === 'normal').length;
  const disabledCount = users.filter((u) => u.status === 'disabled').length;

  return (
    <div className="relative space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="space-y-6"
      >
        {/* Modern Statistics Cards Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/20 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
            <div className="w-12 h-12 rounded-xl bg-primary/5 text-primary flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[24px] fill">group</span>
            </div>
            <div>
              <p className="text-secondary/70 text-xs font-semibold select-none">全市注册市民</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-sans text-on-surface tracking-tight">
                  {totalCount.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5 select-none">
                  <span className="material-symbols-outlined text-[10px] font-bold">trending_up</span>
                  <span>稳步增长</span>
                </span>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/20 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/5 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[24px] fill">task_alt</span>
            </div>
            <div>
              <p className="text-secondary/70 text-xs font-semibold select-none">正常运行账户</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-sans text-emerald-600 tracking-tight">
                  {normalCount.toLocaleString()}
                </span>
                <span className="text-xs text-secondary/60">占比 {totalCount ? Math.round((normalCount / totalCount) * 100) : 100}%</span>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/20 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
            <div className="w-12 h-12 rounded-xl bg-status-error/5 text-status-error flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[24px]">block</span>
            </div>
            <div>
              <p className="text-secondary/70 text-xs font-semibold select-none">受限/封禁市民</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-sans text-status-error tracking-tight">
                  {disabledCount.toLocaleString()}
                </span>
                {disabledCount > 0 ? (
                  <span className="text-[10px] text-status-pending font-bold bg-status-pending/10 px-1.5 py-0.5 rounded flex items-center gap-0.5 select-none">
                    <span className="material-symbols-outlined text-[10px] font-bold">warning</span>
                    <span>状态受控</span>
                  </span>
                ) : (
                  <span className="text-xs text-secondary/60 select-none">无受控异常</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Controls Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20 shadow-sm items-center">
          {/* Seek Input */}
          <div className="sm:col-span-7 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline/60 text-[18px] select-none">
              search
            </span>
            <input
              type="text"
              placeholder="搜索用户姓名、ID、电子邮箱或地区..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface-background border border-outline-variant/40 rounded-lg text-xs placeholder-outline/60 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-sans"
            />
          </div>

          {/* Account Status Filter */}
          <div className="sm:col-span-3 flex items-center gap-2">
            <span className="text-secondary/80 text-xs select-none flex-shrink-0 font-medium">账号状态:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full py-1.5 px-2 bg-surface-background border border-outline-variant/40 rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary/50 transition-all cursor-pointer font-sans"
            >
              <option value="all">显示全部账户</option>
              <option value="normal">正常状态</option>
              <option value="disabled">已被停用</option>
            </select>
          </div>

          {/* Reset Filter Button */}
          <div className="sm:col-span-2 flex justify-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="w-full py-2 border border-outline-variant/40 bg-surface-container-low hover:bg-surface-container hover:text-primary text-secondary hover:border-primary/30 text-xs font-semibold rounded-lg cursor-pointer transition-colors focus:outline-none flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">restart_alt</span>
              <span>重置条件</span>
            </button>
          </div>
        </div>

        {/* User Data Table Grid Panel */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden min-h-[360px] flex flex-col">
          {isSearchingLoad ? (
            /* Elegant animated skeleton rows */
            <div className="p-6 space-y-4 flex-1">
              {[1, 2, 3, 4, 5].map((idx) => (
                <div key={idx} className="flex items-center space-x-4 animate-pulse">
                  <div className="rounded-full bg-outline-variant/30 h-10 w-10 flex-shrink-0"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-outline-variant/30 rounded w-1/4"></div>
                    <div className="h-3 bg-outline-variant/30 rounded w-1/2"></div>
                  </div>
                  <div className="h-4 bg-outline-variant/30 rounded w-32 hidden md:block"></div>
                  <div className="h-5 bg-outline-variant/30 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            /* Beautiful empty results illustration card */
            <div className="flex flex-col items-center justify-center p-16 text-center flex-1 select-none">
              <span className="material-symbols-outlined text-[54px] text-outline/35 mb-3">person_search</span>
              <p className="font-semibold text-sm text-on-surface-variant">暂无符合条件的市民用户</p>
              <p className="text-xs text-outline/65 mt-1">您可以试着清空搜索输入栏或选择不同的常规过滤器</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
                <thead className="bg-surface-container-low/40 font-semibold text-[11px] text-secondary tracking-wider sticky top-0 border-b border-outline-variant/15 select-none">
                  <tr>
                    <th className="py-3 px-6 w-[250px]">用户昵称 / 市民ID</th>
                    <th className="py-3 px-6 w-[230px]">电子邮箱</th>
                    <th className="py-3 px-6 w-[140px]">主要居住辖区</th>
                    <th className="py-3 px-6 w-[110px]">账号状态</th>
                    <th className="py-3 px-6 w-[170px]">注册时间</th>
                    <th className="py-3 px-6 w-[100px] text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-outline-variant/15">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`hover:bg-primary-fixed/15 transition-all cursor-pointer ${
                        user.status === 'disabled' ? 'bg-surface-container-low/20' : ''
                      }`}
                    >
                      {/* Avatar, Username & Identifier Code */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className={`w-9 h-9 rounded-full object-cover border border-outline-variant/30 shadow-xs flex-shrink-0 ${
                              user.status === 'disabled' ? 'grayscale opacity-60' : ''
                            }`}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as any).src = 'https://lh3.googleusercontent.com/aida-public/AB6AXuB51BLmXrMHY3W_3w8lDMModFpDoXFpkON0rvWsuR4TSbZDq63XDgYYu13h7muskvXx8GQfArBB5Aeb1BwnDeAxGZiFeN6A33g6O-xWwCXoplVZdCLi1mU2W--fIz1leAMb8JGnm5urSA40Dm5ExCbWsNSpr3XqujWCsxUzADuiE-4h_0E8oWAxQ9s2nDRgcouqlKl6nCuYrBrdMEXoWhJ0z38k-hx-jef_OcdV0Kq9xHZJ7O3K1_aL7SMjcZCpmTAK3odD-fEkDJJ';
                            }}
                          />
                          <div className="min-w-0">
                            <p className={`font-semibold truncate text-on-surface ${user.status === 'disabled' ? 'text-on-surface-variant/50 line-through' : ''}`}>
                              {user.name}
                            </p>
                            <p className="font-mono text-[10px] text-outline/75 mt-0.5">{user.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Unified email layout */}
                      <td className="py-3.5 px-6 font-mono text-on-surface-variant break-all font-medium">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[15px] text-outline-variant select-none">mail</span>
                          <span className="truncate">{user.email}</span>
                        </div>
                      </td>

                      {/* City Location */}
                      <td className="py-3.5 px-6 text-on-surface-variant font-medium truncate">{user.region}</td>

                      {/* Inline Status label tag */}
                      <td className="py-3.5 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold select-none border ${
                            user.status === 'normal'
                              ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/15'
                              : 'bg-status-error/5 text-status-error border-status-error/15'
                          }`}
                        >
                          <span className={`w-1 h-1 rounded-full ${user.status === 'normal' ? 'bg-emerald-500' : 'bg-status-error'}`}></span>
                          <span>{user.status === 'normal' ? '常规运作' : '已停用'}</span>
                        </span>
                      </td>

                      {/* Regist time */}
                      <td className="py-3.5 px-6 text-outline font-mono select-none">{user.registerTime}</td>

                      {/* Control Link Button */}
                      <td className="py-3.5 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="px-3 py-1.5 bg-primary/5 hover:bg-primary hover:text-on-primary text-primary text-[11px] font-semibold rounded-lg transition-all cursor-pointer focus:outline-none"
                        >
                          核对并管理
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      {/* User details Drawer side overlay panel (fusions click slide mechanism) */}
      <AnimatePresence>
        {selectedUser && (
          <>
            {/* Dark Mask backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="fixed inset-0 bg-slate-900 z-40 transition-opacity"
            />

            {/* Sliding cabinet body */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 210 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-surface-container-lowest border-l border-outline-variant/20 shadow-2xl z-50 overflow-y-auto flex flex-col text-on-surface"
            >
              {/* Drawer Title section */}
              <div className="p-5 border-b border-outline-variant/15 flex items-center justify-between bg-surface-container-low/40 sticky top-0 backdrop-blur-md z-10 select-none">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary font-bold text-[20px]">badge</span>
                  <h3 className="font-bold text-sm text-on-surface">市民用户管理面板</h3>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-outline-variant/20 text-secondary hover:text-on-surface transition-colors cursor-pointer border-none bg-transparent focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {/* Dynamic Action Notification Alert banners */}
              <AnimatePresence>
                {drawerFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -20, height: 0 }}
                    className={`px-5 py-3 text-xs flex items-start gap-2.5 shadow-sm select-none shrink-0 ${
                      drawerFeedback.type === 'success' 
                        ? 'bg-emerald-500/10 text-emerald-600 border-b border-emerald-500/15' 
                        : 'bg-primary/10 text-primary border-b border-primary/15'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px] mt-0.5 font-bold">
                      {drawerFeedback.type === 'success' ? 'check_circle' : 'info'}
                    </span>
                    <span className="flex-1 font-medium">{drawerFeedback.message}</span>
                    <button 
                      onClick={() => setDrawerFeedback(null)} 
                      className="text-secondary/60 hover:text-secondary bg-transparent border-none cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main Cabinet Content */}
              <div className="p-6 space-y-6 flex-1">
                {/* Profile big card block */}
                <div className="text-center bg-surface-background rounded-2xl p-6 border border-outline-variant/15 relative overflow-hidden group">
                  <div className="absolute top-4 right-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold select-none border ${
                        selectedUser.status === 'normal'
                          ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/15'
                          : 'bg-status-error/5 text-status-error border-status-error/15'
                      }`}
                    >
                      {selectedUser.status === 'normal' ? '账户正常' : '已被停禁'}
                    </span>
                  </div>

                  <img
                    src={selectedUser.avatar === AVATARS.linQingfeng ? AVATARS.linQingfengDetail : selectedUser.avatar}
                    alt={selectedUser.name}
                    className={`w-20 h-20 rounded-full object-cover mx-auto border-2 border-white shadow-md mb-3 transition-transform duration-300 group-hover:scale-105 ${
                      selectedUser.status === 'disabled' ? 'grayscale opacity-75' : ''
                    }`}
                    referrerPolicy="no-referrer"
                  />
                  <h4 className="font-bold text-sm text-on-surface flex items-center justify-center gap-1">
                    <span>{selectedUser.name}</span>
                  </h4>
                  <p className="font-mono text-[10px] text-outline mt-1 select-all">{selectedUser.id}</p>
                </div>

                {/* Followers, Following counts list */}
                <div className="grid grid-cols-3 gap-2 text-center border-t border-b border-outline-variant/15 py-3">
                  <div>
                    <div className="font-mono text-sm font-bold text-on-surface">
                      {selectedUser.followersCount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-outline/80 mt-0.5 select-none font-medium">粉丝数</div>
                  </div>
                  <div className="border-l border-r border-outline-variant/15">
                    <div className="font-mono text-sm font-bold text-on-surface">
                      {selectedUser.followingCount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-outline/80 mt-0.5 select-none font-medium">关注中</div>
                  </div>
                  <div>
                    <div className="font-mono text-sm font-bold text-on-surface">
                      {selectedUser.dynamicsCount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-outline/80 mt-0.5 select-none font-medium">发布动态</div>
                  </div>
                </div>

                {/* Profile properties */}
                <div className="space-y-3.5">
                  <h5 className="font-bold text-xs border-l-2 border-l-primary pl-1.5 select-none text-on-surface">基本身份档案</h5>
                  <div className="divide-y divide-outline-variant/10 text-xs text-on-surface">
                    <div className="flex justify-between py-2 border-b border-outline-variant/10">
                      <span className="text-secondary/80 select-none">注册邮箱</span>
                      <span className="font-semibold font-mono selection:bg-primary-fixed">{selectedUser.email}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-outline-variant/10">
                      <span className="text-secondary/80 select-none">居住地区</span>
                      <span className="font-medium">{selectedUser.region}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-outline-variant/10">
                      <span className="text-secondary/80 select-none">账户特征</span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-primary/5 text-primary text-[10px] font-bold rounded">
                        常规市民用户
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-outline-variant/10">
                      <span className="text-secondary/80 select-none">安全积分</span>
                      <span className="font-semibold text-emerald-600 font-mono">100 (优等市民)</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-outline-variant/10">
                      <span className="text-secondary/80 select-none">加入日期</span>
                      <span className="font-semibold font-mono select-none text-secondary">{selectedUser.registerTime}</span>
                    </div>
                  </div>
                </div>

                {/* Additional counts statistics metrics */}
                <div className="bg-surface-container-low/50 rounded-xl p-4 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-200 text-secondary flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
                    </div>
                    <div>
                      <div className="font-mono text-xs font-bold text-on-surface">{selectedUser.goodsCount}</div>
                      <div className="text-[10px] text-outline/80">在售宝贝</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-200 text-secondary flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[16px]">home_repair_service</span>
                    </div>
                    <div>
                      <div className="font-mono text-xs font-bold text-on-surface">{selectedUser.servicesCount}</div>
                      <div className="text-[10px] text-outline/80">登记项目</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons foot row */}
              <div className="p-5 border-t border-outline-variant/15 bg-surface-container-low/40 space-y-3 sticky bottom-0 z-10 select-none">
                <button
                  onClick={() => handleToggleStatusInDrawer(selectedUser)}
                  className={`w-full py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] ${
                    selectedUser.status === 'normal'
                      ? 'bg-status-error text-on-primary hover:opacity-90'
                      : 'bg-emerald-600 text-on-primary hover:bg-emerald-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {selectedUser.status === 'normal' ? 'block' : 'check_circle'}
                  </span>
                  <span>{selectedUser.status === 'normal' ? '禁用暂停该账户' : '立即激活恢复该账号'}</span>
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleResetPassword(selectedUser)}
                    className="py-2.5 bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 hover:border-outline-variant text-[11px] font-bold rounded-lg text-secondary hover:text-primary transition-all cursor-pointer focus:outline-none"
                  >
                    重置初始密码
                  </button>
                  <button
                    onClick={handleForceDeviceLogout}
                    className="py-2.5 bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 hover:border-outline-variant text-[11px] font-bold rounded-lg text-secondary hover:text-primary transition-all cursor-pointer focus:outline-none"
                  >
                    强制下线会话
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

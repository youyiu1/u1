/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, ShieldCheck, Plus, Search, Edit3, Trash2, Key, CheckCircle, 
  XCircle, ToggleLeft, ToggleRight, Settings, Users, Folder, Check, AlertTriangle, RefreshCw
} from 'lucide-react';
import { SystemRole, SystemMenu, SystemPermission } from '../types';

// Predefined default roles for seed-loading
const DEFAULT_ROLES: SystemRole[] = [
  {
    id: 'role-1',
    name: '超级管理员',
    code: 'ROLE_SUPER_ADMIN',
    description: '系统最高规格指挥角色。执掌全网核心业务与底层数据库物理读写控制，主管安全及系统参数审计。',
    status: 'active',
    createTime: '2026-01-01 08:00:00',
    memberCount: 2,
    menuIds: [
      'dir-users', 'menu-users', 'menu-blacklist',
      'dir-content', 'menu-posts', 'menu-comments', 'menu-images',
      'dir-services', 'menu-market', 'menu-services', 'menu-orders',
      'dir-system', 'menu-notifications', 'menu-categories',
      'dir-logs', 'menu-login-logs', 'menu-op-logs'
    ],
    permissionCodes: [
      'user:view', 'user:ban', 'user:verify', 'blacklist:edit',
      'posts:view', 'posts:audit', 'comments:delete', 'images:audit',
      'goods:audit', 'services:create', 'orders:cancel',
      'notifications:create', 'categories:edit', 'logs:retention'
    ]
  },
  {
    id: 'role-2',
    name: '系统安全与风控官',
    code: 'ROLE_SEC_OFFICER',
    description: '主管全区信息安全与应急响应。掌握黑客拦截、敏感风控条目设置，以及登录/操作后台行为的监控核定。',
    status: 'active',
    createTime: '2026-02-15 11:20:00',
    memberCount: 3,
    menuIds: [
      'dir-users', 'menu-users', 'menu-blacklist',
      'dir-logs', 'menu-login-logs', 'menu-op-logs'
    ],
    permissionCodes: [
      'user:view', 'user:ban', 'blacklist:edit',
      'logs:retention'
    ]
  },
  {
    id: 'role-3',
    name: '社区内容精审组长',
    code: 'ROLE_CONTENT_AUDITOR',
    description: '专门核实日常贴子动态。下放评论过滤、市民乱发动态驳回下架，以及物理遮蔽涉毒涉暴力静态相册等。',
    status: 'active',
    createTime: '2026-03-24 14:05:00',
    memberCount: 5,
    menuIds: [
      'dir-content', 'menu-posts', 'menu-comments', 'menu-images'
    ],
    permissionCodes: [
      'posts:view', 'posts:audit', 'comments:delete', 'images:audit'
    ]
  },
  {
    id: 'role-4',
    name: '同城电商与客服主管',
    code: 'ROLE_SERVICES_MANAGER',
    description: '核心解决匠人接单和闲置物发布问题。主管闲置在售精审、特批新服务入库、违章派单强制介入销除等。',
    status: 'active',
    createTime: '2026-04-10 16:30:00',
    memberCount: 4,
    menuIds: [
      'dir-services', 'menu-market', 'menu-services', 'menu-orders',
      'dir-system', 'menu-notifications', 'menu-categories'
    ],
    permissionCodes: [
      'goods:audit', 'services:create', 'orders:cancel', 'notifications:create', 'categories:edit'
    ]
  }
];

export default function RoleManagementView() {
  const [roles, setRoles] = useState<SystemRole[]>([]);
  const [menus, setMenus] = useState<SystemMenu[]>([]);
  const [permissions, setPermissions] = useState<SystemPermission[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  
  // Right-side Workspace Tabs
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'info' | 'menus' | 'permissions'>('info');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State for New Role
  const [isNewRoleModalOpen, setIsNewRoleModalOpen] = useState(false);
  const [newRoleForm, setNewRoleForm] = useState({
    name: '',
    code: '',
    description: '',
    status: 'active' as 'active' | 'disabled'
  });

  // Load datasets on startup
  useEffect(() => {
    // 1. Roles
    const savedRoles = localStorage.getItem('leju_system_roles');
    if (savedRoles) {
      try { setRoles(JSON.parse(savedRoles)); } catch (e) { setRoles(DEFAULT_ROLES); }
    } else {
      setRoles(DEFAULT_ROLES);
      localStorage.setItem('leju_system_roles', JSON.stringify(DEFAULT_ROLES));
    }

    // 2. Menus from localStorage (or import default)
    const savedMenusRaw = localStorage.getItem('leju_system_menus');
    if (savedMenusRaw) {
      try { setMenus(JSON.parse(savedMenusRaw)); } catch (e) {}
    }

    // 3. Permissions from localStorage (or import default)
    const savedPermsRaw = localStorage.getItem('leju_system_permissions');
    if (savedPermsRaw) {
      try { setPermissions(JSON.parse(savedPermsRaw)); } catch (e) {}
    }
  }, []);

  const saveRolesList = (updated: SystemRole[]) => {
    setRoles(updated);
    localStorage.setItem('leju_system_roles', JSON.stringify(updated));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Find currently selected role object
  const currentRole = roles.find(r => r.id === selectedRoleId) || null;

  // Select first role automatically
  useEffect(() => {
    if (roles.length > 0 && !selectedRoleId) {
      setSelectedRoleId(roles[0].id);
    }
  }, [roles, selectedRoleId]);

  const handleToggleRoleStatus = (roleId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const updated = roles.map(r => {
      if (r.id === roleId) {
        // Prevent disabling SUPER_ADMIN to avoid self-locking
        if (r.code === 'ROLE_SUPER_ADMIN') {
          alert('核心保护：您不能封禁系统底层超级管理员角色，以防失去系统接管口！');
          return r;
        }
        const nextStatus = r.status === 'active' ? 'disabled' : 'active';
        showToast(`角色【${r.name}】状态已变更为 ${nextStatus === 'active' ? '正常启用' : '暂停服务'}`);
        return { ...r, status: nextStatus };
      }
      return r;
    });
    saveRolesList(updated);
  };

  const handleDeleteRole = (roleId: string, roleName: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const roleCode = roles.find(r => r.id === roleId)?.code;
    if (roleCode === 'ROLE_SUPER_ADMIN') {
      alert('核心保护：禁止删除全网唯一的【超级管理员】(Super Admin) 底层根级控制账号！');
      return;
    }

    if (window.confirm(`高危安全警告！您确定要核销并删除角色「${roleName}」吗？\n清除后，归属于该类下属的市民专员将丧失会话权限。`)) {
      const updated = roles.filter(r => r.id !== roleId);
      saveRolesList(updated);
      setSelectedRoleId(updated.length > 0 ? updated[0].id : null);
      showToast(`角色「${roleName}」已被物理抹除销户。`);
    }
  };

  const handleCreateNewRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleForm.name.trim() || !newRoleForm.code.trim()) return;

    // Duplication Check
    const codeUpper = newRoleForm.code.trim().toUpperCase();
    const isDup = roles.some(r => r.code === codeUpper);
    if (isDup) {
      alert(`无法注册！当前已存在标识代码为 [${codeUpper}] 的角色矩阵。`);
      return;
    }

    const todayString = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newRole: SystemRole = {
      id: `role-${Math.floor(100 + Math.random() * 900)}`,
      name: newRoleForm.name.trim(),
      code: codeUpper,
      description: newRoleForm.description.trim(),
      status: newRoleForm.status,
      createTime: todayString,
      memberCount: 0,
      menuIds: ['dir-users', 'menu-users'], // Default pre-view user list
      permissionCodes: ['user:view']
    };

    const nextList = [...roles, newRole];
    saveRolesList(nextList);
    setSelectedRoleId(newRole.id);
    setIsNewRoleModalOpen(false);
    showToast(`角色【${newRole.name}】已登记备案并就绪初始化！`);
    
    // Clear Form
    setNewRoleForm({
      name: '',
      code: '',
      description: '',
      status: 'active'
    });
  };

  const handleUpdateRoleMeta = (e: React.FormEvent, roleId: string) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLFormElement;
    const nameInput = (target.elements.namedItem('roleName') as HTMLInputElement).value;
    const descInput = (target.elements.namedItem('roleDesc') as HTMLTextAreaElement).value;

    if (!nameInput.trim()) return;

    const updated = roles.map(r => {
      if (r.id === roleId) {
        return {
          ...r,
          name: nameInput.trim(),
          description: descInput.trim()
        };
      }
      return r;
    });
    saveRolesList(updated);
    showToast('当前角色简况及主要属性修饰保存成功！');
  };

  // Toggle checks inside Menus
  const handleToggleMenuCheck = (menuId: string) => {
    if (!currentRole) return;
    if (currentRole.code === 'ROLE_SUPER_ADMIN') {
      showToast('温馨提示：超级管理员强制继承了所有的菜单路由，无须手动裁剪。');
      return;
    }

    let nextMenuIds = [...currentRole.menuIds];
    if (nextMenuIds.includes(menuId)) {
      // Uncheck it
      nextMenuIds = nextMenuIds.filter(id => id !== menuId);
      // If it is a directory under check, auto uncheck all child menus beneath it
      const isDir = menus.find(m => m.id === menuId)?.type === 'directory';
      if (isDir) {
        const childIds = menus.filter(m => m.parentId === menuId).map(m => m.id);
        nextMenuIds = nextMenuIds.filter(id => !childIds.includes(id));
      }
    } else {
      // Check it
      nextMenuIds.push(menuId);
      // Auto-check parent directory if checking a sub-menu
      const parentId = menus.find(m => m.id === menuId)?.parentId;
      if (parentId && !nextMenuIds.includes(parentId)) {
        nextMenuIds.push(parentId);
      }
      // If checking a directory, check all its child menus for a friendlier initial check
      const isDir = menus.find(m => m.id === menuId)?.type === 'directory';
      if (isDir) {
        const childIds = menus.filter(m => m.parentId === menuId).map(m => m.id);
        childIds.forEach(cid => {
          if (!nextMenuIds.includes(cid)) {
            nextMenuIds.push(cid);
          }
        });
      }
    }

    const updated = roles.map(r => {
      if (r.id === currentRole.id) {
        return { ...r, menuIds: nextMenuIds };
      }
      return r;
    });
    saveRolesList(updated);
  };

  // Toggle checks inside Fine Permissions
  const handleTogglePermissionCheck = (permCode: string) => {
    if (!currentRole) return;
    if (currentRole.code === 'ROLE_SUPER_ADMIN') {
      showToast('精细保护：超级管理员默认拥有全域所有的后台鉴权锁代码，无需剔除。');
      return;
    }

    let nextPerms = [...currentRole.permissionCodes];
    if (nextPerms.includes(permCode)) {
      nextPerms = nextPerms.filter(code => code !== permCode);
    } else {
      nextPerms.push(permCode);
    }

    const updated = roles.map(r => {
      if (r.id === currentRole.id) {
        return { ...r, permissionCodes: nextPerms };
      }
      return r;
    });
    saveRolesList(updated);
  };

  const handleSelectAllMenus = () => {
    if (!currentRole) return;
    const allIds = menus.map(m => m.id);
    const updated = roles.map(r => {
      if (r.id === currentRole.id) {
        return { ...r, menuIds: allIds };
      }
      return r;
    });
    saveRolesList(updated);
    showToast(`当前角色已完整扩充授予 ${allIds.length} 个前端可见菜单。`);
  };

  const handleClearAllMenus = () => {
    if (!currentRole) return;
    const updated = roles.map(r => {
      if (r.id === currentRole.id) {
        return { ...r, menuIds: [] };
      }
      return r;
    });
    saveRolesList(updated);
    showToast('菜单完全注销，当前角色在主后台不可见导航面板。');
  };

  const handleSelectAllPermissions = () => {
    if (!currentRole) return;
    const allCodes = permissions.map(p => p.code);
    const updated = roles.map(r => {
      if (r.id === currentRole.id) {
        return { ...r, permissionCodes: allCodes };
      }
      return r;
    });
    saveRolesList(updated);
    showToast(`已赋予全量底层后台服务拦截控制锁。`);
  };

  const resetRolesAndWipe = () => {
    if (window.confirm('您确定要将全部角色配置回撤还原为出厂设置吗？\n所有自定义角色的指派菜单、拥有的微操权限都会一并推倒重建。')) {
      saveRolesList(DEFAULT_ROLES);
      setSelectedRoleId(DEFAULT_ROLES[0].id);
      showToast('已全面归档重构基础角色表。');
    }
  };

  // Filter list
  const filteredRoles = roles.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-500 uppercase tracking-wider select-none">
            <Users className="w-3.5 h-3.5 text-indigo-500" />
            <span>同城运营核心团队</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 mt-0.5">
            管理员角色分配 
            <span className="font-mono text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-normal">
              roles_assignment
            </span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            建立不同的管理员层级，为其分配可访问的侧边栏菜单（可见性）以及可执行的具体敏感后台操作（核审、冻结、拉黑等）。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetRolesAndWipe}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-705/80 text-slate-700 dark:text-slate-350 font-bold text-xs rounded-xl transition-all cursor-pointer border-none flex items-center gap-1 focus:outline-none"
            title="一键推倒定制角色，返回干净内置档"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>重置基础组</span>
          </button>
          
          <button
            onClick={() => setIsNewRoleModalOpen(true)}
            className="px-4 py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl transition-all cursor-pointer border-none flex items-center gap-1.5 shadow-sm focus:outline-none"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>注册新角色</span>
          </button>
        </div>
      </div>

      {/* Toast notifier */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-semibold flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 animate-bounce" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid: Split panel list layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Roles list (Span 4) */}
        <div className="lg:col-span-4 space-y-3 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl p-4 shadow-sm h-[650px] flex flex-col justify-between">
          <div className="space-y-3 flex-1 flex flex-col overflow-hidden">
            <span className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest block border-b border-slate-50 dark:border-slate-800 pb-2">
              角色组织树架构 ({roles.length})
            </span>
            
            {/* Search filter for roles list only */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Search className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-8 pr-2 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-950/30 outline-none focus:bg-white"
                placeholder="按角色搜索..."
              />
            </div>

            {/* List block */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 py-1">
              {filteredRoles.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-12 font-semibold">无适配的角色分类条目。</p>
              ) : (
                filteredRoles.map((role) => {
                  const isActive = role.id === selectedRoleId;
                  const isDis = role.status === 'disabled';
                  return (
                    <div
                      key={role.id}
                      onClick={() => setSelectedRoleId(role.id)}
                      className={`text-left p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between h-28 relative overflow-hidden ${
                        isActive
                          ? 'border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-505/20'
                          : 'border-slate-200/60 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/15 hover:bg-slate-50 dark:hover:bg-slate-950/30'
                      }`}
                    >
                      <div>
                        {/* Title Code */}
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-[12.5px] font-bold truncate ${
                            isActive ? 'text-indigo-650 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-100'
                          }`}>
                            {role.name}
                          </span>
                          <span className="font-mono text-[9px] text-slate-400 shrink-0 font-bold">
                            {role.code}
                          </span>
                        </div>
                        {/* Desc */}
                        <p className="text-[10.5px] text-slate-450 dark:text-slate-450 line-clamp-2 mt-1.5 leading-relaxed">
                          {role.description}
                        </p>
                      </div>

                      {/* Info metrics */}
                      <div className="flex items-center justify-between border-t border-slate-100/50 dark:border-slate-800/40 pt-2 shrink-0 select-none">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => handleToggleRoleStatus(role.id, e)}
                            className="p-0 border-none bg-transparent cursor-pointer focus:outline-none flex items-center justify-center text-slate-400 hover:text-indigo-500"
                            title="控制开启/物理封锁此职位"
                          >
                            {isDis ? (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold bg-rose-500/10 text-rose-550 text-rose-500">
                                挂起中
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                服务中
                              </span>
                            )}
                          </button>
                          <span className="text-[9px] text-slate-400 font-bold flex items-center gap-0.5 font-mono">
                            <Users className="w-2.5 h-2.5 text-slate-400" />
                            {role.memberCount} 员
                          </span>
                        </div>

                        {/* Actions */}
                        <button
                          onClick={(e) => handleDeleteRole(role.id, role.name, e)}
                          className="p-1 border-none bg-transparent hover:bg-rose-500/10 rounded-lg text-rose-500 text-[10px] cursor-pointer focus:outline-none block shrink-0"
                          title="注销删除该功能岗"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
          {/* Legend and tips */}
          <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-150 dark:border-slate-800 text-[10.5px] text-slate-500">
            <span className="font-bold flex items-center gap-1 text-slate-700 dark:text-slate-350 mb-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span>岗位防爆规则机制:</span>
            </span>
            <p className="leading-relaxed">
              ● 超级管理员拥有不可剥夺且硬写死的至上操作权。<br />
              ● 新开辟的岗位须在其右侧详情栏进行 “导航面板可视” 及 “API微操按钮” 勾连后，才算成功开锁。
            </p>
          </div>
        </div>

        {/* Right Side: Tabbed Workspace assignment panel (Span 8) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl flex flex-col h-[650px] overflow-hidden shadow-sm">
          {currentRole ? (
            <>
              {/* Head Meta Tabs selection rows */}
              <div className="bg-slate-50/75 dark:bg-slate-950/60 p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
                <div>
                  <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-1.5 leading-none">
                    <span>配置工作区：【{currentRole.name}】</span>
                    <span className="font-mono text-[10px] text-slate-400 font-bold bg-slate-200 dark:bg-slate-800/80 px-1.5 py-0.5 rounded truncate max-w-36">
                      {currentRole.code}
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-450 mt-1 select-none font-mono">
                    ID_INDEX: {currentRole.id} ● REGISTER_TIME: {currentRole.createTime}
                  </p>
                </div>

                <div className="flex border border-slate-200 dark:border-slate-800 p-0.5 rounded-xl bg-white dark:bg-slate-900 select-none">
                  {[
                    { value: 'info', label: '主要简述与基础管理' },
                    { value: 'menus', label: `指引导航菜单 (${currentRole.menuIds.length})` },
                    { value: 'permissions', label: `赋予底层功能锁 (${currentRole.permissionCodes.length})` }
                  ].map(tab => (
                    <button
                      key={tab.value}
                      onClick={() => setActiveWorkspaceTab(tab.value as any)}
                      className={`px-3 py-1.5 rounded-lg border-none text-[11px] font-bold cursor-pointer transition-all focus:outline-none ${
                        activeWorkspaceTab === tab.value
                          ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 bg-transparent'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Work Panel Content body */}
              <div className="flex-1 overflow-y-auto p-5">
                
                {/* Tab 1: Role properties detail editing */}
                {activeWorkspaceTab === 'info' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4 max-w-xl"
                  >
                    <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/10 text-[11.5px] text-amber-700 dark:text-amber-400 p-3.5 space-y-1.5">
                      <p className="font-extrabold flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <span>角色修改指引与约束:</span>
                      </p>
                      <p className="leading-relaxed">
                        管理员对目前岗位大名称和职责描述所做的修饰，将在所有绑入了该等级标签的运营人员上即时刷新。标识代码（如超级管理员的 Code `{currentRole.code}`）属于固定系统锚点，不接受任意改写。
                      </p>
                    </div>

                    <form onSubmit={(e) => handleUpdateRoleMeta(e, currentRole.id)} className="space-y-4 pr-2">
                      <div>
                        <label className="block text-[11.5px] uppercase tracking-wider font-bold text-slate-500 select-none" htmlFor="edit-role-name">
                          岗位显示大名 *
                        </label>
                        <input
                          id="edit-role-name"
                          name="roleName"
                          type="text"
                          defaultValue={currentRole.name}
                          key={`${currentRole.id}-name`}
                          className="block w-full border border-slate-200 dark:border-slate-850 rounded-xl p-2.5 mt-1 text-xs text-slate-800 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-950/30 outline-none focus:bg-white font-bold"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11.5px] uppercase tracking-wider font-bold text-slate-500 select-none" htmlFor="edit-role-desc">
                          岗位具体职责范围指引说明 *
                        </label>
                        <textarea
                          id="edit-role-desc"
                          name="roleDesc"
                          defaultValue={currentRole.description}
                          key={`${currentRole.id}-desc`}
                          rows={6}
                          className="block w-full border border-slate-200 dark:border-slate-850 rounded-xl p-2.5 mt-1 text-xs text-slate-800 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-950/30 outline-none focus:bg-white leading-relaxed"
                          required
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          className="px-4.5 py-2.5 bg-slate-850 hover:bg-slate-750 dark:bg-indigo-650 dark:hover:bg-indigo-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer border-none shadow-md focus:outline-none"
                        >
                          立即保存角色简述修饰
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* Tab 2: Visibly accessible system menu list assignment */}
                {activeWorkspaceTab === 'menus' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/30 p-3 rounded-xl border border-slate-150 dark:border-slate-800/80">
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-300">菜单绑定拦截说明：</span>
                        <p className="text-[10.5px] text-slate-500 mt-0.5 leading-relaxed">
                          勾选后，该角色的成员登录系统时可在左侧导航栏看到相应菜单入口。
                        </p>
                      </div>
                      
                      {currentRole.code !== 'ROLE_SUPER_ADMIN' && (
                        <div className="flex items-center gap-1.5 flex-shrink-0 select-none">
                          <button
                            onClick={handleSelectAllMenus}
                            className="px-2 py-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 font-bold text-[10px] rounded-lg cursor-pointer focus:outline-none"
                          >
                            授予全域菜单
                          </button>
                          <button
                            onClick={handleClearAllMenus}
                            className="px-2 py-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-rose-500 border border-slate-200 dark:border-slate-700 font-bold text-[10px] rounded-lg cursor-pointer focus:outline-none"
                          >
                            完全收回注销
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Rendering hierarchy tree view */}
                    <div className="space-y-4 border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden bg-white dark:bg-slate-950/10">
                      {menus.filter(m => m.type === 'directory').map((parentDir) => {
                        const childMenus = menus.filter(m => m.parentId === parentDir.id);
                        const isParentChecked = currentRole.menuIds.includes(parentDir.id);
                        
                        return (
                          <div key={parentDir.id} className="border-b last:border-b-0 border-slate-100 dark:border-slate-850 px-4.5 py-4">
                            {/* Directory Header Layer (Level 1) */}
                            <div className="flex items-center justify-between select-none">
                              <label className="flex items-center gap-2.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isParentChecked}
                                  onChange={() => handleToggleMenuCheck(parentDir.id)}
                                  disabled={currentRole.code === 'ROLE_SUPER_ADMIN'}
                                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-505 shrink-0"
                                />
                                <div className="flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-[17px] text-indigo-500">
                                    {parentDir.icon}
                                  </span>
                                  <span className="font-extrabold text-xs text-slate-850 dark:text-slate-100 uppercase tracking-wide">
                                    {parentDir.name}
                                  </span>
                                  <span className="font-mono text-[9px] text-slate-400 select-all font-bold">({parentDir.id})</span>
                                </div>
                              </label>
                              
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] bg-slate-100 dark:bg-slate-800/80 text-slate-450 font-normal">
                                属 文件夹组
                              </span>
                            </div>

                            {/* Sub menu List Grid Layer (Level 2) */}
                            {childMenus.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 mt-4 ml-6 select-none border-t border-dashed border-slate-100 dark:border-slate-850/60 pt-3.5">
                                {childMenus.map((subPage) => {
                                  const isChildChecked = currentRole.menuIds.includes(subPage.id);
                                  return (
                                    <label
                                      key={subPage.id}
                                      className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                                        isChildChecked
                                          ? 'border-indigo-500/60 bg-indigo-500/5'
                                          : 'border-slate-150 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-755 hover:bg-slate-50/50'
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChildChecked}
                                        onChange={() => handleToggleMenuCheck(subPage.id)}
                                        disabled={currentRole.code === 'ROLE_SUPER_ADMIN'}
                                        className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300 mt-0.5 shrink-0"
                                      />
                                      <div className="overflow-hidden">
                                        <div className="font-bold text-[11px] text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                          <span className="material-symbols-outlined text-[14px] text-slate-450">
                                            {subPage.icon}
                                          </span>
                                          <span className="truncate">{subPage.name}</span>
                                        </div>
                                        <span className="font-mono text-[8.5px] text-slate-450 block truncate mt-1">
                                          {subPage.path}
                                        </span>
                                      </div>
                                    </label>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Tab 3: Background fine permission controls matrices */}
                {activeWorkspaceTab === 'permissions' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between bg-slate-55 dark:bg-slate-955/30 p-3 rounded-xl border border-slate-160 dark:border-slate-800">
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-300">后台业务微操鉴权绑定：</span>
                        <p className="text-[10.5px] text-slate-500 mt-0.5 leading-relaxed">
                          在此赋予或扣除该岗位的具体核心操作权限，被剔除勾选项的管理员将在页面按钮处看到“鉴权锁封”标记。
                        </p>
                      </div>

                      {currentRole.code !== 'ROLE_SUPER_ADMIN' && (
                        <button
                          onClick={handleSelectAllPermissions}
                          className="px-2 py-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-indigo-600 dark:text-indigo-400 border border-slate-205 dark:border-slate-705 font-bold text-[10px] rounded-lg cursor-pointer focus:outline-none flex-shrink-0"
                        >
                          赋予全域底层微操权
                        </button>
                      )}
                    </div>

                    {/* Permission modules blocks rendering */}
                    {permissions.length === 0 ? (
                      <div className="text-center p-8 bg-slate-50 dark:bg-slate-950/20 border border-slate-150 border-dashed rounded-xl text-slate-400 font-semibold">
                        当前本地尚未定义加载系统权限底单。
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {['用户风控', '内容运营', '生活服务', '系统控制'].map((catName) => {
                          const listInCat = permissions.filter(p => p.category === catName || (catName === '系统控制' && p.category === '系统设置'));
                          if (listInCat.length === 0) return null;

                          return (
                            <div key={catName} className="space-y-2 border border-slate-150 dark:border-slate-850 p-4 rounded-xl">
                              <h4 className="text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-550 flex items-center gap-1 border-b border-slate-50 dark:border-slate-850 pb-2 mb-2 select-none">
                                <Key className="w-3 h-3 text-indigo-502/70" />
                                <span>{catName} 核心微操权限</span>
                              </h4>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 select-none">
                                {listInCat.map((perm) => {
                                  const isChecked = currentRole.permissionCodes.includes(perm.code);
                                  return (
                                    <label
                                      key={perm.id}
                                      className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-2.5 ${
                                        isChecked
                                          ? 'border-indigo-500/60 bg-indigo-500/3 ring-1 ring-indigo-500/5'
                                          : 'border-slate-150 dark:border-slate-855 hover:border-slate-300 dark:hover:border-slate-750 hover:bg-slate-50/50'
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => handleTogglePermissionCheck(perm.code)}
                                        disabled={currentRole.code === 'ROLE_SUPER_ADMIN'}
                                        className="w-3.5 h-3.5 mt-0.5 text-indigo-600 rounded border-slate-300 shrink-0 select-none"
                                      />
                                      <div className="overflow-hidden">
                                        <div className="font-bold text-[11px] text-slate-850 dark:text-slate-150 flex items-center gap-1.5">
                                          <span>{perm.name}</span>
                                          <span className="font-mono text-[8px] text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-1 rounded truncate select-all">{perm.code}</span>
                                        </div>
                                        <p className="text-[9.5px] text-slate-450 dark:text-slate-450 leading-relaxed mt-1 line-clamp-2">
                                          {perm.description}
                                        </p>
                                      </div>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}

              </div>
            </>
          ) : (
            <div className="text-center py-24 text-slate-455 font-semibold">
              请在左侧点击一个具体的角色条目进行操作配置视图。
            </div>
          )}
        </div>

      </div>

      {/* Model Dialog to add a new customized Role */}
      <AnimatePresence>
        {isNewRoleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewRoleModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl p-5 text-left text-slate-800 dark:text-slate-200 z-10"
            >
              <h3 className="text-sm font-bold text-slate-905 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3 select-none">
                <Settings className="w-4 h-4 text-primary" />
                <span>注册创建新管理岗位</span>
              </h3>

              <form onSubmit={handleCreateNewRole} className="space-y-4 mt-4">
                {/* Name */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 select-none" htmlFor="new-role-name">
                    岗位汉字大名称 *
                  </label>
                  <input
                    id="new-role-name"
                    type="text"
                    value={newRoleForm.name}
                    onChange={(e) => setNewRoleForm({ ...newRoleForm, name: e.target.value })}
                    className="block w-full border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 mt-1 text-xs text-slate-800 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-950/40 outline-none focus:border-indigo-500 font-bold"
                    placeholder="例如: 社群秩序核审员、同城合伙人"
                    required
                  />
                </div>

                {/* Code */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 select-none" htmlFor="new-role-code">
                    角色唯一代码标识串 (Role Code) *
                  </label>
                  <input
                    id="new-role-code"
                    type="text"
                    value={newRoleForm.code}
                    onChange={(e) => setNewRoleForm({ ...newRoleForm, code: e.target.value })}
                    className="block w-full border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 mt-1 text-xs text-slate-800 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-950/40 outline-none focus:border-indigo-500 font-mono font-bold"
                    placeholder="例如: ROLE_PARTNER_STAFF"
                    required
                  />
                  <p className="text-[9.5px] text-slate-400 mt-1 leading-normal font-sans">
                    一经设置不可更改，系统底层后端用于识别拦截，格式建议以 `ROLE_` 开头。
                  </p>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 select-none">初始启用状态</label>
                  <select
                    value={newRoleForm.status}
                    onChange={(e) => setNewRoleForm({ ...newRoleForm, status: e.target.value as any })}
                    className="block w-full border border-slate-200 dark:border-slate-800 rounded-lg p-2 mt-1 text-xs text-slate-850 bg-slate-50/50 dark:bg-slate-950/40 outline-none focus:border-indigo-500"
                  >
                    <option value="active">正常在岗执勤</option>
                    <option value="disabled">暂时休班暂停</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 select-none" htmlFor="new-role-desc">
                    岗位具体职责范围指引描述 *
                  </label>
                  <textarea
                    id="new-role-desc"
                    value={newRoleForm.description}
                    onChange={(e) => setNewRoleForm({ ...newRoleForm, description: e.target.value })}
                    rows={4}
                    className="block w-full border border-slate-200 dark:border-slate-850 rounded-lg p-2.5 mt-1 text-xs text-slate-850 bg-slate-50/50 dark:bg-slate-950/40 outline-none focus:border-indigo-50"
                    placeholder="阐释该运营官应该负责的系统边界..."
                    required
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-850 mt-5">
                  <button
                    type="button"
                    onClick={() => setIsNewRoleModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 font-bold text-xs rounded-xl cursor-pointer transition-colors border-none focus:outline-none"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-primary text-white font-bold text-xs rounded-xl cursor-pointer transition-colors border-none shadow-md focus:outline-none"
                  >
                    存入角色席位
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

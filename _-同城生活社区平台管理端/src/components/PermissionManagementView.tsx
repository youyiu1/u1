/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Key, Plus, Search, ShieldAlert, Edit2, Trash2, CheckCircle, 
  XCircle, Sliders, RefreshCw, Layers, ShieldCheck
} from 'lucide-react';
import { SystemPermission } from '../types';

// Predefined default permissions reflecting real actions in Leju Portal code
const DEFAULT_PERMISSIONS: SystemPermission[] = [
  // User Governance Module
  { id: 'perm-u1', name: '用户列表检索', code: 'user:view', category: '用户风控', description: '允许管理员检索同城市民账户列表、查看资质认证状态', status: 'active', createTime: '2026-01-10 10:00:00' },
  { id: 'perm-u2', name: '强制账户管控', code: 'user:ban', category: '用户风控', description: '允许冻结/解除冻结同城市民市民账户、限制其发布行为', status: 'active', createTime: '2026-01-10 10:15:00' },
  { id: 'perm-u3', name: '官方实名签署', code: 'user:verify', category: '用户风控', description: '操作市民资质的“官方认证书面盖章”审核动作', status: 'active', createTime: '2026-01-10 10:30:00' },
  { id: 'perm-u4', name: '黑名单词库维保', code: 'blacklist:edit', category: '用户风控', description: '录入或清空封锁IP、违法敏感词拦截标签及自动拉黑限制', status: 'active', createTime: '2026-01-10 11:00:00' },

  // Content Operations Module
  { id: 'perm-c1', name: '社区动态主干监管', code: 'posts:view', category: '内容运营', description: '进入动态管理后台进行图文流审计与列表导出', status: 'active', createTime: '2026-01-11 09:20:00' },
  { id: 'perm-c2', name: '极速撤回下架动态', code: 'posts:audit', category: '内容运营', description: '下架不法涉黄、侮辱谩骂等不良动态，录入退回缘由', status: 'active', createTime: '2026-01-11 09:30:00' },
  { id: 'perm-c3', name: '违规评论清理物理注销', code: 'comments:delete', category: '内容运营', description: '彻底物理删除被举报的脏口弹幕或引战谩骂言论评论', status: 'active', createTime: '2026-01-12 14:10:00' },
  { id: 'perm-c4', name: '服务器资源图片精审', code: 'images:audit', category: '内容运营', description: '标记/遮罩静态服务器上的风险市民配图、违建图审查', status: 'active', createTime: '2026-01-12 15:40:00' },

  // Local Services Module
  { id: 'perm-s1', name: '在售商品强行治理', code: 'goods:audit', category: '生活服务', description: '对违规二手闲置商品、虚假售价标品执行下架封锁', status: 'active', createTime: '2026-01-15 11:15:00' },
  { id: 'perm-s2', name: '匠人服务特批登载', code: 'services:create', category: '生活服务', description: '超级管理员代录入持有认证资质的高级匠人专攻服务', status: 'active', createTime: '2026-01-15 11:45:00' },
  { id: 'perm-s3', name: '生活订单强行介入销单', code: 'orders:cancel', category: '生活服务', description: '对处于退款纠纷、异常违规的订单执行强制中断和全额撤款', status: 'active', createTime: '2026-01-16 16:30:00' },

  // System Setup Module
  { id: 'perm-sys1', name: '全城高置公报广播', code: 'notifications:create', category: '系统控制', description: '向所有同城市民下发置顶官方弹窗、高维跑马灯通告', status: 'active', createTime: '2026-01-20 10:00:00' },
  { id: 'perm-sys2', name: '生活服务分类大纲修正', code: 'categories:edit', category: '系统控制', description: '随意增补、重排二级服务目录和社区标签排序键名值', status: 'active', createTime: '2026-01-20 11:30:00' },
  { id: 'perm-sys3', name: '日志合规到期保留器配置', code: 'logs:retention', category: '系统控制', description: '设置合规政策，对操作日志建立天数轮转与净化清扫', status: 'active', createTime: '2026-05-30 05:35:00' },
];

export default function PermissionManagementView() {
  const [permissions, setPermissions] = useState<SystemPermission[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | '用户风控' | '内容运营' | '生活服务' | '系统控制'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPerm, setEditingPerm] = useState<SystemPermission | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    code: '',
    category: '用户风控' as any,
    description: '',
    status: 'active' as 'active' | 'disabled'
  });

  // Load from localStorage or defaults
  useEffect(() => {
    const saved = localStorage.getItem('leju_system_permissions');
    if (saved) {
      try {
        setPermissions(JSON.parse(saved));
      } catch (e) {
        setPermissions(DEFAULT_PERMISSIONS);
      }
    } else {
      setPermissions(DEFAULT_PERMISSIONS);
      localStorage.setItem('leju_system_permissions', JSON.stringify(DEFAULT_PERMISSIONS));
    }
  }, []);

  const savePermissions = (updated: SystemPermission[]) => {
    setPermissions(updated);
    localStorage.setItem('leju_system_permissions', JSON.stringify(updated));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleToggleStatus = (permId: string) => {
    const updated = permissions.map(p => {
      if (p.id === permId) {
        const nextStatus = p.status === 'active' ? 'disabled' : 'active';
        showToast(`权限「${p.name}」已变更为${nextStatus === 'active' ? '【启用】' : '【禁用】'}`);
        return { ...p, status: nextStatus };
      }
      return p;
    });
    savePermissions(updated);
  };

  const handleDeletePerm = (permId: string, permName: string) => {
    if (window.confirm(`高危预警！您确定要彻底注销权限 “${permName}” 吗？\n一旦永久删除关联此权限代码的管理角色将瞬间丧失操作准入门槛！`)) {
      const updated = permissions.filter(p => p.id !== permId);
      savePermissions(updated);
      showToast(`权限 “${permName}” 已经从系统底层数据库物理下线。`);
    }
  };

  const handleOpenAddModal = () => {
    setEditingPerm(null);
    setFormData({
      id: `perm-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      code: '',
      category: activeCategory === 'all' ? '用户风控' : activeCategory,
      description: '',
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (perm: SystemPermission) => {
    setEditingPerm(perm);
    setFormData({
      id: perm.id,
      name: perm.name,
      code: perm.code,
      category: perm.category,
      description: perm.description,
      status: perm.status
    });
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;

    // Check code duplication
    const isEditingMatch = editingPerm ? editingPerm.code === formData.code.trim() : false;
    if (!isEditingMatch) {
      const isDuplicate = permissions.some(p => p.code.toLowerCase() === formData.code.trim().toLowerCase());
      if (isDuplicate) {
        alert(`系统底层错误！已存在相同标识 [${formData.code.trim()}] 的权限节点，不可重复录入。`);
        return;
      }
    }

    const todayString = new Date().toISOString().replace('T', ' ').substring(0, 19);

    if (editingPerm) {
      const updated = permissions.map(p => {
        if (p.id === editingPerm.id) {
          return {
            ...p,
            name: formData.name.trim(),
            code: formData.code.trim(),
            category: formData.category,
            description: formData.description.trim(),
            status: formData.status
          };
        }
        return p;
      });
      savePermissions(updated);
      showToast(`权限 [${formData.name.trim()}] 同步更改成功。`);
    } else {
      const newItem: SystemPermission = {
        id: formData.id,
        name: formData.name.trim(),
        code: formData.code.trim(),
        category: formData.category,
        description: formData.description.trim(),
        status: formData.status,
        createTime: todayString
      };
      savePermissions([...permissions, newItem]);
      showToast(`成功创设全新权限控制锁 [${formData.name.trim()}]。`);
    }
    setIsModalOpen(false);
  };

  const resetToDefault = () => {
    if (window.confirm('您确定要将所有权限锁节点重置还原为出厂设置吗？本地的所有新绑定与新修饰都将被抹去。')) {
      savePermissions(DEFAULT_PERMISSIONS);
      showToast('回滚指令执行成功，权限大纲一键恢复初始基准。');
    }
  };

  // Filter permission list
  const filteredList = permissions.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = activeCategory === 'all' ? true : p.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500 uppercase tracking-wider select-none">
            <Key className="w-3.5 h-3.5 text-amber-500" />
            <span>网关入口安全堡垒</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 mt-0.5">
            权限管理中心
            <span className="font-mono text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-normal">
              permissions_matrix
            </span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            定义Leju系统底层的控制锁节点。每一个权限配有一个唯一字符串标识（Code），如 `user:ban`，用来锁定特定的核审页面、敏感弹出层和高危业务删除动作。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetToDefault}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-705/80 text-slate-700 dark:text-slate-350 font-bold text-xs rounded-xl transition-all cursor-pointer border-none flex items-center gap-1 focus:outline-none"
            title="还置全套初始化基线权限"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>恢复出厂</span>
          </button>
          
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 active:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer border-none flex items-center gap-1.5 shadow-sm focus:outline-none"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>开发新权限锁</span>
          </button>
        </div>
      </div>

      {/* Global Toast Notification */}
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

      {/* Categories blocks / Tabs row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {[
          { key: 'all', count: permissions.length, label: '全部锁孔' },
          { key: '用户风控', count: permissions.filter(p => p.category === '用户风控').length, label: '用户风控' },
          { key: '内容运营', count: permissions.filter(p => p.category === '内容运营').length, label: '内容运营' },
          { key: '生活服务', count: permissions.filter(p => p.category === '生活服务').length, label: '生活服务' },
          { key: '系统控制', count: permissions.filter(p => p.category === '系统控制').length, label: '系统设置' },
        ].map((tab) => {
          const isActive = activeCategory === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveCategory(tab.key as any)}
              className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                isActive
                  ? 'border-indigo-500 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 font-bold ring-1 ring-indigo-500/20 shadow-xs'
                  : 'border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-650 dark:text-slate-300'
              }`}
            >
              <span className="text-[10px] font-bold uppercase text-slate-400 select-none block tracking-wide">{tab.label}</span>
              <span className="text-sm font-extrabold block mt-2.5 flex items-baseline gap-1 font-mono">
                {tab.count} <span className="text-[9px] font-normal text-slate-400 font-sans">个鉴权项</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Query panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/85 rounded-xl p-4 shadow-xs">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-950/30 outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all font-semibold"
            placeholder="按 权限标识代码 (如 posts:audit)、权限汉字名称、描述职责 快速瞬时检索..."
          />
        </div>
      </div>

      {/* permissions list grid cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredList.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-12 text-center text-slate-400 select-none font-semibold">
            当前分类下无检索匹配的系统鉴权控制锁。
          </div>
        ) : (
          filteredList.map((perm) => {
            const isDis = perm.status === 'disabled';
            return (
              <motion.div
                key={perm.id}
                layout
                className={`bg-white dark:bg-slate-900 border rounded-xl p-4.5 shadow-sm space-y-3 relative group transition-all flex flex-col justify-between h-[180px] ${
                  isDis
                    ? 'border-slate-200 dark:border-slate-800 opacity-65 bg-slate-50/40'
                    : 'border-slate-200/80 dark:border-slate-800/90 hover:border-indigo-200 dark:hover:border-indigo-950 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Title and Badge */}
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <div className={`p-1.5 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isDis 
                          ? 'bg-slate-100 text-slate-400' 
                          : 'bg-indigo-500/10 text-indigo-500'
                      }`}>
                        <Key className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate" title={perm.name}>
                        {perm.name}
                      </h4>
                    </div>

                    <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-400">
                      {perm.category}
                    </span>
                  </div>

                  {/* Code block */}
                  <div className="mt-2.5 font-mono text-[10.5px] font-bold text-indigo-600 dark:text-indigo-400 select-all bg-slate-50 dark:bg-slate-950/40 p-1.5 rounded border border-slate-100 dark:border-slate-850/80 break-all leading-normal flex items-center gap-1">
                    <span className="text-[9px] font-sans font-medium text-slate-400 select-none">串码:</span>
                    {perm.code}
                  </div>

                  {/* Description */}
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed" title={perm.description}>
                    {perm.description || '暂无说明职责细节指引说明'}
                  </p>
                </div>

                {/* Feet block */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-850 select-none">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleStatus(perm.id)}
                      className="border-none bg-transparent cursor-pointer p-0 focus:outline-none"
                      title="点击启用/停用权限控制锁"
                    >
                      {perm.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">
                          ● 正常护航
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] text-rose-500 font-bold">
                          ○ 空白停用
                        </span>
                      )}
                    </button>
                    <span className="text-[9px] font-mono text-slate-400">{perm.createTime.substring(0, 10)}</span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEditModal(perm)}
                      className="p-1 px-2 border-none bg-indigo-500/10 text-indigo-500 text-[10px] font-bold rounded-lg cursor-pointer hover:bg-indigo-500/20 focus:outline-none"
                    >
                      修改
                    </button>
                    <button
                      onClick={() => handleDeletePerm(perm.id, perm.name)}
                      className="p-1 px-2 border-none bg-rose-500/10 text-rose-550 text-rose-500 text-[10px] font-bold rounded-lg cursor-pointer hover:bg-rose-550/20 focus:outline-none"
                    >
                      注销
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Edit / Add Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl p-5 text-left text-slate-800 dark:text-slate-200 z-10"
            >
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
                <Sliders className="w-4 h-4 text-amber-500" />
                <span>{editingPerm ? '重新校准底层权限锁' : '增投开发前端过滤鉴权端点'}</span>
              </h3>

              <form onSubmit={handleSaveForm} className="space-y-4 mt-4">
                {/* Name */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 select-none" htmlFor="perm-name">
                    权限大名称 *
                  </label>
                  <input
                    id="perm-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="block w-full border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 mt-1 text-xs text-slate-800 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-950/40 outline-none focus:border-indigo-500 font-bold"
                    placeholder="如: 用户强制禁言、动态下架封禁"
                    required
                  />
                </div>

                {/* Code (Unique key string) */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 select-none" htmlFor="perm-code">
                    权限绑定钥匙标识串 (Permission Code) *
                  </label>
                  <input
                    id="perm-code"
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="block w-full border border-slate-205 dark:border-slate-800 rounded-lg p-2.5 mt-1 text-xs text-slate-800 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-950/40 outline-none focus:border-indigo-500 font-mono font-bold"
                    placeholder="如: posts:audit、user:ban-unban"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal font-sans">
                    将用于前端路由判定和核心功能拦截（支持以冒号分隔的名词行为法）。
                  </p>
                </div>

                {/* Category & Status SideBySide */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 select-none">所属分类模块 *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="block w-full border border-slate-200 dark:border-slate-800 rounded-lg p-2 mt-1 text-xs text-slate-850 bg-slate-50/50 dark:bg-slate-950/40 outline-none focus:border-indigo-500"
                    >
                      <option value="用户风控">用户风控</option>
                      <option value="内容运营">内容运营</option>
                      <option value="生活服务">生活服务</option>
                      <option value="系统控制">系统设置/控制</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 select-none">默认初始运行状态</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="block w-full border border-slate-200 dark:border-slate-800 rounded-lg p-2 mt-1 text-xs text-slate-850 bg-slate-50/50 dark:bg-slate-950/40 outline-none focus:border-indigo-500"
                    >
                      <option value="active">正常启用</option>
                      <option value="disabled">暂时挂起停用</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 select-none" htmlFor="perm-desc">
                    详细职责与适用范围说明 *
                  </label>
                  <textarea
                    id="perm-desc"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="block w-full border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 mt-1 text-xs text-slate-800 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-950/40 outline-none focus:border-indigo-500 leading-relaxed"
                    placeholder="请阐明该控制锁所归口管控的系统操作，以防后继管理员错领误给..."
                    required
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-850 mt-5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 font-bold text-xs rounded-xl cursor-pointer transition-colors border-none focus:outline-none"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors border-none shadow-md focus:outline-none"
                  >
                    存入权限表
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

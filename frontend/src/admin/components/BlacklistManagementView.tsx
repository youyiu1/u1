/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, ShieldAlert, Plus, X, Trash2, Shield, User, Globe, FileText,
  AlertOctagon, CheckSquare, Sparkles, Filter 
} from 'lucide-react';
import { BlacklistItem } from '../types';
import { matchesAnyKeyword, normalizeSearchTerm } from '../utils/search';

interface BlacklistManagementViewProps {
  blacklist: BlacklistItem[];
  onAddBlacklist: (targetType: 'user' | 'keyword' | 'ip', targetValue: string, reason: string) => void;
  onDeleteBlacklist: (id: string) => void;
  onAddOperationLog?: (action: string, target: string, details?: string) => void;
}

export default function BlacklistManagementView({
  blacklist,
  onAddBlacklist,
  onDeleteBlacklist,
  onAddOperationLog
}: BlacklistManagementViewProps) {
  // Query states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'user' | 'keyword' | 'ip'>('all');

  // Addition form states
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [newType, setNewType] = useState<'user' | 'keyword' | 'ip'>('user');
  const [newValue, setNewValue] = useState('');
  const [newReason, setNewReason] = useState('');
  const [formError, setFormError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Common quick templates based on targetType
  const reasonPresets = {
    user: [
      '频繁散布虚假二手闲置及垃圾广告营销信息',
      '在其他市民动态下恶意谩骂、进行人身攻击',
      '涉嫌欺诈、以假货/刷单套现等手段诱导市民交易',
      '恶意高仿官方客服、冒充平台管理员行骗'
    ],
    keyword: [
      '国家网信办严禁传播的网络色情及淫秽敏感词',
      '洗钱、代开发票、网络高利贷非法黑产拦截词词根',
      '针对其他市民的极端脏话及不文明人身攻击词汇',
      '高频兼职刷单、做空套现、高额返利兼职诈骗过滤'
    ],
    ip: [
      '监测到针对后台管理端口的高频撞库及DDoS报文攻击',
      '非法高并发数据爬行，恶意抓取用户隐私联系方式',
      '多账号恶意批量注册发帖防刷拦截源'
    ]
  };

  // Handle Quick Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Handle Blacklist insert
  const handleSubmitAddition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue.trim()) {
      setFormError('封锁目标值不能为空');
      return;
    }
    if (!newReason.trim()) {
      setFormError('请输入加入黑名单原因，以便后续审计查验');
      return;
    }

    // Smart Batch Keyword Handling
    if (newType === 'keyword' && (newValue.includes(',') || newValue.includes('，'))) {
      const splitKeywords = newValue
        .split(/,|，/)
        .map(kw => kw.trim())
        .filter(kw => kw.length > 0);

      if (splitKeywords.length > 0) {
        splitKeywords.forEach(kw => {
          onAddBlacklist(newType, kw, newReason.trim());
          if (onAddOperationLog) {
            onAddOperationLog(
              `新增黑名单物项 [类型: 敏感词汇(批量)]`,
              kw,
              `缘由: ${newReason.trim()} (共 ${splitKeywords.length} 个词汇)`
            );
          }
        });
      }
    } else {
      onAddBlacklist(newType, newValue.trim(), newReason.trim());
      if (onAddOperationLog) {
        onAddOperationLog(
          `新增黑名单物项 [类型: ${newType === 'user' ? '市民账户' : newType === 'keyword' ? '敏感词汇' : '网关IP'}]`,
          newValue.trim(),
          `缘由: ${newReason.trim()}`
        );
      }
    }

    // Reset Form
    setNewValue('');
    setNewReason('');
    setFormError('');
    setIsAddingMode(false);
  };

  // Run filtering
  const filteredList = useMemo(() => {
    const keyword = normalizeSearchTerm(searchQuery);
    return blacklist.filter(item => {
      const matchSearch = matchesAnyKeyword(keyword, [item.targetValue, item.reason, item.id]);
      const matchType = typeFilter === 'all' || item.targetType === typeFilter;

      return matchSearch && matchType;
    });
  }, [blacklist, searchQuery, typeFilter]);

  // Calculate Operational Metrics
  const metrics = useMemo(() => ({
    total: blacklist.length,
    users: blacklist.filter(i => i.targetType === 'user').length,
    keywords: blacklist.filter(i => i.targetType === 'keyword').length,
    ips: blacklist.filter(i => i.targetType === 'ip').length,
  }), [blacklist]);

  return (
    <div className="space-y-6" id="blacklist-view-root">
      
      {/* Title & Operations Action trigger */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[28px] text-rose-500 animate-pulse">gavel</span>
            同城风控黑名单审计
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            定义全站主动阻断策略。管控恶意违规市民、全局捕获并过滤敏感字词、锁定恶意源 IP 网关。
          </p>
        </div>

        {/* Floating toggle form button */}
        {!isAddingMode ? (
          <button
            onClick={() => setIsAddingMode(true)}
            className="bg-rose-600 hover:bg-rose-700 hover:shadow-rose-600/30 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg flex items-center gap-2 border-none transition-all duration-200 cursor-pointer text-sm"
          >
            <Plus className="h-4 w-4" /> 新增拉黑阻断
          </button>
        ) : (
          <button
            onClick={() => {
              setIsAddingMode(false);
              setFormError('');
            }}
            className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 border-none transition-all cursor-pointer text-sm"
          >
            <X className="h-4 w-4" /> 收起控制台
          </button>
        )}
      </div>

      {/* KPI Stats counters bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">拉黑管理总量</span>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850 text-slate-500">
              <Shield className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2 group-hover:scale-105 origin-left transition-transform duration-200">{metrics.total} <span className="text-xs font-medium text-slate-400">个</span></p>
          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-emerald-500 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Realtime Syncing
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">市民封控账户</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/35 text-indigo-600 dark:text-indigo-400">
              <User className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2 group-hover:scale-105 origin-left transition-transform duration-200">{metrics.users} <span className="text-xs font-medium text-slate-400">个账户</span></p>
          <p className="text-[10px] text-slate-400 mt-1 font-semibold">永久锁定全站功能</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">拦截词库规模</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/35 text-amber-600 dark:text-amber-400">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-2 group-hover:scale-105 origin-left transition-transform duration-200">{metrics.keywords} <span className="text-xs font-medium text-slate-400">词根</span></p>
          <p className="text-[10px] text-slate-400 mt-1 font-semibold">全局发帖及评论过滤</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">恶意封禁 IP</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/35 text-rose-600 dark:text-rose-400">
              <Globe className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-2 group-hover:scale-105 origin-left transition-transform duration-200">{metrics.ips} <span className="text-xs font-medium text-slate-400">个源网关</span></p>
          <p className="text-[10px] text-slate-400 mt-1 font-semibold">外部高频攻击拦截</p>
        </div>
      </div>

      {/* Addition Modal Form Overlay with Anim */}
      <AnimatePresence>
        {isAddingMode && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="bg-white dark:bg-slate-900 border border-rose-100/70 dark:border-rose-950/70 rounded-2xl p-6 shadow-sm shadow-rose-100/5 space-y-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-600 animate-pulse" />
                新增拉黑阻断条目 <span className="text-xs font-medium text-slate-400">| 高阶安全管控</span>
              </h3>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/45 px-2 bg-rose py-1 rounded">审核状态: 注入即刻生效</span>
            </div>

            <form onSubmit={handleSubmitAddition} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Select category */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 block">1. 封禁维度类型</label>
                  <select
                    value={newType}
                    onChange={(e) => {
                      setNewType(e.target.value as any);
                      setNewValue('');
                    }}
                    className="w-full py-2.5 px-3 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                  >
                    <option value="user">违规市民账号 (UserName/UID)</option>
                    <option value="keyword">发帖违禁关键词 (Sensitive Word)</option>
                    <option value="ip">源端非法 IP 地址 (I.P. Address)</option>
                  </select>
                </div>

                {/* Target value */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 block flex items-center justify-between">
                    <span>2. 拉黑主体目标值 {newType === 'user' ? '（市民账号）' : newType === 'keyword' ? '（敏感字眼）' : '（指定IP）'}</span>
                    {newType === 'keyword' && (
                      <span className="text-[10px] text-indigo-500 font-bold bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded">
                        💡 支持逗号批处理 (等效分词导入)
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      newType === 'user' ? "请输入要永久封锁的市民唯一标识或用户名，如 highsf88" :
                      newType === 'keyword' ? "词根（支持中英文逗号隔开，如：枪支,办证,迷款）" : "请输入外部IP例如：182.230.12.98"
                    }
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-full py-2.5 px-3.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all font-semibold"
                  />
                </div>

              </div>

              {/* Dynamic quick templates selector */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 block">3. 快速应用审判模版</span>
                <div className="flex flex-wrap gap-1.5">
                  {reasonPresets[newType].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewReason(preset)}
                      className={`text-[11px] py-1 px-2 rounded-lg cursor-pointer border transition-all text-left truncate max-w-full ${
                        newReason === preset
                          ? 'border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
                      }`}
                    >
                      🏷️ {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Blocking reason details */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 block">4. 详细审判拉黑缘由（存入操作日志）</label>
                <textarea
                  required
                  rows={2}
                  placeholder="说明此阻断的处理背景、发现渠道或系统自动检测的判定依据（将被保留为永久审计日志证据）"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full py-2.5 px-3 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all font-medium"
                ></textarea>
              </div>

              {/* Output potential errors */}
              {formError && (
                <div className="text-xs text-rose-505 font-bold bg-rose-50 dark:bg-rose-950/40 border border-rose-300/20 px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 animate-pulse">
                  <AlertOctagon className="h-4 w-4 text-rose-600" /> {formError}
                </div>
              )}

              {/* Form buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingMode(false);
                    setFormError('');
                  }}
                  className="px-4.5 py-2 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 text-xs font-bold cursor-pointer border-none"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer border-none shadow-md shadow-rose-600/10"
                >
                  确认永久封锁
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter and Search Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="搜索拉黑条目值、判处原因、操作署名..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Category Scope Selection */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5 whitespace-nowrap">
            <Filter className="h-3.5 w-3.5" /> 筛选类型:
          </span>
          <div className="inline-flex rounded-xl p-0.5 bg-slate-100 dark:bg-slate-950">
            {(['all', 'user', 'keyword', 'ip'] as const).map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`py-1.5 px-4 text-xs font-bold rounded-lg border-none cursor-pointer transition-all ${
                  typeFilter === type
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 bg-transparent'
                }`}
              >
                {type === 'all' && '全部拦截'}
                {type === 'user' && '市民成员'}
                {type === 'keyword' && '敏感词汇'}
                {type === 'ip' && '网关IP'}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Main Records Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredList.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 rounded-2xl py-12 px-4 shadow-sm text-center md:col-span-2 space-y-4">
            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-850 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Shield className="h-5 w-5" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">风控策略库未检索到命中黑名单</p>
            <p className="text-slate-400 dark:text-slate-500 text-xs max-w-sm mx-auto">
              可在页面上方点击 “新增拉黑阻断” 快速配置拦截词句、限制市民账号或指定网关高频 IP。
            </p>
          </div>
        ) : (
          filteredList.map(item => {
            const riskRank = item.targetType === 'ip' || item.targetType === 'user' ? 'High Risk Block' : 'Intercept Filter';
            return (
              <motion.div
                layout
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 relative overflow-hidden group"
              >
                {/* Corner Watermark pattern based on type for clean design */}
                <div className="absolute right-4 top-4 select-none opacity-5 dark:opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-300">
                  {item.targetType === 'user' && <User className="h-20 w-20 text-slate-900 dark:text-white" />}
                  {item.targetType === 'keyword' && <FileText className="h-20 w-20 text-slate-900 dark:text-white" />}
                  {item.targetType === 'ip' && <Globe className="h-20 w-20 text-slate-900 dark:text-white" />}
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Category icon badges */}
                    <div className={`p-2.5 rounded-xl transition-transform group-hover:scale-105 duration-150 ${
                      item.targetType === 'user' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' :
                      item.targetType === 'keyword' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' :
                      'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                    }`}>
                      {item.targetType === 'user' && <User className="h-4.5 w-4.5" />}
                      {item.targetType === 'keyword' && <FileText className="h-4.5 w-4.5" />}
                      {item.targetType === 'ip' && <Globe className="h-4.5 w-4.5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                          {item.targetType === 'user' && '市民账户锁定'}
                          {item.targetType === 'keyword' && '敏感词过滤拦截'}
                          {item.targetType === 'ip' && '网关阻断 I.P.'}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          riskRank === 'High Risk Block' 
                            ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-450' 
                            : 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-450'
                        }`}>
                          {riskRank}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-base text-slate-900 dark:text-white font-black select-all tracking-tight break-all">
                          {item.targetValue}
                        </span>
                        
                        {/* Quick Clipboard Copy */}
                        <button
                          onClick={() => handleCopy(item.targetValue, item.id)}
                          className="p-1 text-slate-350 hover:text-slate-600 dark:hover:text-slate-350 bg-transparent border-none cursor-pointer rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="复制目标值"
                        >
                          <CheckSquare className={`h-3 w-3 ${copiedId === item.id ? 'text-emerald-500 scale-110' : ''}`} />
                        </button>
                        {copiedId === item.id && (
                          <span className="text-[9px] text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-950/65 px-1.5 py-0.5 rounded leading-none">
                            已复制!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Revoke/Remove button */}
                  <button
                    onClick={() => {
                      if (window.confirm(`确认解除对此风控条目 [${item.targetValue}] 的拦截限制吗？`)) {
                        onDeleteBlacklist(item.id);
                        if (onAddOperationLog) {
                          onAddOperationLog(`解禁移出黑名单`, item.targetValue, `解封黑名单项ID: ${item.id}`);
                        }
                      }
                    }}
                    className="text-slate-400 hover:text-white hover:bg-rose-600 hover:shadow-md dark:hover:bg-rose-650 border border-slate-150 dark:border-slate-800/80 hover:border-transparent h-8 w-8 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-150 bg-transparent"
                    title="解除此条拉黑审判"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Blocking reason details */}
                <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-900/40 relative overflow-hidden">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed font-bold flex items-center gap-1">
                    <Shield className="h-3 w-3 text-rose-500/80" /> 审计拉黑因果：
                  </p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold mt-1 bg-transparent border-none p-0 outline-none select-text">
                    {item.reason}
                  </p>
                </div>

                {/* Audit trail metadata */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-bold border-t border-slate-100 dark:border-slate-850/60 pt-3">
                  <span className="flex items-center gap-1">
                    裁决主审官: <span className="text-slate-600 dark:text-slate-350">{item.creator}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    注入时间: <span className="font-mono text-[9px]">{item.time}</span>
                  </span>
                </div>

              </motion.div>
            );
          })
        )}
      </div>

    </div>
  );
}

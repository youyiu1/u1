/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, ShieldAlert, CheckCircle, XCircle, Filter, ChevronDown, 
  ChevronUp, Terminal, User, Settings, Sparkles, HelpCircle,
  Clock, Trash2, Database, ShieldCheck
} from 'lucide-react';
import { OperationLogItem } from '../types';
import { adminApi } from '../services/adminApi';

interface OperationLogViewProps {
  logs: OperationLogItem[];
  onUpdateLogs: (logs: OperationLogItem[]) => void;
}

export default function OperationLogView({ logs, onUpdateLogs }: OperationLogViewProps) {
  // Config retention states
  const [retentionPolicy, setRetentionPolicy] = useState(() => {
    return localStorage.getItem('leju_op_log_retention') || 'all';
  });
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [cleanupMessage, setCleanupMessage] = useState<string | null>(null);
  const [isCleaning, setIsCleaning] = useState(false);

  // Queries
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'ai'>('all');

  // Expanded Log Details state array
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Policy switch logic
  const handlePolicyChange = async (policy: string) => {
    setIsCleaning(true);
    try {
      const res = await adminApi.updateOperationLogRetention(policy);
      if (res.code === 200) {
        setRetentionPolicy(policy);
        onUpdateLogs(res.data.logs);
        if (res.data.cleanedCount > 0) {
          setCleanupMessage(`成功切换策略为【${
            policy === '1' ? '最近1天' :
            policy === '7' ? '最近7天' :
            policy === '15' ? '最近15天' :
            policy === '30' ? '最近30天' :
            policy === '90' ? '最近90天' :
            policy === '1095' ? '最近3年' : '永久保存'
          }】！已自动扫除并物理擦除了 ${res.data.cleanedCount} 条超过期限的操作日志记录。`);
        } else {
          setCleanupMessage(`应用策略成功！当前无超过期限的敏感操作日志，所有记录合规存档。`);
        }
        setTimeout(() => {
          setCleanupMessage(null);
        }, 5000);
      }
    } catch (err) {
      console.error('Failed to change retention policy', err);
    } finally {
      setIsCleaning(false);
    }
  };

  const triggerManualCleanup = async () => {
    setIsCleaning(true);
    try {
      const res = await adminApi.updateOperationLogRetention(retentionPolicy);
      if (res.code === 200) {
        onUpdateLogs(res.data.logs);
        if (res.data.cleanedCount > 0) {
          setCleanupMessage(`手动净化完成！已为您清扫并擦除 ${res.data.cleanedCount} 条过期操作日志。`);
        } else {
          setCleanupMessage(`手动净化完成！当前未检测到任何需要清扫的过期日志。`);
        }
        setTimeout(() => {
          setCleanupMessage(null);
        }, 5000);
      }
    } catch (err) {
      console.error('Failed to trigger manual cleanup', err);
    } finally {
      setIsCleaning(false);
    }
  };

  // Filters calculation
  const filteredLogs = logs.filter(log => {
    const matchSearch =
      log.operator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()));

    const isSystemRole = log.operator === '系统自动审计' || log.role.includes('AI') || log.role.includes('系统');
    const matchRole =
      roleFilter === 'all' ||
      (roleFilter === 'admin' && !isSystemRole) ||
      (roleFilter === 'ai' && isSystemRole);

    return matchSearch && matchRole;
  });

  const toggleExpandLog = (id: string) => {
    setExpandedLogId(prev => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6" id="operation-logs-view-root">
      
      {/* Page Title & Back-office Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[28px] text-indigo-500 font-bold">receipt_long</span>
            决策行为及操作日志
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            不可篡改的安全合规历史追踪。留档后台管理员、客服、及风控大脑AI触发的所有介入阻断决策
          </p>
        </div>
      </div>

      {/* 自动清理与日志保留期限配置项 */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setIsSettingOpen(!isSettingOpen)}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Settings className={`w-5 h-5 text-indigo-500 ${isCleaning ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                自动清理与操作日志保留期限设置
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  自动清理守护中
                </span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                合规性存储周期：当前设为 <strong className="text-indigo-600 dark:text-indigo-400 text-sm">
                  {retentionPolicy === 'all' && '永久保存'}
                  {retentionPolicy === '1' && '极简保留 (仅最近24小时)'}
                  {retentionPolicy === '7' && '保留最近 7 天'}
                  {retentionPolicy === '15' && '保留最近 15 天'}
                  {retentionPolicy === '30' && '安全保留最近 30 天'}
                  {retentionPolicy === '90' && '安全保留最近 90 天'}
                  {retentionPolicy === '1095' && '法规级保留最近 3 年'}
                </strong>
              </p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 text-xs font-bold border-none bg-transparent cursor-pointer focus:outline-none">
            {isSettingOpen ? '收起配置' : '展开参数'}
            <span className="material-symbols-outlined text-[18px]">
              {isSettingOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        </div>

        {/* Action feedback banner toast */}
        <AnimatePresence>
          {cleanupMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs flex items-center gap-2 font-semibold"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>{cleanupMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {isSettingOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="overflow-hidden space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800"
          >
            <div>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                选择操作日志自动保留周期 (到期后系统后台自动将其物理擦除，切勿频繁调换)
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {[
                  { value: 'all', label: '永久保存 (演示默认)', desc: '不启动过期清除机制' },
                  { value: '1', label: '最近 1 天', desc: '用于极高涉密和敏感情景' },
                  { value: '7', label: '最近 7 天', desc: '满足短期复盘审查' },
                  { value: '15', label: '最近 15 天', desc: '兼顾安全与存储开销' },
                  { value: '30', label: '最近 30 天 (推荐)', desc: '同城社区推荐基线' },
                  { value: '90', label: '最近 90 天', desc: '满足季度级行政合规审计' },
                  { value: '1095', label: '最近 3 年', desc: '满足互联网信息法规标准' }
                ].map((opt) => {
                  const isActive = retentionPolicy === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handlePolicyChange(opt.value)}
                      disabled={isCleaning}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between h-20 ${
                        isActive
                          ? 'border-indigo-500 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 font-bold ring-1 ring-indigo-500/40'
                          : 'border-slate-200 dark:border-slate-800 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <span className="text-xs font-bold block">{opt.label}</span>
                      <span className="text-[9px] text-slate-400 block mt-1 leading-normal font-sans font-normal line-clamp-2">
                        {opt.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-55/40 dark:bg-slate-950/20 p-3 rounded-lg border border-slate-200/50 dark:border-slate-800/40">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block">
                  自动清理守护机制
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold flex items-center gap-1.5 pt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  当“超级管理员”登录后台、查看日志界面或执行黑标签审核动作时，系统均会自动静默触发净化守护清理。
                </p>
              </div>
              <button
                onClick={triggerManualCleanup}
                disabled={isCleaning}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer border-none flex items-center gap-1.5 shadow-xs disabled:opacity-50 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5 text-indigo-400" />
                {isCleaning ? '执行中...' : '立即执行安全净化守护'}
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Analytics Counter Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-400 dark:text-slate-505 font-bold uppercase">人工操作次数</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800 dark:text-white">
              {logs.filter(l => l.operator !== '系统自动审计').length}
            </span>
            <span className="text-xs text-slate-500 font-sans">个决策</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-400 dark:text-slate-505 font-bold uppercase font-sans">AI 介入次数</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-500">
              {logs.filter(l => l.operator === '系统自动审计').length}
            </span>
            <span className="text-xs text-indigo-500">个联动</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-400 dark:text-slate-505 font-bold uppercase font-sans">决策成功率</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-500">100%</span>
            <span className="text-xs text-emerald-500">执行成功</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-400 dark:text-slate-505 font-bold uppercase">网路审计覆盖</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800 dark:text-white">100%</span>
            <span className="text-xs text-slate-500">网关覆盖</span>
          </div>
        </div>
      </div>

      {/* Filter Options Console */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search tool */}
        <div className="relative flex-grow max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="搜寻具体决策动作、操作人、目标实体标识或详情解说..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        {/* Level filter tab */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold flex items-center gap-0.5 whitespace-nowrap">
            <Filter className="h-4 w-4" /> 操作决策源:
          </span>
          <div className="inline-flex rounded-lg p-0.5 bg-slate-105 dark:bg-slate-950">
            {(['all', 'admin', 'ai'] as const).map(role => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`py-1 px-3.5 text-xs font-bold rounded-md border-none cursor-pointer transition-all ${
                  roleFilter === role
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 bg-transparent'
                }`}
              >
                {role === 'all' && '全部审计'}
                {role === 'admin' && '人工决策（管理员）'}
                {role === 'ai' && '机器指派（AI熔断）'}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Main Table Record Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/85 rounded-xl shadow-sm overflow-hidden animate-fade-in text-slate-650 dark:text-slate-350">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-850 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Terminal className="h-6 w-6" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">未检测到任何命中操作日志</p>
            <p className="text-slate-400 dark:text-slate-500 text-xs">请改变筛选类型或清空当前输入，重新调取平台后台决策</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-extrabold border-b border-slate-200/60 dark:border-slate-800/60 select-none">
                <tr>
                  <th className="p-4 w-10"></th>
                  <th className="p-4">决策者 / 角色岗位</th>
                  <th className="p-4">审计行为动作</th>
                  <th className="p-4">作用目标 Target</th>
                  <th className="p-4">决策源端 IP</th>
                  <th className="p-4">发布执行时刻</th>
                  <th className="p-4 text-center">状态判定</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  const isAIRole = log.operator === '系统自动审计' || log.role.includes('AI') || log.role.includes('系统');
                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        onClick={() => toggleExpandLog(log.id)}
                        className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all font-sans cursor-pointer ${
                          isExpanded ? 'bg-primary/5 dark:bg-primary/5' : ''
                        }`}
                      >
                        {/* Expand Trigger Icon toggle */}
                        <td className="p-4 text-center text-slate-450 dark:text-slate-550">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </td>

                        {/* Executer */}
                        <td className="p-4 font-bold">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isAIRole 
                                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500' 
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-350'
                            }`}>
                              {isAIRole ? <Sparkles className="h-4.5 w-4.5 animate-pulse" /> : <User className="h-4.5 w-4.5" />}
                            </div>
                            <div>
                              <span className="text-slate-900 dark:text-white block leading-none hover:text-primary transition-colors">
                                {log.operator}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 block mt-1">
                                {log.role}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Audit Action Text */}
                        <td className="p-4 text-xs font-bold text-slate-800 dark:text-slate-200">
                          {log.action}
                        </td>

                        {/* Target ID */}
                        <td className="p-4 whitespace-nowrap">
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px] font-bold font-mono tracking-wide px-2 py-1 rounded-md">
                            {log.target}
                          </span>
                        </td>

                        {/* Action IP */}
                        <td className="p-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                          {log.ip}
                        </td>

                        {/* Execute Time */}
                        <td className="p-4 whitespace-nowrap text-xs text-slate-400 font-semibold dark:text-slate-500">
                          {log.time}
                        </td>

                        {/* Operational Status badge */}
                        <td className="p-4 text-center whitespace-nowrap">
                          {log.status === 'success' ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-xs px-2.5 py-1 rounded-full font-bold">
                              <CheckCircle className="w-3 w-3" /> 已完美执行
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 text-xs px-2.5 py-1 rounded-full font-bold">
                              <XCircle className="w-3 w-3" /> 打开中止
                            </span>
                          )}
                        </td>

                      </tr>

                      {/* Expanded Section Panel Details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <tr>
                            <td colSpan={7} className="bg-slate-50 dark:bg-slate-950/65 p-4 border-l-4 border-primary">
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-3 font-semibold overflow-hidden"
                              >
                                <div className="flex items-center gap-2 text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider select-none">
                                  <Terminal className="h-4 w-4 shrink-0 text-primary" />
                                  系统决策详细审计解说 [行为ID: {log.id}]
                                </div>
                                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-xl space-y-2">
                                  <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed max-w-3xl whitespace-pre-wrap font-sans">
                                    {log.details || '未留下附带判定说明。系统已经根据网络运营安全拦截协定，判定阻断安全附件并永久存折归档。'}
                                  </p>
                                  
                                  {/* Deep details */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 mt-2 border-t border-slate-100 dark:border-slate-850/60 font-mono text-[10px] text-slate-400">
                                    <div>
                                      决策执行人: <span className="text-slate-600 dark:text-slate-300">{log.operator} ({log.role})</span>
                                    </div>
                                    <div>
                                      源主机归巢地址: <span className="text-slate-600 dark:text-slate-300">{log.ip}</span>
                                    </div>
                                    <div>
                                      行为影响对象: <span className="text-slate-605 dark:text-slate-300">{log.target}</span>
                                    </div>
                                    <div>
                                      完成反馈: <span className="text-emerald-500">Operation successfully processed with exit code 0</span>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

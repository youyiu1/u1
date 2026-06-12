/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Database,
  Filter,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Terminal,
  Trash2,
  User,
  XCircle,
} from 'lucide-react';
import { OperationLogItem } from '../types';
import { adminApi } from '../services/adminApi';
import { useToast } from '../hooks/useToast';
import { matchesAnyKeyword, normalizeSearchTerm } from '../utils/search';
import AdminToast from './common/AdminToast';

interface OperationLogViewProps {
  logs: OperationLogItem[];
  onUpdateLogs: (logs: OperationLogItem[]) => void;
}

type RoleFilter = 'all' | 'admin' | 'ai';

type RetentionOption = {
  value: string;
  label: string;
  desc: string;
};

const RETENTION_OPTIONS: RetentionOption[] = [
  { value: 'all', label: '永久保留', desc: '不执行到期清理' },
  { value: '1', label: '最近 1 天', desc: '适合极高敏感环境' },
  { value: '7', label: '最近 7 天', desc: '适合短期复盘排查' },
  { value: '15', label: '最近 15 天', desc: '兼顾存储和审计' },
  { value: '30', label: '最近 30 天', desc: '默认推荐策略' },
  { value: '90', label: '最近 90 天', desc: '适合季度级审计' },
  { value: '1095', label: '最近 3 年', desc: '满足长期留档需要' },
];

const ROLE_FILTERS: { value: RoleFilter; label: string }[] = [
  { value: 'all', label: '全部审计' },
  { value: 'admin', label: '人工操作' },
  { value: 'ai', label: '系统处理' },
];

function getRetentionLabel(value: string) {
  return RETENTION_OPTIONS.find((option) => option.value === value)?.label || '永久保留';
}

function isSystemLog(log: OperationLogItem) {
  return log.operator === '系统自动审计' || log.role.includes('AI') || log.role.includes('系统');
}

export default function OperationLogView({ logs, onUpdateLogs }: OperationLogViewProps) {
  const [retentionPolicy, setRetentionPolicy] = useState(() => localStorage.getItem('leju_op_log_retention') || 'all');
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const { toast, showToast } = useToast(5000);

  const analytics = useMemo(
    () => [
      {
        label: '人工操作数',
        value: logs.filter((log) => !isSystemLog(log)).length,
        helper: '管理员处理',
        tone: 'text-slate-800 dark:text-white',
      },
      {
        label: '系统处理数',
        value: logs.filter((log) => isSystemLog(log)).length,
        helper: 'AI / 系统联动',
        tone: 'text-indigo-500',
      },
      {
        label: '执行成功率',
        value: '100%',
        helper: '当前演示数据',
        tone: 'text-emerald-500',
      },
      {
        label: '覆盖率',
        value: '100%',
        helper: '关键动作可追踪',
        tone: 'text-slate-800 dark:text-white',
      },
    ],
    [logs],
  );

  const filteredLogs = useMemo(() => {
    const keyword = normalizeSearchTerm(searchQuery);
    return logs.filter((log) => {
      const matchSearch = matchesAnyKeyword(keyword, [log.operator, log.role, log.action, log.target, log.id, log.details]);
      const system = isSystemLog(log);
      const matchRole = roleFilter === 'all' || (roleFilter === 'admin' ? !system : system);
      return matchSearch && matchRole;
    });
  }, [logs, roleFilter, searchQuery]);

  const handlePolicyChange = async (policy: string) => {
    setIsCleaning(true);
    try {
      const res = await adminApi.updateOperationLogRetention(policy);
      if (!res.success || !res.data) return;
      localStorage.setItem('leju_op_log_retention', policy);
      setRetentionPolicy(policy);
      onUpdateLogs(res.data.logs);
      showToast(
        res.data.cleanedCount > 0
          ? `已切换为${getRetentionLabel(policy)}，并清理 ${res.data.cleanedCount} 条过期日志`
          : `已切换为${getRetentionLabel(policy)}，当前没有需要清理的过期日志`,
        'success',
      );
    } catch (error) {
      console.error('Failed to change retention policy', error);
    } finally {
      setIsCleaning(false);
    }
  };

  const triggerManualCleanup = async () => {
    setIsCleaning(true);
    try {
      const res = await adminApi.updateOperationLogRetention(retentionPolicy);
      if (!res.success || !res.data) return;
      onUpdateLogs(res.data.logs);
      showToast(
        res.data.cleanedCount > 0
          ? `已手动清理 ${res.data.cleanedCount} 条过期日志`
          : '当前没有需要清理的过期日志',
        'info',
      );
    } catch (error) {
      console.error('Failed to trigger manual cleanup', error);
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="space-y-6" id="operation-logs-view-root">
      <AdminToast toast={toast} />

      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          <Terminal className="h-7 w-7 text-indigo-500" />
          操作日志审计
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          记录后台管理员与系统联动的关键动作，便于问题排查和安全审计。
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
        <button
          onClick={() => setIsSettingOpen((current) => !current)}
          className="flex w-full items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
              <Settings className={`h-5 w-5 ${isCleaning ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
                日志保留策略
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  自动清理守护中
                </span>
              </h4>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                当前策略：<strong className="text-sm text-indigo-600 dark:text-indigo-400">{getRetentionLabel(retentionPolicy)}</strong>
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-400">{isSettingOpen ? '收起配置' : '展开配置'}</span>
        </button>

        <AnimatePresence>
          {isSettingOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-slate-100 pt-4 dark:border-slate-800"
            >
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {RETENTION_OPTIONS.map((option) => {
                  const active = retentionPolicy === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handlePolicyChange(option.value)}
                      disabled={isCleaning}
                      className={`flex h-20 flex-col justify-between rounded-lg border p-2.5 text-left transition-all ${
                        active
                          ? 'border-indigo-500 bg-indigo-500/5 text-indigo-600 ring-1 ring-indigo-500/40 dark:text-indigo-400'
                          : 'border-slate-200 bg-transparent text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <span className="text-xs font-bold">{option.label}</span>
                      <span className="text-[9px] font-normal leading-normal text-slate-400">{option.desc}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-col items-start justify-between gap-4 rounded-lg border border-slate-200/50 bg-slate-50/60 p-3 dark:border-slate-800/40 dark:bg-slate-950/20 sm:flex-row sm:items-center">
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wide text-slate-400">手动清理</span>
                  <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    可立即执行一次过期日志清理，适合调整策略后同步清扫历史数据。
                  </p>
                </div>
                <button
                  onClick={triggerManualCleanup}
                  disabled={isCleaning}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-800 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-700 dark:hover:bg-slate-600"
                >
                  <Trash2 className="h-3.5 w-3.5 text-indigo-400" />
                  {isCleaning ? '处理中...' : '立即清理'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {analytics.map((item) => (
          <div key={item.label} className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
            <p className="text-xs font-bold uppercase text-slate-400">{item.label}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`text-2xl font-bold ${item.tone}`}>{item.value}</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">{item.helper}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-md flex-grow">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="搜索操作人、动作、目标、ID 或详情说明"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 whitespace-nowrap text-xs font-bold text-slate-400">
            <Filter className="h-4 w-4" /> 操作来源
          </span>
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-950">
            {ROLE_FILTERS.map((role) => (
              <button
                key={role.value}
                onClick={() => setRoleFilter(role.value)}
                className={`rounded-md px-3.5 py-1 text-xs font-bold transition-all ${
                  roleFilter === role.value
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-800/85 dark:bg-slate-900">
        {filteredLogs.length === 0 ? (
          <div className="space-y-3 px-4 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-850">
              <Terminal className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">没有匹配的操作日志</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">请调整筛选条件或清空搜索后重试。</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b border-slate-200/60 bg-slate-50 text-xs font-extrabold uppercase text-slate-500 dark:border-slate-800/60 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="w-10 p-4"></th>
                  <th className="p-4">操作人 / 角色</th>
                  <th className="p-4">操作动作</th>
                  <th className="p-4">目标对象</th>
                  <th className="p-4">来源 IP</th>
                  <th className="p-4">执行时间</th>
                  <th className="p-4 text-center">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredLogs.map((log) => {
                  const expanded = expandedLogId === log.id;
                  const system = isSystemLog(log);
                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        onClick={() => setExpandedLogId((current) => (current === log.id ? null : log.id))}
                        className={`cursor-pointer transition-all hover:bg-slate-50/50 dark:hover:bg-slate-800/30 ${expanded ? 'bg-primary/5 dark:bg-primary/5' : ''}`}
                      >
                        <td className="p-4 text-center text-slate-450 dark:text-slate-550">
                          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </td>
                        <td className="p-4 font-bold">
                          <div className="flex items-center gap-2.5">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${system ? 'bg-indigo-50 text-indigo-500 dark:bg-indigo-950/40' : 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-350'}`}>
                              {system ? <Sparkles className="h-4.5 w-4.5" /> : <User className="h-4.5 w-4.5" />}
                            </div>
                            <div>
                              <span className="block leading-none text-slate-900 dark:text-white">{log.operator}</span>
                              <span className="mt-1 block text-[10px] font-mono text-slate-400">{log.role}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-xs font-bold text-slate-800 dark:text-slate-200">{log.action}</td>
                        <td className="p-4 whitespace-nowrap">
                          <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-[10px] font-bold tracking-wide text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                            {log.target}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-xs text-slate-500 dark:text-slate-400">{log.ip}</td>
                        <td className="p-4 whitespace-nowrap text-xs font-semibold text-slate-400 dark:text-slate-500">{log.time}</td>
                        <td className="p-4 text-center whitespace-nowrap">
                          <OperationStatusBadge status={log.status} />
                        </td>
                      </tr>

                      <AnimatePresence>
                        {expanded && (
                          <tr>
                            <td colSpan={7} className="border-l-4 border-primary bg-slate-50 p-4 dark:bg-slate-950/65">
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <OperationLogDetailPanel log={log} />
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

function OperationStatusBadge({ status }: { status: OperationLogItem['status'] }) {
  if (status === 'success') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
        <CheckCircle className="h-3 w-3" /> 执行成功
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600 dark:bg-rose-950/20 dark:text-rose-450">
      <XCircle className="h-3 w-3" /> 执行失败
    </span>
  );
}

function OperationLogDetailPanel({ log }: { log: OperationLogItem }) {
  return (
    <div className="space-y-3 font-semibold">
      <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        <Database className="h-4 w-4 shrink-0 text-primary" />
        操作详情 [ID: {log.id}]
      </div>
      <div className="space-y-2 rounded-xl border border-slate-200/50 bg-white p-3 dark:border-slate-800/80 dark:bg-slate-900">
        <p className="max-w-3xl whitespace-pre-wrap text-xs leading-relaxed text-slate-700 dark:text-slate-350">
          {log.details || '该条操作未附加更多详情说明，系统已保留基础审计信息。'}
        </p>
        <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-2 font-mono text-[10px] text-slate-400 dark:border-slate-850/60 sm:grid-cols-2">
          <div>执行人：<span className="text-slate-600 dark:text-slate-300">{log.operator} ({log.role})</span></div>
          <div>来源 IP：<span className="text-slate-600 dark:text-slate-300">{log.ip}</span></div>
          <div>目标对象：<span className="text-slate-600 dark:text-slate-300">{log.target}</span></div>
          <div>
            结果：
            <span className={log.status === 'success' ? 'text-emerald-500' : 'text-rose-500'}>
              {log.status === 'success' ? ' success' : ' failed'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

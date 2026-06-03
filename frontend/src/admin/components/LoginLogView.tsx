/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Search, ShieldAlert, CheckCircle, XCircle, Filter, RotateCcw,
  MapPin, Laptop, Smartphone, HelpCircle, Calendar
} from 'lucide-react';
import { LoginLogItem } from '../types';
import { matchesAnyKeyword, normalizeSearchTerm } from '../utils/search';

interface LoginLogViewProps {
  logs: LoginLogItem[];
}

export default function LoginLogView({ logs }: LoginLogViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all');

  const filteredLogs = useMemo(() => {
    const keyword = normalizeSearchTerm(searchQuery);
    return logs.filter((log) => {
      const matchSearch = matchesAnyKeyword(keyword, [
        log.username,
        log.userId,
        log.ip,
        log.device,
        log.location,
      ]);
      const matchStatus = statusFilter === 'all' || log.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [logs, searchQuery, statusFilter]);

  const logStats = useMemo(() => {
    const successCount = logs.filter((log) => log.status === 'success').length;
    const failedCount = logs.filter((log) => log.status === 'failed').length;
    return {
      failedCount,
      successRate: ((successCount / (logs.length || 1)) * 100).toFixed(0),
    };
  }, [logs]);

  return (
    <div className="space-y-6" id="login-logs-view-root">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[28px] text-indigo-500">fingerprint</span>
            安全认证及登录日志
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            追踪并审计全站同城APP、各微信小程序客户端及总后台超级管理员账户的单次登录授权审计
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-400 dark:text-slate-505 font-bold uppercase">全网登录峰值</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800 dark:text-white">{logs.length}</span>
            <span className="text-xs text-slate-500">次拉起</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-400 dark:text-slate-505 font-bold uppercase">认证成功率</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-500">{logStats.successRate}%</span>
            <span className="text-xs text-emerald-500">在线</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-400 dark:text-slate-505 font-bold uppercase">异常碰撞拦截</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-500">{logStats.failedCount}</span>
            <span className="text-xs text-slate-500 font-sans">起被锁</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-400 dark:text-slate-505 font-bold uppercase">拦截IP计数</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800 dark:text-white">2</span>
            <span className="text-xs text-slate-500">源</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-grow max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="搜索IP地址、登录账户、设备UA标识或省市..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold flex items-center gap-0.5 whitespace-nowrap">
            <Filter className="h-4 w-4" /> 认证判定状态:
          </span>
          <div className="inline-flex rounded-lg p-0.5 bg-slate-105 dark:bg-slate-950">
            {(['all', 'success', 'failed'] as const).map((state) => (
              <button
                key={state}
                onClick={() => setStatusFilter(state)}
                className={`py-1 px-3.5 text-xs font-bold rounded-md border-none cursor-pointer transition-all ${
                  statusFilter === state
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 bg-transparent'
                }`}
              >
                {state === 'all' && '全部登入日志'}
                {state === 'success' && '安全登入成功'}
                {state === 'failed' && '登录失败/受阻'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/85 rounded-xl shadow-sm overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-850 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">未检测到任何命中登录审计</p>
            <p className="text-slate-400 dark:text-slate-500 text-xs">请清除当前搜索栏，或重新刷新列表元数据</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-600 dark:text-slate-350">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-extrabold border-b border-slate-200/60 dark:border-slate-800/60">
                <tr>
                  <th className="p-4">日志唯一标识</th>
                  <th className="p-4">登入关联账户</th>
                  <th className="p-4">来源终端 IP</th>
                  <th className="p-4">设备 U.A. 应用标志</th>
                  <th className="p-4">解析归属地理</th>
                  <th className="p-4">登入时刻</th>
                  <th className="p-4 text-center">状态认定</th>
                  <th className="p-4 text-right">安全拦截附言</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all font-sans"
                  >
                    <td className="p-4 whitespace-nowrap font-mono text-[11px] font-bold text-slate-400">
                      {log.id}
                    </td>
                    <td className="p-4 font-bold">
                      <div className="flex flex-col">
                        <span className="text-slate-900 dark:text-white leading-none">{log.username}</span>
                        <span className="text-[10px] font-mono text-slate-400 mt-1 uppercase" title={log.userId}>
                          {log.userId === 'UID-SYSTEM-ADMIN' ? '核心总代后台' : `UID: ${log.userId.slice(-6)}`}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                      {log.ip}
                    </td>
                    <td className="p-4 text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        {log.device.toLowerCase().includes('mac') || log.device.toLowerCase().includes('chrome') ? (
                          <Laptop className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        ) : (
                          <Smartphone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        )}
                        <span className="truncate max-w-[180px] block" title={log.device}>{log.device}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-bold whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                        <MapPin className="h-3.5 w-3.5 text-sky-500" />
                        <span>{log.location}</span>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap text-xs text-slate-400 font-semibold dark:text-slate-500">
                      {log.time}
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      {log.status === 'success' ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs px-2.5 py-1 rounded-full font-bold">
                          <CheckCircle className="w-3 w-3" /> 验证通过并进入
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs px-2.5 py-1 rounded-full font-bold">
                          <XCircle className="w-3 w-3" /> 阻断失败
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right text-xs text-rose-500 font-bold max-w-xs truncate" title={log.failReason}>
                      {log.status === 'failed' ? log.failReason : <span className="text-slate-400 dark:text-slate-600 font-semibold">-</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

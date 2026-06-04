/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertOctagon,
  CheckSquare,
  FileText,
  Filter,
  Globe,
  Plus,
  Search,
  Shield,
  ShieldAlert,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { BlacklistItem } from '../types';
import { useToast } from '../hooks/useToast';
import { matchesAnyKeyword, normalizeSearchTerm } from '../utils/search';
import AdminToast from './common/AdminToast';

interface BlacklistManagementViewProps {
  blacklist: BlacklistItem[];
  onAddBlacklist: (targetType: 'user' | 'keyword' | 'ip', targetValue: string, reason: string) => void;
  onDeleteBlacklist: (id: string) => void;
  onAddOperationLog?: (action: string, target: string, details?: string) => void;
}

type BlacklistType = 'all' | 'user' | 'keyword' | 'ip';
type AddBlacklistType = Exclude<BlacklistType, 'all'>;

const TYPE_FILTERS: { value: BlacklistType; label: string }[] = [
  { value: 'all', label: '全部拦截' },
  { value: 'user', label: '用户账号' },
  { value: 'keyword', label: '敏感词' },
  { value: 'ip', label: 'IP 地址' },
];

const TYPE_META: Record<AddBlacklistType, {
  title: string;
  shortLabel: string;
  placeholder: string;
  badgeTone: string;
  icon: React.ReactNode;
  presets: string[];
}> = {
  user: {
    title: '违规用户账号',
    shortLabel: '用户账号',
    placeholder: '请输入用户名或用户 ID，例如：highsf88',
    badgeTone: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/35 dark:text-indigo-400',
    icon: <User className="h-4 w-4" />,
    presets: [
      '频繁发布虚假二手信息和垃圾营销内容',
      '在他人动态下恶意辱骂并进行人身攻击',
      '涉嫌诈骗、刷单或引导站外交易',
      '冒充平台客服或管理人员进行欺骗',
    ],
  },
  keyword: {
    title: '敏感词拦截',
    shortLabel: '敏感词',
    placeholder: '支持逗号批量导入，例如：办证,刷单,高利贷',
    badgeTone: 'bg-amber-50 text-amber-600 dark:bg-amber-950/35 dark:text-amber-400',
    icon: <FileText className="h-4 w-4" />,
    presets: [
      '国家网信办严禁传播的涉黄涉赌敏感词',
      '洗钱、代开发票、高利贷等非法黑产词库',
      '针对其他居民的人身攻击和极端辱骂词汇',
      '兼职刷单、返利诈骗等高风险诱导话术',
    ],
  },
  ip: {
    title: '恶意来源 IP',
    shortLabel: 'IP 地址',
    placeholder: '请输入来源 IP，例如：182.230.12.98',
    badgeTone: 'bg-rose-50 text-rose-600 dark:bg-rose-950/35 dark:text-rose-400',
    icon: <Globe className="h-4 w-4" />,
    presets: [
      '检测到针对后台端口的高频撞库和攻击行为',
      '恶意爬取用户隐私数据与联系方式',
      '多账号批量注册和高频发帖来源',
    ],
  },
};

export default function BlacklistManagementView({
  blacklist,
  onAddBlacklist,
  onDeleteBlacklist,
  onAddOperationLog,
}: BlacklistManagementViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<BlacklistType>('all');
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [newType, setNewType] = useState<AddBlacklistType>('user');
  const [newValue, setNewValue] = useState('');
  const [newReason, setNewReason] = useState('');
  const [formError, setFormError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast, showToast } = useToast();

  const metrics = useMemo(
    () => ({
      total: blacklist.length,
      user: blacklist.filter((item) => item.targetType === 'user').length,
      keyword: blacklist.filter((item) => item.targetType === 'keyword').length,
      ip: blacklist.filter((item) => item.targetType === 'ip').length,
    }),
    [blacklist],
  );

  const filteredList = useMemo(() => {
    const keyword = normalizeSearchTerm(searchQuery);
    return blacklist.filter((item) => {
      const matchSearch = matchesAnyKeyword(keyword, [item.targetValue, item.reason, item.creator, item.id]);
      const matchType = typeFilter === 'all' || item.targetType === typeFilter;
      return matchSearch && matchType;
    });
  }, [blacklist, searchQuery, typeFilter]);

  const metricCards = [
    {
      label: '黑名单总量',
      value: metrics.total,
      suffix: '项',
      helper: '实时生效',
      tone: 'text-slate-900 dark:text-white',
      icon: <Shield className="h-4 w-4" />,
      iconClassName: 'bg-slate-50 text-slate-500 dark:bg-slate-850',
    },
    {
      label: '封禁用户',
      value: metrics.user,
      suffix: '个',
      helper: '账号级阻断',
      tone: 'text-indigo-600 dark:text-indigo-400',
      icon: <User className="h-4 w-4" />,
      iconClassName: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/35 dark:text-indigo-400',
    },
    {
      label: '敏感词库',
      value: metrics.keyword,
      suffix: '条',
      helper: '全局文本过滤',
      tone: 'text-amber-600 dark:text-amber-400',
      icon: <FileText className="h-4 w-4" />,
      iconClassName: 'bg-amber-50 text-amber-600 dark:bg-amber-950/35 dark:text-amber-400',
    },
    {
      label: '恶意 IP',
      value: metrics.ip,
      suffix: '个',
      helper: '来源封禁',
      tone: 'text-rose-600 dark:text-rose-400',
      icon: <Globe className="h-4 w-4" />,
      iconClassName: 'bg-rose-50 text-rose-600 dark:bg-rose-950/35 dark:text-rose-400',
    },
  ];

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('已复制目标值', 'success');
    window.setTimeout(() => setCopiedId(null), 1800);
  };

  const resetForm = () => {
    setNewValue('');
    setNewReason('');
    setFormError('');
    setIsAddingMode(false);
  };

  const handleSubmitAddition = (event: React.FormEvent) => {
    event.preventDefault();
    const targetValue = newValue.trim();
    const reason = newReason.trim();

    if (!targetValue) {
      setFormError('目标值不能为空');
      return;
    }
    if (!reason) {
      setFormError('请输入加入黑名单的原因，便于后续审计');
      return;
    }

    const values = newType === 'keyword'
      ? targetValue.split(/[，,]/).map((item) => item.trim()).filter(Boolean)
      : [targetValue];

    values.forEach((value) => {
      onAddBlacklist(newType, value, reason);
      onAddOperationLog?.(`新增黑名单项[${TYPE_META[newType].shortLabel}]`, value, `原因：${reason}`);
    });

    showToast(values.length > 1 ? `已批量新增 ${values.length} 条黑名单` : '黑名单项已新增', 'success');
    resetForm();
  };

  return (
    <div className="space-y-6" id="blacklist-view-root">
      <AdminToast toast={toast} />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            <ShieldAlert className="h-7 w-7 text-rose-500" />
            风控黑名单管理
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            统一维护违规用户、敏感词和恶意 IP 的拦截策略，所有变更即时生效。
          </p>
        </div>

        <button
          onClick={() => {
            setIsAddingMode((current) => !current);
            setFormError('');
          }}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
            isAddingMode
              ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              : 'bg-rose-600 text-white shadow-lg shadow-rose-600/20 hover:bg-rose-700'
          }`}
        >
          {isAddingMode ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isAddingMode ? '收起表单' : '新增拦截项'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metricCards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>

      <AnimatePresence>
        {isAddingMode && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-5 rounded-2xl border border-rose-100/70 bg-white p-6 shadow-sm dark:border-rose-950/70 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                <ShieldAlert className="h-5 w-5 text-rose-600" />
                新增拦截项
              </h3>
              <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-600 dark:bg-amber-950/45 dark:text-amber-400">
                提交后立即生效
              </span>
            </div>

            <form onSubmit={handleSubmitAddition} className="space-y-4">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500">1. 拦截类型</label>
                  <select
                    value={newType}
                    onChange={(event) => {
                      setNewType(event.target.value as AddBlacklistType);
                      setNewValue('');
                      setFormError('');
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-900 outline-none transition-all focus:border-rose-500 focus:ring-2 focus:ring-rose-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="user">违规用户账号</option>
                    <option value="keyword">敏感词拦截</option>
                    <option value="ip">恶意来源 IP</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500">2. 目标值</label>
                  <input
                    type="text"
                    value={newValue}
                    onChange={(event) => setNewValue(event.target.value)}
                    placeholder={TYPE_META[newType].placeholder}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none transition-all placeholder:font-sans focus:border-rose-500 focus:ring-2 focus:ring-rose-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <span className="block text-xs font-bold text-slate-500">3. 快捷原因模板</span>
                <div className="flex flex-wrap gap-1.5">
                  {TYPE_META[newType].presets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNewReason(preset)}
                      className={`rounded-lg border px-2 py-1 text-left text-[11px] transition-all ${
                        newReason === preset
                          ? 'border-rose-300 bg-rose-50 font-bold text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-850'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500">4. 详细原因</label>
                <textarea
                  rows={3}
                  value={newReason}
                  onChange={(event) => setNewReason(event.target.value)}
                  placeholder="请输入详细原因，内容会同步记录到操作日志中"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-900 outline-none transition-all focus:border-rose-500 focus:ring-2 focus:ring-rose-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  required
                />
              </div>

              {formError ? (
                <div className="flex items-center gap-1.5 rounded-xl border border-rose-300/20 bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-600 dark:bg-rose-950/40">
                  <AlertOctagon className="h-4 w-4" />
                  {formError}
                </div>
              ) : null}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-3 dark:border-slate-800/60">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg px-4.5 py-2 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-850"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-600/10 hover:bg-rose-700"
                >
                  确认新增
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="搜索目标值、原因、创建人或 ID"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs text-slate-900 outline-none transition-all focus:border-rose-500 focus:ring-2 focus:ring-rose-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 whitespace-nowrap text-xs font-bold text-slate-400">
            <Filter className="h-3.5 w-3.5" /> 类型筛选
          </span>
          <div className="inline-flex rounded-xl bg-slate-100 p-0.5 dark:bg-slate-950">
            {TYPE_FILTERS.map((type) => (
              <button
                key={type.value}
                onClick={() => setTypeFilter(type.value)}
                className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                  typeFilter === type.value
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filteredList.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-slate-200/50 bg-white px-4 py-12 text-center shadow-sm dark:border-slate-850 dark:bg-slate-900">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400 dark:bg-slate-850">
              <Shield className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">没有匹配的黑名单项</p>
            <p className="mx-auto mt-2 max-w-sm text-xs text-slate-400 dark:text-slate-500">
              你可以修改筛选条件，或者在上方新增用户账号、敏感词和来源 IP 的拦截策略。
            </p>
          </div>
        ) : (
          filteredList.map((item) => (
            <BlacklistItemCard
              key={item.id}
              item={item}
              copied={copiedId === item.id}
              onCopy={() => handleCopy(item.targetValue, item.id)}
              onDelete={() => {
                if (!window.confirm(`确认移除黑名单项「${item.targetValue}」吗？`)) return;
                onDeleteBlacklist(item.id);
                onAddOperationLog?.('移除黑名单项', item.targetValue, `黑名单项 ID：${item.id}`);
                showToast('黑名单项已移除', 'info');
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  suffix,
  helper,
  tone,
  icon,
  iconClassName,
}: {
  key?: React.Key;
  label: string;
  value: number;
  suffix: string;
  helper: string;
  tone: string;
  icon: React.ReactNode;
  iconClassName: string;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400">{label}</span>
        <div className={`rounded-xl p-2 ${iconClassName}`}>{icon}</div>
      </div>
      <p className={`mt-2 origin-left text-2xl font-extrabold transition-transform group-hover:scale-105 ${tone}`}>
        {value} <span className="text-xs font-medium text-slate-400">{suffix}</span>
      </p>
      <p className="mt-1 text-[10px] font-semibold text-slate-400">{helper}</p>
    </div>
  );
}

function BlacklistItemCard({
  item,
  copied,
  onCopy,
  onDelete,
}: {
  key?: React.Key;
  item: BlacklistItem;
  copied: boolean;
  onCopy: () => void;
  onDelete: () => void;
}) {
  const meta = TYPE_META[item.targetType];
  const riskLabel = item.targetType === 'keyword' ? '文本拦截' : '高风险阻断';

  return (
    <motion.div
      layout
      className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900 dark:hover:border-slate-700"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`rounded-xl p-2.5 ${meta.badgeTone}`}>{meta.icon}</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{meta.title}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">{riskLabel}</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="break-all text-base font-black tracking-tight text-slate-900 dark:text-white">{item.targetValue}</span>
              <button
                onClick={onCopy}
                className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                title="复制目标值"
              >
                <CheckSquare className={`h-3 w-3 ${copied ? 'scale-110 text-emerald-500' : ''}`} />
              </button>
              {copied ? (
                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-500 dark:bg-emerald-950/65">已复制</span>
              ) : null}
            </div>
          </div>
        </div>

        <button
          onClick={onDelete}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-150 text-slate-400 transition-all hover:border-transparent hover:bg-rose-600 hover:text-white dark:border-slate-800/80"
          title="移除黑名单"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-900/40 dark:bg-slate-950/60">
        <p className="flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500">
          <Shield className="h-3 w-3 text-rose-500/80" /> 审计原因
        </p>
        <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-700 dark:text-slate-300">{item.reason}</p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] font-bold text-slate-400 dark:border-slate-850/60 dark:text-slate-500">
        <span>创建人：<span className="text-slate-600 dark:text-slate-300">{item.creator}</span></span>
        <span className="font-mono">时间：{item.time}</span>
      </div>
    </motion.div>
  );
}

import React from 'react';

type StatusBadgeConfig = {
  label: string;
  className: string;
};

export type StatusBadgeMap = Record<string, StatusBadgeConfig>;

interface AdminStatusBadgeProps {
  status: string;
  statusMap: StatusBadgeMap;
}

export const goodsStatusMap: StatusBadgeMap = {
  active: {
    label: '在售',
    className: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
  },
  sold: {
    label: '已售出',
    className: 'bg-gray-100 text-gray-500 border border-gray-200',
  },
  removed: {
    label: '已下架',
    className: 'bg-rose-50 text-rose-500 border border-rose-100',
  },
  pending: {
    label: '待审核',
    className: 'bg-amber-50 text-amber-600 border border-amber-200',
  },
};

export const serviceStatusMap: StatusBadgeMap = {
  active: {
    label: '已上架',
    className: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/10',
  },
  pending: {
    label: '待审核',
    className: 'bg-amber-500/10 text-amber-600 border border-amber-500/10',
  },
  rejected: {
    label: '已下架',
    className: 'bg-rose-500/10 text-rose-600 border border-rose-500/10',
  },
};

export const orderStatusMap: StatusBadgeMap = {
  completed: {
    label: '已完成',
    className: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
  },
  pending_payment: {
    label: '待付款',
    className: 'bg-amber-500/10 text-amber-600 border border-amber-500/20',
  },
  pending_execution: {
    label: '待服务',
    className: 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20',
  },
  canceled: {
    label: '已取消',
    className: 'bg-gray-100 text-gray-500 border border-gray-200',
  },
  abnormal: {
    label: '异常单',
    className: 'bg-rose-500/10 text-rose-600 border border-rose-500/20',
  },
};

export const imageStatusMap: StatusBadgeMap = {
  approved: {
    label: '已放行',
    className: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400',
  },
  pending: {
    label: '待审核',
    className: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
  },
  flagged: {
    label: '已封禁',
    className: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
  },
};

export default function AdminStatusBadge({ status, statusMap }: AdminStatusBadgeProps) {
  const config = statusMap[status];
  if (!config) return null;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold ${config.className}`}>
      {config.label}
    </span>
  );
}

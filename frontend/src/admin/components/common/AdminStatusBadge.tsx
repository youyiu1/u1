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

export default function AdminStatusBadge({ status, statusMap }: AdminStatusBadgeProps) {
  const config = statusMap[status];
  if (!config) return null;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold ${config.className}`}>
      {config.label}
    </span>
  );
}

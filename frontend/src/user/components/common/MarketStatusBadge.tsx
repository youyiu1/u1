import React from 'react';
import { getMarketStatusMeta } from '../../utils/marketStatus';
import { Item } from '../../types';

type MarketStatusBadgeProps = {
  status?: Item['status'];
  rejectReason?: string;
  className?: string;
};

export function MarketStatusBadge({ status, rejectReason, className = '' }: MarketStatusBadgeProps) {
  const meta = getMarketStatusMeta(status, rejectReason);
  if (!meta) {
    return null;
  }

  return (
    <span
      className={`rounded-2xl px-3 py-1 text-[10px] font-black uppercase tracking-widest backdrop-blur-md ${meta.className} ${className}`.trim()}
      title={meta.description}
    >
      {meta.label}
    </span>
  );
}

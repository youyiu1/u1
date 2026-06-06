import { Item } from '../types';

type MarketStatusMeta = {
  label: string;
  className: string;
  description?: string;
};

const STATUS_META: Record<string, MarketStatusMeta> = {
  sold: {
    label: '已售出',
    className: 'bg-stone-900/85 text-white',
    description: '该商品已完成交易，当前不能再发起购买。',
  },
  pending: {
    label: '审核中',
    className: 'bg-amber-500/90 text-white',
    description: '商品正在等待审核，审核通过后才会对外展示。',
  },
  rejected: {
    label: '未通过',
    className: 'bg-rose-500/90 text-white',
    description: '商品未通过审核，请根据原因修改后重新发布。',
  },
  removed: {
    label: '已下架',
    className: 'bg-stone-500/90 text-white',
    description: '该商品当前已下架，暂时无法继续购买。',
  },
};

export function getMarketStatusMeta(status?: Item['status'], rejectReason?: string): MarketStatusMeta | null {
  if (!status) {
    return null;
  }

  const meta = STATUS_META[status];
  if (!meta) {
    return null;
  }

  if (status === 'rejected' && rejectReason) {
    return {
      ...meta,
      description: rejectReason,
    };
  }

  return meta;
}

export function isMarketItemPurchasable(status?: Item['status']): boolean {
  return !status || status === 'active';
}

export function isMarketItemVisibleInDetail(status?: Item['status']): boolean {
  return status === 'active' || status === 'sold' || status === 'pending' || status === 'rejected';
}

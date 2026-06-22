/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, Star, Trash2 } from 'lucide-react';
import { Order } from '../../types';

interface ProfileCompletedItemProps {
  order: Order;
  currentUserId: string;
  onDelete?: (id: string) => void;
  onComplete?: (order: Order) => void;
  onReview?: (order: Order) => void;
}

const STATUS_LABELS = {
  in_progress: '进行中',
  completed: '已完成',
} as const;

function formatDate(value?: string) {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return `${parsed.getFullYear()}/${parsed.getMonth() + 1}/${parsed.getDate()}`;
}

export const ProfileCompletedItem: React.FC<ProfileCompletedItemProps> = ({
  order,
  currentUserId,
  onDelete,
  onComplete,
  onReview,
}) => {
  const navigate = useNavigate();
  const isBuyer = order.buyerId === currentUserId;
  const isCompleted = order.status === 'completed';
  const isInProgress = order.status === 'in_progress';
  const roleLabel = isBuyer ? '我是买家' : '我是卖家';
  const statusLabel = order.status in STATUS_LABELS ? STATUS_LABELS[order.status as keyof typeof STATUS_LABELS] : '';

  const handleOpenDetail = () => {
    if (order.serviceId) {
      navigate(`/service/${order.serviceId}`);
    }
  };

  return (
    <div className="theme-card rounded-3xl p-6 transition-all hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 cursor-pointer" onClick={handleOpenDetail}>
          <div className="mb-2 flex items-center gap-2">
            <span
              className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                isBuyer ? 'bg-primary/5 text-primary' : 'bg-green-500/5 text-green-600'
              }`}
            >
              {roleLabel}
            </span>
            {statusLabel && (
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                  isInProgress ? 'bg-yellow-100 text-yellow-700' : 'bg-green-500/5 text-green-600'
                }`}
              >
                {statusLabel}
              </span>
            )}
          </div>

          <h4 className="mb-1 font-black text-ink transition-colors hover:text-primary">{order.serviceTitle}</h4>

          <div className="flex items-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(order.bookingDate)} {order.bookingTime}
            </span>
            {order.duration > 0 && <span>{order.duration}小时</span>}
            {order.completedTime && <span className="text-green-600">完成于 {formatDate(order.completedTime)}</span>}
          </div>

          <div className="mt-2 text-sm font-bold text-primary">¥{order.price}</div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {isBuyer && isInProgress && onComplete && (
            <button
              onClick={(event) => {
                event.stopPropagation();
                onComplete(order);
              }}
              className="flex items-center gap-1 rounded-xl bg-green-500 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-green-600"
            >
              <CheckCircle2 className="h-3 w-3" />
              完成服务
            </button>
          )}

          {isBuyer && isCompleted && onReview && (
            <button
              onClick={(event) => {
                event.stopPropagation();
                onReview(order);
              }}
              className="flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-primary-hover"
            >
              <Star className="h-3 w-3" />
              评价
            </button>
          )}

          {onDelete && (
            <button
              onClick={(event) => {
                event.stopPropagation();
                onDelete(order.id);
              }}
              className="p-2 text-muted transition-colors hover:text-red-500"
              aria-label="删除订单"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

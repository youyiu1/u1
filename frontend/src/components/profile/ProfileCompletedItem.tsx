/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Star, Trash2, CheckCircle2 } from 'lucide-react';
import { Order } from '../../types';

interface ProfileCompletedItemProps {
  order: Order;
  currentUserId: string;
  onDelete?: (id: string) => void;
  onComplete?: (order: Order) => void;
  onReview?: (order: Order) => void;
}

export const ProfileCompletedItem: React.FC<ProfileCompletedItemProps> = ({ order, currentUserId, onDelete, onComplete, onReview }) => {
  const navigate = useNavigate();
  const isBuyer = order.buyerId === currentUserId;
  const isSeller = order.sellerId === currentUserId;
  const isCompleted = order.status === 'completed';
  const isInProgress = order.status === 'in_progress';

  const handleClick = () => {
    if (order.serviceId) {
      navigate(`/service/${order.serviceId}`);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white border border-hairline rounded-3xl p-6 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 cursor-pointer" onClick={handleClick}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
              isBuyer ? 'bg-primary/5 text-primary' : 'bg-green-500/5 text-green-600'
            }`}>
              {isBuyer ? '我是买家' : '我是卖家'}
            </span>
            {isInProgress && (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-yellow-100 text-yellow-600 rounded">
                进行中
              </span>
            )}
            {isCompleted && (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-green-500/5 text-green-600 rounded">
                已完成
              </span>
            )}
          </div>
          <h4 className="font-black text-ink mb-1 hover:text-primary transition-colors">{order.serviceTitle}</h4>
          <div className="flex items-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(order.bookingDate)} {order.bookingTime}
            </span>
            {order.duration && (
              <span>{order.duration}小时</span>
            )}
            {order.completedTime && (
              <span className="text-green-600">
                完成于 {formatDate(order.completedTime)}
              </span>
            )}
          </div>
          <div className="mt-2 text-sm font-bold text-primary">
            ¥{order.price}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {isBuyer && isInProgress && onComplete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onComplete(order);
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-xl hover:bg-green-600 transition-colors"
            >
              <CheckCircle2 className="w-3 h-3" />
              完成服务
            </button>
          )}
          {isBuyer && isCompleted && onReview && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReview(order);
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-colors"
            >
              <Star className="w-3 h-3" />
              评价
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(order.id);
              }}
              className="p-2 text-muted hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Clock3, MapPin, Star } from 'lucide-react';
import { MarketStatusBadge } from '../common/MarketStatusBadge';
import { Item, Service } from '../../types';
import { formatCurrency } from '../../utils/display';
import { getItemPrimaryImage, getServicePrimaryImage } from '../../utils/images';
import { getPendingReviewState, getRejectedReviewState } from '../../utils/reviewState';

interface ProfileMarketItemProps {
  item: Item | Service;
}

const isItem = (item: Item | Service): item is Item => 'itemCondition' in item;

export const ProfileMarketItem: React.FC<ProfileMarketItemProps> = ({ item }) => {
  const navigate = useNavigate();
  const itemType = isItem(item);
  const reviewState = getReviewState(item.status, item.rejectReason);
  const primaryImage = itemType ? getItemPrimaryImage(item) : getServicePrimaryImage(item);
  const locationText = 'location' in item ? item.location || '未知位置' : item.distance;

  return (
    <div
      onClick={() => navigate(itemType ? `/item/${item.id}` : `/service/${item.id}`, { state: { from: '/profile' } })}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-hairline bg-white transition-all hover:border-primary/20 hover:shadow-lg"
    >
      <div className="relative aspect-square bg-surface-soft">
        {primaryImage ? (
          <img
            src={primaryImage}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            alt={item.title}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-stone-400">暂无图片</div>
        )}
        {itemType ? (
          <>
            <div className="absolute left-2 top-2 rounded bg-red-400/90 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-md">
              {item.itemCondition || item.condition || '全新'}
            </div>
            <MarketStatusBadge status={item.status} rejectReason={item.rejectReason} className="absolute right-2 top-2" />
          </>
        ) : (
          <div className="absolute left-2 top-2 rounded bg-primary/90 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-md">
            {'category' in item ? item.category : '服务'}
          </div>
        )}
      </div>

      <div className="space-y-2 p-2">
        <div>
          <h4 className="mb-0.5 line-clamp-1 text-xs font-bold text-ink transition-colors group-hover:text-primary">{item.title}</h4>
          <div className="mb-1 flex items-center gap-1">
            <MapPin className="h-2.5 w-2.5 text-muted" />
            <span className="truncate text-[9px] text-muted">{locationText}</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-ink">{formatCurrency(item.price)}</span>
              {itemType && item.originalPrice ? (
                <span className="ml-1 text-[9px] text-muted line-through">{formatCurrency(item.originalPrice)}</span>
              ) : null}
            </div>
            {!itemType && 'rating' in item && (
              <div className="flex items-center gap-0.5">
                <Star className="h-2.5 w-2.5 fill-current text-yellow-400" />
                <span className="text-[9px] font-bold text-ink">{item.rating}</span>
              </div>
            )}
          </div>
        </div>

        {reviewState && (
          <div className={`flex items-start gap-2 rounded-xl px-2 py-2 text-[10px] font-bold ${reviewState.className}`}>
            {reviewState.status === 'pending' ? (
              <Clock3 className="mt-0.5 h-3 w-3 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
            )}
            <div>
              <p>{reviewState.label}</p>
              {reviewState.reason ? <p className="mt-1 font-medium opacity-80">原因：{reviewState.reason}</p> : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function getReviewState(status?: string, rejectReason?: string) {
  return (
    getPendingReviewState(status) ||
    getRejectedReviewState(status, rejectReason, {
      label: '未通过审核',
      fallbackReason: '请修改后重新提交',
    })
  );
}

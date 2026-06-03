import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Clock3, MapPin, Star } from 'lucide-react';
import { Item, Service } from '../../types';
import { getItemPrimaryImage, getServicePrimaryImage } from '../../utils/images';

interface ProfileMarketItemProps {
  item: Item | Service;
}

const isItem = (item: Item | Service): boolean => 'itemCondition' in item;

export const ProfileMarketItem: React.FC<ProfileMarketItemProps> = ({ item }) => {
  const navigate = useNavigate();
  const itemType = isItem(item);
  const reviewState = getReviewState(item.status, item.rejectReason);
  const primaryImage = itemType ? getItemPrimaryImage(item) : getServicePrimaryImage(item);

  return (
    <div
      onClick={() => navigate(itemType ? `/item/${item.id}` : `/service/${item.id}`, { state: { from: '/profile' } })}
      className="bg-white border border-hairline rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer group"
    >
      <div className="relative aspect-square bg-surface-soft">
        {primaryImage ? (
          <img src={primaryImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={item.title} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">暂无图片</div>
        )}
        {itemType ? (
          <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-red-400/90 backdrop-blur-md text-white text-[9px] font-bold rounded">
            {('itemCondition' in item) ? item.itemCondition : '全新'}
          </div>
        ) : (
          <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-primary/90 backdrop-blur-md text-white text-[9px] font-bold rounded">
            {('category' in item) ? item.category : '服务'}
          </div>
        )}
      </div>
      <div className="p-2 space-y-2">
        <div>
          <h4 className="text-xs font-bold text-ink mb-0.5 line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h4>
          <div className="flex items-center gap-1 mb-1">
            <MapPin className="w-2.5 h-2.5 text-muted" />
            <span className="text-[9px] text-muted truncate">{'location' in item ? (item.location || '未知位置') : ('distance' in item ? item.distance : '')}</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-ink">¥{item.price}</span>
              {itemType && 'originalPrice' in item && item.originalPrice && (
                <span className="text-[9px] text-muted line-through ml-1">¥{item.originalPrice}</span>
              )}
            </div>
            {!itemType && 'rating' in item && (
              <div className="flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 text-yellow-400 fill-current" />
                <span className="text-[9px] font-bold text-ink">{item.rating}</span>
              </div>
            )}
          </div>
        </div>

        {reviewState && (
          <div className={`flex items-start gap-2 rounded-xl px-2 py-2 text-[10px] font-bold ${reviewState.className}`}>
            {reviewState.status === 'pending' ? <Clock3 className="w-3 h-3 mt-0.5 shrink-0" /> : <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />}
            <div>
              <p>{reviewState.label}</p>
              {reviewState.reason && <p className="mt-1 font-medium opacity-80">原因：{reviewState.reason}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function getReviewState(status?: string, rejectReason?: string) {
  if (status === 'pending') {
    return {
      status,
      label: '待平台审核',
      reason: '',
      className: 'bg-amber-50 text-amber-700 border border-amber-100',
    };
  }
  if (status === 'removed' || status === 'rejected') {
    return {
      status,
      label: '未通过审核',
      reason: rejectReason || '请修改后重新提交',
      className: 'bg-rose-50 text-rose-700 border border-rose-100',
    };
  }
  return null;
}

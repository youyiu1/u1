import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';
import { Item, Service } from '../../types';

interface ProfileMarketItemProps {
  item: Item | Service;
}

const isItem = (item: Item | Service): boolean => {
  return 'itemCondition' in item;
};

export const ProfileMarketItem: React.FC<ProfileMarketItemProps> = ({ item }) => {
  const navigate = useNavigate();
  const itemType = isItem(item);

  return (
    <div
      key={item.id}
      onClick={() => navigate(itemType ? `/item/${item.id}` : `/service/${item.id}`)}
      className="bg-white border border-hairline rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer group"
    >
      <div className="relative aspect-square bg-surface-soft">
        {item.image && item.image.trim() ? (
          <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={item.title} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">暂无图片</div>
        )}
        {/* 标签 */}
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
      <div className="p-2">
        <h4 className="text-xs font-bold text-ink mb-0.5 line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h4>
        {/* 位置 */}
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
    </div>
  );
};

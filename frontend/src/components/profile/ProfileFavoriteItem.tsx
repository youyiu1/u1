/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Trash2 } from 'lucide-react';
import { Post, Item, Service } from '../../types';
import { favoriteApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { getStoredUser } from '../../utils/authStorage';
import { getPrimaryImage, parseImages } from '../../utils/images';

interface ProfileFavoriteItemProps {
  favorite: {
    id: string;
    targetType: string;
    targetId: string;
    createTime?: string;
  };
  data: Post | Item | Service;
  onUnfavorite: (targetId: string) => void;
}

export const ProfileFavoriteItem: React.FC<ProfileFavoriteItemProps> = ({ favorite, data, onUnfavorite }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isRemoving, setIsRemoving] = React.useState(false);

  const isNews = favorite.targetType === 'news';
  const isService = favorite.targetType === 'service';
  const isMarket = favorite.targetType === 'market';

  const handleUnfavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRemoving) return;

    const currentUser = getStoredUser();
    if (!currentUser?.id) {
      showToast('请先登录', 'warning');
      return;
    }

    setIsRemoving(true);
    try {
      await favoriteApi.remove(currentUser.id, favorite.targetType, favorite.targetId);
      showToast('已取消收藏', 'success');
      onUnfavorite(favorite.targetId);
    } catch {
      showToast('取消收藏失败', 'error');
      setIsRemoving(false);
    }
  };

  const handleClick = () => {
    if (isNews) {
      navigate(`/news/${favorite.targetId}`, { state: { from: '/profile' } });
    } else if (isService) {
      navigate(`/service/${favorite.targetId}`, { state: { from: '/profile' } });
    } else {
      navigate(`/item/${favorite.targetId}`, { state: { from: '/profile' } });
    }
  };

  if (isNews) {
    const post = data as Post;
    const images = parseImages(post.images);
    return (
      <div
        onClick={handleClick}
        className="bg-white border border-hairline rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer group"
      >
        {images.length > 0 && (
          <div className="aspect-video bg-surface-soft">
            <img src={images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="" />
          </div>
        )}
        <div className="p-3">
          <p className="text-xs font-bold text-ink line-clamp-2 group-hover:text-primary transition-colors">{post.content}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-muted truncate">{post.location}</span>
            <button
              onClick={handleUnfavorite}
              disabled={isRemoving}
              className="p-1.5 text-muted hover:text-red-500 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // market or service item
  const item = data as Item | Service;
  const isItemType = 'itemCondition' in item;
  const primaryImage = getPrimaryImage((item as Item).images, item.image);

  return (
    <div
      onClick={handleClick}
      className="bg-white border border-hairline rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer group"
    >
      <div className="relative aspect-square bg-surface-soft">
        {primaryImage ? (
          <img src={primaryImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">暂无图片</div>
        )}
        <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-primary/90 backdrop-blur-md text-white text-[9px] font-bold rounded">
          {isNews ? '动态' : isService ? '服务' : '闲置'}
        </div>
      </div>
      <div className="p-2">
        <h4 className="text-xs font-bold text-ink mb-0.5 line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h4>
        <div className="flex items-center gap-1 mb-1">
          <MapPin className="w-2.5 h-2.5 text-muted" />
          <span className="text-[9px] text-muted truncate">{'location' in item ? (item.location || '未知位置') : ('distance' in item ? item.distance : '')}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-ink">¥{item.price}</span>
            {isItemType && 'originalPrice' in item && item.originalPrice && (
              <span className="text-[9px] text-muted line-through ml-1">¥{item.originalPrice}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {!isItemType && 'rating' in item && (
              <div className="flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 text-yellow-400 fill-current" />
                <span className="text-[9px] font-bold text-ink">{item.rating}</span>
              </div>
            )}
            <button
              onClick={handleUnfavorite}
              disabled={isRemoving}
              className="p-1 text-muted hover:text-red-500 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

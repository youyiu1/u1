/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Trash2 } from 'lucide-react';
import { MarketStatusBadge } from '../common/MarketStatusBadge';
import { favoriteApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Item, Post, Service } from '../../types';
import { getStoredUser } from '../../utils/authStorage';
import { formatCurrency } from '../../utils/display';
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

const TARGET_LABELS: Record<string, string> = {
  news: '动态',
  service: '服务',
  market: '闲置',
};

export const ProfileFavoriteItem: React.FC<ProfileFavoriteItemProps> = ({ favorite, data, onUnfavorite }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isRemoving, setIsRemoving] = React.useState(false);
  const isNews = favorite.targetType === 'news';
  const isService = favorite.targetType === 'service';

  const handleUnfavorite = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (isRemoving) {
      return;
    }

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
    const from = { state: { from: '/profile' } };
    if (isNews) {
      navigate(`/news/${favorite.targetId}`, from);
      return;
    }
    if (isService) {
      navigate(`/service/${favorite.targetId}`, from);
      return;
    }
    navigate(`/item/${favorite.targetId}`, from);
  };

  if (isNews) {
    const post = data as Post;
    const images = parseImages(post.images);

    return (
      <div
        onClick={handleClick}
        className="theme-card group cursor-pointer overflow-hidden rounded-2xl transition-all hover:border-primary/20 hover:shadow-lg"
      >
        {images.length > 0 && (
          <div className="aspect-video bg-surface-soft">
            <img src={images[0]} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" alt="" />
          </div>
        )}

        <div className="p-3">
          <p className="line-clamp-2 text-xs font-bold text-ink transition-colors group-hover:text-primary">{post.content}</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="truncate text-[10px] text-muted">{post.location || '未设置位置'}</span>
            <button
              onClick={handleUnfavorite}
              disabled={isRemoving}
              className="p-1.5 text-muted transition-colors hover:text-red-500 disabled:opacity-50"
              aria-label="取消收藏"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const item = data as Item | Service;
  const isItemType = 'itemCondition' in item;
  const primaryImage = getPrimaryImage((item as Item).images, item.image);
  const locationText = 'location' in item ? item.location || '未知位置' : item.distance;
  const typeLabel = TARGET_LABELS[favorite.targetType] || '内容';

  return (
    <div
      onClick={handleClick}
      className="theme-card group cursor-pointer overflow-hidden rounded-2xl transition-all hover:border-primary/20 hover:shadow-lg"
    >
      <div className="relative aspect-square bg-surface-soft">
        {primaryImage ? (
          <img src={primaryImage} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" alt="" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-stone-400">暂无图片</div>
        )}
        <div className="absolute left-2 top-2 rounded bg-primary/90 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-md">
          {typeLabel}
        </div>
        {isItemType ? <MarketStatusBadge status={item.status} rejectReason={item.rejectReason} className="absolute right-2 top-2" /> : null}
      </div>

      <div className="p-2">
        <h4 className="mb-0.5 line-clamp-1 text-xs font-bold text-ink transition-colors group-hover:text-primary">{item.title}</h4>
        <div className="mb-1 flex items-center gap-1">
          <MapPin className="h-2.5 w-2.5 text-muted" />
          <span className="truncate text-[9px] text-muted">{locationText}</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-ink">{formatCurrency(item.price)}</span>
            {isItemType && item.originalPrice ? (
              <span className="ml-1 text-[9px] text-muted line-through">{formatCurrency(item.originalPrice)}</span>
            ) : null}
          </div>

          <div className="flex items-center gap-1.5">
            {!isItemType && 'rating' in item && (
              <div className="flex items-center gap-0.5">
                <Star className="h-2.5 w-2.5 fill-current text-yellow-400" />
                <span className="text-[9px] font-bold text-ink">{item.rating}</span>
              </div>
            )}
            <button
              onClick={handleUnfavorite}
              disabled={isRemoving}
              className="p-1 text-muted transition-colors hover:text-red-500 disabled:opacity-50"
              aria-label="取消收藏"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

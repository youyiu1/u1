/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { useAuthCheck } from '../../context/useAuthCheck';
import { useToast } from '../../context/ToastContext';
import { favoriteApi } from '../../services/api';

interface FavoriteButtonProps {
  targetId: string;
  targetType: 'news' | 'market' | 'service';
  initialFavorited?: boolean;
  size?: 'sm' | 'md';
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  targetId,
  targetType,
  initialFavorited = false,
  size = 'md'
}) => {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [burst, setBurst] = useState(false);
  const { requireAuth } = useAuthCheck();
  const { showToast } = useToast();

  // 加载时从 API 获取真实收藏状态
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('neighborhood_user') || '{}');
    if (!currentUser.id || !targetId) return;
    favoriteApi.check(currentUser.id, targetType, Number(targetId))
      .then(res => setFavorited(res))
      .catch(() => {});
  }, [targetId, targetType]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    requireAuth(async () => {
      const currentUser = JSON.parse(localStorage.getItem('neighborhood_user') || '{}');
      if (!currentUser.id) return;
      const next = !favorited;
      try {
        if (next) {
          await favoriteApi.add(currentUser.id, targetType, Number(targetId));
        } else {
          await favoriteApi.remove(currentUser.id, targetType, Number(targetId));
        }
        setFavorited(next);
        showToast(next ? '已收藏' : '已取消收藏', 'success');
        if (next) {
          setBurst(true);
          setTimeout(() => setBurst(false), 900);
        }
      } catch {
        showToast('操作失败', 'error');
      }
    });
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4'
  };

  return (
    <button
      onClick={toggleFavorite}
      className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-md rounded-full hover:bg-white transition-all shadow-sm"
    >
      <div className="relative">
        <motion.div
          animate={favorited ? {
            scale: [1, 1.3, 1],
          } : {}}
          transition={{ duration: 0.3 }}
        >
          <Heart
            className={`${iconSizes[size]} transition-all ${
              favorited
                ? 'fill-red-500 text-red-500'
                : 'text-secondary hover:text-red-500'
            }`}
          />
        </motion.div>
        {burst && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 1 }}
                animate={{
                  scale: [0, 1.5],
                  opacity: [1, 0],
                  x: (Math.random() - 0.5) * 60,
                  y: (Math.random() - 0.5) * 60,
                }}
                transition={{ duration: 0.6 }}
                className="absolute left-1/2 top-1/2 w-1 h-1 bg-red-500 rounded-full"
              />
            ))}
          </div>
        )}
      </div>
    </button>
  );
};
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useAuthCheck } from '../../context/useAuthCheck';
import { useToast } from '../../context/ToastContext';
import { favoriteApi, getToken } from '../../services/api';

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
  size = 'md',
}) => {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [burst, setBurst] = useState(false);
  const { requireAuth } = useAuthCheck();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!isAuthenticated || !getToken() || !user?.id || !targetId) {
      setFavorited(initialFavorited);
      return;
    }
    favoriteApi
      .check(user.id, targetType, Number(targetId))
      .then((result) => setFavorited(result))
      .catch(() => {
        // ignore
      });
  }, [initialFavorited, isAuthenticated, targetId, targetType, user?.id]);

  const toggleFavorite = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    requireAuth(async () => {
      if (!user?.id) {
        return;
      }

      const next = !favorited;
      try {
        if (next) {
          await favoriteApi.add(user.id, targetType, Number(targetId));
        } else {
          await favoriteApi.remove(user.id, targetType, Number(targetId));
        }
        setFavorited(next);
        showToast(next ? '收藏成功' : '已取消收藏', 'success');
        if (next) {
          setBurst(true);
          setTimeout(() => setBurst(false), 900);
        }
      } catch {
        showToast('操作失败，请稍后重试', 'error');
      }
    });
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-4 w-4',
  };

  return (
    <button onClick={toggleFavorite} className="absolute right-3 top-3 rounded-full bg-white/80 p-2 shadow-sm backdrop-blur-md transition-all hover:bg-white">
      <div className="relative">
        <motion.div animate={favorited ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
          <Heart className={`${iconSizes[size]} transition-all ${favorited ? 'fill-red-500 text-red-500' : 'text-secondary hover:text-red-500'}`} />
        </motion.div>
        {burst ? (
          <div className="pointer-events-none absolute inset-0">
            {Array.from({ length: 6 }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0, opacity: 1 }}
                animate={{
                  scale: [0, 1.5],
                  opacity: [1, 0],
                  x: (Math.random() - 0.5) * 60,
                  y: (Math.random() - 0.5) * 60,
                }}
                transition={{ duration: 0.6 }}
                className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-red-500"
              />
            ))}
          </div>
        ) : null}
      </div>
    </button>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { useAuthCheck } from '../../context/useAuthCheck';

interface FavoriteButtonProps {
  initialFavorited?: boolean;
  size?: 'sm' | 'md';
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  initialFavorited = false,
  size = 'md'
}) => {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [burst, setBurst] = useState(false);
  const { requireAuth } = useAuthCheck();

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    requireAuth(() => {
      const next = !favorited;
      setFavorited(next);
      if (next) {
        setBurst(true);
        setTimeout(() => setBurst(false), 900);
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
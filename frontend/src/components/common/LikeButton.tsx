/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { useAuthCheck } from '../../context/useAuthCheck';

interface LikeButtonProps {
  postId: string;
  initialLikes?: number;
  isLikedInitial?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  lg?: boolean;
}

const LIKE_KEY = 'like_states_v1';

const ParticleBurst = ({ active }: { active: boolean }) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
          animate={active ? {
            scale: [0, 1.5, 0.8, 0],
            x: [(Math.random() - 0.5) * 120, (Math.random() - 0.5) * 180],
            y: [(Math.random() - 0.5) * 120, (Math.random() - 0.5) * 180],
            opacity: [0, 1, 1, 0]
          } : {}}
          transition={{ duration: 0.9, ease: [0.2, 1, 0.3, 1], delay: Math.random() * 0.1 }}
          className="absolute left-1/2 top-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_12px_rgba(255,56,92,0.6)]"
        />
      ))}
    </div>
  );
};

export const LikeButton: React.FC<LikeButtonProps> = ({
  postId,
  initialLikes = 0,
  isLikedInitial = false,
  size = 'md',
  showCount = true,
  lg = false
}) => {
  const [liked, setLiked] = useState<boolean>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LIKE_KEY) || '{}');
      return saved[postId] ?? isLikedInitial;
    } catch { return isLikedInitial; }
  });
  const [likes, setLikes] = useState(initialLikes);
  const [burst, setBurst] = useState(false);
  const { requireAuth } = useAuthCheck();

  const effectiveSize = lg ? 'lg' : size;

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    requireAuth(() => {
      const nextLiked = !liked;
      setLiked(nextLiked);
      setLikes(prev => Math.max(0, nextLiked ? prev + 1 : prev - 1));
      const saved = JSON.parse(localStorage.getItem(LIKE_KEY) || '{}');
      saved[postId] = nextLiked;
      localStorage.setItem(LIKE_KEY, JSON.stringify(saved));

      if (nextLiked) {
        setBurst(true);
        setTimeout(() => setBurst(false), 900);
      }
    });
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7'
  };

  const textSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-[11px]'
  };

  return (
    <button
      onClick={toggleLike}
      className="group/heart flex items-center gap-3 transition-all active:scale-90"
    >
      <div className="relative">
        <motion.div
          animate={liked ? {
            scale: [1, 1.4, 1],
            rotate: [0, 15, -15, 0]
          } : {}}
          transition={{ duration: 0.5 }}
        >
          <Heart
            className={`${iconSizes[effectiveSize]} transition-all duration-500 ${
              liked
                ? 'fill-primary text-primary'
                : 'text-muted group-hover/heart:text-primary'
            }`}
          />
        </motion.div>
        <ParticleBurst active={burst} />
      </div>
      {showCount && (
        <span className={`${textSizes[effectiveSize]} font-black uppercase tracking-[0.2em] leading-none ${
          liked ? 'text-primary' : 'text-muted group-hover/heart:text-ink'
        }`}>
          {likes} <span className="opacity-40">LIKES</span>
        </span>
      )}
    </button>
  );
};
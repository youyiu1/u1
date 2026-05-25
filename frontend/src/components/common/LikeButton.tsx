/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { useAuthCheck } from '../../context/useAuthCheck';
import { getLiked, setLiked } from '../../utils/interactionStorage';

interface LikeButtonProps {
  postId: string;
  initialLikes?: number;
  isLikedInitial?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  lg?: boolean;
}

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
  // 从localStorage读取：liked状态 + 显示数量
  const { liked, displayCount } = getLiked(postId, initialLikes);
  const [isLiked, setIsLiked] = useState(liked);
  const [showCountVal, setShowCountVal] = useState(displayCount);
  const [burst, setBurst] = useState(false);
  const { requireAuth } = useAuthCheck();

  const effectiveSize = lg ? 'lg' : size;

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    requireAuth(() => {
      const nextLiked = !isLiked;
      setIsLiked(nextLiked);
      setShowCountVal(prev => nextLiked ? prev + 1 : Math.max(0, prev - 1));
      setLiked(postId, nextLiked, initialLikes);

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
          animate={isLiked ? {
            scale: [1, 1.4, 1],
            rotate: [0, 15, -15, 0]
          } : {}}
          transition={{ duration: 0.5 }}
        >
          <Heart
            className={`${iconSizes[effectiveSize]} transition-all duration-500 ${
              isLiked
                ? 'fill-primary text-primary'
                : 'text-muted group-hover/heart:text-primary'
            }`}
          />
        </motion.div>
        <ParticleBurst active={burst} />
      </div>
      {showCount && (
        <span className={`${textSizes[effectiveSize]} font-black uppercase tracking-[0.2em] leading-none ${
          isLiked ? 'text-primary' : 'text-muted group-hover/heart:text-ink'
        }`}>
          {showCountVal} <span className="opacity-40">LIKES</span>
        </span>
      )}
    </button>
  );
};
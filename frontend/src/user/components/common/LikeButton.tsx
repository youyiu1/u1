/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { useAuthCheck } from '../../context/useAuthCheck';
import { getLiked, setLiked } from '../../utils/interactionStorage';

const BURST_DURATION_MS = 900;

interface LikeButtonProps {
  postId: string;
  initialLikes?: number;
  isLikedInitial?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  lg?: boolean;
}

const ICON_SIZES = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
} as const;

const TEXT_SIZES = {
  sm: 'text-[9px]',
  md: 'text-[10px]',
  lg: 'text-[11px]',
} as const;

const ParticleBurst = ({ active }: { active: boolean }) => (
  <div className="pointer-events-none absolute inset-0">
    {Array.from({ length: 12 }).map((_, index) => (
      <motion.div
        key={index}
        initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
        animate={
          active
            ? {
                scale: [0, 1.5, 0.8, 0],
                x: [(Math.random() - 0.5) * 120, (Math.random() - 0.5) * 180],
                y: [(Math.random() - 0.5) * 120, (Math.random() - 0.5) * 180],
                opacity: [0, 1, 1, 0],
              }
            : {}
        }
        transition={{ duration: 0.9, ease: [0.2, 1, 0.3, 1], delay: Math.random() * 0.1 }}
        className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_12px_rgba(255,56,92,0.6)]"
      />
    ))}
  </div>
);

export const LikeButton: React.FC<LikeButtonProps> = ({
  postId,
  initialLikes = 0,
  size = 'md',
  showCount = true,
  lg = false,
}) => {
  const { liked, displayCount } = getLiked(postId, initialLikes);
  const [isLiked, setIsLiked] = useState(liked);
  const [showCountVal, setShowCountVal] = useState(displayCount);
  const [burst, setBurst] = useState(false);
  const { requireAuth } = useAuthCheck();
  const effectiveSize = lg ? 'lg' : size;

  const stopEvent = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const getNextCount = (currentCount: number, nextLiked: boolean) =>
    nextLiked ? currentCount + 1 : Math.max(0, currentCount - 1);

  const triggerBurst = () => {
    setBurst(true);
    setTimeout(() => setBurst(false), BURST_DURATION_MS);
  };

  const toggleLike = (event: React.MouseEvent) => {
    stopEvent(event);

    requireAuth(() => {
      const nextLiked = !isLiked;
      setIsLiked(nextLiked);
      setShowCountVal((prev) => getNextCount(prev, nextLiked));
      setLiked(postId, nextLiked, initialLikes);

      if (nextLiked) {
        triggerBurst();
      }
    });
  };

  return (
    <button onClick={toggleLike} className="group/heart flex items-center gap-3 transition-all active:scale-90">
      <div className="relative">
        <motion.div
          animate={
            isLiked
              ? {
                  scale: [1, 1.4, 1],
                  rotate: [0, 15, -15, 0],
                }
              : {}
          }
          transition={{ duration: 0.5 }}
        >
          <Heart
            className={`${ICON_SIZES[effectiveSize]} transition-all duration-500 ${
              isLiked ? 'fill-primary text-primary' : 'text-muted group-hover/heart:text-primary'
            }`}
          />
        </motion.div>
        <ParticleBurst active={burst} />
      </div>

      {showCount && (
        <span
          className={`${TEXT_SIZES[effectiveSize]} font-black uppercase tracking-[0.2em] leading-none ${
            isLiked ? 'text-primary' : 'text-muted group-hover/heart:text-ink'
          }`}
        >
          {showCountVal} <span className="opacity-40">LIKES</span>
        </span>
      )}
    </button>
  );
};

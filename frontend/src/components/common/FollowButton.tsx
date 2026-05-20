import React, { useState } from 'react';
import { UserPlus, UserMinus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthCheck } from '../../context/useAuthCheck';

interface FollowButtonProps {
  isFollowingInitial?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  className?: string;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  isFollowingInitial = false,
  onFollowChange,
  className = '',
  variant = 'primary',
  size = 'md',
}) => {
  const [isFollowing, setIsFollowing] = useState(isFollowingInitial);
  const { requireAuth } = useAuthCheck();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    requireAuth(() => {
      const newState = !isFollowing;
      setIsFollowing(newState);
      onFollowChange?.(newState);
    });
  };

  const baseStyles = "relative flex items-center justify-center font-black transition-all overflow-hidden rounded-2xl group active:scale-95";

  const sizeStyles = {
    sm: "px-4 py-1.5 text-[10px] gap-1.5 tracking-wider uppercase",
    md: "px-6 py-2.5 text-[11px] gap-2 tracking-widest uppercase",
    lg: "px-10 py-3.5 text-xs gap-2.5 tracking-[0.2em] uppercase",
  };

  const getVariantStyles = () => {
    if (isFollowing) {
      return "bg-surface-soft text-muted border border-hairline hover:bg-hairline hover:text-ink";
    }

    switch (variant) {
      case 'outline':
        return "bg-transparent border-2 border-primary text-primary hover:bg-primary/5";
      case 'ghost':
        return "bg-transparent text-primary hover:bg-primary/10 hover:shadow-inner";
      default:
        return "bg-primary text-white shadow-xl shadow-primary/20 hover:bg-primary-hover hover:shadow-primary/30";
    }
  };

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleToggle}
      className={`${baseStyles} ${sizeStyles[size]} ${getVariantStyles()} ${className}`}
    >
      <AnimatePresence mode="wait">
        {isFollowing ? (
          <motion.div
            key="following"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            className="flex items-center gap-2"
          >
            <Check className="w-3.5 h-3.5" />
            <span>已关注</span>
          </motion.div>
        ) : (
          <motion.div
            key="follow"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            className="flex items-center gap-2"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>关注</span>
          </motion.div>
        )}
      </AnimatePresence>

      {!isFollowing && variant === 'primary' && (
        <div className="absolute inset-x-0 top-0 h-1/2 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </motion.button>
  );
};
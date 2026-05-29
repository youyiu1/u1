import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { Comment } from '../../types';
import { newsApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatDateTime } from '../../utils/dateTime';
import { getFallbackAvatar } from '../../utils/avatar';

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onLikeChange?: (commentId: string, isLiked: boolean, likes: number) => void;
  onAfterLike?: () => void | Promise<void>;
  onReply?: (comment: Comment) => void;
  compact?: boolean;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUserId,
  onLikeChange,
  onAfterLike,
  onReply,
  compact = false,
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [liking, setLiking] = useState(false);
  const [isLiked, setIsLiked] = useState(comment.isLiked ?? false);
  const [likes, setLikes] = useState(comment.likes ?? 0);

  const userName = comment.userName || comment.user || '邻居用户';
  const avatar = comment.userAvatar || comment.avatar || getFallbackAvatar(userName);
  const content = comment.content || comment.text || '';
  const commentTime = formatDateTime(comment.createTime || comment.time, '刚刚');

  useEffect(() => {
    setIsLiked(comment.isLiked ?? false);
    setLikes(comment.likes ?? 0);
  }, [comment.isLiked, comment.likes]);

  const handleLike = async () => {
    if (liking) return;

    if (!currentUserId) {
      showToast('请先登录', 'warning');
      navigate('/login');
      return;
    }

    setLiking(true);
    try {
      const nextLiked = await newsApi.likeComment(comment.id, currentUserId);
      const nextLikes = nextLiked ? likes + 1 : Math.max(0, likes - 1);
      setIsLiked(nextLiked);
      setLikes(nextLikes);
      onLikeChange?.(comment.id, nextLiked, nextLikes);
      await onAfterLike?.();
      showToast(nextLiked ? '点赞成功' : '已取消点赞', 'success');
    } catch {
      showToast('点赞失败', 'error');
    } finally {
      setLiking(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={() => onReply?.(comment)}
      className={`group transition-all text-left border border-transparent hover:border-hairline cursor-pointer ${
        compact
          ? 'flex gap-2.5 p-2.5 rounded-xl hover:bg-surface-soft/70'
          : 'flex gap-5 px-6 pt-5 pb-2 rounded-[32px] hover:bg-surface-soft'
      }`}
    >
      <div
        className="cursor-pointer shrink-0 relative overflow-hidden rounded-2xl"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/profile/${userName}`);
        }}
      >
        <img
          src={avatar}
          className={`${compact ? 'w-7 h-7 rounded-md' : 'w-12 h-12'} border border-hairline object-cover transition-transform group-hover:scale-110`}
          alt={userName}
        />
      </div>
      <div className="flex-1">
        <div className={`flex items-start justify-between ${compact ? 'mb-0.5' : 'mb-2'}`}>
          <div className="flex items-center gap-2">
            <span
              className={`${compact ? 'text-[11px]' : 'text-sm'} font-black text-ink cursor-pointer hover:text-primary transition-colors`}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/profile/${userName}`);
              }}
            >
              {userName}
            </span>
            {!compact && (
              <span className="px-1.5 py-0.5 bg-hairline/30 rounded text-[8px] font-black text-muted uppercase">Level 3</span>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`${compact ? 'text-[8px]' : 'text-[10px]'} text-muted font-bold`}>{commentTime}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
              disabled={liking}
              className={`flex items-center gap-1 ${compact ? 'text-[9px]' : 'text-[10px]'} font-black uppercase tracking-widest transition-colors disabled:opacity-50 ${isLiked ? 'text-red-500' : 'text-muted hover:text-red-500'}`}
            >
              <Heart className={`${compact ? 'w-2.5 h-2.5' : 'w-3 h-3'} ${isLiked ? 'fill-current' : ''}`} />
              {likes}
            </button>
          </div>
        </div>
        <p className={`${compact ? 'text-[11px] leading-snug mb-1' : 'text-sm leading-relaxed mb-1.5'} text-secondary font-medium`}>
          {content}
        </p>
      </div>
    </motion.div>
  );
};

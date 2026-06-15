/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { Comment } from '../../types';
import { newsApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatDateTime } from '../../utils/dateTime';
import { getFallbackAvatar } from '../../utils/avatar';
import { buildProfilePath, buildProfileRouteState } from '../../utils/profileRoute';

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onLikeChange?: (commentId: string, isLiked: boolean, likes: number) => void;
  onAfterLike?: () => void | Promise<void>;
  onReply?: (comment: Comment) => void;
  compact?: boolean;
  children?: React.ReactNode;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUserId,
  onLikeChange,
  onAfterLike,
  onReply,
  compact = false,
  children,
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
    if (liking) {
      return;
    }

    if (!currentUserId) {
      showToast('请先登录后继续操作', 'warning');
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
      showToast('点赞失败，请稍后重试', 'error');
    } finally {
      setLiking(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={() => onReply?.(comment)}
      className={`group cursor-pointer border border-transparent text-left transition-all hover:border-hairline ${
        compact
          ? 'flex gap-2.5 rounded-2xl bg-surface-soft/70 px-3 py-2.5 hover:border-primary/10 hover:bg-white'
          : 'flex gap-5 rounded-[32px] px-6 pb-2 pt-5 hover:bg-surface-soft'
      }`}
    >
      <div
        className="relative shrink-0 cursor-pointer overflow-hidden rounded-2xl"
        onClick={(event) => {
          event.stopPropagation();
          navigate(buildProfilePath(undefined, userName), {
            state: buildProfileRouteState({
              name: userName,
              avatar,
            }),
          });
        }}
      >
        <img
          src={avatar}
          className={`${compact ? 'h-7 w-7 rounded-lg' : 'h-12 w-12'} border border-hairline object-cover transition-transform group-hover:scale-110`}
          alt={userName}
        />
      </div>
      <div className="flex-1">
        <div className={`flex items-start justify-between ${compact ? 'mb-0.5' : 'mb-2'}`}>
          <div className="flex items-center gap-2">
            <span
              className={`${compact ? 'text-[11px]' : 'text-sm'} cursor-pointer font-black text-ink transition-colors hover:text-primary`}
              onClick={(event) => {
                event.stopPropagation();
                navigate(buildProfilePath(undefined, userName), {
                  state: buildProfileRouteState({
                    name: userName,
                    avatar,
                  }),
                });
              }}
            >
              {userName}
            </span>
            {!compact ? <span className="rounded bg-hairline/30 px-1.5 py-0.5 text-[8px] font-black uppercase text-muted">邻里互动</span> : null}
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`${compact ? 'text-[8px]' : 'text-[10px]'} font-bold text-muted`}>{commentTime}</span>
            <button
              onClick={(event) => {
                event.stopPropagation();
                handleLike();
              }}
              disabled={liking}
              className={`flex items-center gap-1 font-black uppercase tracking-widest transition-colors disabled:opacity-50 ${compact ? 'text-[9px]' : 'text-[10px]'} ${
                isLiked ? 'text-red-500' : 'text-muted hover:text-red-500'
              }`}
            >
              <Heart className={`${compact ? 'h-2.5 w-2.5' : 'h-3 w-3'} ${isLiked ? 'fill-current' : ''}`} />
              {likes}
            </button>
          </div>
        </div>
        <p className={`${compact ? 'mb-0.5 text-[12px] leading-5 text-secondary/90' : 'mb-1.5 text-sm leading-relaxed text-secondary'} font-medium`}>{content}</p>
        {children ? (
          <div className={compact ? 'mt-2' : 'mt-3'} onClick={(event) => event.stopPropagation()}>
            {children}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { Comment } from '../../types';
import { newsApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onLikeChange?: (commentId: string, isLiked: boolean, likes: number) => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({ comment, currentUserId, onLikeChange }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [liking, setLiking] = useState(false);
  const [isLiked, setIsLiked] = useState(comment.isLiked ?? false);
  const [likes, setLikes] = useState(comment.likes ?? 0);

  // 同步外部状态变化（父组件刷新数据后需要同步）
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

    const wasLiked = isLiked;
    const prevLikes = likes;
    setLiking(true);

    // 乐观更新
    setIsLiked(!wasLiked);
    const newLikes = wasLiked ? Math.max(0, prevLikes - 1) : prevLikes + 1;
    setLikes(newLikes);

    try {
      await newsApi.likeComment(comment.id, currentUserId);
      showToast(wasLiked ? '已取消点赞' : '已点赞', 'success');
      onLikeChange?.(comment.id, !wasLiked, newLikes);
    } catch {
      // 回滚
      setIsLiked(wasLiked);
      setLikes(prevLikes);
      showToast('点赞失败', 'error');
    } finally {
      setLiking(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex gap-5 group p-6 rounded-[32px] hover:bg-surface-soft transition-all text-left border border-transparent hover:border-hairline"
    >
      <div
        className="cursor-pointer shrink-0 relative overflow-hidden rounded-2xl"
        onClick={() => navigate(`/profile/${comment.user}`)}
      >
        <img
          src={comment.avatar || `https://ui-avatars.com/api/?name=${comment.user}&background=random`}
          className="w-12 h-12 border border-hairline object-cover transition-transform group-hover:scale-110"
          alt={comment.user}
        />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className="font-black text-sm text-ink cursor-pointer hover:text-primary transition-colors"
              onClick={() => navigate(`/profile/${comment.user}`)}
            >
              {comment.user}
            </span>
            <span className="px-1.5 py-0.5 bg-hairline/30 rounded text-[8px] font-black text-muted uppercase">Level 3</span>
          </div>
          <span className="text-[10px] text-muted font-bold">{comment.time || '22:45'}</span>
        </div>
        <p className="text-sm text-secondary leading-relaxed mb-4 font-medium">
          {comment.text || comment.content}
        </p>
        <div className="flex items-center gap-6">
          <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:opacity-70 transition-opacity">回复</button>
          <button
            onClick={handleLike}
            disabled={liking || !currentUserId}
            className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-colors disabled:opacity-50 ${isLiked ? 'text-red-500' : 'text-muted hover:text-red-500'}`}
          >
            <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
            {likes}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
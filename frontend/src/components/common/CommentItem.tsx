import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { Comment } from '../../types';

interface CommentItemProps {
  comment: Comment;
}

export const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  const navigate = useNavigate();

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
          {comment.text}
        </p>
        <div className="flex items-center gap-6">
          <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:opacity-70 transition-opacity">回复</button>
          <button className="flex items-center gap-1.5 text-[10px] font-black text-muted hover:text-red-500 transition-colors uppercase tracking-widest">
             <Heart className="w-3 h-3 group-hover:fill-current" />
             点赞
          </button>
        </div>
      </div>
    </motion.div>
  );
};

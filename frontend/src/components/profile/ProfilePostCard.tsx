import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2, Heart, MessageCircle } from 'lucide-react';
import { Post } from '../../types';

interface ProfilePostCardProps {
  post: Post;
}

export const ProfilePostCard: React.FC<ProfilePostCardProps> = ({ post }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/news/${post.id}`)}
      className="bg-surface-soft border border-hairline rounded-3xl p-6 hover:shadow-xl hover:bg-white transition-all cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] text-muted font-black uppercase tracking-widest">{post.time}</span>
        <button className="p-2 hover:bg-white rounded-xl transition-colors" onClick={(e) => { e.stopPropagation(); /* share logic */ }}>
          <Share2 className="w-3.5 h-3.5 text-muted" />
        </button>
      </div>
      <p className="text-sm text-secondary line-clamp-3 mb-6 group-hover:text-ink transition-colors leading-relaxed font-medium">
        {post.content}
      </p>
      {post.images.length > 0 && post.images[0] && (
        <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-6 border border-hairline/50">
          <img src={post.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
        </div>
      )}
      <div className="flex items-center gap-6 pt-4 border-t border-hairline/50">
        <div className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-widest">
          <Heart className="w-3.5 h-3.5" /> {post.likes}
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-widest">
          <MessageCircle className="w-3.5 h-3.5" /> {post.commentsCount}
        </div>
      </div>
    </div>
  );
};

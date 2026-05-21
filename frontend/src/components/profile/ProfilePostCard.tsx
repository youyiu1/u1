import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle } from 'lucide-react';
import { Post } from '../../types';

interface ProfilePostCardProps {
  post: Post;
}

export const ProfilePostCard: React.FC<ProfilePostCardProps> = ({ post }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/news/${post.id}`, { state: { from: '/profile' } })}
      className="bg-white border border-hairline rounded-2xl p-4 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        {/* 内容区域 */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-secondary truncate group-hover:text-ink transition-colors font-medium">
            {post.content}
          </p>
        </div>
        {/* 图片缩略图 */}
        {post.images && post.images.length > 0 && post.images[0] && (
          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-hairline/50">
            <img src={post.images[0]} className="w-full h-full object-cover" alt="" />
          </div>
        )}
      </div>
      {/* 时间和互动数据 */}
      <div className="flex items-center gap-4 mt-3 text-[10px] font-black text-muted">
        <span>{post.time || post.createTime}</span>
        <div className="flex items-center gap-1">
          <Heart className="w-3 h-3" />
          <span>{post.likes || 0}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle className="w-3 h-3" />
          <span>{post.commentsCount || 0}</span>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle } from 'lucide-react';
import { Post } from '../../types';
import { PostMenu } from '../common/PostMenu';

interface ProfilePostCardProps {
  post: Post;
  currentUserId?: string;
  onDelete?: (postId: string) => void;
}

// 格式化时间显示
const formatTime = (timeStr: string | undefined) => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
};

export const ProfilePostCard: React.FC<ProfilePostCardProps> = ({ post, currentUserId, onDelete }) => {
  const navigate = useNavigate();
  const isOwner = currentUserId && (post.authorId === currentUserId || post.author?.id === currentUserId);

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
        {/* 删除按钮 */}
        {isOwner && onDelete && (
          <div onClick={e => e.stopPropagation()}>
            <PostMenu
              isOwner={true}
              onDelete={async () => { await onDelete(post.id); }}
            />
          </div>
        )}
      </div>
      {/* 时间和互动数据 */}
      <div className="flex items-center gap-4 mt-3 text-[10px] font-black text-muted">
        <span>{formatTime(post.createTime)}</span>
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

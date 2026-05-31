import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Clock3, Heart, MessageCircle } from 'lucide-react';
import { Post } from '../../types';
import { PostMenu } from '../common/PostMenu';
import { formatDateTime } from '../../utils/dateTime';
import { parseImages } from '../../utils/images';

interface ProfilePostCardProps {
  post: Post;
  currentUserId?: string;
  onDelete?: (postId: string) => void;
}

export const ProfilePostCard: React.FC<ProfilePostCardProps> = ({ post, currentUserId, onDelete }) => {
  const navigate = useNavigate();
  const isOwner = currentUserId && (post.authorId === currentUserId || post.author?.id === currentUserId);
  const images = parseImages(post.images);
  const reviewState = getReviewState(post.status, post.rejectReason);

  return (
    <div
      onClick={() => navigate(`/news/${post.id}`, { state: { from: '/profile' } })}
      className="bg-white border border-hairline rounded-2xl p-4 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-secondary truncate group-hover:text-ink transition-colors font-medium">
            {post.content}
          </p>
        </div>
        {images[0] && (
          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-hairline/50">
            <img src={images[0]} className="w-full h-full object-cover" alt="" />
          </div>
        )}
        {isOwner && onDelete && (
          <div onClick={e => e.stopPropagation()}>
            <PostMenu
              isOwner={true}
              onDelete={async () => { await onDelete(post.id); }}
            />
          </div>
        )}
      </div>

      {reviewState && (
        <div className={`mt-3 flex items-start gap-2 rounded-xl px-3 py-2 text-[11px] font-bold ${reviewState.className}`}>
          {reviewState.status === 'pending' ? <Clock3 className="w-3.5 h-3.5 mt-0.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />}
          <div>
            <p>{reviewState.label}</p>
            {reviewState.reason && <p className="mt-1 font-medium opacity-80">原因：{reviewState.reason}</p>}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mt-3 text-[10px] font-black text-muted">
        <span>{formatDateTime(post.createTime)}</span>
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

function getReviewState(status?: string, rejectReason?: string) {
  if (status === 'pending') {
    return {
      status,
      label: '待平台审核，通过后将公开展示',
      reason: '',
      className: 'bg-amber-50 text-amber-700 border border-amber-100',
    };
  }
  if (status === 'removed') {
    return {
      status,
      label: '未通过审核，已下架',
      reason: rejectReason || '请按平台规范修改后重新发布',
      className: 'bg-rose-50 text-rose-700 border border-rose-100',
    };
  }
  return null;
}

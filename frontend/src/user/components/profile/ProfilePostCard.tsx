import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Clock3, Heart, MessageCircle } from 'lucide-react';
import { Post } from '../../types';
import { PostMenu } from '../common/PostMenu';
import { formatDateTime } from '../../utils/dateTime';
import { parseImages } from '../../utils/images';
import { getPendingReviewState, getRejectedReviewState } from '../../utils/reviewState';

interface ProfilePostCardProps {
  post: Post;
  currentUserId?: string;
  onDelete?: (postId: string) => void;
}

export const ProfilePostCard: React.FC<ProfilePostCardProps> = ({ post, currentUserId, onDelete }) => {
  const navigate = useNavigate();
  const isOwner = Boolean(currentUserId && (post.authorId === currentUserId || post.author?.id === currentUserId));
  const images = parseImages(post.images);
  const reviewState = getReviewState(post.status, post.rejectReason);

  return (
    <div
      onClick={() => navigate(`/news/${post.id}`, { state: { from: '/profile' } })}
      className="theme-card group cursor-pointer rounded-2xl p-4 transition-all hover:border-primary/20 hover:shadow-md"
    >
      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-secondary transition-colors group-hover:text-ink">{post.content}</p>
        </div>

        {images[0] ? (
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-hairline/50">
            <img src={images[0]} className="h-full w-full object-cover" alt="" />
          </div>
        ) : null}

        {isOwner && onDelete ? (
          <div onClick={(event) => event.stopPropagation()}>
            <PostMenu isOwner={true} onDelete={async () => onDelete(post.id)} />
          </div>
        ) : null}
      </div>

      {reviewState ? (
        <div className={`mt-3 flex items-start gap-2 rounded-xl px-3 py-2 text-[11px] font-bold ${reviewState.className}`}>
          {reviewState.status === 'pending' ? (
            <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          )}
          <div>
            <p>{reviewState.label}</p>
            {reviewState.reason ? <p className="mt-1 font-medium opacity-80">原因：{reviewState.reason}</p> : null}
          </div>
        </div>
      ) : null}

      <div className="mt-3 flex items-center gap-4 text-[10px] font-black text-muted">
        <span>{formatDateTime(post.createTime)}</span>
        <div className="flex items-center gap-1">
          <Heart className="h-3 w-3" />
          <span>{post.likes || 0}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle className="h-3 w-3" />
          <span>{post.commentsCount || 0}</span>
        </div>
      </div>
    </div>
  );
};

function getReviewState(status?: string, rejectReason?: string) {
  return (
    getPendingReviewState(status, {
      label: '待平台审核，通过后将公开展示',
    }) ||
    getRejectedReviewState(status, rejectReason, {
      label: '未通过审核，已下架',
      fallbackReason: '请按平台规范修改后重新发布',
    })
  );
}

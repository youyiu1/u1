/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Post } from '../../types';
import { LikeButton } from '../common/LikeButton';
import { formatDateTime } from '../../utils/dateTime';
import { parseImages } from '../../utils/images';
import { buildProfilePath, buildProfileRouteState } from '../../utils/profileRoute';

interface HomePostCardProps {
  post: Post;
  idx: number;
  compact?: boolean;
}

export const HomePostCard: React.FC<HomePostCardProps> = ({ post, idx, compact = false }) => {
  const navigate = useNavigate();

  const authorName = post.author?.name || post.authorName || '匿名用户';
  const authorAvatar = post.author?.avatar || post.authorAvatar || '';
  const authorVerified = post.author?.verified ?? post.authorVerified ?? false;
  const avatarSrc = authorAvatar || null;
  const postTime = formatDateTime(post.time || post.createTime, '刚刚');
  const authorId = post.author?.id || post.authorId;

  const images = parseImages(post.images);
  const comments = (post.comments || []).slice(0, 3);

  return (
    <div
      className={`theme-card group flex h-full cursor-pointer flex-col rounded-[16px] p-3 transition-shadow duration-300 content-visibility-auto hover:shadow-[0_12px_26px_rgba(15,23,42,0.08)] ${
        compact ? '' : 'rounded-[48px] p-10'
      }`}
      onClick={() => navigate(`/news/${post.id}`)}
    >
      <div
        className={`${compact ? 'mb-2 gap-2' : 'mb-10 gap-6'} flex items-center`}
        onClick={(e) => {
          e.stopPropagation();
          navigate(buildProfilePath(authorId, authorName), {
            state: buildProfileRouteState({
              id: authorId,
              name: authorName,
              avatar: authorAvatar,
              isVerified: authorVerified,
            }),
          });
        }}
      >
        <div className="relative shrink-0">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={authorName}
              loading="lazy"
              decoding="async"
              className={`${compact ? 'h-7.5 w-7.5 ring-offset-2' : 'h-16 w-16 ring-offset-4'} rounded-full object-cover ring-2 ring-hairline transition-colors duration-300 group-hover:ring-primary/30`}
            />
          ) : (
            <div className={`${compact ? 'h-7.5 w-7.5 text-[11px]' : 'h-16 w-16 text-xl'} theme-card-muted flex items-center justify-center rounded-full font-bold text-muted`}>
              {authorName.charAt(0)}
            </div>
          )}
          {authorVerified ? (
            <div className={`${compact ? 'h-2.5 w-2.5 border-2' : 'h-6 w-6 border-4'} absolute -bottom-1 -right-1 rounded-full border-white bg-primary shadow-sm`} />
          ) : null}
        </div>
        <div className="min-w-0">
          <h4 className={`${compact ? 'text-[11px]' : 'text-lg'} truncate font-black text-ink transition-colors group-hover:text-primary`}>
            {authorName}
          </h4>
          <p className="truncate text-[6px] font-black uppercase tracking-[0.1em] text-secondary opacity-40">
            {postTime} · {post.location}
          </p>
        </div>
      </div>

      <p className={`${compact ? 'mb-2.5 min-h-[32px] line-clamp-2 text-[10px]' : 'mb-10 line-clamp-3 text-xl'} text-left font-medium leading-relaxed text-ink transition-colors group-hover:text-ink/80`}>
        {post.content}
      </p>

      {images.length > 0 && images[0] ? (
        <div className={`${compact ? 'mb-2.5 rounded-[14px]' : 'mb-10 rounded-[32px]'} theme-card-muted aspect-[16/9] overflow-hidden shadow-inner`}>
          <img src={images[0]} alt="Post content" loading="lazy" decoding="async" className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className={`${compact ? 'mb-2.5 h-[84px] rounded-[14px]' : 'mb-10 h-[160px] rounded-[32px]'} theme-card-muted`} />
      )}

      <div className={`${compact ? 'pt-2' : 'pt-10'} mt-auto flex items-center justify-between border-t border-hairline`} onClick={(e) => e.stopPropagation()}>
        <div className={`flex items-center ${compact ? 'gap-2.5' : 'gap-8'}`}>
          <LikeButton postId={post.id} initialLikes={post.likes} isLikedInitial={post.isLiked ?? false} />
          <button className="flex items-center gap-1 group/btn">
            <div className="text-[6px] font-black uppercase tracking-[0.1em] leading-none text-muted underline decoration-hairline underline-offset-4 group-hover/btn:text-ink">
              评论 {post.commentsCount}
            </div>
          </button>
        </div>
        {comments.length > 0 ? (
          <div className="flex -space-x-1 transition-all duration-500 group-hover:-space-x-0.5">
            {comments.map((comment, i) => (
              <div
                key={i}
                className={`${compact ? 'h-5 w-5' : 'h-8 w-8'} theme-card-soft cursor-pointer overflow-hidden rounded-full border-2 transition-all hover:ring-2 hover:ring-primary/50`}
                onClick={() =>
                  navigate(buildProfilePath(undefined, comment.userName), {
                    state: buildProfileRouteState({
                      name: comment.userName,
                      avatar: comment.userAvatar,
                    }),
                  })
                }
              >
                <img src={comment.userAvatar} alt={comment.userName} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

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
      className={`group flex h-full cursor-pointer flex-col border border-hairline bg-white transition-shadow duration-300 content-visibility-auto hover:shadow-lg ${
        compact ? 'rounded-[32px] p-6' : 'rounded-[48px] p-10'
      }`}
      onClick={() => navigate(`/news/${post.id}`)}
    >
      <div
        className={`${compact ? 'mb-6 gap-4' : 'mb-10 gap-6'} flex items-center`}
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
        <div className="relative">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={authorName}
              loading="lazy"
              decoding="async"
              className={`${compact ? 'h-11 w-11 ring-offset-2' : 'h-16 w-16 ring-offset-4'} rounded-full object-cover ring-2 ring-hairline transition-colors duration-300 group-hover:ring-primary/30`}
            />
          ) : (
            <div className={`${compact ? 'h-11 w-11 text-base' : 'h-16 w-16 text-xl'} flex items-center justify-center rounded-full bg-stone-200 font-bold text-stone-400`}>
              {authorName.charAt(0)}
            </div>
          )}
          {authorVerified ? (
            <div className={`${compact ? 'h-4 w-4 border-2' : 'h-6 w-6 border-4'} absolute -bottom-1 -right-1 rounded-full border-white bg-primary shadow-sm`} />
          ) : null}
        </div>
        <div>
          <h4 className={`${compact ? 'text-base' : 'text-lg'} font-black text-ink transition-colors group-hover:text-primary`}>{authorName}</h4>
          <p className="text-[10px] font-black uppercase tracking-widest text-secondary opacity-40">
            {postTime} · {post.location}
          </p>
        </div>
      </div>

      <p className={`${compact ? 'mb-6 line-clamp-2 text-base' : 'mb-10 line-clamp-3 text-xl'} font-medium leading-relaxed text-ink transition-colors group-hover:text-ink/80`}>
        {post.content}
      </p>

      {images.length > 0 && images[0] ? (
        <div className={`${compact ? 'mb-6 rounded-[24px]' : 'mb-10 rounded-[32px]'} aspect-[16/9] overflow-hidden bg-stone-100 shadow-inner`}>
          <img src={images[0]} alt="Post content" loading="lazy" decoding="async" className="h-full w-full object-cover" />
        </div>
      ) : null}

      <div className={`${compact ? 'pt-6' : 'pt-10'} mt-auto flex items-center justify-between border-t border-hairline`} onClick={(e) => e.stopPropagation()}>
        <div className={`flex items-center ${compact ? 'gap-5' : 'gap-8'}`}>
          <LikeButton postId={post.id} initialLikes={post.likes} isLikedInitial={post.isLiked ?? false} />
          <button className="flex items-center gap-2.5 group/btn">
            <div className="text-[10px] font-black uppercase tracking-widest leading-none text-muted underline decoration-hairline underline-offset-4 group-hover/btn:text-ink">
              评论 {post.commentsCount}
            </div>
          </button>
        </div>
        {comments.length > 0 ? (
          <div className="flex -space-x-3 transition-all duration-500 group-hover:-space-x-1">
            {comments.map((comment, i) => (
              <div
                key={i}
                className={`${compact ? 'h-7 w-7' : 'h-8 w-8'} overflow-hidden rounded-full border-2 border-white bg-stone-100 cursor-pointer transition-all hover:ring-2 hover:ring-primary/50`}
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

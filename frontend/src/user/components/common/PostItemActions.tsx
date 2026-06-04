/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Heart, MessageSquare, Share2, Bookmark } from 'lucide-react';
import { useLikeAndFavorite } from '../../hooks/useLikeAndFavorite';
import { Post } from '../../types';

interface PostItemActionsProps {
  post: Post;
}

export function PostItemActions({ post }: PostItemActionsProps) {
  const { isLiked, isFavorited, likes, collections, isLiking, isFavoriting, toggleLike, toggleFavorite } = useLikeAndFavorite(
    post.id,
    {
      isLiked: post.isLiked ?? false,
      isFavorited: post.isFavorited ?? false,
      likes: post.likes ?? 0,
      collections: post.collections ?? 0,
    }
  );

  return (
    <footer className="flex items-center gap-6 mt-6 pt-4 border-t border-hairline">
      <button
        onClick={toggleLike}
        disabled={isLiking}
        className={`flex items-center gap-1.5 transition-colors group ${isLiked ? 'text-red-500' : 'text-muted hover:text-red-500'} ${isLiking ? 'opacity-50' : ''}`}
      >
        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : 'group-hover:fill-current'}`} />
        <span className="text-xs font-bold">{likes}</span>
      </button>

      <button className="flex items-center gap-1.5 text-muted hover:text-blue-500 transition-colors">
        <MessageSquare className="w-4 h-4" />
        <span className="text-xs font-bold">{post.commentsCount}</span>
      </button>

      <button className="flex items-center gap-1.5 text-muted hover:text-green-500 transition-colors">
        <Share2 className="w-4 h-4" />
        <span className="text-xs font-bold">{post.shares}</span>
      </button>

      <button
        onClick={toggleFavorite}
        disabled={isFavoriting}
        className={`flex items-center gap-1.5 transition-colors ${isFavorited ? 'text-accent-gold' : 'text-muted hover:text-accent-gold'} ${isFavoriting ? 'opacity-50' : ''}`}
      >
        <Bookmark className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        <span className="text-xs font-bold">{collections}</span>
      </button>
    </footer>
  );
}
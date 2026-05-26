/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { newsApi, favoriteApi } from '../services/api';
import { useToast } from '../context/ToastContext';

interface UseLikeAndFavoriteOptions {
  onLikeChange?: (isLiked: boolean, likes: number) => void;
  onFavoriteChange?: (isFavorited: boolean, collections: number) => void;
}

interface LikeAndFavoriteState {
  isLiked: boolean;
  isFavorited: boolean;
  likes: number;
  collections: number;
}

export function useLikeAndFavorite(
  postId: string,
  initialState: LikeAndFavoriteState,
  options: UseLikeAndFavoriteOptions = {}
) {
  const [state, setState] = useState(initialState);
  const { showToast } = useToast();

  const toggleLike = useCallback(async (e: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();

    const wasLiked = state.isLiked;
    const prevLikes = state.likes;

    try {
      await newsApi.like(postId);
      const newIsLiked = !wasLiked;
      const newLikes = wasLiked ? Math.max(0, prevLikes - 1) : prevLikes + 1;

      setState(prev => ({
        ...prev,
        isLiked: newIsLiked,
        likes: newLikes,
      }));

      options.onLikeChange?.(newIsLiked, newLikes);
    } catch {
      setState(prev => ({ ...prev, isLiked: wasLiked, likes: prevLikes }));
      showToast('点赞失败', 'error');
    }
  }, [postId, state.isLiked, state.likes, options]);

  const toggleFavorite = useCallback(async (e: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();

    const currentUser = JSON.parse(localStorage.getItem('neighborhood_user') || '{}');
    if (!currentUser.id) {
      showToast('请先登录', 'warning');
      return;
    }

    const wasFavorited = state.isFavorited;
    const prevCollections = state.collections;

    try {
      if (wasFavorited) {
        await favoriteApi.remove(currentUser.id, 'news', postId);
      } else {
        await favoriteApi.add(currentUser.id, 'news', postId);
      }
      const newIsFavorited = !wasFavorited;
      const newCollections = wasFavorited ? Math.max(0, prevCollections - 1) : prevCollections + 1;

      setState(prev => ({
        ...prev,
        isFavorited: newIsFavorited,
        collections: newCollections,
      }));

      options.onFavoriteChange?.(newIsFavorited, newCollections);
      showToast(wasFavorited ? '已取消收藏' : '已收藏', 'success');
    } catch {
      setState(prev => ({ ...prev, isFavorited: wasFavorited, collections: prevCollections }));
      showToast('收藏失败', 'error');
    }
  }, [postId, state.isFavorited, state.collections, options]);

  return {
    ...state,
    toggleLike,
    toggleFavorite,
  };
}
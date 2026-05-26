/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  const [isLiking, setIsLiking] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const { showToast } = useToast();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  // 同步外部状态变化（API返回数据后）
  useEffect(() => {
    setState({
      isLiked: initialState.isLiked ?? state.isLiked,
      isFavorited: initialState.isFavorited ?? state.isFavorited,
      likes: initialState.likes ?? state.likes,
      collections: initialState.collections ?? state.collections,
    });
  }, [initialState.isLiked, initialState.isFavorited, initialState.likes, initialState.collections]);

  const toggleLike = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    if (isLiking) return;

    const currentUser = JSON.parse(localStorage.getItem('neighborhood_user') || '{}');
    if (!currentUser.id) {
      showToast('请先登录', 'warning');
      return;
    }

    const wasLiked = state.isLiked;
    const prevLikes = state.likes;
    setIsLiking(true);

    try {
      await newsApi.like(postId);
      if (!isMountedRef.current) return;
      const newIsLiked = !wasLiked;
      const newLikes = wasLiked ? Math.max(0, prevLikes - 1) : prevLikes + 1;
      setState(prev => ({ ...prev, isLiked: newIsLiked, likes: newLikes }));
      options.onLikeChange?.(newIsLiked, newLikes);
    } catch {
      if (!isMountedRef.current) return;
      setState(prev => ({ ...prev, isLiked: wasLiked, likes: prevLikes }));
      showToast('点赞失败', 'error');
    } finally {
      if (isMountedRef.current) setIsLiking(false);
    }
  }, [postId, state.isLiked, state.likes, isLiking, options]);

  const toggleFavorite = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    if (isFavoriting) return;

    const currentUser = JSON.parse(localStorage.getItem('neighborhood_user') || '{}');
    if (!currentUser.id) {
      showToast('请先登录', 'warning');
      return;
    }

    const wasFavorited = state.isFavorited;
    const prevCollections = state.collections;
    setIsFavoriting(true);

    try {
      if (wasFavorited) {
        await favoriteApi.remove(currentUser.id, 'news', postId);
      } else {
        await favoriteApi.add(currentUser.id, 'news', postId);
      }
      if (!isMountedRef.current) return;
      const newIsFavorited = !wasFavorited;
      const newCollections = wasFavorited ? Math.max(0, prevCollections - 1) : prevCollections + 1;
      setState(prev => ({ ...prev, isFavorited: newIsFavorited, collections: newCollections }));
      options.onFavoriteChange?.(newIsFavorited, newCollections);
      showToast(wasFavorited ? '已取消收藏' : '已收藏', 'success');
    } catch {
      if (!isMountedRef.current) return;
      setState(prev => ({ ...prev, isFavorited: wasFavorited, collections: prevCollections }));
      showToast('收藏失败', 'error');
    } finally {
      if (isMountedRef.current) setIsFavoriting(false);
    }
  }, [postId, state.isFavorited, state.collections, isFavoriting, options]);

  return {
    ...state,
    isLiking,
    isFavoriting,
    toggleLike,
    toggleFavorite,
  };
}
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { newsApi, favoriteApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { getStoredUser } from '../utils/authStorage';

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
  const navigate = useNavigate();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  // 同步外部状态变化（API返回数据后）
  const prevPostIdRef = useRef<string | null>(null);
  const prevInitialRef = useRef<LikeAndFavoriteState | null>(null);

  useEffect(() => {
    if (prevPostIdRef.current !== null) {
      if (prevPostIdRef.current !== postId) {
        // postId 变化，重置状态
        setState({
          isLiked: initialState.isLiked ?? false,
          isFavorited: initialState.isFavorited ?? false,
          likes: initialState.likes ?? 0,
          collections: initialState.collections ?? 0,
        });
      } else if (prevInitialRef.current) {
        // postId 不变但 initialState 变化，同步收藏/点赞状态
        const prev = prevInitialRef.current;
        if (prev.isFavorited !== initialState.isFavorited) {
          setState(s => ({ ...s, isFavorited: initialState.isFavorited ?? s.isFavorited }));
        }
        if (prev.isLiked !== initialState.isLiked) {
          setState(s => ({ ...s, isLiked: initialState.isLiked ?? s.isLiked }));
        }
        if (prev.likes !== initialState.likes) {
          setState(s => ({ ...s, likes: initialState.likes ?? s.likes }));
        }
        if (prev.collections !== initialState.collections) {
          setState(s => ({ ...s, collections: initialState.collections ?? s.collections }));
        }
      }
    }
    prevPostIdRef.current = postId;
    prevInitialRef.current = { ...initialState };
  }, [initialState.isLiked, initialState.isFavorited, initialState.likes, initialState.collections, postId]);

  const toggleLike = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    if (isLiking) return;

    const currentUser = getStoredUser();
    if (!currentUser?.id) {
      showToast('请先登录', 'warning');
      navigate('/login');
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
      showToast(newIsLiked ? '已点赞' : '已取消点赞', 'success');
    } catch {
      if (!isMountedRef.current) return;
      setState(prev => ({ ...prev, isLiked: wasLiked, likes: prevLikes }));
      showToast('点赞失败', 'error');
    } finally {
      if (isMountedRef.current) setIsLiking(false);
    }
  }, [postId, state.isLiked, state.likes, isLiking, options, navigate, showToast]);

  const toggleFavorite = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    if (isFavoriting) return;

    const currentUser = getStoredUser();
    if (!currentUser?.id) {
      showToast('请先登录', 'warning');
      navigate('/login');
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
  }, [postId, state.isFavorited, state.collections, isFavoriting, options, navigate, showToast]);

  return {
    ...state,
    isLiking,
    isFavoriting,
    toggleLike,
    toggleFavorite,
  };
}

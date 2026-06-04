/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';
import { favoriteApi, newsApi } from '../services/api';
import { useAuthCheck } from '../context/useAuthCheck';
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
  const { requireAuth } = useAuthCheck();
  const { showToast } = useToast();
  const isMountedRef = useRef(true);
  const prevPostIdRef = useRef<string | null>(null);
  const prevInitialRef = useRef<LikeAndFavoriteState | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (prevPostIdRef.current !== null) {
      if (prevPostIdRef.current !== postId) {
        setState({
          isLiked: initialState.isLiked ?? false,
          isFavorited: initialState.isFavorited ?? false,
          likes: initialState.likes ?? 0,
          collections: initialState.collections ?? 0,
        });
      } else if (prevInitialRef.current) {
        const prev = prevInitialRef.current;
        if (prev.isFavorited !== initialState.isFavorited) {
          setState((current) => ({ ...current, isFavorited: initialState.isFavorited ?? current.isFavorited }));
        }
        if (prev.isLiked !== initialState.isLiked) {
          setState((current) => ({ ...current, isLiked: initialState.isLiked ?? current.isLiked }));
        }
        if (prev.likes !== initialState.likes) {
          setState((current) => ({ ...current, likes: initialState.likes ?? current.likes }));
        }
        if (prev.collections !== initialState.collections) {
          setState((current) => ({ ...current, collections: initialState.collections ?? current.collections }));
        }
      }
    }

    prevPostIdRef.current = postId;
    prevInitialRef.current = { ...initialState };
  }, [initialState.collections, initialState.isFavorited, initialState.isLiked, initialState.likes, postId]);

  const toggleLike = useCallback(
    async (event?: React.MouseEvent) => {
      if (event) {
        event.stopPropagation();
        event.preventDefault();
      }

      if (isLiking || !requireAuth()) {
        return;
      }

      const currentUser = getStoredUser();
      if (!currentUser?.id) {
        return;
      }

      const previous = state.isLiked;
      const previousLikes = state.likes;
      setIsLiking(true);

      try {
        await newsApi.like(postId);
        if (!isMountedRef.current) {
          return;
        }
        const nextLiked = !previous;
        const nextLikes = previous ? Math.max(0, previousLikes - 1) : previousLikes + 1;
        setState((current) => ({ ...current, isLiked: nextLiked, likes: nextLikes }));
        options.onLikeChange?.(nextLiked, nextLikes);
        showToast(nextLiked ? '点赞成功' : '已取消点赞', 'success');
      } catch {
        if (!isMountedRef.current) {
          return;
        }
        setState((current) => ({ ...current, isLiked: previous, likes: previousLikes }));
        showToast('点赞失败，请稍后重试', 'error');
      } finally {
        if (isMountedRef.current) {
          setIsLiking(false);
        }
      }
    },
    [isLiking, options, postId, requireAuth, showToast, state.isLiked, state.likes]
  );

  const toggleFavorite = useCallback(
    async (event?: React.MouseEvent) => {
      if (event) {
        event.stopPropagation();
        event.preventDefault();
      }

      if (isFavoriting || !requireAuth()) {
        return;
      }

      const currentUser = getStoredUser();
      if (!currentUser?.id) {
        return;
      }

      const previous = state.isFavorited;
      const previousCollections = state.collections;
      setIsFavoriting(true);

      try {
        if (previous) {
          await favoriteApi.remove(currentUser.id, 'news', postId);
        } else {
          await favoriteApi.add(currentUser.id, 'news', postId);
        }

        if (!isMountedRef.current) {
          return;
        }

        const nextFavorited = !previous;
        const nextCollections = previous ? Math.max(0, previousCollections - 1) : previousCollections + 1;
        setState((current) => ({ ...current, isFavorited: nextFavorited, collections: nextCollections }));
        options.onFavoriteChange?.(nextFavorited, nextCollections);
        showToast(nextFavorited ? '收藏成功' : '已取消收藏', 'success');
      } catch {
        if (!isMountedRef.current) {
          return;
        }
        setState((current) => ({ ...current, isFavorited: previous, collections: previousCollections }));
        showToast('收藏失败，请稍后重试', 'error');
      } finally {
        if (isMountedRef.current) {
          setIsFavoriting(false);
        }
      }
    },
    [isFavoriting, options, postId, requireAuth, showToast, state.collections, state.isFavorited]
  );

  return {
    ...state,
    isLiking,
    isFavoriting,
    toggleLike,
    toggleFavorite,
  };
}
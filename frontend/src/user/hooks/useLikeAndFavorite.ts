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

  const updateState = useCallback((patch: Partial<LikeAndFavoriteState>) => {
    setState((current) => ({ ...current, ...patch }));
  }, []);

  const getCurrentUserId = useCallback(() => getStoredUser()?.id || '', []);

  const stopEvent = useCallback((event?: React.MouseEvent) => {
    if (!event) {
      return;
    }
    event.stopPropagation();
    event.preventDefault();
  }, []);

  const canCommitState = useCallback(() => isMountedRef.current, []);

  const resolveNextCount = useCallback(
    (currentCount: number, enabled: boolean) => (enabled ? currentCount + 1 : Math.max(0, currentCount - 1)),
    []
  );

  const finishPendingState = useCallback((setter: (value: boolean) => void) => {
    if (canCommitState()) {
      setter(false);
    }
  }, [canCommitState]);

  const applyLikeState = useCallback(
    (nextLiked: boolean, nextLikes: number) => {
      updateState({ isLiked: nextLiked, likes: nextLikes });
      options.onLikeChange?.(nextLiked, nextLikes);
    },
    [options, updateState]
  );

  const applyFavoriteState = useCallback(
    (nextFavorited: boolean, nextCollections: number) => {
      updateState({ isFavorited: nextFavorited, collections: nextCollections });
      options.onFavoriteChange?.(nextFavorited, nextCollections);
    },
    [options, updateState]
  );

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
          updateState({ isFavorited: initialState.isFavorited });
        }
        if (prev.isLiked !== initialState.isLiked) {
          updateState({ isLiked: initialState.isLiked });
        }
        if (prev.likes !== initialState.likes) {
          updateState({ likes: initialState.likes });
        }
        if (prev.collections !== initialState.collections) {
          updateState({ collections: initialState.collections });
        }
      }
    }

    prevPostIdRef.current = postId;
    prevInitialRef.current = { ...initialState };
  }, [initialState.collections, initialState.isFavorited, initialState.isLiked, initialState.likes, postId, updateState]);

  const toggleLike = useCallback(
    async (event?: React.MouseEvent) => {
      stopEvent(event);

      if (isLiking || !requireAuth()) {
        return;
      }

      const currentUserId = getCurrentUserId();
      if (!currentUserId) {
        return;
      }

      const previous = state.isLiked;
      const previousLikes = state.likes;
      setIsLiking(true);

      try {
        await newsApi.like(postId);
        if (!canCommitState()) {
          return;
        }
        const nextLiked = !previous;
        const nextLikes = resolveNextCount(previousLikes, nextLiked);
        applyLikeState(nextLiked, nextLikes);
        showToast(nextLiked ? '点赞成功' : '已取消点赞', 'success');
      } catch {
        if (!canCommitState()) {
          return;
        }
        applyLikeState(previous, previousLikes);
        showToast('点赞失败，请稍后重试', 'error');
      } finally {
        finishPendingState(setIsLiking);
      }
    },
    [
      applyLikeState,
      canCommitState,
      finishPendingState,
      getCurrentUserId,
      isLiking,
      postId,
      requireAuth,
      resolveNextCount,
      showToast,
      state.isLiked,
      state.likes,
      stopEvent,
    ]
  );

  const toggleFavorite = useCallback(
    async (event?: React.MouseEvent) => {
      stopEvent(event);

      if (isFavoriting || !requireAuth()) {
        return;
      }

      const currentUserId = getCurrentUserId();
      if (!currentUserId) {
        return;
      }

      const previous = state.isFavorited;
      const previousCollections = state.collections;
      setIsFavoriting(true);

      try {
        if (previous) {
          await favoriteApi.remove(currentUserId, 'news', postId);
        } else {
          await favoriteApi.add(currentUserId, 'news', postId);
        }

        if (!canCommitState()) {
          return;
        }

        const nextFavorited = !previous;
        const nextCollections = resolveNextCount(previousCollections, nextFavorited);
        applyFavoriteState(nextFavorited, nextCollections);
        showToast(nextFavorited ? '收藏成功' : '已取消收藏', 'success');
      } catch {
        if (!canCommitState()) {
          return;
        }
        applyFavoriteState(previous, previousCollections);
        showToast('收藏失败，请稍后重试', 'error');
      } finally {
        finishPendingState(setIsFavoriting);
      }
    },
    [
      applyFavoriteState,
      canCommitState,
      finishPendingState,
      getCurrentUserId,
      isFavoriting,
      postId,
      requireAuth,
      resolveNextCount,
      showToast,
      state.collections,
      state.isFavorited,
      stopEvent,
    ]
  );

  return {
    ...state,
    isLiking,
    isFavoriting,
    toggleLike,
    toggleFavorite,
  };
}


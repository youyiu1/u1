/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { userApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { getFollowState, setFollowState } from '../utils/followStorage';

interface UseFollowOptions {
  targetId: string;
  initialState?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

export function useFollow({ targetId, initialState, onFollowChange }: UseFollowOptions) {
  const [isFollowing, setIsFollowing] = useState(() => getFollowState(targetId) ?? initialState ?? false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (initialState !== undefined) {
      setIsFollowing(initialState);
    }
  }, [initialState, targetId]);

  const toggleFollow = useCallback(async () => {
    if (!targetId || isLoading) return;

    const currentUser = JSON.parse(localStorage.getItem('neighborhood_user') || '{}');
    if (!currentUser.id) {
      showToast('请先登录', 'warning');
      return;
    }

    const wasFollowing = isFollowing;
    setIsLoading(true);

    try {
      if (wasFollowing) {
        await userApi.unfollow(currentUser.id, targetId);
      } else {
        await userApi.follow(currentUser.id, targetId);
      }

      if (!isMountedRef.current) return;

      const newState = !wasFollowing;
      setIsFollowing(newState);
      setFollowState(targetId, newState);
      onFollowChange?.(newState);
    } catch {
      if (!isMountedRef.current) return;
      setIsFollowing(wasFollowing);
      showToast(wasFollowing ? '取消关注失败' : '关注失败', 'error');
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [targetId, isFollowing, isLoading, onFollowChange]);

  return {
    isFollowing,
    isLoading,
    toggleFollow,
  };
}
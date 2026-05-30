/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { userApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { getStoredUser } from '../utils/authStorage';
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

  const prevTargetIdRef = useRef<string | null>(null);
  const prevInitialStateRef = useRef<boolean | undefined>(undefined);

  useEffect(() => {
    if (prevTargetIdRef.current !== null) {
      if (prevTargetIdRef.current !== targetId && initialState !== undefined) {
        setIsFollowing(initialState);
      } else if (prevInitialStateRef.current !== initialState && initialState !== undefined) {
        setIsFollowing(initialState);
      }
    }
    prevTargetIdRef.current = targetId;
    prevInitialStateRef.current = initialState;
  }, [initialState, targetId]);

  const toggleFollow = useCallback(async () => {
    if (!targetId || isLoading) return;

    const currentUser = getStoredUser();
    if (!currentUser?.id) {
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
      showToast(newState ? '已关注' : '已取消关注', 'success');
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

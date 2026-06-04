/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
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
  const prevTargetIdRef = useRef<string | null>(null);
  const prevInitialStateRef = useRef<boolean | undefined>(undefined);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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
    if (!targetId || isLoading) {
      return;
    }

    const currentUser = getStoredUser();
    if (!currentUser?.id) {
      showToast('请先登录后继续操作', 'warning');
      return;
    }

    const previous = isFollowing;
    setIsLoading(true);

    try {
      if (previous) {
        await userApi.unfollow(currentUser.id, targetId);
      } else {
        await userApi.follow(currentUser.id, targetId);
      }

      if (!isMountedRef.current) {
        return;
      }

      const nextState = !previous;
      setIsFollowing(nextState);
      setFollowState(targetId, nextState);
      onFollowChange?.(nextState);
      showToast(nextState ? '关注成功' : '已取消关注', 'success');
    } catch {
      if (!isMountedRef.current) {
        return;
      }
      setIsFollowing(previous);
      showToast(previous ? '取消关注失败' : '关注失败', 'error');
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [isFollowing, isLoading, onFollowChange, showToast, targetId]);

  return {
    isFollowing,
    isLoading,
    toggleFollow,
  };
}

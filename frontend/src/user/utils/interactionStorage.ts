/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { readJson, writeJson } from './jsonStorage';

// 浜掑姩鐘舵€佸瓨鍌紙鐐硅禐銆佹敹钘忥級
// 瀛樺偍缁撴瀯锛歿 postId: { liked: bool, baseLikes: number, favorited: bool, baseCollections: number } }

const INTERACTION_KEY = 'interaction_states_v1';

type FavoriteTargetType = 'news' | 'market' | 'service';

interface InteractionState {
  liked?: boolean;
  favorited?: boolean;
  baseLikes?: number;
  baseCollections?: number;
}

export function getInteractionState(postId: string): InteractionState {
  const saved = readJson<Record<string, InteractionState>>(INTERACTION_KEY, {});
  return saved[postId] || {};
}

export function setInteractionState(postId: string, state: Partial<InteractionState>): void {
  const saved = readJson<Record<string, InteractionState>>(INTERACTION_KEY, {});
  saved[postId] = { ...(saved[postId] || {}), ...state };
  writeJson(INTERACTION_KEY, saved);
}

export function getLiked(postId: string, initialLikes: number): { liked: boolean; displayCount: number } {
  const state = getInteractionState(postId);
  const liked = state.liked ?? false;
  const base = state.baseLikes ?? initialLikes;
  const displayCount = liked ? base + 1 : base;
  return { liked, displayCount };
}

export function setLiked(postId: string, liked: boolean, baseLikes: number): void {
  setInteractionState(postId, { liked, baseLikes });
}

export function getFavorited(postId: string, initialCollections: number): { favorited: boolean; displayCount: number } {
  const state = getInteractionState(postId);
  const favorited = state.favorited ?? false;
  const base = state.baseCollections ?? initialCollections;
  const displayCount = favorited ? base + 1 : base;
  return { favorited, displayCount };
}

export function setFavorited(postId: string, favorited: boolean, baseCollections: number): void {
  setInteractionState(postId, { favorited, baseCollections });
}

export async function resolveFavoriteState(
  currentUserId: string | undefined,
  targetType: FavoriteTargetType,
  targetId: string | number | undefined,
  fetchFavoriteState: (userId: string, targetType: FavoriteTargetType, targetId: string | number) => Promise<boolean>,
  fallback = false
): Promise<boolean> {
  if (!currentUserId || targetId === undefined || targetId === null || targetId === '') {
    return fallback;
  }

  try {
    return await fetchFavoriteState(currentUserId, targetType, targetId);
  } catch {
    return fallback;
  }
}


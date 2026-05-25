/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// 互动状态存储（点赞、收藏）
// 存储结构：{ postId: { liked: bool, baseLikes: number, favorited: bool, baseCollections: number } }

const INTERACTION_KEY = 'interaction_states_v1';

interface InteractionState {
  liked?: boolean;
  favorited?: boolean;
  baseLikes?: number;
  baseCollections?: number;
}

export function getInteractionState(postId: string): InteractionState {
  try {
    const saved = JSON.parse(localStorage.getItem(INTERACTION_KEY) || '{}');
    return saved[postId] || {};
  } catch { return {}; }
}

export function setInteractionState(postId: string, state: Partial<InteractionState>): void {
  try {
    const saved = JSON.parse(localStorage.getItem(INTERACTION_KEY) || '{}');
    if (!saved[postId]) {
      saved[postId] = {};
    }
    saved[postId] = { ...saved[postId], ...state };
    localStorage.setItem(INTERACTION_KEY, JSON.stringify(saved));
  } catch {}
}

export function getLiked(postId: string, initialLikes: number): { liked: boolean; displayCount: number } {
  const state = getInteractionState(postId);
  const liked = state.liked ?? false;
  // 如果本地记录了baseLikes用本地，否则用服务端初始值
  const base = state.baseLikes ?? initialLikes;
  // 初始值已经是服务端返回的，如果之前点过赞，服务端不知道，所以要+1
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
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// 点赞状态存储
const LIKE_KEY = 'like_states_v1';

// 收藏状态存储
const FAVORITE_KEY = 'favorite_states_v1';

/**
 * 获取本地存储的点赞状态
 */
export function getLikeState(postId: string): boolean {
  try {
    const saved = JSON.parse(localStorage.getItem(LIKE_KEY) || '{}');
    return saved[postId] ?? false;
  } catch { return false; }
}

/**
 * 设置本地存储的点赞状态
 */
export function setLikeState(postId: string, value: boolean): void {
  try {
    const saved = JSON.parse(localStorage.getItem(LIKE_KEY) || '{}');
    saved[postId] = value;
    localStorage.setItem(LIKE_KEY, JSON.stringify(saved));
  } catch {}
}

/**
 * 获取本地存储的收藏状态
 */
export function getFavoriteState(targetType: string, targetId: string): boolean {
  try {
    const saved = JSON.parse(localStorage.getItem(FAVORITE_KEY) || '{}');
    return saved[`${targetType}_${targetId}`] ?? false;
  } catch { return false; }
}

/**
 * 设置本地存储的收藏状态
 */
export function setFavoriteState(targetType: string, targetId: string, value: boolean): void {
  try {
    const saved = JSON.parse(localStorage.getItem(FAVORITE_KEY) || '{}');
    saved[`${targetType}_${targetId}`] = value;
    localStorage.setItem(FAVORITE_KEY, JSON.stringify(saved));
  } catch {}
}
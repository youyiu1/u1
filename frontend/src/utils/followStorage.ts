/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const FOLLOW_KEY = 'follow_states_v2';

/**
 * 获取本地存储的关注状态
 */
export function getFollowState(key: string): boolean {
  try {
    const saved = JSON.parse(localStorage.getItem(FOLLOW_KEY) || '{}');
    return saved[key] ?? false;
  } catch { return false; }
}

/**
 * 设置本地存储的关注状态
 */
export function setFollowState(key: string, value: boolean): void {
  try {
    const saved = JSON.parse(localStorage.getItem(FOLLOW_KEY) || '{}');
    saved[key] = value;
    localStorage.setItem(FOLLOW_KEY, JSON.stringify(saved));
  } catch {}
}
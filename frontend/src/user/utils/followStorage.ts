/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { readJson, writeJson } from './jsonStorage';

const FOLLOW_KEY = 'follow_states_v2';

/**
 * 获取本地存储的关注状态
 */
export function getFollowState(key: string): boolean {
  const saved = readJson<Record<string, boolean>>(FOLLOW_KEY, {});
  return saved[key] ?? false;
}

/**
 * 设置本地存储的关注状态
 */
export function setFollowState(key: string, value: boolean): void {
  const saved = readJson<Record<string, boolean>>(FOLLOW_KEY, {});
  saved[key] = value;
  writeJson(FOLLOW_KEY, saved);
}

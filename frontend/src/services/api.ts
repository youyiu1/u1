/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Service, Item, Post, Comment } from '../types';

const BASE_URL = '/api';

interface Result<T> {
  success: boolean;
  message: string;
  data: T;
  total: number | null;
}

interface AuthResponse {
  user: User;
  token: string;
}

const TOKEN_KEY = 'auth_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(BASE_URL + url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  const json: Result<T> = await res.json();
  if (!json.success) {
    throw new Error(json.message || 'Request failed');
  }
  return json.data;
}

// 用户相关
export const userApi = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/user/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string) =>
    request<AuthResponse>('/user/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  getUser: (id: string) => request<User>(`/user/${id}`),

  update: (user: Partial<User>) =>
    request<boolean>('/user/update', {
      method: 'POST',
      body: JSON.stringify(user),
    }),

  follow: (followerId: string, followingId: string) =>
    request<boolean>('/user/follow', {
      method: 'POST',
      body: JSON.stringify({ followerId, followingId }),
    }),

  unfollow: (followerId: string, followingId: string) =>
    request<boolean>('/user/unfollow', {
      method: 'POST',
      body: JSON.stringify({ followerId, followingId }),
    }),

  isFollowing: (followerId: string, followingId: string) =>
    request<boolean>(`/user/isfollowing?followerId=${followerId}&followingId=${followingId}`),
};

// 动态/帖子相关
export const newsApi = {
  list: () => request<Post[]>('/news/list'),

  get: (id: number) => request<Post>(`/news/${id}`),

  create: (post: Partial<Post>) =>
    request<boolean>('/news/create', {
      method: 'POST',
      body: JSON.stringify(post),
    }),

  like: (id: number) =>
    request<boolean>(`/news/${id}/like`, { method: 'POST' }),

  getComments: (id: number, limit = 20, offset = 0) =>
    request<Comment[]>(`/news/${id}/comments?limit=${limit}&offset=${offset}`),

  addComment: (id: number, comment: { content: string; userId: string; userName: string; userAvatar: string }) =>
    request<boolean>(`/news/${id}/comment`, {
      method: 'POST',
      body: JSON.stringify(comment),
    }),
};

// 闲置市场相关
export const marketApi = {
  list: () => request<Item[]>('/market/list'),

  get: (id: number) => request<Item>(`/market/${id}`),

  create: (item: Partial<Item>) =>
    request<boolean>('/market/create', {
      method: 'POST',
      body: JSON.stringify(item),
    }),
};

// 服务相关
export const serviceApi = {
  list: () => request<Service[]>('/service/list'),

  get: (id: number) => request<Service>(`/service/${id}`),

  create: (service: Partial<Service>) =>
    request<boolean>('/service/create', {
      method: 'POST',
      body: JSON.stringify(service),
    }),
};

// 首页聚合数据
export const homeApi = {
  index: () => request<{ hotNews: Post[]; hotMarket: Item[]; hotServices: Service[] }>('/home/index'),
};
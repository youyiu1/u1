/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Service, ServiceDetail, Item, Post, Comment, Notification, Category, Review } from '../types';

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

  // Token无效或过期，清除并跳转登录
  if (res.status === 401) {
    window.dispatchEvent(new Event('token-invalid'));
    window.location.href = '/login';
    throw new Error('Token无效，请重新登录');
  }

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

  register: (name: string, email: string, password: string, code: string) =>
    request<AuthResponse>('/user/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, code }),
    }),

  sendCode: (email: string) =>
    request<boolean>('/user/send-code?email=' + encodeURIComponent(email), { method: 'POST' }),

  getUser: (id: string) => request<User>(`/user/${id}`),

  getUserByName: (name: string) => request<User>(`/user/name/${encodeURIComponent(name)}`),

  getCurrentUser: () => request<User>(`/user/profile/current`),

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

  get: (id: number) => request<ServiceDetail>(`/service/${id}`),

  getReviews: (id: number) => request<Review[]>(`/service/${id}/reviews`),

  create: (service: Partial<Service>) =>
    request<boolean>('/service/create', {
      method: 'POST',
      body: JSON.stringify(service),
    }),

  book: (booking: {
    serviceId: number;
    buyerId: string;
    sellerId: string;
    bookingDate: string;
    bookingTime: string;
    duration: number;
  }) =>
    request<boolean>('/service/book', {
      method: 'POST',
      body: JSON.stringify(booking),
    }),
};

// 首页聚合数据
export const homeApi = {
  index: () => request<{ hotNews: Post[]; hotMarket: Item[]; hotServices: Service[] }>('/home/index'),
};

// 通知相关
export const notificationApi = {
  list: (userId: string) => request<Notification[]>(`/notification/list?userId=${userId}`),
  markRead: (id: string) => request<boolean>(`/notification/${id}/read`, { method: 'POST' }),
  markAllRead: (userId: string) => request<boolean>(`/notification/read-all?userId=${userId}`, { method: 'POST' }),
};

// 消息相关
export const chatApi = {
  getConversations: () => request<ChatPartner[]>('/message/conversations'),
  getConversation: (partnerId: string) => request<Message[]>(`/message/conversation/${partnerId}`),
  sendMessage: (receiverId: string, content: string) =>
    request<Message>('/message/send', {
      method: 'POST',
      body: JSON.stringify({ receiverId, content }),
    }),
  markRead: (messageId: string) => request<boolean>(`/message/read/${messageId}`, { method: 'POST' }),
  markConversationRead: (partnerId: string) => request<boolean>(`/message/read-conversation/${partnerId}`, { method: 'POST' }),
};

// 分类相关
export const categoryApi = {
  list: () => request<Category[]>('/category/list'),
};

// 搜索相关
export const searchApi = {
  all: (keyword: string) => request<{ services: Service[]; items: Item[]; posts: Post[] }>(`/search?keyword=${encodeURIComponent(keyword)}`),
};
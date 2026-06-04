/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category, Comment, Item, Message, Notification, Post, Review, Service, ServiceDetail, User } from '../types';
import { removeStoredUser } from '../utils/authStorage';

const BASE_URL = '/api';
const TOKEN_KEY = 'auth_token';
const API_SLOW_THRESHOLD_MS = 600;
const inflightGetRequests = new Map<string, Promise<unknown>>();

let authInvalidated = false;

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

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  未登录: '请先登录',
  Token无效: '登录信息无效，请重新登录',
  Token已过期: '登录已过期，请重新登录',
};

type QueryValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryValue>;
type JsonBodyMethod = 'POST' | 'PUT' | 'DELETE';

function isLocalDevRuntime(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1';
}

function isAuthError(message: string): message is keyof typeof AUTH_ERROR_MESSAGES {
  return message in AUTH_ERROR_MESSAGES;
}

function buildQuery(params: QueryParams): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

function withAuthHeaders(headers?: HeadersInit): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };
}

function logSlowRequest(method: string, url: string, startAt: number) {
  if (!isLocalDevRuntime()) {
    return;
  }
  const endAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const costMs = Math.round(endAt - startAt);
  if (costMs >= API_SLOW_THRESHOLD_MS) {
    console.warn(`[API慢请求] ${method} ${url} ${costMs}ms`);
  }
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    const json = await res.json();
    const message = json.message || '';

    if (isAuthError(message)) {
      if (message !== '未登录') {
        authInvalidated = true;
        removeToken();
        removeStoredUser();
      }
      throw new Error(AUTH_ERROR_MESSAGES[message]);
    }

    throw new Error(message || '认证失败');
  }

  const json: Result<T> = await res.json();
  if (!json.success) {
    throw new Error(json.message || '请求失败');
  }
  return json.data;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const method = options?.method?.toUpperCase() || 'GET';
  const isGetWithoutBody = method === 'GET' && !options?.body;
  const requestKey = isGetWithoutBody ? `${method}:${url}` : '';

  if (authInvalidated && url.startsWith('/favorite/check')) {
    throw new Error('登录已失效');
  }

  if (isGetWithoutBody && inflightGetRequests.has(requestKey)) {
    return inflightGetRequests.get(requestKey) as Promise<T>;
  }

  const doRequest = async () => {
    const startAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const res = await fetch(BASE_URL + url, {
      ...options,
      headers: withAuthHeaders(options?.headers),
    });
    const data = await parseResponse<T>(res);
    logSlowRequest(method, url, startAt);
    return data;
  };

  if (!isGetWithoutBody) {
    return doRequest();
  }

  const promise = doRequest().finally(() => {
    inflightGetRequests.delete(requestKey);
  });
  inflightGetRequests.set(requestKey, promise);
  return promise;
}

function postJson<T>(url: string, body?: unknown) {
  return request<T>(url, {
    method: 'POST',
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function requestWithQuery<T>(path: string, params?: QueryParams) {
  return request<T>(`${path}${params ? buildQuery(params) : ''}`);
}

function mutateJson<T>(method: JsonBodyMethod, path: string, body?: unknown) {
  return request<T>(path, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function postWithQuery<T>(path: string, params?: QueryParams, body?: unknown) {
  return mutateJson<T>('POST', `${path}${params ? buildQuery(params) : ''}`, body);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  authInvalidated = false;
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export const userApi = {
  login: (email: string, password: string) => postJson<AuthResponse>('/user/login', { email, password }),
  register: (name: string, email: string, password: string, code: string) =>
    postJson<AuthResponse>('/user/register', { name, email, password, code }),
  sendCode: (email: string) => postWithQuery<boolean>('/user/send-code', { email }),
  getUser: (id: string) => request<User>(`/user/${id}`),
  getUserByName: (name: string) => request<User>(`/user/name/${encodeURIComponent(name)}`),
  getCurrentUser: () => request<User>('/user/profile/current'),
  update: (user: Partial<User>) => postJson<boolean>('/user/update', user),
  changePassword: (oldPassword: string, newPassword: string) =>
    postJson<boolean>('/user/change-password', { oldPassword, newPassword }),
  updatePrivacy: (settings: { profileVisible?: string; postsVisible?: string; showLocation?: boolean }) =>
    postJson<boolean>('/user/privacy', settings),
  updateNotificationSettings: (settings: {
    pushEnabled?: boolean;
    messageNotify?: boolean;
    followNotify?: boolean;
    likeNotify?: boolean;
    commentNotify?: boolean;
    systemNotify?: boolean;
  }) => postJson<boolean>('/user/notification-settings', settings),
  follow: (followerId: string, followingId: string) => postJson<boolean>('/user/follow', { followerId, followingId }),
  unfollow: (followerId: string, followingId: string) => postJson<boolean>('/user/unfollow', { followerId, followingId }),
  isFollowing: (followerId: string, followingId: string) => requestWithQuery<boolean>('/user/isfollowing', { followerId, followingId }),
  getFollowingList: (userId: string) => request<User[]>(`/user/${userId}/following`),
  getSuggestedUsers: (limit = 5) => requestWithQuery<User[]>('/user/suggested', { limit }),
};

export const newsApi = {
  list: () => request<Post[]>('/news/list'),
  get: (id: string, userId?: string) => requestWithQuery<Post>(`/news/${id}`, { userId }),
  getByUserId: (userId: string) => request<Post[]>(`/news/user/${userId}`),
  create: (post: { title: string; content: string; category: string; images?: string[] | string; location?: string }) =>
    postJson<boolean>('/news/create', post),
  like: (id: string) => postJson<boolean>(`/news/${id}/like`),
  getComments: (id: string, limit = 20, offset = 0, userId?: string) => requestWithQuery<Comment[]>(`/news/${id}/comments`, { limit, offset, userId }),
  addComment: (
    id: string,
    comment: { content: string; userId: string; userName: string; userAvatar: string; parentId?: string }
  ) => postJson<boolean>(`/news/${id}/comment`, comment),
  getTrending: (limit = 5) => requestWithQuery<Post[]>('/news/trending', { limit }),
  delete: (id: string) => postJson<boolean>(`/news/${id}/delete`),
  likeComment: (commentId: string, userId: string) => postWithQuery<boolean>(`/news/comment/${commentId}/like`, { userId }),
};

export const marketApi = {
  list: () => request<Item[]>('/market/list'),
  get: (id: string) => request<Item>(`/market/${id}`),
  getByUserId: (userId: string) => request<Item[]>(`/market/user/${userId}`),
  create: (item: Partial<Item>) => postJson<boolean>('/market/create', item),
};

export const serviceApi = {
  list: (lat?: number, lng?: number) => requestWithQuery<Service[]>('/service/list', { lat, lng }),
  get: (id: string, lat?: number, lng?: number) => requestWithQuery<ServiceDetail>(`/service/${id}`, { lat, lng }),
  getByUserId: (userId: string) => request<Service[]>(`/service/user/${userId}`),
  getReviews: (id: string) => request<Review[]>(`/service/${id}/reviews`),
  create: (service: Partial<Service>) => postJson<boolean>('/service/create', service),
  book: (booking: {
    serviceId: string;
    buyerId: string;
    sellerId: string;
    bookingDate: string;
    bookingTime: string;
    duration: number;
  }) => postJson<boolean>('/service/book', booking),
};

export const homeApi = {
  index: () => request<{ hotNews: Post[]; hotMarket: Item[]; hotServices: Service[] }>('/home/index'),
};

export const notificationApi = {
  list: (userId: string) => requestWithQuery<Notification[]>('/notification/list', { userId }),
  markRead: (id: string) => postJson<boolean>(`/notification/${id}/read`),
  markAllRead: (userId: string) => postWithQuery<boolean>('/notification/read-all', { userId }),
  send: (userId: string, title: string, content: string, serviceName?: string) =>
    postJson<boolean>('/notification/send', { userId, title, content, serviceName }),
  process: (params: {
    notificationId: string;
    accept: boolean;
    buyerId?: string;
    sellerId?: string;
    serviceId?: string;
    serviceTitle?: string;
    price?: string;
    bookingDate?: string;
    bookingTime?: string;
    duration?: number;
  }) => postJson<boolean>('/notification/process', params),
};

export const chatApi = {
  getConversations: () => request<Message[]>('/message/conversations'),
  getConversation: (partnerId: string) => request<Message[]>(`/message/conversation/${partnerId}`),
  sendMessage: (receiverId: string, content: string, messageType = 'text', mediaUrl = '') =>
    postJson<Message>('/message/send', { receiverId, content, messageType, mediaUrl }),
  markRead: (messageId: string) => postJson<boolean>(`/message/read/${messageId}`),
  markConversationRead: (partnerId: string) => postJson<boolean>(`/message/read-conversation/${partnerId}`),
};

export const favoriteApi = {
  list: (userId: string) => requestWithQuery<any[]>('/favorite/list', { userId }),
  add: (userId: string, targetType: string, targetId: string | number) =>
    postJson<boolean>('/favorite/add', { userId, targetType, targetId }),
  remove: (userId: string, targetType: string, targetId: string | number) =>
    postJson<boolean>('/favorite/remove', { userId, targetType, targetId }),
  check: (userId: string, targetType: string, targetId: string | number) => requestWithQuery<boolean>('/favorite/check', { userId, targetType, targetId }),
};

export const categoryApi = {
  list: () => request<Category[]>('/category/list'),
};

export const orderApi = {
  list: (userId: string) => requestWithQuery<any[]>('/order/list', { userId }),
  completedList: (userId: string) => requestWithQuery<any[]>('/order/list/completed', { userId }),
  inProgressList: (userId: string) => requestWithQuery<any[]>('/order/list/in_progress', { userId }),
  get: (id: string) => request<any>(`/order/${id}`),
  confirm: (id: string) => postJson<boolean>(`/order/${id}/confirm`),
  complete: (id: string) => postJson<boolean>(`/order/${id}/complete`),
  cancel: (id: string) => postJson<boolean>(`/order/${id}/cancel`),
};

export const reviewApi = {
  addServiceReview: (
    serviceId: string,
    data: { userId: string; userName: string; userAvatar: string; rating: number; content: string }
  ) => postJson<boolean>(`/service/${serviceId}/review`, data),
  likeReview: (reviewId: string) => postJson<boolean>(`/service/review/${reviewId}/like`),
  unlikeReview: (reviewId: string) => postJson<boolean>(`/service/review/${reviewId}/unlike`),
};

export const searchApi = {
  all: (keyword: string) => requestWithQuery<{ services: Service[]; items: Item[]; posts: Post[] }>('/search', { keyword }),
};

export const fileApi = {
  upload: async (file: File) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${BASE_URL}/file/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.message);
    }
    return json.data as string;
  },
};

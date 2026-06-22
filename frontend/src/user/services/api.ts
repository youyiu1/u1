/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category, Comment, Item, Message, Notification, Post, Review, Service, ServiceDetail, User } from '../types';
import { dispatchAuthStateChange, removeStoredUser } from '../utils/authStorage';
import { readStorageValue, removeStorageValue, writeStorageValue } from '../utils/jsonStorage';

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

export interface PageData<T> {
  data: T;
  total: number;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface CaptchaResponse {
  captchaId: string;
  imageBase64: string;
  expiresInSeconds: number;
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  未登录: '请先登录',
  Token无效: '登录信息无效，请重新登录',
  Token已过期: '登录已过期，请重新登录',
};

const AUTH_FAILURE_TEXTS = new Set([
  '请先登录',
  '登录信息无效，请重新登录',
  '登录已过期，请重新登录',
  '认证失败',
]);

type QueryValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryValue>;
type JsonBodyMethod = 'POST' | 'PUT' | 'DELETE';
type TargetPayload = {
  userId: string;
  targetType: string;
  targetId: string | number;
};

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

export function isAuthFailureMessage(message: string): boolean {
  return AUTH_FAILURE_TEXTS.has(message);
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

function clearInflightGetRequests(): void {
  inflightGetRequests.clear();
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

function invalidateAuthState(requestToken: string | null): void {
  const currentToken = getToken();
  if (requestToken && currentToken && requestToken !== currentToken) {
    return;
  }
  authInvalidated = true;
  removeToken();
  removeStoredUser();
}

async function parseResponse<T>(res: Response, requestToken: string | null): Promise<Result<T>> {
  if (res.status === 401) {
    const json = await res.json();
    const message = json.message || '';

    if (isAuthError(message)) {
      invalidateAuthState(requestToken);
      throw new Error(AUTH_ERROR_MESSAGES[message]);
    }

    invalidateAuthState(requestToken);
    throw new Error(message || '认证失败');
  }

  const json: Result<T> = await res.json();
  if (!json.success) {
    throw new Error(json.message || '请求失败');
  }
  return json;
}

async function requestResult<T>(url: string, options?: RequestInit): Promise<Result<T>> {
  const method = options?.method?.toUpperCase() || 'GET';
  const isGetWithoutBody = method === 'GET' && !options?.body;
  const requestToken = getToken();
  const requestKey = isGetWithoutBody ? `${method}:${url}:token=${requestToken ?? ''}` : '';

  if (authInvalidated && url.startsWith('/favorite/check')) {
    throw new Error('登录已失效');
  }

  if (isGetWithoutBody && inflightGetRequests.has(requestKey)) {
    return inflightGetRequests.get(requestKey) as Promise<Result<T>>;
  }

  const doRequest = async () => {
    const startAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const res = await fetch(BASE_URL + url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(requestToken ? { Authorization: `Bearer ${requestToken}` } : {}),
        ...options?.headers,
      },
    });
    const result = await parseResponse<T>(res, requestToken);
    logSlowRequest(method, url, startAt);
    return result;
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

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const result = await requestResult<T>(url, options);
  return result.data;
}

async function requestPage<T>(url: string, options?: RequestInit): Promise<PageData<T>> {
  const result = await requestResult<T>(url, options);
  return {
    data: result.data,
    total: result.total ?? (Array.isArray(result.data) ? result.data.length : 0),
  };
}

function postJson<T>(url: string, body?: unknown) {
  return request<T>(url, {
    method: 'POST',
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function postFlag(path: string, body?: unknown) {
  return postJson<boolean>(path, body);
}

function requestWithQuery<T>(path: string, params?: QueryParams) {
  return request<T>(`${path}${params ? buildQuery(params) : ''}`);
}

function requestPageWithQuery<T>(path: string, params?: QueryParams) {
  return requestPage<T>(`${path}${params ? buildQuery(params) : ''}`);
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

function buildTargetPayload(userId: string, targetType: string, targetId: string | number): TargetPayload {
  return { userId, targetType, targetId };
}

function postTargetFlag(path: string, userId: string, targetType: string, targetId: string | number) {
  return postFlag(path, buildTargetPayload(userId, targetType, targetId));
}

function queryTargetFlag(path: string, userId: string, targetType: string, targetId: string | number) {
  return requestWithQuery<boolean>(path, buildTargetPayload(userId, targetType, targetId));
}

function queryByUserId<T>(path: string, userId: string) {
  return requestWithQuery<T>(path, { userId });
}

export function getToken(): string | null {
  const sessionToken = readStorageValue(sessionStorage, TOKEN_KEY);
  if (sessionToken) {
    return sessionToken;
  }
  const legacyToken = readStorageValue(localStorage, TOKEN_KEY);
  if (legacyToken) {
    writeStorageValue(sessionStorage, TOKEN_KEY, legacyToken);
    removeStorageValue(localStorage, TOKEN_KEY);
    return legacyToken;
  }
  return null;
}

export function setToken(token: string): void {
  writeStorageValue(sessionStorage, TOKEN_KEY, token);
  removeStorageValue(localStorage, TOKEN_KEY);
  authInvalidated = false;
  clearInflightGetRequests();
}

export function removeToken(): void {
  if (!getToken()) {
    return;
  }
  removeStorageValue(sessionStorage, TOKEN_KEY);
  removeStorageValue(localStorage, TOKEN_KEY);
  clearInflightGetRequests();
  dispatchAuthStateChange();
}

export const userApi = {
  login: (email: string, password: string, captchaId: string, captchaCode: string) =>
    postJson<AuthResponse>('/user/login', { email, password, captchaId, captchaCode }),
  register: (name: string, email: string, password: string, code: string) =>
    postJson<AuthResponse>('/user/register', { name, email, password, code }),
  logout: () => postFlag('/user/logout'),
  getCaptcha: () => request<CaptchaResponse>('/user/captcha-image'),
  sendCode: (email: string) => postWithQuery<boolean>('/user/send-code', { email }),
  resetPassword: (email: string, code: string, newPassword: string) =>
    postFlag('/user/reset-password', { email, code, newPassword }),
  getUser: (id: string) => request<User>(`/user/${id}`),
  getUserByName: (name: string) => request<User>(`/user/name/${encodeURIComponent(name)}`),
  getCurrentUser: () => request<User>('/user/profile/current'),
  update: (user: Partial<User>) => postFlag('/user/update', user),
  changePassword: (oldPassword: string, newPassword: string) =>
    postFlag('/user/change-password', { oldPassword, newPassword }),
  updatePrivacy: (settings: { profileVisible?: string; postsVisible?: string; showLocation?: boolean }) =>
    postFlag('/user/privacy', settings),
  updateNotificationSettings: (settings: {
    pushEnabled?: boolean;
    messageNotify?: boolean;
    followNotify?: boolean;
    likeNotify?: boolean;
    commentNotify?: boolean;
    systemNotify?: boolean;
  }) => postFlag('/user/notification-settings', settings),
  follow: (followerId: string, followingId: string) => postFlag('/user/follow', { followerId, followingId }),
  unfollow: (followerId: string, followingId: string) => postFlag('/user/unfollow', { followerId, followingId }),
  isFollowing: (followingId: string) => requestWithQuery<boolean>('/user/isfollowing', { followingId }),
  getFollowingList: (userId: string) => request<User[]>(`/user/${userId}/following`),
  getSuggestedUsers: (limit = 5) => requestWithQuery<User[]>('/user/suggested', { limit }),
};

export const newsApi = {
  list: (pageNum = 1, pageSize = 10) => requestPageWithQuery<Post[]>('/news/list', { pageNum, pageSize }),
  get: (id: string, userId?: string) => requestWithQuery<Post>(`/news/${id}`, { userId }),
  getByUserId: (userId: string) => request<Post[]>(`/news/user/${userId}`),
  create: (post: { title: string; content: string; category: string; images?: string[] | string; location?: string }) =>
    postFlag('/news/create', post),
  like: (id: string) => postFlag(`/news/${id}/like`),
  getComments: (id: string, limit = 20, offset = 0, userId?: string) => requestWithQuery<Comment[]>(`/news/${id}/comments`, { limit, offset, userId }),
  addComment: (
    id: string,
    comment: { content: string; userId: string; userName: string; userAvatar: string; parentId?: string }
  ) => postFlag(`/news/${id}/comment`, comment),
  getTrending: (limit = 5) => requestWithQuery<Post[]>('/news/trending', { limit }),
  delete: (id: string) => postFlag(`/news/${id}/delete`),
  likeComment: (commentId: string, userId: string) => postWithQuery<boolean>(`/news/comment/${commentId}/like`, { userId }),
};

export const marketApi = {
  list: (params?: { category?: string; keyword?: string; pageNum?: number; pageSize?: number }) =>
    requestPageWithQuery<Item[]>('/market/list', params),
  get: (id: string) => request<Item>(`/market/${id}`),
  getByUserId: (userId: string) => request<Item[]>(`/market/user/${userId}`),
  create: (item: Partial<Item>) => postFlag('/market/create', item),
  purchase: (itemId: string) => postFlag('/market/purchase', { itemId }),
};

export const serviceApi = {
  list: (params?: { category?: string; keyword?: string; lat?: number; lng?: number; pageNum?: number; pageSize?: number }) =>
    requestPageWithQuery<Service[]>('/service/list', params),
  get: (id: string, lat?: number, lng?: number) => requestWithQuery<ServiceDetail>(`/service/${id}`, { lat, lng }),
  getByUserId: (userId: string) => request<Service[]>(`/service/user/${userId}`),
  getReviews: (id: string) => request<Review[]>(`/service/${id}/reviews`),
  getBookingStatus: (id: string) => request<boolean>(`/service/${id}/booking-status`),
  create: (service: Partial<Service>) => postFlag('/service/create', service),
  book: (booking: {
    serviceId: string;
    buyerId: string;
    sellerId: string;
    bookingDate: string;
    bookingTime: string;
    duration: number;
  }) => postFlag('/service/book', booking),
};

export const homeApi = {
  index: () => request<{ hotNews: Post[]; hotMarket: Item[]; hotServices: Service[] }>('/home/index'),
};

export const notificationApi = {
  list: (userId: string) => requestWithQuery<Notification[]>('/notification/list', { userId }),
  markRead: (id: string) => postFlag(`/notification/${id}/read`),
  markAllRead: (userId: string) => postWithQuery<boolean>('/notification/read-all', { userId }),
  send: (userId: string, title: string, content: string, serviceName?: string) =>
    postFlag('/notification/send', { userId, title, content, serviceName }),
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
  }) => postFlag('/notification/process', params),
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
  list: (userId: string) => queryByUserId<any[]>('/favorite/list', userId),
  add: (userId: string, targetType: string, targetId: string | number) => postTargetFlag('/favorite/add', userId, targetType, targetId),
  remove: (userId: string, targetType: string, targetId: string | number) => postTargetFlag('/favorite/remove', userId, targetType, targetId),
  check: (userId: string, targetType: string, targetId: string | number) => queryTargetFlag('/favorite/check', userId, targetType, targetId),
};

export const categoryApi = {
  list: () => request<Category[]>('/category/list'),
};

export const orderApi = {
  list: (userId: string) => queryByUserId<any[]>('/order/list', userId),
  completedList: (userId: string) => queryByUserId<any[]>('/order/list/completed', userId),
  inProgressList: (userId: string) => queryByUserId<any[]>('/order/list/in_progress', userId),
  get: (id: string) => request<any>(`/order/${id}`),
  confirm: (id: string) => postFlag(`/order/${id}/confirm`),
  complete: (id: string) => postFlag(`/order/${id}/complete`),
  cancel: (id: string) => postFlag(`/order/${id}/cancel`),
};

export const reviewApi = {
  addServiceReview: (
    serviceId: string,
    data: { userId: string; userName: string; userAvatar: string; rating: number; content: string }
  ) => postFlag(`/service/${serviceId}/review`, data),
  likeReview: (reviewId: string) => postFlag(`/service/review/${reviewId}/like`),
  unlikeReview: (reviewId: string) => postFlag(`/service/review/${reviewId}/unlike`),
};

export const searchApi = {
  all: (keyword: string) => requestWithQuery<{ services: Service[]; items: Item[]; posts: Post[] }>('/search', { keyword }),
};

export const aiApi = {
  chat: (message: string, systemPrompt?: string) => postJson<string>('/ai/chat', { message, systemPrompt }),
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

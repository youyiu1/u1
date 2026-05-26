/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Service, ServiceDetail, Item, Post, Comment, Notification, Category, Review, Message } from '../types';

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

// 401错误区分处理
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  '未登录': '请先登录',
  'Token无效': '登录信息无效，请重新登录',
  'Token已过期': '登录已过期，请重新登录'
};

function isAuthError(message: string): message is keyof typeof AUTH_ERROR_MESSAGES {
  return message in AUTH_ERROR_MESSAGES;
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

  // 401错误根据消息内容区分处理
  if (res.status === 401) {
    const json = await res.json();
    const message = json.message || '';
    if (isAuthError(message)) {
      // Token无效或已过期时自动登出
      if (message !== '未登录') {
        removeToken();
        localStorage.removeItem('auth_user');
      }
      throw new Error(AUTH_ERROR_MESSAGES[message]);
    }
    throw new Error(message || '认证失败');
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

  changePassword: (oldPassword: string, newPassword: string) =>
    request<boolean>('/user/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
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

  getFollowingList: (userId: string) => request<User[]>(`/user/${userId}/following`),

  getSuggestedUsers: (limit = 5) => request<User[]>(`/user/suggested?limit=${limit}`),
};

// 动态/帖子相关
export const newsApi = {
  list: () => request<Post[]>('/news/list'),

  get: (id: string) => request<Post>(`/news/${id}`),

  getByUserId: (userId: string) => request<Post[]>(`/news/user/${userId}`),

  create: (post: { title: string; content: string; category: string; images?: string[]; location?: string }) =>
    request<boolean>('/news/create', {
      method: 'POST',
      body: JSON.stringify(post),
    }),

  like: (id: string) =>
    request<boolean>(`/news/${id}/like`, { method: 'POST' }),

  getComments: (id: string, limit = 20, offset = 0) =>
    request<Comment[]>(`/news/${id}/comments?limit=${limit}&offset=${offset}`),

  addComment: (id: string, comment: { content: string; userId: string; userName: string; userAvatar: string }) =>
    request<boolean>(`/news/${id}/comment`, {
      method: 'POST',
      body: JSON.stringify(comment),
    }),

  getTrending: (limit = 5) => request<Post[]>(`/news/trending?limit=${limit}`),

  delete: (id: string) =>
    request<boolean>(`/news/${id}/delete`, { method: 'POST' }),
};

// 闲置市场相关
export const marketApi = {
  list: () => request<Item[]>('/market/list'),

  get: (id: string) => request<Item>(`/market/${id}`),

  getByUserId: (userId: string) => request<Item[]>(`/market/user/${userId}`),

  create: (item: Partial<Item>) =>
    request<boolean>('/market/create', {
      method: 'POST',
      body: JSON.stringify(item),
    }),
};

// 服务相关
export const serviceApi = {
  list: () => request<Service[]>('/service/list'),

  get: (id: string) => request<ServiceDetail>(`/service/${id}`),

  getByUserId: (userId: string) => request<Service[]>(`/service/user/${userId}`),

  getReviews: (id: string) => request<Review[]>(`/service/${id}/reviews`),

  create: (service: Partial<Service>) =>
    request<boolean>('/service/create', {
      method: 'POST',
      body: JSON.stringify(service),
    }),

  book: (booking: {
    serviceId: string;
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
  getConversations: () => request<Message[]>('/message/conversations'),
  getConversation: (partnerId: string) => request<Message[]>(`/message/conversation/${partnerId}`),
  sendMessage: (receiverId: string, content: string) =>
    request<Message>('/message/send', {
      method: 'POST',
      body: JSON.stringify({ receiverId, content }),
    }),
  markRead: (messageId: string) => request<boolean>(`/message/read/${messageId}`, { method: 'POST' }),
  markConversationRead: (partnerId: string) => request<boolean>(`/message/read-conversation/${partnerId}`, { method: 'POST' }),
};

// 收藏相关
export const favoriteApi = {
  list: (userId: string) => request<any[]>(`/favorite/list?userId=${userId}`),
  add: (userId: string, targetType: string, targetId: string) =>
    request<boolean>('/favorite/add', {
      method: 'POST',
      body: JSON.stringify({ userId, targetType, targetId }),
    }),
  remove: (userId: string, targetType: string, targetId: string) =>
    request<boolean>('/favorite/remove', {
      method: 'POST',
      body: JSON.stringify({ userId, targetType, targetId }),
    }),
  check: (userId: string, targetType: string, targetId: string) =>
    request<boolean>(`/favorite/check?userId=${userId}&targetType=${targetType}&targetId=${targetId}`),
};

// 分类相关
export const categoryApi = {
  list: () => request<Category[]>('/category/list'),
};

// 搜索相关
export const searchApi = {
  all: (keyword: string) => request<{ services: Service[]; items: Item[]; posts: Post[] }>(`/search?keyword=${encodeURIComponent(keyword)}`),
};

// 文件上传 - 直接请求后端，绕过Vite代理（代理处理multipart有问题）
export const fileApi = {
  upload: (file: File) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);
    // 绕过代理，直接请求后端8080
    return fetch('http://localhost:8080/api/file/upload', {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    }).then(res => res.json()).then(json => {
      if (!json.success) throw new Error(json.message);
      return json.data as string;
    });
  },
};
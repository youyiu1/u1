/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  User,
  Dynamic,
  Goods,
  Service,
  Order,
  CategoryItem,
  NotificationItem,
  DashboardStats,
  ManagedComment,
  BlacklistItem,
  ManagedImage,
  ManagedMessage,
  LoginLogItem,
  OperationLogItem,
  SystemMenu,
  SystemRole,
  SystemPermission,
} from '../types';
import {
  readStorageJson,
  readStorageValue,
  removeStorageItems,
  writeStorageJson,
  writeStorageValue,
} from '../../user/utils/jsonStorage';

export interface Result<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  total: number | null;
  code?: number;
  msg?: string;
}

export interface AdminSessionResponse {
  token: string;
  username: string;
  adminRole: string;
  readonly: string;
  permissionCodes: string[];
  menuIds: string[];
}

interface CaptchaResponse {
  captchaId: string;
  imageBase64: string;
  expiresInSeconds: number;
}

const BASE_URL = '/api/admin';
const TOKEN_KEY = 'admin_token';
const USERNAME_KEY = 'admin_username';
const ROLE_KEY = 'admin_role';
const READONLY_KEY = 'admin_readonly';
const PERMISSIONS_KEY = 'admin_permissions';
const SESSION_STORAGE_KEYS = [TOKEN_KEY, USERNAME_KEY, ROLE_KEY, READONLY_KEY, PERMISSIONS_KEY] as const;

type AdminHttpMethod = 'GET' | 'POST' | 'DELETE';
type AdminStatus = 'success' | 'failed';
type AdminStatusPayload = { status: string; rejectReason?: string };

function headers(): HeadersInit {
  const token = readStorageValue(localStorage, TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<Result<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      ...headers(),
      ...init?.headers,
    },
  });
  const json = await res.json();
  return {
    ...json,
    code: json.success ? 200 : res.status,
    msg: json.message,
  } as Result<T>;
}

function adminRequest<T>(path: string, method: AdminHttpMethod = 'GET', body?: unknown): Promise<Result<T>> {
  return request<T>(path, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function get<T>(path: string) {
  return adminRequest<T>(path);
}

function post<T>(path: string, body?: unknown) {
  return adminRequest<T>(path, 'POST', body);
}

function remove<T>(path: string, body?: unknown) {
  return adminRequest<T>(path, 'DELETE', body);
}

function postById<T>(resource: string, id: string, action: string, body?: unknown) {
  return post<T>(`/${resource}/${id}/${action}`, body);
}

function removeById<T>(resource: string, id: string) {
  return remove<T>(`/${resource}/${id}`);
}

function postStatus<T>(path: string, status: string, rejectReason?: string) {
  const payload: AdminStatusPayload = { status };
  if (rejectReason) {
    payload.rejectReason = rejectReason;
  }
  return post<T>(path, payload);
}

function setAuth(token: string, username: string) {
  writeStorageValue(localStorage, TOKEN_KEY, token);
  writeStorageValue(localStorage, USERNAME_KEY, username);
}

function setSessionMeta(data: Partial<AdminSessionResponse>) {
  writeStorageValue(localStorage, ROLE_KEY, data.adminRole || 'USER');
  writeStorageValue(localStorage, READONLY_KEY, data.readonly || 'false');
  writeStorageJson(localStorage, PERMISSIONS_KEY, data.permissionCodes || []);
}

function clearAuth() {
  removeStorageItems(localStorage, SESSION_STORAGE_KEYS);
}

function successResult<T>(data: T): Result<T> {
  return { success: true, message: 'success', data, total: null, code: 200, msg: 'success' };
}

export const adminApi = {
  async login(username: string, password: string, captchaId: string, captchaCode: string): Promise<Result<AdminSessionResponse>> {
    const res = await post<AdminSessionResponse>('/login', { username, password, captchaId, captchaCode });
    if (res.success && res.data?.token) {
      setAuth(res.data.token, res.data.username || username);
      setSessionMeta(res.data);
    }
    return res;
  },

  async getCaptcha(): Promise<Result<CaptchaResponse>> {
    return get<CaptchaResponse>('/captcha-image');
  },

  async logout(): Promise<Result<void>> {
    try {
      if (readStorageValue(localStorage, TOKEN_KEY)) {
        await post<void>('/logout');
      }
    } finally {
      clearAuth();
    }
    return successResult(undefined);
  },

  async getAdminInfo(): Promise<Result<Omit<AdminSessionResponse, 'token'>>> {
    const res = await get<Omit<AdminSessionResponse, 'token'>>('/me');
    if (res.success && res.data) {
      setSessionMeta(res.data);
    }
    return res;
  },

  getStoredAdminRole(): string {
    return readStorageValue(localStorage, ROLE_KEY) || 'USER';
  },

  getStoredUsername(): string {
    return readStorageValue(localStorage, USERNAME_KEY) || 'admin';
  },

  hasStoredSession(): boolean {
    return Boolean(readStorageValue(localStorage, TOKEN_KEY));
  },

  isReadonlyAdmin(): boolean {
    return readStorageValue(localStorage, READONLY_KEY) === 'true';
  },

  getStoredPermissionCodes(): string[] {
    return readStorageJson<string[]>(localStorage, PERMISSIONS_KEY, []);
  },

  async getDashboardStats(): Promise<Result<DashboardStats>> {
    return get<DashboardStats>('/dashboard/stats');
  },

  async getUsers(): Promise<Result<User[]>> {
    return get<User[]>('/users');
  },

  async updateUserStatus(id: string, status: 'normal' | 'disabled'): Promise<Result<void>> {
    return postById<void>('users', id, 'status', { status });
  },

  async updateUserVerified(id: string, verified: 'verified' | 'unverified'): Promise<Result<void>> {
    return postById<void>('users', id, 'verified', { verified });
  },

  async updateUserAdminRole(id: string, adminRole: 'USER' | 'READONLY_ADMIN' | 'ADMIN' | 'SUPER_ADMIN'): Promise<Result<void>> {
    return postById<void>('users', id, 'admin-role', { adminRole });
  },

  async getDynamics(): Promise<Result<Dynamic[]>> {
    return get<Dynamic[]>('/dynamics');
  },

  async updateDynamicStatus(id: string, status: 'pending' | 'normal' | 'removed', rejectReason?: string): Promise<Result<void>> {
    return postStatus<void>(`/dynamics/${id}/status`, status, rejectReason);
  },

  async addComment(dynId: string, commenter: string, text: string): Promise<Result<void>> {
    return post<void>(`/dynamics/${dynId}/comments`, { commenter, text });
  },

  async deleteComment(dynId: string, commentId: string): Promise<Result<void>> {
    return remove<void>(`/dynamics/${dynId}/comments/${commentId}`);
  },

  async getGoods(): Promise<Result<Goods[]>> {
    return get<Goods[]>('/goods');
  },

  async updateGoodsStatus(id: string, status: 'active' | 'sold' | 'removed' | 'pending', rejectReason?: string): Promise<Result<void>> {
    return postStatus<void>(`/goods/${id}/status`, status, rejectReason);
  },

  async getServices(): Promise<Result<Service[]>> {
    return get<Service[]>('/services');
  },

  async updateServiceStatus(id: string, status: 'pending' | 'active' | 'rejected', rejectReason?: string): Promise<Result<void>> {
    return postStatus<void>(`/services/${id}/status`, status, rejectReason);
  },

  async addNewService(srv: Partial<Service>): Promise<Result<void>> {
    return post<void>('/services', srv);
  },

  async getOrders(): Promise<Result<Order[]>> {
    return get<Order[]>('/orders');
  },

  async forceCancelOrder(id: string, reason: string): Promise<Result<void>> {
    return postById<void>('orders', id, 'cancel', { reason });
  },

  async getCategories(): Promise<Result<CategoryItem[]>> {
    return get<CategoryItem[]>('/categories');
  },

  async toggleCategoryStatus(id: string): Promise<Result<void>> {
    return postById<void>('categories', id, 'toggle');
  },

  async addCategory(name: string, type: 'dynamic' | 'goods' | 'service'): Promise<Result<void>> {
    return post<void>('/categories', { name, type });
  },

  async getNotifications(): Promise<Result<NotificationItem[]>> {
    return get<NotificationItem[]>('/notifications');
  },

  async toggleNotificationRead(id: string): Promise<Result<void>> {
    return postById<void>('notifications', id, 'toggle');
  },

  async addNotification(title: string, content: string, target: 'all' | 'specific', isScheduled: boolean): Promise<Result<void>> {
    return post<void>('/notifications', { title, content, target, isScheduled });
  },

  async getManagedComments(): Promise<Result<ManagedComment[]>> {
    return get<ManagedComment[]>('/comments');
  },

  async updateCommentStatus(id: string, status: 'pending' | 'normal' | 'flagged' | 'hidden'): Promise<Result<void>> {
    return postStatus<void>(`/comments/${id}/status`, status);
  },

  async deleteManagedComment(id: string): Promise<Result<void>> {
    return removeById<void>('comments', id);
  },

  async getBlacklist(): Promise<Result<BlacklistItem[]>> {
    return get<BlacklistItem[]>('/blacklist');
  },

  async addBlacklist(targetType: 'user' | 'keyword' | 'ip', targetValue: string, reason: string, creator: string): Promise<Result<void>> {
    return post<void>('/blacklist', { targetType, targetValue, reason, creator });
  },

  async deleteBlacklist(id: string): Promise<Result<void>> {
    return removeById<void>('blacklist', id);
  },

  async getImages(): Promise<Result<ManagedImage[]>> {
    return get<ManagedImage[]>('/images');
  },

  async getMessages(): Promise<Result<ManagedMessage[]>> {
    return get<ManagedMessage[]>('/messages');
  },

  async markMessageRead(id: string): Promise<Result<void>> {
    return postById<void>('messages', id, 'read');
  },

  async deleteMessage(id: string): Promise<Result<void>> {
    return removeById<void>('messages', id);
  },

  async updateImageStatus(id: string, status: 'approved' | 'pending' | 'flagged'): Promise<Result<void>> {
    return post<void>('/images/status', { imageUrl: id, status });
  },

  async deleteImage(id: string): Promise<Result<void>> {
    return remove<void>('/images', { imageUrl: id });
  },

  async getLoginLogs(): Promise<Result<LoginLogItem[]>> {
    return get<LoginLogItem[]>('/login-logs');
  },

  async getOperationLogs(): Promise<Result<OperationLogItem[]>> {
    return get<OperationLogItem[]>('/operation-logs');
  },

  async addOperationLog(operator: string, role: string, action: string, target: string, ip: string, status: AdminStatus, details?: string): Promise<Result<void>> {
    return post<void>('/operation-logs', { operator, role, action, target, ip, status, details });
  },

  async updateOperationLogRetention(policy: string): Promise<Result<{ cleanedCount: number; logs: OperationLogItem[] }>> {
    return post<{ cleanedCount: number; logs: OperationLogItem[] }>('/operation-logs/retention', { policy });
  },

  async getMenus(): Promise<Result<SystemMenu[]>> {
    return get<SystemMenu[]>('/menus');
  },

  async getRoles(): Promise<Result<SystemRole[]>> {
    return get<SystemRole[]>('/roles');
  },

  async updateRole(id: string, payload: Partial<SystemRole>): Promise<Result<void>> {
    return post<void>(`/roles/${id}`, payload);
  },

  async getPermissions(): Promise<Result<SystemPermission[]>> {
    return get<SystemPermission[]>('/permissions');
  },
};

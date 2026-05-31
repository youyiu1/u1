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
  LoginLogItem,
  OperationLogItem,
  SystemMenu,
  SystemRole,
  SystemPermission,
} from '../types';

export interface Result<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  total: number | null;
  code?: number;
  msg?: string;
}

export interface AdminLoginResponse {
  token: string;
  username: string;
  adminRole: string;
  readonly: string;
}

const BASE_URL = '/api/admin';
const TOKEN_KEY = 'admin_token';
const USERNAME_KEY = 'admin_username';
const ROLE_KEY = 'admin_role';
const READONLY_KEY = 'admin_readonly';

function headers(): HeadersInit {
  const token = localStorage.getItem(TOKEN_KEY);
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

function setAuth(token: string, username: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USERNAME_KEY, username);
}

function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(READONLY_KEY);
}

export const adminApi = {
  async login(username: string, password: string): Promise<Result<AdminLoginResponse>> {
    const res = await request<AdminLoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (res.success && res.data?.token) {
      setAuth(res.data.token, res.data.username || username);
      localStorage.setItem(ROLE_KEY, res.data.adminRole || 'USER');
      localStorage.setItem(READONLY_KEY, res.data.readonly || 'false');
    }
    return res;
  },

  async logout(): Promise<Result<void>> {
    clearAuth();
    return { success: true, message: 'success', data: undefined, total: null, code: 200, msg: 'success' };
  },

  async getAdminInfo(): Promise<Result<{ username: string }>> {
    return request<{ username: string }>('/me');
  },

  getStoredAdminRole(): string {
    return localStorage.getItem(ROLE_KEY) || 'USER';
  },

  isReadonlyAdmin(): boolean {
    return localStorage.getItem(READONLY_KEY) === 'true';
  },

  async getDashboardStats(): Promise<Result<DashboardStats>> {
    return request<DashboardStats>('/dashboard/stats');
  },

  async getUsers(): Promise<Result<User[]>> {
    return request<User[]>('/users');
  },

  async updateUserStatus(id: string, status: 'normal' | 'disabled'): Promise<Result<void>> {
    return request<void>(`/users/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  },

  async updateUserVerified(id: string, verified: 'verified' | 'unverified'): Promise<Result<void>> {
    return request<void>(`/users/${id}/verified`, {
      method: 'POST',
      body: JSON.stringify({ verified }),
    });
  },

  async updateUserAdminRole(id: string, adminRole: 'USER' | 'READONLY_ADMIN' | 'SUPER_ADMIN'): Promise<Result<void>> {
    return request<void>(`/users/${id}/admin-role`, {
      method: 'POST',
      body: JSON.stringify({ adminRole }),
    });
  },

  async getDynamics(): Promise<Result<Dynamic[]>> {
    return request<Dynamic[]>('/dynamics');
  },

  async updateDynamicStatus(id: string, status: 'pending' | 'normal' | 'removed', rejectReason?: string): Promise<Result<void>> {
    return request<void>(`/dynamics/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, rejectReason }),
    });
  },

  async addComment(dynId: string, commenter: string, text: string): Promise<Result<void>> {
    return request<void>(`/dynamics/${dynId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ commenter, text }),
    });
  },

  async deleteComment(dynId: string, commentId: string): Promise<Result<void>> {
    return request<void>(`/dynamics/${dynId}/comments/${commentId}`, {
      method: 'DELETE',
    });
  },

  async getGoods(): Promise<Result<Goods[]>> {
    return request<Goods[]>('/goods');
  },

  async updateGoodsStatus(id: string, status: 'active' | 'sold' | 'removed' | 'pending', rejectReason?: string): Promise<Result<void>> {
    return request<void>(`/goods/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, rejectReason }),
    });
  },

  async getServices(): Promise<Result<Service[]>> {
    return request<Service[]>('/services');
  },

  async updateServiceStatus(id: string, status: 'pending' | 'active' | 'rejected', rejectReason?: string): Promise<Result<void>> {
    return request<void>(`/services/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, rejectReason }),
    });
  },

  async addNewService(srv: Service): Promise<Result<void>> {
    return request<void>('/services', {
      method: 'POST',
      body: JSON.stringify(srv),
    });
  },

  async getOrders(): Promise<Result<Order[]>> {
    return request<Order[]>('/orders');
  },

  async forceCancelOrder(id: string, reason: string): Promise<Result<void>> {
    return request<void>(`/orders/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async getCategories(): Promise<Result<CategoryItem[]>> {
    return request<CategoryItem[]>('/categories');
  },

  async toggleCategoryStatus(id: string): Promise<Result<void>> {
    return request<void>(`/categories/${id}/toggle`, { method: 'POST' });
  },

  async addCategory(name: string, type: 'dynamic' | 'goods' | 'service'): Promise<Result<void>> {
    return request<void>('/categories', {
      method: 'POST',
      body: JSON.stringify({ name, type }),
    });
  },

  async getNotifications(): Promise<Result<NotificationItem[]>> {
    return request<NotificationItem[]>('/notifications');
  },

  async toggleNotificationRead(id: string): Promise<Result<void>> {
    return request<void>(`/notifications/${id}/toggle`, { method: 'POST' });
  },

  async addNotification(title: string, content: string, target: 'all' | 'specific', isScheduled: boolean): Promise<Result<void>> {
    return request<void>('/notifications', {
      method: 'POST',
      body: JSON.stringify({ title, content, target, isScheduled }),
    });
  },

  async getManagedComments(): Promise<Result<ManagedComment[]>> {
    return request<ManagedComment[]>('/comments');
  },

  async updateCommentStatus(id: string, status: 'pending' | 'normal' | 'flagged' | 'hidden'): Promise<Result<void>> {
    return request<void>(`/comments/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  },

  async deleteManagedComment(id: string): Promise<Result<void>> {
    return request<void>(`/comments/${id}`, { method: 'DELETE' });
  },

  async getBlacklist(): Promise<Result<BlacklistItem[]>> {
    return request<BlacklistItem[]>('/blacklist');
  },

  async addBlacklist(targetType: 'user' | 'keyword' | 'ip', targetValue: string, reason: string, creator: string): Promise<Result<void>> {
    return request<void>('/blacklist', {
      method: 'POST',
      body: JSON.stringify({ targetType, targetValue, reason, creator }),
    });
  },

  async deleteBlacklist(id: string): Promise<Result<void>> {
    return request<void>(`/blacklist/${id}`, { method: 'DELETE' });
  },

  async getImages(): Promise<Result<ManagedImage[]>> {
    return request<ManagedImage[]>('/images');
  },

  async updateImageStatus(id: string, status: 'approved' | 'pending' | 'flagged'): Promise<Result<void>> {
    return request<void>(`/images/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  },

  async deleteImage(id: string): Promise<Result<void>> {
    return request<void>(`/images/${id}`, { method: 'DELETE' });
  },

  async getLoginLogs(): Promise<Result<LoginLogItem[]>> {
    return request<LoginLogItem[]>('/login-logs');
  },

  async getOperationLogs(): Promise<Result<OperationLogItem[]>> {
    return request<OperationLogItem[]>('/operation-logs');
  },

  async addOperationLog(operator: string, role: string, action: string, target: string, ip: string, status: 'success' | 'failed', details?: string): Promise<Result<void>> {
    return request<void>('/operation-logs', {
      method: 'POST',
      body: JSON.stringify({ operator, role, action, target, ip, status, details }),
    });
  },

  async updateOperationLogRetention(policy: string): Promise<Result<{ cleanedCount: number; logs: OperationLogItem[] }>> {
    return request<{ cleanedCount: number; logs: OperationLogItem[] }>('/operation-logs/retention', {
      method: 'POST',
      body: JSON.stringify({ policy }),
    });
  },

  async getMenus(): Promise<Result<SystemMenu[]>> {
    return request<SystemMenu[]>('/menus');
  },

  async getRoles(): Promise<Result<SystemRole[]>> {
    return request<SystemRole[]>('/roles');
  },

  async getPermissions(): Promise<Result<SystemPermission[]>> {
    return request<SystemPermission[]>('/permissions');
  },
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Dynamic, Goods, Service, Order, CategoryItem, NotificationItem, DashboardStats, ManagedComment, BlacklistItem, ManagedImage, LoginLogItem, OperationLogItem } from '../types';
import {
  INITIAL_DASHBOARD_STATS,
  INITIAL_USERS,
  INITIAL_DYNAMICS,
  INITIAL_GOODS,
  INITIAL_SERVICES,
  INITIAL_ORDERS,
  INITIAL_CATEGORIES,
  INITIAL_NOTIFICATIONS,
  INITIAL_MANAGED_COMMENTS,
  INITIAL_BLACKLIST,
  INITIAL_IMAGES,
  INITIAL_LOGIN_LOGS,
  INITIAL_OP_LOGS
} from '../mockData';

export interface Result<T = any> {
  code: number;
  msg: string;
  data: T;
}

// Low-level helper to mock delayed responses & authenticate requests with standard local Storage JWTs
function simulateAPI<T>(data: T, delayMs = 300): Promise<Result<T>> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Check for token existence
      const token = localStorage.getItem('admin_token');
      if (!token) {
        resolve({
          code: 401,
          msg: '登录凭证已过期或未登录，请重新登录认证',
          data: null as any
        });
        return;
      }
      resolve({
        code: 200,
        msg: '操作成功',
        data
      });
    }, delayMs);
  });
}

// Key indexes for browser persistent memory database
const KEYS = {
  STATS: 'leju_stats',
  USERS: 'leju_users',
  DYNAMICS: 'leju_dynamics',
  GOODS: 'leju_goods',
  SERVICES: 'leju_services',
  ORDERS: 'leju_orders',
  CATEGORIES: 'leju_categories',
  NOTIFICATIONS: 'leju_notifications',
  MANAGED_COMMENTS: 'leju_managed_comments',
  BLACKLIST: 'leju_blacklist',
  IMAGES: 'leju_images',
  LOGIN_LOGS: 'leju_login_logs',
  OP_LOGS: 'leju_op_logs'
};

// Initialize DB if not present
function initPersistence() {
  if (!localStorage.getItem(KEYS.STATS)) {
    localStorage.setItem(KEYS.STATS, JSON.stringify(INITIAL_DASHBOARD_STATS));
  }
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(KEYS.DYNAMICS)) {
    localStorage.setItem(KEYS.DYNAMICS, JSON.stringify(INITIAL_DYNAMICS));
  }
  if (!localStorage.getItem(KEYS.GOODS)) {
    localStorage.setItem(KEYS.GOODS, JSON.stringify(INITIAL_GOODS));
  }
  if (!localStorage.getItem(KEYS.SERVICES)) {
    localStorage.setItem(KEYS.SERVICES, JSON.stringify(INITIAL_SERVICES));
  }
  if (!localStorage.getItem(KEYS.ORDERS)) {
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  }
  if (!localStorage.getItem(KEYS.CATEGORIES)) {
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  }
  if (!localStorage.getItem(KEYS.NOTIFICATIONS)) {
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  }
  if (!localStorage.getItem(KEYS.MANAGED_COMMENTS)) {
    localStorage.setItem(KEYS.MANAGED_COMMENTS, JSON.stringify(INITIAL_MANAGED_COMMENTS));
  }
  if (!localStorage.getItem(KEYS.BLACKLIST)) {
    localStorage.setItem(KEYS.BLACKLIST, JSON.stringify(INITIAL_BLACKLIST));
  }
  if (!localStorage.getItem(KEYS.IMAGES)) {
    localStorage.setItem(KEYS.IMAGES, JSON.stringify(INITIAL_IMAGES));
  }
  if (!localStorage.getItem(KEYS.LOGIN_LOGS)) {
    localStorage.setItem(KEYS.LOGIN_LOGS, JSON.stringify(INITIAL_LOGIN_LOGS));
  }
  if (!localStorage.getItem(KEYS.OP_LOGS)) {
    localStorage.setItem(KEYS.OP_LOGS, JSON.stringify(INITIAL_OP_LOGS));
  }
}

// Auto fire on load
initPersistence();

// Helper updates
function getLocal<T>(key: string): T {
  return JSON.parse(localStorage.getItem(key) || '[]');
}

function setLocal(key: string, val: any) {
  localStorage.setItem(key, JSON.stringify(val));
}

export const adminApi = {
  // 1. Auth Module
  async login(username: string, password: string): Promise<Result<{ token: string; username: string }>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (username.trim() === 'admin' && password === '123456') {
          const mockToken = 'mock_jwt_token_header_secret_bearer_leju_' + Date.now();
          localStorage.setItem('admin_token', mockToken);
          localStorage.setItem('admin_username', username);
          resolve({
            code: 200,
            msg: '登录成功',
            data: { token: mockToken, username }
          });
        } else {
          resolve({
            code: 400,
            msg: '账号或密码不正确（Demo账号：admin，密码：123456）',
            data: null as any
          });
        }
      }, 800);
    });
  },

  async logout(): Promise<Result<void>> {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    return {
      code: 200,
      msg: '登出成功',
      data: undefined
    };
  },

  async getAdminInfo(): Promise<Result<{ username: string }>> {
    const token = localStorage.getItem('admin_token');
    const username = localStorage.getItem('admin_username') || 'admin';
    if (!token) {
      return {
        code: 401,
        msg: '凭证已失效',
        data: null as any
      };
    }
    return {
      code: 200,
      msg: '成功',
      data: { username }
    };
  },

  // 2. Stats
  async getDashboardStats(): Promise<Result<DashboardStats>> {
    const data = getLocal<DashboardStats>(KEYS.STATS);
    return simulateAPI(data);
  },

  // 3. User Management
  async getUsers(): Promise<Result<User[]>> {
    const data = getLocal<User[]>(KEYS.USERS);
    return simulateAPI(data);
  },

  async updateUserStatus(id: string, status: 'normal' | 'disabled'): Promise<Result<void>> {
    const users = getLocal<User[]>(KEYS.USERS);
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index].status = status;
      setLocal(KEYS.USERS, users);

      // Stat updates
      const stats = getLocal<DashboardStats>(KEYS.STATS);
      stats.totalUsers += (status === 'normal' ? 1 : -1);
      setLocal(KEYS.STATS, stats);
    }
    return simulateAPI(undefined);
  },

  async updateUserVerified(id: string, verified: 'verified' | 'unverified'): Promise<Result<void>> {
    const users = getLocal<User[]>(KEYS.USERS);
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index].verified = verified;
      setLocal(KEYS.USERS, users);
    }
    return simulateAPI(undefined);
  },

  // 4. Dynamics/Posts Management
  async getDynamics(): Promise<Result<Dynamic[]>> {
    const data = getLocal<Dynamic[]>(KEYS.DYNAMICS);
    return simulateAPI(data);
  },

  async updateDynamicStatus(id: string, status: 'pending' | 'normal' | 'removed', rejectReason?: string): Promise<Result<void>> {
    const list = getLocal<Dynamic[]>(KEYS.DYNAMICS);
    const index = list.findIndex(item => item.id === id);
    if (index !== -1) {
      list[index].status = status;
      if (rejectReason !== undefined) {
        list[index].rejectReason = rejectReason;
      }
      setLocal(KEYS.DYNAMICS, list);

      // Stat updates
      const stats = getLocal<DashboardStats>(KEYS.STATS);
      if (status === 'normal') {
        stats.newPosts += 1;
      } else if (status === 'removed') {
        stats.newPosts = Math.max(0, stats.newPosts - 1);
      }
      setLocal(KEYS.STATS, stats);
    }
    return simulateAPI(undefined);
  },

  async addComment(dynId: string, commenter: string, text: string): Promise<Result<void>> {
    const dynamics = getLocal<Dynamic[]>(KEYS.DYNAMICS);
    const index = dynamics.findIndex(d => d.id === dynId);
    if (index !== -1) {
      const freshComment = {
        id: `COM-${Date.now().toString().slice(-4)}`,
        author: commenter,
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAutf8uw-UP_WcJF6DedJ7BJ-58j6AAoLLsPj5uet4SuxCOsbEVOsOt8J5Q8cq0EcOJjh94kvPemlbPGCcdd89_oNXUsQRyuMWCsUQlagzBJhnOTUtw94XVV1AIw494VL8MRVgRwo0k2vWHujUJ-JYDSlLcvmZOOau40QddlzoeAwLsvEYy0BeAyExWOUQIL9zD8ULX6ruVNErCoPp9-hFCH6zrLtpvJwLdnaYJ1EBsCdh4kv_Dyp_5tUU8mZI1XzDOqNQ03ZcnPHZ4',
        text,
        time: '刚刚'
      };
      dynamics[index].commentsCount += 1;
      dynamics[index].comments.unshift(freshComment);
      setLocal(KEYS.DYNAMICS, dynamics);
    }
    return simulateAPI(undefined);
  },

  async deleteComment(dynId: string, commentId: string): Promise<Result<void>> {
    const dynamics = getLocal<Dynamic[]>(KEYS.DYNAMICS);
    const index = dynamics.findIndex(d => d.id === dynId);
    if (index !== -1) {
      dynamics[index].commentsCount = Math.max(0, dynamics[index].commentsCount - 1);
      dynamics[index].comments = dynamics[index].comments.filter(c => c.id !== commentId);
      setLocal(KEYS.DYNAMICS, dynamics);
    }
    return simulateAPI(undefined);
  },

  // 5. Goods/Market Management
  async getGoods(): Promise<Result<Goods[]>> {
    const data = getLocal<Goods[]>(KEYS.GOODS);
    return simulateAPI(data);
  },

  async updateGoodsStatus(id: string, status: 'active' | 'sold' | 'removed' | 'pending', rejectReason?: string): Promise<Result<void>> {
    const list = getLocal<Goods[]>(KEYS.GOODS);
    const index = list.findIndex(item => item.id === id);
    if (index !== -1) {
      list[index].status = status;
      if (rejectReason !== undefined) {
        list[index].rejectReason = rejectReason;
      }
      setLocal(KEYS.GOODS, list);

      // Stat updates
      const stats = getLocal<DashboardStats>(KEYS.STATS);
      if (status === 'active') {
        stats.activeGoods += 1;
      } else if (status === 'removed' || status === 'sold') {
        stats.activeGoods = Math.max(0, stats.activeGoods - 1);
      }
      setLocal(KEYS.STATS, stats);
    }
    return simulateAPI(undefined);
  },

  // 6. Services Management
  async getServices(): Promise<Result<Service[]>> {
    const data = getLocal<Service[]>(KEYS.SERVICES);
    return simulateAPI(data);
  },

  async updateServiceStatus(id: string, status: 'pending' | 'active' | 'rejected', rejectReason?: string): Promise<Result<void>> {
    const list = getLocal<Service[]>(KEYS.SERVICES);
    const index = list.findIndex(item => item.id === id);
    if (index !== -1) {
      list[index].status = status;
      if (rejectReason !== undefined) {
        list[index].rejectReason = rejectReason;
      }
      setLocal(KEYS.SERVICES, list);

      // Stat updates
      const stats = getLocal<DashboardStats>(KEYS.STATS);
      if (status === 'active') {
        stats.activeServices += 1;
      } else {
        stats.activeServices = Math.max(0, stats.activeServices - 1);
      }
      setLocal(KEYS.STATS, stats);
    }
    return simulateAPI(undefined);
  },

  async addNewService(srv: Service): Promise<Result<void>> {
    const list = getLocal<Service[]>(KEYS.SERVICES);
    list.unshift(srv);
    setLocal(KEYS.SERVICES, list);
    return simulateAPI(undefined);
  },

  // 7. Orders Management
  async getOrders(): Promise<Result<Order[]>> {
    const data = getLocal<Order[]>(KEYS.ORDERS);
    return simulateAPI(data);
  },

  async forceCancelOrder(id: string, reason: string): Promise<Result<void>> {
    const list = getLocal<Order[]>(KEYS.ORDERS);
    const index = list.findIndex(o => o.id === id);
    if (index !== -1) {
      list[index].status = 'canceled';
      list[index].cancelReason = reason;
      list[index].steps.push({
        name: '平台超管强制取消介入（全额退款）',
        time: new Date().toISOString().replace('T', ' ').slice(0, 19)
      });
      setLocal(KEYS.ORDERS, list);

      // Stats
      const stats = getLocal<DashboardStats>(KEYS.STATS);
      stats.monthlyOrders = Math.max(0, stats.monthlyOrders - 1);
      setLocal(KEYS.STATS, stats);
    }
    return simulateAPI(undefined);
  },

  // 8. Categories Management
  async getCategories(): Promise<Result<CategoryItem[]>> {
    const data = getLocal<CategoryItem[]>(KEYS.CATEGORIES);
    return simulateAPI(data);
  },

  async toggleCategoryStatus(id: string): Promise<Result<void>> {
    const list = getLocal<CategoryItem[]>(KEYS.CATEGORIES);
    const index = list.findIndex(c => c.id === id);
    if (index !== -1) {
      list[index].status = list[index].status === 'normal' ? 'disabled' : 'normal';
      setLocal(KEYS.CATEGORIES, list);
    }
    return simulateAPI(undefined);
  },

  async addCategory(name: string, type: 'dynamic' | 'goods' | 'service'): Promise<Result<void>> {
    const list = getLocal<CategoryItem[]>(KEYS.CATEGORIES);
    const novelCat: CategoryItem = {
      id: `cat-${type === 'dynamic' ? 'dyn' : type === 'goods' ? 'gds' : 'srv'}-${Date.now().toString().slice(-4)}`,
      name,
      type,
      status: 'normal',
      order: list.filter(c => c.type === type).length + 1
    };
    list.push(novelCat);
    setLocal(KEYS.CATEGORIES, list);
    return simulateAPI(undefined);
  },

  // 9. Notifications Management
  async getNotifications(): Promise<Result<NotificationItem[]>> {
    const data = getLocal<NotificationItem[]>(KEYS.NOTIFICATIONS);
    return simulateAPI(data);
  },

  async toggleNotificationRead(id: string): Promise<Result<void>> {
    const list = getLocal<NotificationItem[]>(KEYS.NOTIFICATIONS);
    const index = list.findIndex(n => n.id === id);
    if (index !== -1) {
      list[index].read = !list[index].read;
      setLocal(KEYS.NOTIFICATIONS, list);
    }
    return simulateAPI(undefined);
  },

  async addNotification(title: string, content: string, target: 'all' | 'specific', isScheduled: boolean): Promise<Result<void>> {
    const list = getLocal<NotificationItem[]>(KEYS.NOTIFICATIONS);
    const freshNotice: NotificationItem = {
      id: `ntf-${Date.now().toString().slice(-3)}`,
      title,
      content,
      target,
      time: new Date().toISOString().replace('T', ' ').slice(0, 19),
      status: isScheduled ? 'scheduled' : 'sent',
      read: false
    };
    list.unshift(freshNotice);
    setLocal(KEYS.NOTIFICATIONS, list);
    return simulateAPI(undefined);
  },

  // 10. Comments Management
  async getManagedComments(): Promise<Result<ManagedComment[]>> {
    const data = getLocal<ManagedComment[]>(KEYS.MANAGED_COMMENTS);
    return simulateAPI(data);
  },

  async updateCommentStatus(id: string, status: 'normal' | 'flagged' | 'hidden'): Promise<Result<void>> {
    const list = getLocal<ManagedComment[]>(KEYS.MANAGED_COMMENTS);
    const index = list.findIndex(c => c.id === id);
    if (index !== -1) {
      list[index].status = status;
      setLocal(KEYS.MANAGED_COMMENTS, list);
    }
    return simulateAPI(undefined);
  },

  async deleteManagedComment(id: string): Promise<Result<void>> {
    const list = getLocal<ManagedComment[]>(KEYS.MANAGED_COMMENTS);
    const updated = list.filter(c => c.id !== id);
    setLocal(KEYS.MANAGED_COMMENTS, updated);
    return simulateAPI(undefined);
  },

  // 11. Blacklist Management
  async getBlacklist(): Promise<Result<BlacklistItem[]>> {
    const data = getLocal<BlacklistItem[]>(KEYS.BLACKLIST);
    return simulateAPI(data);
  },

  async addBlacklist(targetType: 'user' | 'keyword' | 'ip', targetValue: string, reason: string, creator: string): Promise<Result<void>> {
    const list = getLocal<BlacklistItem[]>(KEYS.BLACKLIST);
    const newItem: BlacklistItem = {
      id: `BLK-${Date.now().toString().slice(-4)}`,
      targetType,
      targetValue,
      reason,
      creator,
      time: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
    list.unshift(newItem);
    setLocal(KEYS.BLACKLIST, list);
    return simulateAPI(undefined);
  },

  async deleteBlacklist(id: string): Promise<Result<void>> {
    const list = getLocal<BlacklistItem[]>(KEYS.BLACKLIST);
    const updated = list.filter(b => b.id !== id);
    setLocal(KEYS.BLACKLIST, updated);
    return simulateAPI(undefined);
  },

  // 12. Image/Media Management
  async getImages(): Promise<Result<ManagedImage[]>> {
    const data = getLocal<ManagedImage[]>(KEYS.IMAGES);
    return simulateAPI(data);
  },

  async updateImageStatus(id: string, status: 'approved' | 'pending' | 'flagged'): Promise<Result<void>> {
    const list = getLocal<ManagedImage[]>(KEYS.IMAGES);
    const index = list.findIndex(img => img.id === id);
    if (index !== -1) {
      list[index].status = status;
      setLocal(KEYS.IMAGES, list);
    }
    return simulateAPI(undefined);
  },

  async deleteImage(id: string): Promise<Result<void>> {
    const list = getLocal<ManagedImage[]>(KEYS.IMAGES);
    const updated = list.filter(img => img.id !== id);
    setLocal(KEYS.IMAGES, updated);
    return simulateAPI(undefined);
  },

  // 13. Login Logs
  async getLoginLogs(): Promise<Result<LoginLogItem[]>> {
    const data = getLocal<LoginLogItem[]>(KEYS.LOGIN_LOGS);
    return simulateAPI(data);
  },

  // 14. Operation Logs
  async getOperationLogs(): Promise<Result<OperationLogItem[]>> {
    const data = autoCleanupOperationLogs();
    return simulateAPI(data);
  },

  async addOperationLog(operator: string, role: string, action: string, target: string, ip: string, status: 'success' | 'failed', details?: string): Promise<Result<void>> {
    const list = getLocal<OperationLogItem[]>(KEYS.OP_LOGS);
    const newItem: OperationLogItem = {
      id: `LOG-OP${Date.now().toString().slice(-4)}`,
      operator,
      role,
      action,
      target,
      ip,
      time: new Date().toISOString().replace('T', ' ').slice(0, 19),
      status,
      details
    };
    list.unshift(newItem);
    setLocal(KEYS.OP_LOGS, list);
    autoCleanupOperationLogs();
    return simulateAPI(undefined);
  },

  async updateOperationLogRetention(policy: string): Promise<Result<{ cleanedCount: number; logs: OperationLogItem[] }>> {
    const previousLogs = getLocal<OperationLogItem[]>(KEYS.OP_LOGS);
    localStorage.setItem('leju_op_log_retention', policy);
    const currentLogs = autoCleanupOperationLogs();
    const cleanedCount = previousLogs.length - currentLogs.length;
    return simulateAPI({
      cleanedCount,
      logs: currentLogs
    });
  }
};

// Helper to automatically cleanup operation logs that exceed retention duration limit
export function autoCleanupOperationLogs(): OperationLogItem[] {
  const retention = localStorage.getItem('leju_op_log_retention') || 'all';
  const logsRaw = localStorage.getItem('leju_op_logs');
  let logs: OperationLogItem[] = [];
  try {
    logs = logsRaw ? JSON.parse(logsRaw) : [];
  } catch (e) {
    logs = [];
  }
  
  if (!logs || !logs.length || retention === 'all') {
    return logs || [];
  }
  
  const days = parseInt(retention, 10);
  if (isNaN(days) || days <= 0) {
    return logs;
  }
  
  const currentLocalTime = Date.now();
  const cutoffTime = currentLocalTime - days * 24 * 60 * 60 * 1000;
  
  const filtered = logs.filter((log: OperationLogItem) => {
    try {
      const logTime = new Date(log.time.replace(/-/g, '/')).getTime();
      return logTime >= cutoffTime;
    } catch (e) {
      return true; // Keep old files if date format is invalid or can't be parsed
    }
  });
  
  if (filtered.length !== logs.length) {
    localStorage.setItem('leju_op_logs', JSON.stringify(filtered));
  }
  return filtered;
}

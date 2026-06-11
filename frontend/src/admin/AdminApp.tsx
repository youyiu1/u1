/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type {
  BlacklistItem,
  CategoryItem,
  DashboardStats,
  Dynamic,
  Goods,
  LoginLogItem,
  ManagedComment,
  ManagedImage,
  ManagedMessage,
  NotificationItem,
  OperationLogItem,
  Order,
  Service,
  SystemMenu,
  User,
} from './types';
import { adminApi, type Result } from './services/adminApi';
import { getPrimaryImage } from './utils/images';
import './admin.css';

import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import UserManagementView from './components/UserManagementView';
import DynamicManagementView from './components/DynamicManagementView';
import GoodsManagementView from './components/GoodsManagementView';
import ServiceManagementView from './components/ServiceManagementView';
import OrderManagementView from './components/OrderManagementView';
import NoticeCategoryView from './components/NoticeCategoryView';
import CommentManagementView from './components/CommentManagementView';
import BlacklistManagementView from './components/BlacklistManagementView';
import ImageManagementView from './components/ImageManagementView';
import MessageManagementView from './components/MessageManagementView';
import LoginLogView from './components/LoginLogView';
import OperationLogView from './components/OperationLogView';
import MenuManagementView from './components/MenuManagementView';
import RoleManagementView from './components/RoleManagementView';
import PermissionManagementView from './components/PermissionManagementView';
import AdminToast from './components/common/AdminToast';
import { useToast } from './hooks/useToast';

const EMPTY_STATS: DashboardStats = {
  totalUsers: 0,
  totalUsersTrend: 0,
  newPosts: 0,
  newPostsTrend: 0,
  activeGoods: 0,
  activeGoodsTrend: 0,
  activeServices: 0,
  activeServicesTrend: 0,
  monthlyOrders: 0,
  monthlyOrdersTrend: 0,
};

const VALID_PATHS = new Set([
  '/admin/dashboard',
  '/admin/users',
  '/admin/posts',
  '/admin/market',
  '/admin/services',
  '/admin/orders',
  '/admin/notifications',
  '/admin/categories',
  '/admin/comments',
  '/admin/blacklist',
  '/admin/images',
  '/admin/messages',
  '/admin/login-logs',
  '/admin/op-logs',
  '/admin/menus',
  '/admin/roles',
  '/admin/permissions',
  '/admin/login',
]);

const ADMIN_DESKTOP_MEDIA_QUERY = '(min-width: 1024px)';
const ADMIN_LOGIN_PATH = '/admin/login';
const ADMIN_DASHBOARD_PATH = '/admin/dashboard';
const ADMIN_ROOT_REDIRECT_PATHS = new Set(['/', ADMIN_LOGIN_PATH, '/index.html']);

function ok<T>(res: Result<T>) {
  return res.success;
}

function isUnauthorized(res: Result<unknown>) {
  return !res.success && res.code === 401;
}

function isForbidden(res: Result<unknown>) {
  return !res.success && res.code === 403;
}

function toAlertMessage(res: Result<unknown>) {
  return res.message || '操作失败';
}

function toFeedbackMessage(res: Result<unknown>, fallbackMessage = '操作失败，请稍后重试') {
  return res.message || fallbackMessage;
}

function normalizeAdminPath(pathname: string) {
  return VALID_PATHS.has(pathname) ? pathname : ADMIN_DASHBOARD_PATH;
}

type UserProfile = {
  id: string;
  avatar: string;
  tag: string;
};

type UserProfileLookup = {
  byId: Map<string, UserProfile>;
  byName: Map<string, UserProfile>;
};

function normalizeTag(value?: string) {
  return value?.trim() || '';
}

function getUserProfileTag(user?: User) {
  return normalizeTag(user?.tag) || normalizeTag(user?.region);
}

function getUserProfile(user?: User): UserProfile {
  return {
    id: user?.id || '',
    avatar: getPrimaryImage(user?.avatar),
    tag: getUserProfileTag(user),
  };
}

function buildUserProfileLookup(userList: User[]): UserProfileLookup {
  const byId = new Map<string, UserProfile>();
  const byName = new Map<string, UserProfile>();
  userList.forEach((user) => {
    const profile = getUserProfile(user);
    byId.set(user.id, profile);
    if (user.name && !byName.has(user.name)) {
      byName.set(user.name, profile);
    }
  });
  return { byId, byName };
}

function resolveUserProfile(lookup: UserProfileLookup, id?: string, name?: string) {
  return (id ? lookup.byId.get(id) : undefined) || (name ? lookup.byName.get(name) : undefined);
}

type EnrichPayload = Parameters<typeof enrichWithUserProfiles>[0];

function enrichWithUserProfiles(payload: {
  dynamics?: Dynamic[];
  goods?: Goods[];
  services?: Service[];
  orders?: Order[];
  comments?: ManagedComment[];
  images?: ManagedImage[];
  messages?: ManagedMessage[];
}, userList: User[]) {
  const lookup = buildUserProfileLookup(userList);
  return {
    dynamics: payload.dynamics?.map((item) => ({
      ...item,
      authorAvatar: getPrimaryImage(item.authorAvatar, resolveUserProfile(lookup, item.userId, item.author)?.avatar),
      authorTag: normalizeTag(item.authorTag) || resolveUserProfile(lookup, item.userId, item.author)?.tag || '',
    })),
    goods: payload.goods?.map((item) => ({
      ...item,
      sellerAvatar: getPrimaryImage(item.sellerAvatar, resolveUserProfile(lookup, item.sellerId, item.sellerName)?.avatar),
      sellerTag: normalizeTag(item.sellerTag) || resolveUserProfile(lookup, item.sellerId, item.sellerName)?.tag || '',
    })),
    services: payload.services?.map((item) => {
      const providerProfile = resolveUserProfile(lookup, item.providerId, item.providerName);
      return {
        ...item,
        providerId: item.providerId || providerProfile?.id,
        providerAvatar: getPrimaryImage(item.providerAvatar, providerProfile?.avatar),
        providerTag: normalizeTag(item.providerTag) || providerProfile?.tag || '',
      };
    }),
    orders: payload.orders?.map((item) => {
      const buyerProfile = resolveUserProfile(lookup, item.buyerId, item.buyerName);
      const sellerProfile = resolveUserProfile(lookup, item.sellerId, item.sellerName);
      return {
        ...item,
        buyerId: item.buyerId || buyerProfile?.id,
        buyerTag: normalizeTag(item.buyerTag) || buyerProfile?.tag || '',
        buyerAvatar: getPrimaryImage(item.buyerAvatar, buyerProfile?.avatar),
        sellerId: item.sellerId || sellerProfile?.id,
        sellerTag: normalizeTag(item.sellerTag) || sellerProfile?.tag || '',
        sellerAvatar: getPrimaryImage(item.sellerAvatar, sellerProfile?.avatar),
      };
    }),
    comments: payload.comments?.map((item) => ({
      ...item,
      authorAvatar: getPrimaryImage(item.authorAvatar, resolveUserProfile(lookup, undefined, item.authorName)?.avatar),
      authorTag: normalizeTag(item.authorTag) || resolveUserProfile(lookup, undefined, item.authorName)?.tag || '',
    })),
    images: payload.images?.map((item) => ({
      ...item,
      uploaderTag: normalizeTag(item.uploaderTag) || resolveUserProfile(lookup, undefined, item.uploader)?.tag || '',
    })),
    messages: payload.messages?.map((item) => {
      const senderProfile = resolveUserProfile(lookup, item.senderId, item.senderName);
      const receiverProfile = resolveUserProfile(lookup, item.receiverId, item.receiverName);
      return {
        ...item,
        senderAvatar: getPrimaryImage(item.senderAvatar, senderProfile?.avatar),
        senderTag: normalizeTag(item.senderTag) || senderProfile?.tag || '',
        receiverAvatar: getPrimaryImage(item.receiverAvatar, receiverProfile?.avatar),
        receiverTag: normalizeTag(item.receiverTag) || receiverProfile?.tag || '',
      };
    }),
  };
}

export default function AdminApp() {
  const [isDesktopLayout, setIsDesktopLayout] = useState(() => window.matchMedia(ADMIN_DESKTOP_MEDIA_QUERY).matches);
  const [isLoggedIn, setIsLoggedIn] = useState(() => adminApi.hasStoredSession());
  const [adminUser, setAdminUser] = useState(() => adminApi.getStoredUsername());
  const [adminRole, setAdminRole] = useState(() => adminApi.getStoredAdminRole());
  const [isReadonlyAdmin, setIsReadonlyAdmin] = useState(() => adminApi.isReadonlyAdmin());

  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(EMPTY_STATS);
  const [users, setUsers] = useState<User[]>([]);
  const [dynamics, setDynamics] = useState<Dynamic[]>([]);
  const [goods, setGoods] = useState<Goods[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [managedComments, setManagedComments] = useState<ManagedComment[]>([]);
  const [blacklist, setBlacklist] = useState<BlacklistItem[]>([]);
  const [images, setImages] = useState<ManagedImage[]>([]);
  const [messages, setMessages] = useState<ManagedMessage[]>([]);
  const [loginLogs, setLoginLogs] = useState<LoginLogItem[]>([]);
  const [opLogs, setOpLogs] = useState<OperationLogItem[]>([]);
  const [systemMenus, setSystemMenus] = useState<SystemMenu[]>([]);

  const [currentPath, setCurrentPath] = useState(() => normalizeAdminPath(window.location.pathname));
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [exteriorTabFilter, setExteriorTabFilter] = useState<string | undefined>();
  const [initialSelectedOrderId, setInitialSelectedOrderId] = useState<string | undefined>();
  const [isTabTransitioning, setIsTabTransitioning] = useState(false);
  const { toast, showToast } = useToast(3200);

  const handleUnauthorized = () => {
    void adminApi.logout();
    setSystemMenus([]);
    setIsLoggedIn(false);
    window.history.pushState({}, '', ADMIN_LOGIN_PATH);
    setCurrentPath(ADMIN_LOGIN_PATH);
  };

  const syncUsersFromResult = (res: Result<User[]>) => {
    const userList = ok(res) ? res.data : users;
    if (ok(res)) setUsers(userList);
    return userList;
  };

  const applySessionState = (username: string, role: string, readonly: boolean) => {
    setAdminUser(username);
    setAdminRole(role);
    setIsReadonlyAdmin(readonly);
  };

  const handleFailedResponse = (
    res: Result<unknown>,
    options?: {
      forbiddenMessage?: string;
      fallbackMessage?: string;
    }
  ) => {
    if (isUnauthorized(res)) {
      handleUnauthorized();
      return true;
    }
    if (isForbidden(res)) {
      showToast(options?.forbiddenMessage || '当前账号没有权限执行这个操作', 'error');
      return true;
    }
    if (!ok(res)) {
      showToast(toFeedbackMessage(res, options?.fallbackMessage), 'error');
      return true;
    }
    return false;
  };

  const applyEnrichedData = <K extends keyof EnrichPayload>(
    key: K,
    data: NonNullable<EnrichPayload[K]>,
    userList: User[],
    setter: (value: NonNullable<EnrichPayload[K]>) => void
  ) => {
    const enriched = enrichWithUserProfiles({ [key]: data } as EnrichPayload, userList)[key] || data;
    setter(enriched as NonNullable<EnrichPayload[K]>);
  };

  const loadDataWithUsers = async <T, K extends keyof EnrichPayload>(
    request: Promise<Result<T>>,
    key: K,
    setter: (value: NonNullable<EnrichPayload[K]>) => void
  ) => {
    const [res, userRes] = await Promise.all([request, adminApi.getUsers()]);
    if (handleFailedResponse(res, { forbiddenMessage: '你没有查看当前页面内容的权限' })) {
      return;
    }
    if (handleFailedResponse(userRes, { forbiddenMessage: '缺少用户资料读取权限，当前页面信息无法完整展示' })) {
      return;
    }
    const userList = syncUsersFromResult(userRes);
    applyEnrichedData(key, res.data as NonNullable<EnrichPayload[K]>, userList, setter);
  };

  const loadSimpleData = async <T,>(request: Promise<Result<T>>, setter: (value: T) => void) => {
    const res = await request;
    if (handleFailedResponse(res, { forbiddenMessage: '你没有查看当前页面内容的权限' })) {
      return;
    }
    setter(res.data);
  };

  const loadAdminShellData = async () => {
    const [sessionRes, menuRes] = await Promise.all([adminApi.getAdminInfo(), adminApi.getMenus()]);
    if (handleFailedResponse(sessionRes, { forbiddenMessage: '当前账号无法读取管理端会话信息' })) {
      return;
    }
    if (handleFailedResponse(menuRes, { forbiddenMessage: '当前账号无法读取管理端菜单配置' })) {
      return;
    }
    applySessionState(
      sessionRes.data.username || adminApi.getStoredUsername(),
      sessionRes.data.adminRole || adminApi.getStoredAdminRole(),
      sessionRes.data.readonly === 'true'
    );
    setSystemMenus(menuRes.data);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia(ADMIN_DESKTOP_MEDIA_QUERY);

    const syncDesktopLayout = (matches: boolean) => {
      setIsDesktopLayout(matches);
      if (matches) {
        setIsMobileSidebarOpen(false);
      }
    };

    const handleChange = (event: MediaQueryListEvent) => {
      syncDesktopLayout(event.matches);
    };

    syncDesktopLayout(mediaQuery.matches);
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    const legacyListener = (event: MediaQueryListEvent) => handleChange(event);
    mediaQuery.addListener(legacyListener);
    return () => {
      mediaQuery.removeListener(legacyListener);
    };
  }, []);

  useEffect(() => {
    if (adminApi.hasStoredSession()) {
      setIsLoggedIn(true);
      applySessionState(adminApi.getStoredUsername(), adminApi.getStoredAdminRole(), adminApi.isReadonlyAdmin());
      void loadAdminShellData();
      if (ADMIN_ROOT_REDIRECT_PATHS.has(window.location.pathname)) {
        window.history.replaceState({}, '', ADMIN_DASHBOARD_PATH);
        setCurrentPath(ADMIN_DASHBOARD_PATH);
      } else {
        setCurrentPath(normalizeAdminPath(window.location.pathname));
      }
    } else {
      setIsLoggedIn(false);
      window.history.replaceState({}, '', ADMIN_LOGIN_PATH);
      setCurrentPath(ADMIN_LOGIN_PATH);
    }

    const handlePopState = () => {
      setCurrentPath(normalizeAdminPath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const fetchActivePageData = async (path: string) => {
    if (path === ADMIN_LOGIN_PATH) return;
    if (!adminApi.hasStoredSession()) {
      handleUnauthorized();
      return;
    }

    setIsTabTransitioning(true);
    try {
      switch (path) {
        case '/admin/dashboard': {
          const [resStats, resDyn, resGoods, resOrders, resServices, userRes] = await Promise.all([
            adminApi.getDashboardStats(),
            adminApi.getDynamics(),
            adminApi.getGoods(),
            adminApi.getOrders(),
            adminApi.getServices(),
            adminApi.getUsers(),
          ]);
          if (handleFailedResponse(resStats, { forbiddenMessage: '你没有查看仪表盘统计的权限' })) return;
          if (handleFailedResponse(resDyn, { forbiddenMessage: '缺少动态查看权限，仪表盘内容无法完整展示' })) return;
          if (handleFailedResponse(resGoods, { forbiddenMessage: '缺少商品查看权限，仪表盘内容无法完整展示' })) return;
          if (handleFailedResponse(resOrders, { forbiddenMessage: '缺少订单查看权限，仪表盘内容无法完整展示' })) return;
          if (handleFailedResponse(resServices, { forbiddenMessage: '缺少服务查看权限，仪表盘内容无法完整展示' })) return;
          if (handleFailedResponse(userRes, { forbiddenMessage: '缺少用户资料读取权限，仪表盘内容无法完整展示' })) return;
          const userList = syncUsersFromResult(userRes);
          setDashboardStats(resStats.data);
          applyEnrichedData('dynamics', resDyn.data, userList, setDynamics);
          applyEnrichedData('goods', resGoods.data, userList, setGoods);
          applyEnrichedData('orders', resOrders.data, userList, setOrders);
          applyEnrichedData('services', resServices.data, userList, setServices);
          break;
        }
        case '/admin/users': {
          await loadSimpleData(adminApi.getUsers(), setUsers);
          break;
        }
        case '/admin/posts': {
          await loadDataWithUsers(adminApi.getDynamics(), 'dynamics', setDynamics);
          break;
        }
        case '/admin/market': {
          await loadDataWithUsers(adminApi.getGoods(), 'goods', setGoods);
          break;
        }
        case '/admin/services': {
          await loadDataWithUsers(adminApi.getServices(), 'services', setServices);
          break;
        }
        case '/admin/orders': {
          await loadDataWithUsers(adminApi.getOrders(), 'orders', setOrders);
          break;
        }
        case '/admin/notifications': {
          await loadSimpleData(adminApi.getNotifications(), setNotifications);
          break;
        }
        case '/admin/categories': {
          await loadSimpleData(adminApi.getCategories(), setCategories);
          break;
        }
        case '/admin/comments': {
          await loadDataWithUsers(adminApi.getManagedComments(), 'comments', setManagedComments);
          break;
        }
        case '/admin/blacklist': {
          await loadSimpleData(adminApi.getBlacklist(), setBlacklist);
          break;
        }
        case '/admin/images': {
          await loadDataWithUsers(adminApi.getImages(), 'images', setImages);
          break;
        }
        case '/admin/messages': {
          await loadDataWithUsers(adminApi.getMessages(), 'messages', setMessages);
          break;
        }
        case '/admin/login-logs': {
          await loadSimpleData(adminApi.getLoginLogs(), setLoginLogs);
          break;
        }
        case '/admin/op-logs': {
          await loadSimpleData(adminApi.getOperationLogs(), setOpLogs);
          break;
        }
        default:
          break;
      }
    } catch (err) {
      console.error('Admin API request failed:', err);
      showToast('页面数据加载失败，请刷新后重试', 'error');
    } finally {
      setIsTabTransitioning(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchActivePageData(currentPath);
  }, [currentPath, isLoggedIn]);

  const handleNavigateWithFilters = (nextPath: string, filter?: string) => {
    setIsTabTransitioning(true);
    setIsMobileSidebarOpen(false);
    if (nextPath === '/admin/orders' && filter?.startsWith('ORD-')) {
      setInitialSelectedOrderId(filter);
      setExteriorTabFilter(undefined);
    } else {
      setExteriorTabFilter(filter);
      setInitialSelectedOrderId(undefined);
    }
    window.history.pushState({}, '', nextPath);
    setTimeout(() => {
      setCurrentPath(nextPath);
      setIsTabTransitioning(false);
    }, 180);
  };

  const handleTabChange = (nextPath: string) => {
    setExteriorTabFilter(undefined);
    setInitialSelectedOrderId(undefined);
    handleNavigateWithFilters(nextPath);
  };

  const handleLoginSuccess = (userAccountName: string) => {
    applySessionState(userAccountName, adminApi.getStoredAdminRole(), adminApi.isReadonlyAdmin());
    setIsLoggedIn(true);
    void loadAdminShellData();
    window.history.pushState({}, '', ADMIN_DASHBOARD_PATH);
    setCurrentPath(ADMIN_DASHBOARD_PATH);
  };

  const handleLogout = async () => {
    await adminApi.logout();
    setIsLoggedIn(false);
    window.history.pushState({}, '', ADMIN_LOGIN_PATH);
    setCurrentPath(ADMIN_LOGIN_PATH);
  };

  const runAction = async (action: Promise<Result<void>>) => {
    if (isReadonlyAdmin) {
      showToast('只读账号没有权限执行该操作', 'error');
      return;
    }
    const res = await action;
    if (!handleFailedResponse(res)) {
      void fetchActivePageData(currentPath);
      return;
    }
  };

  const handleAddOperationLog = async (action: string, target: string, details?: string) => {
    if (isReadonlyAdmin) return;
    const res = await adminApi.addOperationLog(adminUser, adminRole, action, target, '127.0.0.1', 'success', details);
    if (ok(res) && currentPath === '/admin/op-logs') fetchActivePageData(currentPath);
  };

  const renderActiveView = () => {
    switch (currentPath) {
      case '/admin/dashboard':
        return (
          <DashboardView
            stats={dashboardStats}
            users={users}
            dynamics={dynamics}
            goods={goods}
            orders={orders}
            services={services}
            onNavigate={handleNavigateWithFilters}
          />
        );
      case '/admin/users':
        return (
          <UserManagementView
            users={users}
            onUpdateUserStatus={(id, status) => runAction(adminApi.updateUserStatus(id, status))}
            onUpdateUserVerified={(id, verified) => runAction(adminApi.updateUserVerified(id, verified))}
            onUpdateUserAdminRole={(id, role) => runAction(adminApi.updateUserAdminRole(id, role))}
            canManageRoles={adminRole === 'SUPER_ADMIN' && !isReadonlyAdmin}
          />
        );
      case '/admin/posts':
        return (
          <DynamicManagementView
            dynamics={dynamics}
            onUpdateDynamicStatus={(id, status, reason) => runAction(adminApi.updateDynamicStatus(id, status, reason))}
            onBanUser={async (dynamic) => {
              const targetId = dynamic.userId || users.find((u) => u.name === dynamic.author)?.id;
              if (!targetId) {
                showToast('未找到对应用户，无法封禁', 'error');
                return false;
              }
              const res = await adminApi.updateUserStatus(targetId, 'disabled');
              if (handleFailedResponse(res)) {
                return false;
              }
              const [userRes, dynamicRes, blacklistRes] = await Promise.all([
                adminApi.getUsers(),
                adminApi.getDynamics(),
                adminApi.getBlacklist(),
              ]);
              if (handleFailedResponse(userRes, { forbiddenMessage: '缺少用户资料读取权限，封禁后的关联信息无法刷新' })) {
                return false;
              }
              if (handleFailedResponse(dynamicRes, { forbiddenMessage: '缺少动态查看权限，封禁后的动态列表无法刷新' })) {
                return false;
              }
              if (handleFailedResponse(blacklistRes, { forbiddenMessage: '缺少黑名单查看权限，封禁后的黑名单数据无法刷新' })) {
                return false;
              }
              const userList = syncUsersFromResult(userRes);
              applyEnrichedData('dynamics', dynamicRes.data, userList, setDynamics);
              setBlacklist(blacklistRes.data);
              return true;
            }}
            onAddComment={(id, commenter, content) => runAction(adminApi.addComment(id, commenter, content))}
            onDeleteComment={(dynId, commentId) => runAction(adminApi.deleteComment(dynId, commentId))}
            initialTabFilter={exteriorTabFilter}
          />
        );
      case '/admin/market':
        return <GoodsManagementView goods={goods} onUpdateGoodsStatus={(id, status, reason) => runAction(adminApi.updateGoodsStatus(id, status, reason))} />;
      case '/admin/services':
        return (
          <ServiceManagementView
            services={services}
            onUpdateServiceStatus={(id, status, reason) => runAction(adminApi.updateServiceStatus(id, status, reason))}
            onAddNewService={(srv) => runAction(adminApi.addNewService(srv))}
            initialTabFilter={exteriorTabFilter}
          />
        );
      case '/admin/orders':
        return <OrderManagementView orders={orders} onForceCancelOrder={(id, reason) => runAction(adminApi.forceCancelOrder(id, reason))} initialSelectedOrderId={initialSelectedOrderId} initialTabFilter={exteriorTabFilter} />;
      case '/admin/notifications':
      case '/admin/categories':
        return (
          <NoticeCategoryView
            categories={categories}
            notifications={notifications}
            onToggleCategoryStatus={(id) => runAction(adminApi.toggleCategoryStatus(id))}
            onAddCategory={(name, type) => runAction(adminApi.addCategory(name, type))}
            onToggleNotificationRead={(id) => runAction(adminApi.toggleNotificationRead(id))}
            onAddNotification={(title, content, target, scheduled) => runAction(adminApi.addNotification(title, content, target, scheduled))}
            vMode={currentPath === '/admin/notifications' ? 'notifications' : 'categories'}
          />
        );
      case '/admin/comments':
        return <CommentManagementView comments={managedComments} onUpdateCommentStatus={(id, status) => runAction(adminApi.updateCommentStatus(id, status))} onDeleteComment={(id) => runAction(adminApi.deleteManagedComment(id))} onAddOperationLog={handleAddOperationLog} />;
      case '/admin/blacklist':
        return <BlacklistManagementView blacklist={blacklist} onAddBlacklist={(type, value, reason) => runAction(adminApi.addBlacklist(type, value, reason, adminUser))} onDeleteBlacklist={(id) => runAction(adminApi.deleteBlacklist(id))} onAddOperationLog={handleAddOperationLog} />;
      case '/admin/images':
        return <ImageManagementView images={images} onUpdateImageStatus={(id, status) => runAction(adminApi.updateImageStatus(id, status))} onDeleteImage={(id) => runAction(adminApi.deleteImage(id))} onAddOperationLog={handleAddOperationLog} />;
      case '/admin/messages':
        return <MessageManagementView messages={messages} onMarkRead={(id) => runAction(adminApi.markMessageRead(id))} onDeleteMessage={(id) => runAction(adminApi.deleteMessage(id))} onRefresh={() => fetchActivePageData(currentPath)} />;
      case '/admin/login-logs':
        return <LoginLogView logs={loginLogs} />;
      case '/admin/op-logs':
        return <OperationLogView logs={opLogs} onUpdateLogs={setOpLogs} />;
      case '/admin/menus':
        return <MenuManagementView />;
      case '/admin/roles':
        return <RoleManagementView readonly={isReadonlyAdmin} adminRole={adminRole} />;
      case '/admin/permissions':
        return <PermissionManagementView readonly={isReadonlyAdmin} adminRole={adminRole} />;
      default:
        return <div className="text-center py-12 text-outline text-headline-md font-extrabold">页面建设中</div>;
    }
  };

  const currentAdminProfile = users.find((user) => user.name === adminUser || user.email === adminUser);
  const unreadNotificationCount = notifications.filter((notification) => !notification.read).length;
  const refreshCurrentPage = () => fetchActivePageData(currentPath);

  if (!isLoggedIn || currentPath === ADMIN_LOGIN_PATH) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="admin-shell flex bg-surface-background min-h-screen text-on-surface font-sans antialiased overflow-x-hidden">
      <AdminToast toast={toast} />
      <Sidebar
        currentTab={currentPath}
        onTabChange={handleNavigateWithFilters}
        isCollapsed={isDesktopLayout ? isSidebarCollapsed : false}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        unreadCount={unreadNotificationCount}
        menus={systemMenus}
        isDesktopLayout={isDesktopLayout}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          username={adminUser}
          adminRole={adminRole}
          adminTag={currentAdminProfile?.tag || currentAdminProfile?.region}
          adminAvatar={currentAdminProfile?.avatar}
          notifications={notifications}
          onToggleNotificationRead={(id) => runAction(adminApi.toggleNotificationRead(id))}
          onLogout={handleLogout}
          onNavigateToNotifications={() => handleTabChange('/admin/notifications')}
          onNavigate={handleNavigateWithFilters}
          users={users}
          dynamics={dynamics}
          goods={goods}
          services={services}
          orders={orders}
          onRefresh={refreshCurrentPage}
          onToggleSidebar={() => setIsMobileSidebarOpen((current) => !current)}
          isDesktopLayout={isDesktopLayout}
        />
        <main className="admin-main p-3 sm:p-6 flex-grow overflow-y-auto relative min-h-[500px]">
          <AnimatePresence mode="wait">
            {isTabTransitioning ? (
              <motion.div
                key="tab-skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 bg-surface-background px-6 pt-2 pb-6 space-y-6 z-20"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse select-none">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-28 bg-outline-variant/35 rounded-xl border border-outline-variant/20 p-5 space-y-3">
                      <div className="h-4 bg-outline-variant/40 rounded w-1/3" />
                      <div className="h-6 bg-outline-variant/40 rounded w-1/2" />
                    </div>
                  ))}
                </div>
                <div className="h-[300px] bg-slate-200/40 border border-outline-variant/20 rounded-xl animate-pulse flex items-center justify-center p-6 text-outline select-none font-semibold">
                  图表加载中...
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
          <div className={isTabTransitioning ? 'opacity-0 select-none pointer-events-none' : 'opacity-100 transition-opacity duration-200'}>
            {renderActiveView()}
          </div>
        </main>
      </div>
    </div>
  );
}


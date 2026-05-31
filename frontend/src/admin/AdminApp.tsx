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
  NotificationItem,
  OperationLogItem,
  Order,
  Service,
  User,
} from './types';
import { adminApi, type Result } from './services/adminApi';
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
import LoginLogView from './components/LoginLogView';
import OperationLogView from './components/OperationLogView';
import MenuManagementView from './components/MenuManagementView';
import RoleManagementView from './components/RoleManagementView';
import PermissionManagementView from './components/PermissionManagementView';

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
  '/admin/login-logs',
  '/admin/op-logs',
  '/admin/menus',
  '/admin/roles',
  '/admin/permissions',
  '/admin/login',
]);

function ok<T>(res: Result<T>) {
  return res.success;
}

function isUnauthorized(res: Result<unknown>) {
  return res.message === '未登录' || res.message === 'Token无效' || res.message === 'Token已过期';
}

function toAlertMessage(res: Result<unknown>) {
  return res.message || '操作失败';
}

export default function AdminApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('admin_token'));
  const [adminUser, setAdminUser] = useState(() => localStorage.getItem('admin_username') || 'admin');
  const [adminRole, setAdminRole] = useState(() => localStorage.getItem('admin_role') || 'USER');
  const [isReadonlyAdmin, setIsReadonlyAdmin] = useState(() => localStorage.getItem('admin_readonly') === 'true');

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
  const [loginLogs, setLoginLogs] = useState<LoginLogItem[]>([]);
  const [opLogs, setOpLogs] = useState<OperationLogItem[]>([]);

  const [currentPath, setCurrentPath] = useState(() => {
    const p = window.location.pathname;
    return VALID_PATHS.has(p) ? p : '/admin/dashboard';
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [exteriorTabFilter, setExteriorTabFilter] = useState<string | undefined>();
  const [initialSelectedOrderId, setInitialSelectedOrderId] = useState<string | undefined>();
  const [isTabTransitioning, setIsTabTransitioning] = useState(false);

  const handleUnauthorized = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    localStorage.removeItem('admin_role');
    localStorage.removeItem('admin_readonly');
    setIsLoggedIn(false);
    window.history.pushState({}, '', '/admin/login');
    setCurrentPath('/admin/login');
  };

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const username = localStorage.getItem('admin_username') || 'admin';
    if (token) {
      setIsLoggedIn(true);
      setAdminUser(username);
      setAdminRole(adminApi.getStoredAdminRole());
      setIsReadonlyAdmin(adminApi.isReadonlyAdmin());
      if (window.location.pathname === '/' || window.location.pathname === '/admin/login' || window.location.pathname === '/index.html') {
        window.history.replaceState({}, '', '/admin/dashboard');
        setCurrentPath('/admin/dashboard');
      } else {
        setCurrentPath(VALID_PATHS.has(window.location.pathname) ? window.location.pathname : '/admin/dashboard');
      }
    } else {
      setIsLoggedIn(false);
      window.history.replaceState({}, '', '/admin/login');
      setCurrentPath('/admin/login');
    }

    const handlePopState = () => {
      const nextPath = VALID_PATHS.has(window.location.pathname) ? window.location.pathname : '/admin/dashboard';
      setCurrentPath(nextPath);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const fetchActivePageData = async (path: string) => {
    if (path === '/admin/login') return;
    if (!localStorage.getItem('admin_token')) {
      handleUnauthorized();
      return;
    }

    setIsTabTransitioning(true);
    try {
      switch (path) {
        case '/admin/dashboard': {
          const [resStats, resDyn, resOrders] = await Promise.all([
            adminApi.getDashboardStats(),
            adminApi.getDynamics(),
            adminApi.getOrders(),
          ]);
          if ([resStats, resDyn, resOrders].some(isUnauthorized)) return handleUnauthorized();
          if (ok(resStats)) setDashboardStats(resStats.data);
          if (ok(resDyn)) setDynamics(resDyn.data);
          if (ok(resOrders)) setOrders(resOrders.data);
          break;
        }
        case '/admin/users': {
          const res = await adminApi.getUsers();
          if (isUnauthorized(res)) return handleUnauthorized();
          if (ok(res)) setUsers(res.data);
          break;
        }
        case '/admin/posts': {
          const res = await adminApi.getDynamics();
          if (isUnauthorized(res)) return handleUnauthorized();
          if (ok(res)) setDynamics(res.data);
          break;
        }
        case '/admin/market': {
          const res = await adminApi.getGoods();
          if (isUnauthorized(res)) return handleUnauthorized();
          if (ok(res)) setGoods(res.data);
          break;
        }
        case '/admin/services': {
          const res = await adminApi.getServices();
          if (isUnauthorized(res)) return handleUnauthorized();
          if (ok(res)) setServices(res.data);
          break;
        }
        case '/admin/orders': {
          const res = await adminApi.getOrders();
          if (isUnauthorized(res)) return handleUnauthorized();
          if (ok(res)) setOrders(res.data);
          break;
        }
        case '/admin/notifications': {
          const res = await adminApi.getNotifications();
          if (isUnauthorized(res)) return handleUnauthorized();
          if (ok(res)) setNotifications(res.data);
          break;
        }
        case '/admin/categories': {
          const res = await adminApi.getCategories();
          if (isUnauthorized(res)) return handleUnauthorized();
          if (ok(res)) setCategories(res.data);
          break;
        }
        case '/admin/comments': {
          const res = await adminApi.getManagedComments();
          if (isUnauthorized(res)) return handleUnauthorized();
          if (ok(res)) setManagedComments(res.data);
          break;
        }
        case '/admin/blacklist': {
          const res = await adminApi.getBlacklist();
          if (isUnauthorized(res)) return handleUnauthorized();
          if (ok(res)) setBlacklist(res.data);
          break;
        }
        case '/admin/images': {
          const res = await adminApi.getImages();
          if (isUnauthorized(res)) return handleUnauthorized();
          if (ok(res)) setImages(res.data);
          break;
        }
        case '/admin/login-logs': {
          const res = await adminApi.getLoginLogs();
          if (isUnauthorized(res)) return handleUnauthorized();
          if (ok(res)) setLoginLogs(res.data);
          break;
        }
        case '/admin/op-logs': {
          const res = await adminApi.getOperationLogs();
          if (isUnauthorized(res)) return handleUnauthorized();
          if (ok(res)) setOpLogs(res.data);
          break;
        }
        default:
          break;
      }
    } catch (err) {
      console.error('Admin API request failed:', err);
    } finally {
      setIsTabTransitioning(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchActivePageData(currentPath);
  }, [currentPath, isLoggedIn]);

  const handleNavigateWithFilters = (nextPath: string, filter?: string) => {
    setIsTabTransitioning(true);
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
    setAdminUser(userAccountName);
    setAdminRole(adminApi.getStoredAdminRole());
    setIsReadonlyAdmin(adminApi.isReadonlyAdmin());
    setIsLoggedIn(true);
    window.history.pushState({}, '', '/admin/dashboard');
    setCurrentPath('/admin/dashboard');
  };

  const handleLogout = async () => {
    await adminApi.logout();
    setIsLoggedIn(false);
    window.history.pushState({}, '', '/admin/login');
    setCurrentPath('/admin/login');
  };

  const runAction = async (action: Promise<Result<void>>) => {
    if (isReadonlyAdmin) {
      alert('当前账号为只读管理员，不能执行此操作');
      return;
    }
    const res = await action;
    if (ok(res)) {
      fetchActivePageData(currentPath);
      return;
    }
    alert(toAlertMessage(res));
  };

  const handleAddOperationLog = async (action: string, target: string, details?: string) => {
    if (isReadonlyAdmin) return;
    const res = await adminApi.addOperationLog(adminUser, '超级管理员', action, target, '127.0.0.1', 'success', details);
    if (ok(res) && currentPath === '/admin/op-logs') fetchActivePageData(currentPath);
  };

  const renderActiveView = () => {
    switch (currentPath) {
      case '/admin/dashboard':
        return <DashboardView stats={dashboardStats} dynamics={dynamics} orders={orders} onNavigate={handleNavigateWithFilters} />;
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
            onBanUser={(authorName) => {
              const target = users.find((u) => u.name === authorName);
              if (target) runAction(adminApi.updateUserStatus(target.id, 'disabled'));
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
        return <div className="text-center py-12 text-outline text-headline-md font-extrabold">找不到对应的管理视图</div>;
    }
  };

  if (!isLoggedIn || currentPath === '/admin/login') {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="admin-shell flex bg-surface-background min-h-screen text-on-surface font-sans antialiased overflow-x-hidden">
      <Sidebar
        currentTab={currentPath}
        onTabChange={handleNavigateWithFilters}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        unreadCount={notifications.filter((n) => !n.read).length}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          username={adminUser}
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
          onRefresh={() => fetchActivePageData(currentPath)}
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
                  正在同步管理端数据...
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

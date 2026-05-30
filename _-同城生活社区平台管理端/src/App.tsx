/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';

// Type definitions & seed mock database
import { User, Dynamic, Goods, Service, Order, CategoryItem, NotificationItem, DashboardStats, ManagedComment, BlacklistItem, ManagedImage, LoginLogItem, OperationLogItem } from './types';
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
} from './mockData';

// API services
import { adminApi } from './services/adminApi';

// Modular layouts
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// View modules
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

export default function App() {
  // Session authentication state gating
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem('admin_token');
  });
  const [adminUser, setAdminUser] = useState(() => {
    return localStorage.getItem('admin_username') || 'admin';
  });

  // Unified global memory database state tree initialized securely from localStorage arrays
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(() => {
    const val = localStorage.getItem('leju_stats');
    return val ? JSON.parse(val) : INITIAL_DASHBOARD_STATS;
  });
  const [users, setUsers] = useState<User[]>(() => {
    const val = localStorage.getItem('leju_users');
    return val ? JSON.parse(val) : INITIAL_USERS;
  });
  const [dynamics, setDynamics] = useState<Dynamic[]>(() => {
    const val = localStorage.getItem('leju_dynamics');
    return val ? JSON.parse(val) : INITIAL_DYNAMICS;
  });
  const [goods, setGoods] = useState<Goods[]>(() => {
    const val = localStorage.getItem('leju_goods');
    return val ? JSON.parse(val) : INITIAL_GOODS;
  });
  const [services, setServices] = useState<Service[]>(() => {
    const val = localStorage.getItem('leju_services');
    return val ? JSON.parse(val) : INITIAL_SERVICES;
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    const val = localStorage.getItem('leju_orders');
    return val ? JSON.parse(val) : INITIAL_ORDERS;
  });
  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    const val = localStorage.getItem('leju_categories');
    return val ? JSON.parse(val) : INITIAL_CATEGORIES;
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const val = localStorage.getItem('leju_notifications');
    return val ? JSON.parse(val) : INITIAL_NOTIFICATIONS;
  });
  const [managedComments, setManagedComments] = useState<ManagedComment[]>(() => {
    const val = localStorage.getItem('leju_managed_comments');
    return val ? JSON.parse(val) : INITIAL_MANAGED_COMMENTS;
  });
  const [blacklist, setBlacklist] = useState<BlacklistItem[]>(() => {
    const val = localStorage.getItem('leju_blacklist');
    return val ? JSON.parse(val) : INITIAL_BLACKLIST;
  });
  const [images, setImages] = useState<ManagedImage[]>(() => {
    const val = localStorage.getItem('leju_images');
    return val ? JSON.parse(val) : INITIAL_IMAGES;
  });
  const [loginLogs, setLoginLogs] = useState<LoginLogItem[]>(() => {
    const val = localStorage.getItem('leju_login_logs');
    return val ? JSON.parse(val) : INITIAL_LOGIN_LOGS;
  });
  const [opLogs, setOpLogs] = useState<OperationLogItem[]>(() => {
    const val = localStorage.getItem('leju_op_logs');
    return val ? JSON.parse(val) : INITIAL_OP_LOGS;
  });

  // Active navigation clients-side routing controller
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const p = window.location.pathname;
    const validPaths = [
      '/admin/dashboard', '/admin/users', '/admin/posts', '/admin/market',
      '/admin/services', '/admin/orders', '/admin/notifications', '/admin/categories',
      '/admin/comments', '/admin/blacklist', '/admin/images', '/admin/login-logs', '/admin/op-logs',
      '/admin/login'
    ];
    if (validPaths.includes(p)) {
      return p;
    }
    return '/admin/dashboard';
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Cross-tab interaction context linkages
  const [exteriorTabFilter, setExteriorTabFilter] = useState<string | undefined>(undefined);
  const [initialSelectedOrderId, setInitialSelectedOrderId] = useState<string | undefined>(undefined);

  // Central page load buffer for Requirements 5 & 6 (smooth skeleton effect on tab change)
  const [isTabTransitioning, setIsTabTransitioning] = useState<boolean>(false);

  // Synchronize browser backward and forward click coordinates on load
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const username = localStorage.getItem('admin_username') || 'admin';
    
    if (token) {
      setIsLoggedIn(true);
      setAdminUser(username);
      if (window.location.pathname === '/' || window.location.pathname === '/admin/login' || window.location.pathname === '/index.html') {
        window.history.replaceState({}, '', '/admin/dashboard');
        setCurrentPath('/admin/dashboard');
      } else {
        setCurrentPath(window.location.pathname);
      }
    } else {
      setIsLoggedIn(false);
      window.history.replaceState({}, '', '/admin/login');
      setCurrentPath('/admin/login');
    }

    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Fetch data dynamically on route pathname edits
  const fetchActivePageData = async (path: string) => {
    if (path === '/admin/login') return;

    const token = localStorage.getItem('admin_token');
    if (!token) {
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
            adminApi.getOrders()
          ]);
          if (resStats.code === 401 || resDyn.code === 401 || resOrders.code === 401) {
            handleUnauthorized();
            return;
          }
          if (resStats.code === 200) setDashboardStats(resStats.data);
          if (resDyn.code === 200) setDynamics(resDyn.data);
          if (resOrders.code === 200) setOrders(resOrders.data);
          break;
        }
        case '/admin/users': {
          const res = await adminApi.getUsers();
          if (res.code === 401) {
            handleUnauthorized();
            return;
          }
          if (res.code === 200) setUsers(res.data);
          break;
        }
        case '/admin/posts': {
          const res = await adminApi.getDynamics();
          if (res.code === 401) {
            handleUnauthorized();
            return;
          }
          if (res.code === 200) setDynamics(res.data);
          break;
        }
        case '/admin/market': {
          const res = await adminApi.getGoods();
          if (res.code === 401) {
            handleUnauthorized();
            return;
          }
          if (res.code === 200) setGoods(res.data);
          break;
        }
        case '/admin/services': {
          const res = await adminApi.getServices();
          if (res.code === 401) {
            handleUnauthorized();
            return;
          }
          if (res.code === 200) setServices(res.data);
          break;
        }
        case '/admin/orders': {
          const res = await adminApi.getOrders();
          if (res.code === 401) {
            handleUnauthorized();
            return;
          }
          if (res.code === 200) setOrders(res.data);
          break;
        }
        case '/admin/notifications': {
          const res = await adminApi.getNotifications();
          if (res.code === 401) {
            handleUnauthorized();
            return;
          }
          if (res.code === 200) setNotifications(res.data);
          break;
        }
        case '/admin/categories': {
          const res = await adminApi.getCategories();
          if (res.code === 401) {
            handleUnauthorized();
            return;
          }
          if (res.code === 200) setCategories(res.data);
          break;
        }
        case '/admin/comments': {
          const res = await adminApi.getManagedComments();
          if (res.code === 401) {
            handleUnauthorized();
            return;
          }
          if (res.code === 200) setManagedComments(res.data);
          break;
        }
        case '/admin/blacklist': {
          const res = await adminApi.getBlacklist();
          if (res.code === 401) {
            handleUnauthorized();
            return;
          }
          if (res.code === 200) setBlacklist(res.data);
          break;
        }
        case '/admin/images': {
          const res = await adminApi.getImages();
          if (res.code === 401) {
            handleUnauthorized();
            return;
          }
          if (res.code === 200) setImages(res.data);
          break;
        }
        case '/admin/login-logs': {
          const res = await adminApi.getLoginLogs();
          if (res.code === 401) {
            handleUnauthorized();
            return;
          }
          if (res.code === 200) setLoginLogs(res.data);
          break;
        }
        case '/admin/op-logs': {
          const res = await adminApi.getOperationLogs();
          if (res.code === 401) {
            handleUnauthorized();
            return;
          }
          if (res.code === 200) setOpLogs(res.data);
          break;
        }
        default:
          break;
      }
    } catch (err) {
      console.error('API Pull Failed:', err);
    } finally {
      setIsTabTransitioning(false);
    }
  };

  const handleUnauthorized = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    setIsLoggedIn(false);
    window.history.pushState({}, '', '/admin/login');
    setCurrentPath('/admin/login');
  };

  // Pull asynchronously
  useEffect(() => {
    if (isLoggedIn) {
      fetchActivePageData(currentPath);
    }
  }, [currentPath, isLoggedIn]);

  // Trigger loading placeholder animation when menu shifts
  const handleTabChange = (nextPath: string) => {
    setIsTabTransitioning(true);
    setExteriorTabFilter(undefined);
    setInitialSelectedOrderId(undefined);

    window.history.pushState({}, '', nextPath);

    setTimeout(() => {
      setCurrentPath(nextPath);
      setIsTabTransitioning(false);
    }, 320); // Simulated network load effect matching original transition
  };

  // Explicit deep navigate override
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
    }, 320);
  };

  const handleLoginSuccess = (userAccountName: string) => {
    setAdminUser(userAccountName);
    setIsLoggedIn(true);
    // Push history
    window.history.pushState({}, '', '/admin/dashboard');
    setCurrentPath('/admin/dashboard');
  };

  const handleLogout = async () => {
    await adminApi.logout();
    setIsLoggedIn(false);
    window.history.pushState({}, '', '/admin/login');
    setCurrentPath('/admin/login');
  };

  // ==========================================
  // CROSS-TAB DEEP CASCADE ACTION TRIGGERS
  // ==========================================

  // Toggle user state and propagate to related items
  const handleUpdateUserStatus = async (userId: string, newStatus: 'normal' | 'disabled') => {
    const res = await adminApi.updateUserStatus(userId, newStatus);
    if (res.code === 200) {
      fetchActivePageData(currentPath);
    } else {
      alert(res.msg);
    }
  };

  // Toggle User Identity verification parameter
  const handleUpdateUserVerified = async (userId: string, isVerified: 'verified' | 'unverified') => {
    const res = await adminApi.updateUserVerified(userId, isVerified);
    if (res.code === 200) {
      fetchActivePageData(currentPath);
    } else {
      alert(res.msg);
    }
  };

  // Moderate dynamic status and append dismiss explanations
  const handleUpdateDynamicStatus = async (dynId: string, status: 'normal' | 'removed' | 'pending', rejectReason?: string) => {
    const res = await adminApi.updateDynamicStatus(dynId, status, rejectReason);
    if (res.code === 200) {
      fetchActivePageData(currentPath);
    } else {
      alert(res.msg);
    }
  };

  // Instantly ban a specific user from any of their post drawer actions
  const handleBanUserByAuthorName = async (authorName: string) => {
    const target = users.find(u => u.name === authorName);
    if (target) {
      handleUpdateUserStatus(target.id, 'disabled');
    }
  };

  // Append customized comment responses straight to dynamic state
  const handleAddCommentToDynamic = async (dynId: string, commenter: string, contentText: string) => {
    const res = await adminApi.addComment(dynId, commenter, contentText);
    if (res.code === 200) {
      fetchActivePageData(currentPath);
    }
  };

  // Delete a specific reply on feed
  const handleDeleteCommentFromDynamic = async (dynId: string, commentId: string) => {
    const res = await adminApi.deleteComment(dynId, commentId);
    if (res.code === 200) {
      fetchActivePageData(currentPath);
    }
  };

  // Moderate Merchandise visibility details
  const handleUpdateGoodsStatus = async (goodsId: string, status: 'active' | 'sold' | 'removed' | 'pending', rejectReason?: string) => {
    const res = await adminApi.updateGoodsStatus(goodsId, status, rejectReason);
    if (res.code === 200) {
      fetchActivePageData(currentPath);
    } else {
      alert(res.msg);
    }
  };

  // Moderate Service approval parameters
  const handleUpdateServiceStatus = async (serviceId: string, status: 'pending' | 'active' | 'rejected', rejectReason?: string) => {
    const res = await adminApi.updateServiceStatus(serviceId, status, rejectReason);
    if (res.code === 200) {
      fetchActivePageData(currentPath);
    } else {
      alert(res.msg);
    }
  };

  // Insert novel service item to services list
  const handleAddNewService = async (newSrv: Service) => {
    const res = await adminApi.addNewService(newSrv);
    if (res.code === 200) {
      fetchActivePageData(currentPath);
    }
  };

  // Forced cancellation of unresolved transaction order
  const handleForceCancelOrder = async (orderId: string, cancelReason: string) => {
    const res = await adminApi.forceCancelOrder(orderId, cancelReason);
    if (res.code === 200) {
      fetchActivePageData(currentPath);
    }
  };

  // Taxonomy status switch action
  const handleToggleCategoryStatus = async (catId: string) => {
    const res = await adminApi.toggleCategoryStatus(catId);
    if (res.code === 200) {
      fetchActivePageData(currentPath);
    }
  };

  // Adding category directly inside view
  const handleAddCategory = async (name: string, type: 'dynamic' | 'goods' | 'service') => {
    const res = await adminApi.addCategory(name, type);
    if (res.code === 200) {
      fetchActivePageData(currentPath);
    }
  };

  // Read status flip trigger
  const handleToggleNotificationRead = async (ntfId: string) => {
    const res = await adminApi.toggleNotificationRead(ntfId);
    if (res.code === 200) {
      fetchActivePageData(currentPath);
    }
  };

  // Distribute announcements alerts to the right notification feed
  const handleAddNotification = async (title: string, content: string, target: 'all' | 'specific', isScheduled: boolean) => {
    const res = await adminApi.addNotification(title, content, target, isScheduled);
    if (res.code === 200) {
      fetchActivePageData(currentPath);
    }
  };

  // 10. Managed Comments handlers
  const handleUpdateCommentStatus = async (id: string, status: 'normal' | 'flagged' | 'hidden') => {
    const res = await adminApi.updateCommentStatus(id, status);
    if (res.code === 200) {
      fetchActivePageData(currentPath);
    }
  };

  const handleDeleteComment = async (id: string) => {
    const res = await adminApi.deleteManagedComment(id);
    if (res.code === 200) {
      fetchActivePageData(currentPath);
    }
  };

  // 11. Blacklist handlers
  const handleAddBlacklist = async (targetType: 'user' | 'keyword' | 'ip', targetValue: string, reason: string) => {
    const res = await adminApi.addBlacklist(targetType, targetValue, reason, adminUser);
    if (res.code === 200) {
      fetchActivePageData(currentPath);
    }
  };

  const handleDeleteBlacklist = async (id: string) => {
    const res = await adminApi.deleteBlacklist(id);
    if (res.code === 200) {
      fetchActivePageData(currentPath);
    }
  };

  // 12. Images handlers
  const handleUpdateImageStatus = async (id: string, status: 'approved' | 'pending' | 'flagged') => {
    const res = await adminApi.updateImageStatus(id, status);
    if (res.code === 200) {
      fetchActivePageData(currentPath);
    }
  };

  const handleDeleteImage = async (id: string) => {
    const res = await adminApi.deleteImage(id);
    if (res.code === 200) {
      fetchActivePageData(currentPath);
    }
  };

  // 14. Operation Log append helper
  const handleAddOperationLog = async (action: string, target: string, details?: string) => {
    const res = await adminApi.addOperationLog(
      adminUser,
      '超级管理员',
      action,
      target,
      '14.120.55.88', // simulated operator IP
      'success',
      details
    );
    if (res.code === 200) {
      // Lazy reload logs if currently viewing operations
      if (currentPath === '/admin/op-logs') {
        fetchActivePageData(currentPath);
      }
    }
  };

  // Render individual screen depending on Tab ID
  const renderActiveView = () => {
    switch (currentPath) {
      case '/admin/dashboard':
        return (
          <DashboardView
            stats={dashboardStats}
            dynamics={dynamics}
            orders={orders}
            onNavigate={handleNavigateWithFilters}
          />
        );
      case '/admin/users':
        return (
          <UserManagementView
            users={users}
            onUpdateUserStatus={handleUpdateUserStatus}
            onUpdateUserVerified={handleUpdateUserVerified}
          />
        );
      case '/admin/posts':
        return (
          <DynamicManagementView
            dynamics={dynamics}
            onUpdateDynamicStatus={handleUpdateDynamicStatus}
            onBanUser={handleBanUserByAuthorName}
            onAddComment={handleAddCommentToDynamic}
            onDeleteComment={handleDeleteCommentFromDynamic}
            initialTabFilter={exteriorTabFilter}
          />
        );
      case '/admin/market':
        return (
          <GoodsManagementView
            goods={goods}
            onUpdateGoodsStatus={handleUpdateGoodsStatus}
          />
        );
      case '/admin/services':
        return (
          <ServiceManagementView
            services={services}
            onUpdateServiceStatus={handleUpdateServiceStatus}
            onAddNewService={handleAddNewService}
            initialTabFilter={exteriorTabFilter}
          />
        );
      case '/admin/orders':
        return (
          <OrderManagementView
            orders={orders}
            onForceCancelOrder={handleForceCancelOrder}
            initialSelectedOrderId={initialSelectedOrderId}
            initialTabFilter={exteriorTabFilter}
          />
        );
      case '/admin/notifications':
        return (
          <NoticeCategoryView
            categories={categories}
            notifications={notifications}
            onToggleCategoryStatus={handleToggleCategoryStatus}
            onAddCategory={handleAddCategory}
            onToggleNotificationRead={handleToggleNotificationRead}
            onAddNotification={handleAddNotification}
            vMode="notifications"
          />
        );
      case '/admin/categories':
        return (
          <NoticeCategoryView
            categories={categories}
            notifications={notifications}
            onToggleCategoryStatus={handleToggleCategoryStatus}
            onAddCategory={handleAddCategory}
            onToggleNotificationRead={handleToggleNotificationRead}
            onAddNotification={handleAddNotification}
            vMode="categories"
          />
        );
      case '/admin/comments':
        return (
          <CommentManagementView
            comments={managedComments}
            onUpdateCommentStatus={handleUpdateCommentStatus}
            onDeleteComment={handleDeleteComment}
            onAddOperationLog={handleAddOperationLog}
          />
        );
      case '/admin/blacklist':
        return (
          <BlacklistManagementView
            blacklist={blacklist}
            onAddBlacklist={handleAddBlacklist}
            onDeleteBlacklist={handleDeleteBlacklist}
            onAddOperationLog={handleAddOperationLog}
          />
        );
      case '/admin/images':
        return (
          <ImageManagementView
            images={images}
            onUpdateImageStatus={handleUpdateImageStatus}
            onDeleteImage={handleDeleteImage}
            onAddOperationLog={handleAddOperationLog}
          />
        );
      case '/admin/login-logs':
        return (
          <LoginLogView
            logs={loginLogs}
          />
        );
      case '/admin/op-logs':
        return (
          <OperationLogView
            logs={opLogs}
            onUpdateLogs={(updatedLogs) => setOpLogs(updatedLogs)}
          />
        );
      case '/admin/menus':
        return (
          <MenuManagementView />
        );
      case '/admin/roles':
        return (
          <RoleManagementView />
        );
      case '/admin/permissions':
        return (
          <PermissionManagementView />
        );
      default:
        return (
          <div className="text-center py-12">
            <p className="text-outline text-headline-md font-extrabold select-none">找不到对应的视图模块</p>
          </div>
        );
    }
  };

  // Render gating
  if (!isLoggedIn || currentPath === '/admin/login') {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex bg-surface-background min-h-screen text-on-surface font-sans antialiased overflow-x-hidden">
      
      {/* 1. Expandable Sidebar functional index rails - placed on the left */}
      <Sidebar
        currentTab={currentPath}
        onTabChange={handleNavigateWithFilters}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        unreadCount={notifications.filter(n => !n.read).length}
      />

      {/* 2. Structured Content layout columns */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Persistent top brand controls */}
        <Header
          username={adminUser}
          notifications={notifications}
          onToggleNotificationRead={handleToggleNotificationRead}
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

        {/* Unified workspace canvas overlay */}
        <main className="p-6 flex-grow overflow-y-auto relative min-h-[500px]">
          
          {/* Skeleton Load Feedback on changing tab panel menu */}
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
                {/* Dashboard / general mock pulse layout loader */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse select-none">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-28 bg-outline-variant/35 rounded-xl border border-outline-variant/20 p-5 space-y-3">
                      <div className="h-4 bg-outline-variant/40 rounded w-1/3"></div>
                      <div className="h-6 bg-outline-variant/40 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
                <div className="h-[300px] bg-slate-200/40 border border-outline-variant/20 rounded-xl animate-pulse flex items-center justify-center p-6 text-outline select-none font-semibold">
                  正在同步云服务平台网关数据库运行中...
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Subview display */}
          <div className={isTabTransitioning ? 'opacity-0 select-none pointer-events-none' : 'opacity-100 transition-opacity duration-200'}>
            {renderActiveView()}
          </div>
        </main>
      </div>
    </div>
  );
}

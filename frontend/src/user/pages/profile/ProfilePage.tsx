/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Bell,
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  Eye,
  Grid,
  Heart,
  Lock,
  LogOut,
  Settings,
  ShoppingBag,
  Users,
} from 'lucide-react';
import { motion } from 'motion/react';
import { favoriteApi, getToken, marketApi, newsApi, orderApi, reviewApi, serviceApi, userApi } from '../../services/api';
import { ReviewDialog } from '../../components/common/ReviewDialog';
import { ProfileCompletedItem } from '../../components/profile/ProfileCompletedItem';
import { ProfileFavoriteItem } from '../../components/profile/ProfileFavoriteItem';
import { ProfileInfoCard } from '../../components/profile/ProfileInfoCard';
import { ProfileMarketItem } from '../../components/profile/ProfileMarketItem';
import { ProfilePostCard } from '../../components/profile/ProfilePostCard';
import { ChangePasswordOverlay, NotificationSettingsOverlay, PrivacySettingsOverlay } from '../../components/settings/SettingsOverlays';
import { useAuth } from '../../context/AuthContext';
import { useAuthCheck } from '../../context/useAuthCheck';
import { usePublish } from '../../context/PublishContext';
import { Item, Order, Post, Service, User } from '../../types';
import { getFallbackAvatar } from '../../utils/avatar';
import { getErrorMessage } from '../../utils/error';
import { resolveFollowState } from '../../utils/followStorage';
import { buildProfilePath, buildProfileRouteState, decodeProfilePathParam, type ProfileRouteState } from '../../utils/profileRoute';

type FavoriteRecord = {
  id: string;
  targetType: 'news' | 'market' | 'service';
  targetId: string;
  createTime?: string;
};

type FavoriteTab = 'all' | 'news' | 'market' | 'service';

type TabId = 'posts' | 'market' | 'completed' | 'bookmarks' | 'following' | 'settings' | 'likes';

const ownTabs = [
  { id: 'posts' as const, name: '我的动态', icon: Grid },
  { id: 'market' as const, name: '我的发布', icon: ShoppingBag },
  { id: 'completed' as const, name: '已完成订单', icon: CheckCircle2 },
  { id: 'bookmarks' as const, name: '我的收藏', icon: Bookmark },
  { id: 'following' as const, name: '我的关注', icon: Users },
  { id: 'settings' as const, name: '账号设置', icon: Settings },
];

const publicTabs = [
  { id: 'posts' as const, name: 'Ta 的动态', icon: Grid },
  { id: 'likes' as const, name: 'Ta 的喜欢', icon: Heart },
];

const BOOKMARK_TABS: Array<{ id: FavoriteTab; name: string }> = [
  { id: 'all', name: '全部' },
  { id: 'news', name: '动态' },
  { id: 'market', name: '闲置' },
  { id: 'service', name: '服务' },
];

const SETTINGS_ACTIONS = [
  {
    key: 'password',
    icon: <Lock className="h-4 w-4" />,
    title: '修改登录密码',
    description: '更新密码，提升账号安全',
  },
  {
    key: 'notification',
    icon: <Bell className="h-4 w-4" />,
    title: '通知设置',
    description: '管理私信、评论和系统提醒',
  },
  {
    key: 'privacy',
    icon: <Eye className="h-4 w-4" />,
    title: '隐私设置',
    description: '控制资料、动态和地区可见范围',
  },
] as const;

const TAB_IDS: TabId[] = ['posts', 'market', 'completed', 'bookmarks', 'following', 'settings', 'likes'];

function resolveTabId(value: string | null): TabId {
  return TAB_IDS.includes(value as TabId) ? (value as TabId) : 'posts';
}

export default function ProfilePage() {
  const { username: paramUsername } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: currentUser, logout } = useAuth();
  const { requireAuth } = useAuthCheck();
  const { openPublish } = usePublish();

  const decodedParamUsername = decodeProfilePathParam(paramUsername);
  const username = decodedParamUsername || currentUser?.id || currentUser?.name;
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [favorites, setFavorites] = useState<FavoriteRecord[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<Record<string, Post | Item | Service>>({});
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [inProgressOrders, setInProgressOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFavoriteTab, setActiveFavoriteTab] = useState<FavoriteTab>('all');
  const [passwordOverlayOpen, setPasswordOverlayOpen] = useState(false);
  const [notificationOverlayOpen, setNotificationOverlayOpen] = useState(false);
  const [privacyOverlayOpen, setPrivacyOverlayOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewingOrder, setReviewingOrder] = useState<Order | null>(null);
  const [stats, setStats] = useState({ followers: 0, isFollowing: false });

  const loadedTabsRef = useRef<Set<string>>(new Set());
  const currentProfileKeyRef = useRef<string>('');
  const routeMatchesCurrentUser = !decodedParamUsername || decodedParamUsername === currentUser?.id || decodedParamUsername === currentUser?.name;
  const isOwnProfile = routeMatchesCurrentUser || Boolean(profileUser?.id && profileUser.id === currentUser?.id);
  const routeState = location.state as ProfileRouteState | null;
  const requestedTab = resolveTabId(searchParams.get('tab'));
  const routeProfilePreview = useMemo(() => {
    if (isOwnProfile) {
      return null;
    }
    const preview = routeState?.profilePreview;
    if (!preview) {
      return null;
    }
    if (!decodedParamUsername) {
      return null;
    }
    return decodedParamUsername === preview.id || decodedParamUsername === preview.name ? preview : null;
  }, [decodedParamUsername, isOwnProfile, routeState]);
  const tabs = useMemo(() => (isOwnProfile ? ownTabs : publicTabs.filter((tab) => tab.id !== 'likes')), [isOwnProfile]);
  const activeTab = tabs.some((tab) => tab.id === requestedTab) ? requestedTab : tabs[0].id;
  const marketItems = useMemo(() => [...items, ...services], [items, services]);
  const effectiveProfileId = profileUser?.id || routeProfilePreview?.id || '';

  const userData = useMemo(() => {
    if (isOwnProfile && currentUser) {
      return { ...(profileUser || {}), ...currentUser } as User;
    }
    return (
      profileUser || routeProfilePreview || {
        id: '',
        name: username || '匿名用户',
        avatar: getFallbackAvatar(username || '用户'),
        tag: '社区邻居',
        isVerified: false,
        followersCount: 0,
        followingCount: 0,
      }
    );
  }, [currentUser, isOwnProfile, profileUser, routeProfilePreview, username]);

  const resetTabData = useCallback(() => {
    loadedTabsRef.current.clear();
    setPosts([]);
    setItems([]);
    setServices([]);
    setFollowing([]);
    setFavorites([]);
    setFavoriteItems({});
    setCompletedOrders([]);
    setInProgressOrders([]);
  }, []);

  useEffect(() => {
    if (!getToken() && isOwnProfile) {
      navigate('/login');
    }
  }, [isOwnProfile, navigate]);

  useEffect(() => {
    if (requestedTab === activeTab) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    if (searchParams.get('tab') === tabs[0].id) {
      return;
    }
    nextParams.set('tab', tabs[0].id);
    setSearchParams(nextParams, { replace: true });
  }, [activeTab, requestedTab, searchParams, setSearchParams, tabs]);

  useEffect(() => {
    let cancelled = false;

    const fetchProfileData = async () => {
      if (!username) {
        return;
      }

      const profileKey = isOwnProfile ? `own:${currentUser?.id || 'me'}` : `public:${username}`;
      if (currentProfileKeyRef.current !== profileKey) {
        currentProfileKeyRef.current = profileKey;
        resetTabData();
      }

      setLoading(true);
      setError(null);

      try {
        const user = isOwnProfile && getToken()
          ? await userApi.getCurrentUser()
          : await userApi.getUser(username).catch(() => userApi.getUserByName(username));

        if (cancelled) {
          return;
        }

        setProfileUser(user);
        setStats({ followers: user.followersCount || 0, isFollowing: false });

        if (!isOwnProfile && currentUser?.id && user.id) {
          const followingState = await resolveFollowState(currentUser.id, user.id, userApi.isFollowing);
          if (!cancelled) {
            setStats({ followers: user.followersCount || 0, isFollowing: followingState });
          }
        }
      } catch (fetchError: unknown) {
        if (cancelled) {
          return;
        }
        if (isOwnProfile && getToken()) {
          navigate('/login');
          return;
        }
        setError(getErrorMessage(fetchError, '个人主页加载失败'));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchProfileData();
    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, currentUser?.name, isOwnProfile, navigate, resetTabData, username]);

  const loadTabData = useCallback(
    async (tabId: TabId, userId: string) => {
      if (!userId || tabId === 'settings' || tabId === 'likes') {
        return;
      }
      if ((tabId === 'bookmarks' || tabId === 'completed') && !isOwnProfile) {
        return;
      }

      const loadKey = `${userId}:${tabId}`;
      if (loadedTabsRef.current.has(loadKey)) {
        return;
      }

      setTabLoading(true);
      try {
        if (tabId === 'posts') {
          setPosts(await newsApi.getByUserId(userId).catch(() => []));
        } else if (tabId === 'market') {
          const [marketData, serviceData] = await Promise.all([
            marketApi.getByUserId(userId).catch(() => []),
            serviceApi.getByUserId(userId).catch(() => []),
          ]);
          setItems(marketData);
          setServices(serviceData);
        } else if (tabId === 'following') {
          setFollowing(await userApi.getFollowingList(userId).catch(() => []));
        } else if (tabId === 'completed') {
          const [completedData, inProgressData] = await Promise.all([
            orderApi.completedList(userId).catch(() => []),
            orderApi.inProgressList(userId).catch(() => []),
          ]);
          setCompletedOrders(completedData);
          setInProgressOrders(inProgressData);
        } else if (tabId === 'bookmarks') {
          const favoriteList = (await favoriteApi.list(userId).catch(() => [])) as FavoriteRecord[];
          setFavorites(favoriteList);
          const results = await Promise.all(
            favoriteList.map((favorite) => {
              const mapKey = `${favorite.targetType}-${favorite.targetId}`;
              const api = favorite.targetType === 'news' ? newsApi : favorite.targetType === 'market' ? marketApi : serviceApi;
              return api.get(favorite.targetId).then((item) => ({ mapKey, item })).catch(() => null);
            }),
          );
          const itemMap: Record<string, Post | Item | Service> = {};
          results.forEach((result) => {
            if (result?.item) {
              itemMap[result.mapKey] = result.item;
            }
          });
          setFavoriteItems(itemMap);
        }
        loadedTabsRef.current.add(loadKey);
      } finally {
        setTabLoading(false);
      }
    },
    [isOwnProfile],
  );

  useEffect(() => {
    if (!effectiveProfileId || activeTab === 'settings') {
      return;
    }
    void loadTabData(activeTab, effectiveProfileId);
  }, [activeTab, effectiveProfileId, loadTabData]);

  const handleTabChange = (tabId: TabId) => {
    if (tabId === activeTab) {
      return;
    }
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', tabId);
    setSearchParams(nextParams);
  };

  const handleFollowChange = (isFollowing: boolean) => {
    setStats((current) => ({
      ...current,
      isFollowing,
      followers: isFollowing ? current.followers + 1 : Math.max(0, current.followers - 1),
    }));
  };

  const handleUnfavorite = (targetId: string) => {
    let removedType = '';
    setFavorites((current) =>
      current.filter((favorite) => {
        const matched = String(favorite.targetId) === String(targetId);
        if (matched) {
          removedType = favorite.targetType;
        }
        return !matched;
      }),
    );
    setFavoriteItems((current) => {
      const next = { ...current };
      if (removedType) {
        delete next[`${removedType}-${targetId}`];
      }
      return next;
    });
  };

  if (loading && !routeProfilePreview) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-bright px-6 text-center">
        <p className="text-sm font-bold text-red-500">{error}</p>
        <button onClick={() => navigate('/news')} className="rounded-2xl bg-primary px-6 py-3 text-xs font-black text-white">
          返回社区首页
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <div className="relative h-48 overflow-hidden md:h-64">
        <button
          onClick={() => navigate('/news', { replace: true })}
          className="theme-card-soft absolute left-6 top-6 z-10 rounded-full p-2 shadow-sm backdrop-blur-md transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-ink" />
        </button>
      </div>

      <div className="mx-auto max-w-[1280px] px-6 md:px-20">
        <div className="relative z-10 -mt-16 flex flex-col gap-8 md:flex-row">
          <ProfileInfoCard
            userData={userData}
            username={username || ''}
            stats={stats}
            handleFollowChange={handleFollowChange}
            isOwnProfile={isOwnProfile}
            onProfileUpdated={(nextUser) => {
              setProfileUser((current) => (current ? { ...current, ...nextUser } : current));
            }}
          />

          <div className="flex-1 space-y-6 pb-0">
            <div className="theme-surface-panel p-0 md:rounded-2xl md:border md:border-hairline md:p-4 md:shadow-sm">
              <div className="no-scrollbar flex items-center gap-6 overflow-x-auto border-b border-hairline px-4 scroll-smooth md:gap-8 md:px-4">
                {tabs.map((tab) => (
                  <ProfileTabButton key={tab.id} tab={tab} activeTab={activeTab} onClick={handleTabChange} />
                ))}
              </div>

              <div className="py-8">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.16 }}
                  className="grid gap-4 md:grid-cols-2"
                >
                  {tabLoading && activeTab !== 'settings' ? (
                    <div className="col-span-2 py-16 text-center">
                      <div className="mx-auto mb-4 h-7 w-7 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                      <p className="text-xs font-bold text-muted">正在加载内容...</p>
                    </div>
                  ) : (
                    <>
                      {activeTab === 'posts' ? <PostsTab posts={posts} currentUserId={currentUser?.id} setPosts={setPosts} /> : null}
                      {activeTab === 'market' ? <MarketTab items={marketItems} requireAuth={requireAuth} openPublish={openPublish} /> : null}
                      {activeTab === 'completed' ? (
                        <CompletedTab
                          currentUserId={currentUser?.id || ''}
                          inProgressOrders={inProgressOrders}
                          completedOrders={completedOrders}
                          setInProgressOrders={setInProgressOrders}
                          setCompletedOrders={setCompletedOrders}
                          openReview={(order) => {
                            setReviewingOrder(order);
                            setReviewDialogOpen(true);
                          }}
                        />
                      ) : null}
                      {activeTab === 'bookmarks' ? (
                        <BookmarksTab
                          favorites={favorites}
                          favoriteItems={favoriteItems}
                          activeFavoriteTab={activeFavoriteTab}
                          setActiveFavoriteTab={setActiveFavoriteTab}
                          onUnfavorite={handleUnfavorite}
                        />
                      ) : null}
                      {activeTab === 'following' ? <FollowingTab following={following} navigate={navigate} /> : null}
                      {activeTab === 'settings' ? (
                        <SettingsTab
                          openPassword={() => setPasswordOverlayOpen(true)}
                          openNotification={() => setNotificationOverlayOpen(true)}
                          openPrivacy={() => setPrivacyOverlayOpen(true)}
                          logout={logout}
                        />
                      ) : null}
                      {!['posts', 'market', 'completed', 'bookmarks', 'following', 'settings'].includes(activeTab) ? <EmptyPlaceholder /> : null}
                    </>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ReviewDialog
        isOpen={reviewDialogOpen}
        onClose={() => {
          setReviewDialogOpen(false);
          setReviewingOrder(null);
        }}
        onSubmit={async (rating, content) => {
          if (!reviewingOrder || !currentUser) {
            return;
          }
          await reviewApi.addServiceReview(reviewingOrder.serviceId!, {
            userId: currentUser.id,
            userName: currentUser.name,
            userAvatar: currentUser.avatar,
            rating,
            content,
          });
        }}
        title={`评价 ${reviewingOrder?.serviceTitle || '服务'}`}
      />

      {passwordOverlayOpen ? <ChangePasswordOverlay isOpen={passwordOverlayOpen} onClose={() => setPasswordOverlayOpen(false)} /> : null}
      {notificationOverlayOpen ? <NotificationSettingsOverlay isOpen={notificationOverlayOpen} onClose={() => setNotificationOverlayOpen(false)} /> : null}
      {privacyOverlayOpen ? <PrivacySettingsOverlay isOpen={privacyOverlayOpen} onClose={() => setPrivacyOverlayOpen(false)} /> : null}
    </div>
  );
}

function PostsTab({
  posts,
  currentUserId,
  setPosts,
}: {
  posts: Post[];
  currentUserId?: string;
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
}) {
  if (posts.length === 0) {
    return <EmptyState text="这里还没有发布动态" />;
  }

  return (
    <div className="col-span-2">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {posts.map((post) => (
          <ProfilePostCard
            key={post.id}
            post={post}
            currentUserId={currentUserId}
            onDelete={async (postId) => {
              await newsApi.delete(postId);
              setPosts((current) => current.filter((item) => item.id !== postId));
            }}
          />
        ))}
      </div>
    </div>
  );
}

function MarketTab({
  items,
  requireAuth,
  openPublish,
}: {
  items: Array<Item | Service>;
  requireAuth: (callback: () => void) => boolean;
  openPublish: () => void;
}) {
  if (items.length === 0) {
    return (
      <div className="theme-card-muted col-span-2 rounded-[40px] border border-dashed py-20 text-center">
        <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-hairline" />
        <p className="text-sm font-bold text-muted">这里还没有发布闲置或服务</p>
        <button onClick={() => requireAuth(() => openPublish())} className="mt-6 rounded-2xl bg-primary px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white">
          去发布内容
        </button>
      </div>
    );
  }

  return (
    <div className="col-span-2">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <ProfileMarketItem key={`${'itemCondition' in item ? 'market' : 'service'}-${item.id}`} item={item} />
        ))}
      </div>
    </div>
  );
}

function CompletedTab({
  currentUserId,
  inProgressOrders,
  completedOrders,
  setInProgressOrders,
  setCompletedOrders,
  openReview,
}: {
  currentUserId: string;
  inProgressOrders: Order[];
  completedOrders: Order[];
  setInProgressOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setCompletedOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  openReview: (order: Order) => void;
}) {
  if (inProgressOrders.length === 0 && completedOrders.length === 0) {
    return (
      <div className="theme-card-muted col-span-2 rounded-[40px] border border-dashed py-20 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-hairline" />
        <p className="text-sm font-bold text-muted">这里还没有已完成的订单</p>
      </div>
    );
  }

  return (
    <div className="col-span-2 space-y-6">
      {inProgressOrders.length > 0 ? (
        <div>
          <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-muted">进行中的订单</h3>
          <div className="space-y-4">
            {inProgressOrders.map((order) => (
              <ProfileCompletedItem
                key={order.id}
                order={order}
                currentUserId={currentUserId}
                onDelete={(id) => setInProgressOrders((current) => current.filter((item) => item.id !== id))}
                onComplete={async (item) => {
                  await orderApi.complete(item.id);
                  setInProgressOrders((current) => current.filter((orderItem) => orderItem.id !== item.id));
                  setCompletedOrders((current) => [{ ...item, status: 'completed', completedTime: new Date().toISOString() }, ...current]);
                }}
              />
            ))}
          </div>
        </div>
      ) : null}
      {completedOrders.length > 0 ? (
        <div>
          <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-muted">已完成订单</h3>
          <div className="space-y-4">
            {completedOrders.map((order) => (
              <ProfileCompletedItem
                key={order.id}
                order={order}
                currentUserId={currentUserId}
                onDelete={(id) => setCompletedOrders((current) => current.filter((item) => item.id !== id))}
                onReview={openReview}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function BookmarksTab({
  favorites,
  favoriteItems,
  activeFavoriteTab,
  setActiveFavoriteTab,
  onUnfavorite,
}: {
  favorites: FavoriteRecord[];
  favoriteItems: Record<string, Post | Item | Service>;
  activeFavoriteTab: FavoriteTab;
  setActiveFavoriteTab: React.Dispatch<React.SetStateAction<FavoriteTab>>;
  onUnfavorite: (targetId: string) => void;
}) {
  if (favorites.length === 0) {
    return (
      <div className="theme-card-muted col-span-2 rounded-[40px] border border-dashed py-20 text-center">
        <Bookmark className="mx-auto mb-4 h-12 w-12 text-hairline" />
        <p className="text-sm font-bold text-muted">这里还没有收藏内容</p>
      </div>
    );
  }

  return (
    <div className="col-span-2 space-y-4">
      <div className="flex items-center gap-2">
        {BOOKMARK_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFavoriteTab(tab.id)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${activeFavoriteTab === tab.id ? 'bg-primary text-white' : 'bg-surface-soft text-secondary hover:text-ink'}`}
          >
            {tab.name}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {favorites
          .filter((favorite) => activeFavoriteTab === 'all' || favorite.targetType === activeFavoriteTab)
          .map((favorite) => {
            const mapKey = `${favorite.targetType}-${favorite.targetId}`;
            const item = favoriteItems[mapKey];
            if (!item) {
              return null;
            }
            return <ProfileFavoriteItem key={mapKey} favorite={favorite} data={item} onUnfavorite={onUnfavorite} />;
          })}
      </div>
    </div>
  );
}

function FollowingTab({
  following,
  navigate,
}: {
  following: User[];
  navigate: (path: string, options?: { state?: unknown }) => void;
}) {
  if (following.length === 0) {
    return (
      <div className="col-span-2 py-20 text-center">
        <Users className="mx-auto mb-4 h-16 w-16 text-hairline" />
        <p className="text-sm font-bold text-muted">这里还没有关注的人</p>
      </div>
    );
  }

  return (
    <div className="col-span-2">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {following.map((user) => (
          <div
            key={user.id}
            className="theme-card cursor-pointer rounded-2xl p-4 text-center transition-colors hover:border-primary/30"
            onClick={() =>
              navigate(buildProfilePath(user.id, user.name), {
                state: buildProfileRouteState(user),
              })
            }
          >
            <img src={user.avatar || getFallbackAvatar(user.name)} className="mx-auto mb-3 h-16 w-16 rounded-xl border border-hairline object-cover" alt={user.name} />
            <p className="truncate text-sm font-bold text-ink">{user.name}</p>
            {user.tag ? <p className="mt-1 text-xs text-primary">{user.tag}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsTab({
  openPassword,
  openNotification,
  openPrivacy,
  logout,
}: {
  openPassword: () => void;
  openNotification: () => void;
  openPrivacy: () => void;
  logout: () => Promise<void>;
}) {
  return (
    <div className="col-span-2 space-y-4">
      <div className="theme-card rounded-[32px] p-6 shadow-sm">
        <div className="mb-5">
          <h4 className="text-sm font-black uppercase tracking-widest text-ink">资料与提醒</h4>
          <p className="mt-2 text-xs text-muted">保留常用设置入口，减少来回切换。</p>
        </div>
        <div className="space-y-3">
          {SETTINGS_ACTIONS.filter((action) => action.key !== 'password').map((action) => (
            <SettingsButton
              key={action.key}
              icon={action.icon}
              title={action.title}
              description={action.description}
              onClick={action.key === 'notification' ? openNotification : openPrivacy}
            />
          ))}
        </div>
      </div>

      <div className="theme-card-muted rounded-[32px] p-6">
        <div className="mb-5">
          <h4 className="text-sm font-black uppercase tracking-widest text-ink">账号与安全</h4>
          <p className="mt-2 text-xs text-muted">密码修改单独放置，和普通设置分开。</p>
        </div>
        <div className="space-y-3">
          {SETTINGS_ACTIONS.filter((action) => action.key === 'password').map((action) => (
            <SettingsButton
              key={action.key}
              icon={action.icon}
              title={action.title}
              description={action.description}
              onClick={openPassword}
            />
          ))}
        </div>
      </div>

      <div className="rounded-[32px] border border-red-100 bg-red-50/40 p-6">
        <h4 className="mb-2 text-sm font-black uppercase tracking-widest text-red-600">退出登录</h4>
        <p className="mb-5 text-xs text-red-500/80">当前设备将清除登录状态，需要重新登录后继续使用。</p>
        <button
          onClick={() => {
            void logout();
          }}
          className="flex w-full items-center justify-center gap-3 rounded-3xl bg-red-500 p-4 text-[11px] font-black uppercase tracking-[0.26em] text-white shadow-xl shadow-red-500/20 transition-all hover:bg-red-600 active:scale-95"
        >
          <LogOut className="h-4 w-4" />
          安全退出
        </button>
      </div>
    </div>
  );
}

function SettingsButton({
  icon,
  title,
  description,
  onClick,
}: {
  key?: React.Key;
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="theme-card group flex w-full items-center justify-between rounded-2xl p-4 transition-all hover:border-primary/30 hover:bg-primary/[0.02]">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-soft text-secondary transition-colors group-hover:text-primary">{icon}</div>
        <div className="text-left">
          <p className="text-xs font-black text-ink">{title}</p>
          <p className="text-[11px] font-medium text-muted">{description}</p>
        </div>
      </div>
      <ChevronLeft className="h-4 w-4 rotate-180 text-muted" />
    </button>
  );
}

function ProfileTabButton({
  tab,
  activeTab,
  onClick,
}: {
  key?: React.Key;
  tab: { id: TabId; name: string; icon: typeof Grid };
  activeTab: TabId;
  onClick: (tabId: TabId) => void;
}) {
  const Icon = tab.icon;

  return (
    <button
      onClick={() => onClick(tab.id)}
      className={`group relative shrink-0 pb-4 text-sm font-bold transition-all ${activeTab === tab.id ? 'text-primary' : 'text-secondary hover:text-ink'}`}
    >
      <span className="relative z-10 flex items-center gap-2 transition-transform duration-200 group-hover:scale-105 active:scale-95">
        <Icon className="h-4 w-4" />
        {tab.name}
      </span>
      {activeTab === tab.id ? (
        <motion.div
          layoutId="profileTabBottom"
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          className="absolute bottom-0 left-0 right-0 z-20 h-0.5 bg-primary shadow-[0_2px_8px_rgba(255,54,92,0.3)]"
        />
      ) : null}
    </button>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="col-span-2 py-20 text-center">
      <p className="text-sm font-bold text-muted">{text}</p>
    </div>
  );
}

function EmptyPlaceholder() {
  return (
    <div className="col-span-2 space-y-4 py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-soft">
        <Settings className="h-6 w-6 text-muted" />
      </div>
      <p className="text-sm font-bold text-muted">当前标签暂时没有内容</p>
    </div>
  );
}

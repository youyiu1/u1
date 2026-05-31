/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
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
import { favoriteApi, getToken, marketApi, newsApi, orderApi, reviewApi, serviceApi, userApi } from '../services/api';
import { ReviewDialog } from '../components/common/ReviewDialog';
import { useAuth } from '../context/AuthContext';
import { useAuthCheck } from '../context/useAuthCheck';
import { usePublish } from '../context/PublishContext';
import { ProfileInfoCard } from '../components/profile/ProfileInfoCard';
import { ProfilePostCard } from '../components/profile/ProfilePostCard';
import { ProfileMarketItem } from '../components/profile/ProfileMarketItem';
import { ProfileFavoriteItem } from '../components/profile/ProfileFavoriteItem';
import { ProfileCompletedItem } from '../components/profile/ProfileCompletedItem';
import { ChangePasswordOverlay, NotificationSettingsOverlay, PrivacySettingsOverlay } from '../components/settings/SettingsOverlays';
import { Item, Order, Post, Service, User } from '../types';
import { getFallbackAvatar } from '../utils/avatar';
import { getFollowState, setFollowState } from '../utils/followStorage';

type FavoriteRecord = {
  id: string;
  targetType: 'news' | 'market' | 'service';
  targetId: string;
  createTime?: string;
};

const ownTabs = [
  { id: 'posts', name: '社区动态', icon: Grid },
  { id: 'market', name: '发布清单', icon: ShoppingBag },
  { id: 'completed', name: '已完成', icon: CheckCircle2 },
  { id: 'bookmarks', name: '收藏夹', icon: Bookmark },
  { id: 'following', name: '关注邻里', icon: Users },
  { id: 'settings', name: '系统设置', icon: Settings },
];

const publicTabs = [
  { id: 'posts', name: '社区动态', icon: Grid },
  { id: 'likes', name: '点赞内容', icon: Heart },
];

export default function Profile() {
  const { username: paramUsername } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user: currentUser, logout } = useAuth();
  const { requireAuth } = useAuthCheck();
  const { openPublish } = usePublish();

  const username = paramUsername || currentUser?.id || currentUser?.name;
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [favorites, setFavorites] = useState<FavoriteRecord[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<Record<string, Post | Item | Service>>({});
  const [activeFavoriteTab, setActiveFavoriteTab] = useState<'all' | 'news' | 'market' | 'service'>('all');
  const [inProgressOrders, setInProgressOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'posts');
  const [passwordOverlayOpen, setPasswordOverlayOpen] = useState(false);
  const [notificationOverlayOpen, setNotificationOverlayOpen] = useState(false);
  const [privacyOverlayOpen, setPrivacyOverlayOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewingOrder, setReviewingOrder] = useState<Order | null>(null);
  const [stats, setStats] = useState({ followers: 0, isFollowing: false });

  const loadedTabsRef = useRef<Set<string>>(new Set());
  const currentProfileKeyRef = useRef<string>('');
  const routeMatchesCurrentUser = !paramUsername || paramUsername === currentUser?.id || paramUsername === currentUser?.name;
  const isOwnProfile = routeMatchesCurrentUser || (!!profileUser?.id && profileUser.id === currentUser?.id);
  const tabs = useMemo(() => (isOwnProfile ? ownTabs : publicTabs), [isOwnProfile]);
  const marketItems = useMemo(() => [...items, ...services], [items, services]);
  const userData = useMemo(() => {
    if (isOwnProfile && currentUser) {
      return { ...(profileUser || {}), ...currentUser } as User;
    }
    return profileUser || {
      id: '',
      name: username || '未知用户',
      avatar: getFallbackAvatar(username || '用户'),
      tag: '新晋邻居',
      isVerified: false,
      followersCount: 0,
      followingCount: 0,
    };
  }, [currentUser, isOwnProfile, profileUser, username]);

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
    let cancelled = false;

    const fetchProfileData = async () => {
      if (!username) return;
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
        if (cancelled) return;

        setProfileUser(user);
        setStats({ followers: user.followersCount || 0, isFollowing: false });

        if (!isOwnProfile && currentUser?.id && user.id) {
          const saved = getFollowState(user.id);
          setStats({ followers: user.followersCount || 0, isFollowing: saved });
          if (!saved) {
            userApi.isFollowing(currentUser.id, user.id)
              .then((followingState) => {
                if (cancelled) return;
                setStats({ followers: user.followersCount || 0, isFollowing: followingState });
                setFollowState(user.id, followingState);
              })
              .catch(() => {
                if (!cancelled) setStats({ followers: user.followersCount || 0, isFollowing: false });
              });
          }
        }
      } catch (err: any) {
        if (cancelled) return;
        if (isOwnProfile && getToken()) {
          navigate('/login');
          return;
        }
        setError(err.message || '加载失败');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProfileData();
    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, currentUser?.name, isOwnProfile, navigate, resetTabData, username]);

  const loadTabData = useCallback(async (tabId: string, userId: string) => {
    if (!userId || tabId === 'settings' || tabId === 'likes') return;
    if ((tabId === 'bookmarks' || tabId === 'completed') && !isOwnProfile) return;

    const loadKey = `${userId}:${tabId}`;
    if (loadedTabsRef.current.has(loadKey)) return;

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
        const favoriteList = await favoriteApi.list(userId).catch(() => []) as FavoriteRecord[];
        setFavorites(favoriteList);
        const results = await Promise.all(
          favoriteList.map((favorite) => {
            const mapKey = `${favorite.targetType}-${favorite.targetId}`;
            const api = favorite.targetType === 'news' ? newsApi : favorite.targetType === 'market' ? marketApi : serviceApi;
            return api.get(favorite.targetId).then(item => ({ mapKey, item })).catch(() => null);
          })
        );
        const itemMap: Record<string, Post | Item | Service> = {};
        results.forEach(result => {
          if (result?.item) itemMap[result.mapKey] = result.item;
        });
        setFavoriteItems(itemMap);
      }
      loadedTabsRef.current.add(loadKey);
    } finally {
      setTabLoading(false);
    }
  }, [isOwnProfile]);

  useEffect(() => {
    if (!profileUser?.id || activeTab === 'settings') return;
    loadTabData(activeTab, profileUser.id);
  }, [activeTab, loadTabData, profileUser?.id]);

  const handleTabChange = (tabId: string) => {
    if (tabId === activeTab) return;
    setActiveTab(tabId);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tabId);
    window.history.pushState({}, '', url.toString());
  };

  const handleFollowChange = (isFollowing: boolean) => {
    setStats(prev => ({
      ...prev,
      isFollowing,
      followers: isFollowing ? prev.followers + 1 : Math.max(0, prev.followers - 1),
    }));
  };

  const handleUnfavorite = (targetId: string) => {
    let removedType = '';
    setFavorites(prev => prev.filter(favorite => {
      const matched = String(favorite.targetId) === String(targetId);
      if (matched) removedType = favorite.targetType;
      return !matched;
    }));
    setFavoriteItems(prev => {
      const next = { ...prev };
      if (removedType) delete next[`${removedType}-${targetId}`];
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white px-6 text-center">
        <p className="text-sm font-bold text-red-500">{error}</p>
        <button onClick={() => navigate('/news')} className="px-6 py-3 bg-primary text-white rounded-2xl text-xs font-black">
          返回首页
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-12">
      <div className="h-48 md:h-64 bg-surface-soft relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <button
          onClick={() => navigate('/news', { replace: true })}
          className="absolute top-6 left-6 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm hover:bg-white transition-colors z-10"
        >
          <ChevronLeft className="w-5 h-5 text-ink" />
        </button>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 md:px-20">
        <div className="flex flex-col md:flex-row gap-8 -mt-16 relative z-10">
          <ProfileInfoCard
            userData={userData}
            username={username || ''}
            stats={stats}
            handleFollowChange={handleFollowChange}
            isOwnProfile={isOwnProfile}
            onProfileUpdated={(nextUser) => {
              setProfileUser(prev => prev ? { ...prev, ...nextUser } : prev);
            }}
          />

          <div className="flex-1 space-y-6 pb-0">
            <div className="bg-white md:border md:border-hairline md:rounded-2xl p-0 md:p-4 md:shadow-sm">
              <div className="flex items-center gap-6 md:gap-8 px-4 md:px-4 border-b border-hairline overflow-x-auto no-scrollbar scroll-smooth">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all relative shrink-0 group ${activeTab === tab.id ? 'text-primary' : 'text-secondary hover:text-ink'}`}
                    >
                      <span className="relative z-10 flex items-center gap-2 transition-transform duration-200 group-hover:scale-105 active:scale-95">
                        <Icon className="w-4 h-4" />
                        {tab.name}
                      </span>
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="profileTabBottom"
                          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary z-20 shadow-[0_2px_8px_rgba(255,54,92,0.3)]"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="py-8">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.16 }}
                  className="grid md:grid-cols-2 gap-4"
                >
                  {tabLoading && activeTab !== 'settings' ? (
                    <div className="col-span-2 py-16 text-center">
                      <div className="w-7 h-7 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-xs font-bold text-muted">正在加载内容...</p>
                    </div>
                  ) : (
                    <>
                      {activeTab === 'posts' && <PostsTab posts={posts} currentUserId={currentUser?.id} setPosts={setPosts} />}
                      {activeTab === 'market' && <MarketTab items={marketItems} requireAuth={requireAuth} openPublish={openPublish} />}
                      {activeTab === 'completed' && (
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
                      )}
                      {activeTab === 'bookmarks' && (
                        <BookmarksTab
                          favorites={favorites}
                          favoriteItems={favoriteItems}
                          activeFavoriteTab={activeFavoriteTab}
                          setActiveFavoriteTab={setActiveFavoriteTab}
                          onUnfavorite={handleUnfavorite}
                        />
                      )}
                      {activeTab === 'following' && <FollowingTab following={following} navigate={navigate} />}
                      {activeTab === 'settings' && (
                        <SettingsTab
                          openPassword={() => setPasswordOverlayOpen(true)}
                          openNotification={() => setNotificationOverlayOpen(true)}
                          openPrivacy={() => setPrivacyOverlayOpen(true)}
                          logout={logout}
                        />
                      )}
                      {!['posts', 'market', 'completed', 'bookmarks', 'following', 'settings'].includes(activeTab) && <EmptyPlaceholder />}
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
          if (!reviewingOrder || !currentUser) return;
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

      {passwordOverlayOpen && <ChangePasswordOverlay isOpen={passwordOverlayOpen} onClose={() => setPasswordOverlayOpen(false)} />}
      {notificationOverlayOpen && <NotificationSettingsOverlay isOpen={notificationOverlayOpen} onClose={() => setNotificationOverlayOpen(false)} />}
      {privacyOverlayOpen && <PrivacySettingsOverlay isOpen={privacyOverlayOpen} onClose={() => setPrivacyOverlayOpen(false)} />}
    </div>
  );
}

function PostsTab({ posts, currentUserId, setPosts }: { posts: Post[]; currentUserId?: string; setPosts: React.Dispatch<React.SetStateAction<Post[]>> }) {
  if (posts.length === 0) {
    return <EmptyState text="还没有发布过动态" />;
  }
  return (
    <div className="col-span-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {posts.map(post => (
          <ProfilePostCard
            key={post.id}
            post={post}
            currentUserId={currentUserId}
            onDelete={(id) => {
              newsApi.delete(id);
              setPosts(prev => prev.filter(item => item.id !== id));
            }}
          />
        ))}
      </div>
    </div>
  );
}

function MarketTab({ items, requireAuth, openPublish }: { items: Array<Item | Service>; requireAuth: (callback: () => void) => void; openPublish: () => void }) {
  if (items.length === 0) {
    return (
      <div className="col-span-2 py-20 text-center bg-stone-50 rounded-[40px] border border-dashed border-hairline">
        <ShoppingBag className="w-12 h-12 text-hairline mx-auto mb-4" />
        <p className="text-sm font-bold text-muted">还没有发布过宝贝或服务</p>
        <button onClick={() => requireAuth(() => openPublish())} className="mt-6 px-8 py-3 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">
          去发布一个
        </button>
      </div>
    );
  }
  return (
    <div className="col-span-2">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((item) => <ProfileMarketItem key={`${'itemCondition' in item ? 'market' : 'service'}-${item.id}`} item={item} />)}
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
      <div className="col-span-2 py-20 text-center bg-stone-50 rounded-[40px] border border-dashed border-hairline">
        <CheckCircle2 className="w-12 h-12 text-hairline mx-auto mb-4" />
        <p className="text-sm font-bold text-muted">还没有进行中或已完成的服务</p>
      </div>
    );
  }

  return (
    <div className="col-span-2 space-y-6">
      {inProgressOrders.length > 0 && (
        <div>
          <h3 className="text-sm font-black text-muted uppercase tracking-widest mb-4">进行中</h3>
          <div className="space-y-4">
            {inProgressOrders.map(order => (
              <ProfileCompletedItem
                key={order.id}
                order={order}
                currentUserId={currentUserId}
                onDelete={(id) => setInProgressOrders(prev => prev.filter(item => item.id !== id))}
                onComplete={async (item) => {
                  await orderApi.complete(item.id);
                  setInProgressOrders(prev => prev.filter(orderItem => orderItem.id !== item.id));
                  setCompletedOrders(prev => [{ ...item, status: 'completed', completedTime: new Date().toISOString() }, ...prev]);
                }}
              />
            ))}
          </div>
        </div>
      )}
      {completedOrders.length > 0 && (
        <div>
          <h3 className="text-sm font-black text-muted uppercase tracking-widest mb-4">已完成</h3>
          <div className="space-y-4">
            {completedOrders.map(order => (
              <ProfileCompletedItem
                key={order.id}
                order={order}
                currentUserId={currentUserId}
                onDelete={(id) => setCompletedOrders(prev => prev.filter(item => item.id !== id))}
                onReview={openReview}
              />
            ))}
          </div>
        </div>
      )}
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
  activeFavoriteTab: 'all' | 'news' | 'market' | 'service';
  setActiveFavoriteTab: React.Dispatch<React.SetStateAction<'all' | 'news' | 'market' | 'service'>>;
  onUnfavorite: (targetId: string) => void;
}) {
  if (favorites.length === 0) {
    return (
      <div className="col-span-2 py-20 text-center bg-stone-50 rounded-[40px] border border-dashed border-hairline">
        <Bookmark className="w-12 h-12 text-hairline mx-auto mb-4" />
        <p className="text-sm font-bold text-muted">还没有收藏过任何内容</p>
      </div>
    );
  }

  return (
    <div className="col-span-2 space-y-4">
      <div className="flex items-center gap-2">
        {(['all', 'news', 'market', 'service'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFavoriteTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeFavoriteTab === tab ? 'bg-primary text-white' : 'bg-surface-soft text-secondary hover:text-ink'}`}
          >
            {tab === 'all' ? '全部' : tab === 'news' ? '动态' : tab === 'market' ? '闲置' : '服务'}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {favorites
          .filter(favorite => activeFavoriteTab === 'all' || favorite.targetType === activeFavoriteTab)
          .map(favorite => {
            const mapKey = `${favorite.targetType}-${favorite.targetId}`;
            const item = favoriteItems[mapKey];
            if (!item) return null;
            return <ProfileFavoriteItem key={mapKey} favorite={favorite} data={item} onUnfavorite={onUnfavorite} />;
          })}
      </div>
    </div>
  );
}

function FollowingTab({ following, navigate }: { following: User[]; navigate: (path: string) => void }) {
  if (following.length === 0) {
    return (
      <div className="col-span-2 py-20 text-center">
        <Users className="w-16 h-16 text-hairline mx-auto mb-4" />
        <p className="text-sm text-muted font-bold">还没有关注任何人</p>
      </div>
    );
  }

  return (
    <div className="col-span-2">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {following.map(user => (
          <div key={user.id} className="bg-white p-4 rounded-2xl border border-hairline text-center cursor-pointer hover:border-primary/30 transition-colors" onClick={() => navigate(`/profile/${user.id}`)}>
            <img src={user.avatar || getFallbackAvatar(user.name)} className="w-16 h-16 rounded-xl object-cover mx-auto mb-3 border border-hairline" alt={user.name} />
            <p className="font-bold text-sm text-ink truncate">{user.name}</p>
            {user.tag && <p className="text-xs text-primary mt-1">{user.tag}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsTab({ openPassword, openNotification, openPrivacy, logout }: { openPassword: () => void; openNotification: () => void; openPrivacy: () => void; logout: () => void }) {
  return (
    <div className="col-span-2 space-y-4">
      <div className="bg-stone-50 rounded-[32px] p-8 border border-hairline">
        <h4 className="text-sm font-black text-ink uppercase tracking-widest mb-6">账号安全</h4>
        <div className="space-y-3">
          <SettingsButton icon={<Lock className="w-4 h-4" />} title="修改登录密码" description="建议定期更换密码以保障账号安全" onClick={openPassword} />
          <SettingsButton icon={<Bell className="w-4 h-4" />} title="消息通知设置" description="管理系统通知、私信及动态提醒" onClick={openNotification} />
          <SettingsButton icon={<Eye className="w-4 h-4" />} title="隐私权限设置" description="控制个人资料及动态的可见范围" onClick={openPrivacy} />
        </div>
      </div>
      <div className="bg-red-50/30 rounded-[32px] p-8 border border-red-100">
        <h4 className="text-sm font-black text-red-600 uppercase tracking-widest mb-6">危险区域</h4>
        <button onClick={logout} className="w-full flex items-center justify-center gap-3 p-5 bg-red-500 text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-red-600 transition-all shadow-xl shadow-red-500/20 active:scale-95">
          <LogOut className="w-4 h-4" />
          退出当前账号
        </button>
      </div>
    </div>
  );
}

function SettingsButton({ icon, title, description, onClick }: { icon: React.ReactNode; title: string; description: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-hairline hover:border-primary/30 transition-all group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-surface-soft rounded-xl flex items-center justify-center text-secondary group-hover:text-primary transition-colors">{icon}</div>
        <div className="text-left">
          <p className="text-xs font-black text-ink">{title}</p>
          <p className="text-[10px] text-muted font-medium">{description}</p>
        </div>
      </div>
      <ChevronLeft className="w-4 h-4 text-muted rotate-180" />
    </button>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="col-span-2 py-20 text-center">
      <p className="text-sm text-muted font-bold">{text}</p>
    </div>
  );
}

function EmptyPlaceholder() {
  return (
    <div className="col-span-2 py-20 text-center space-y-4">
      <div className="w-16 h-16 bg-surface-soft rounded-full flex items-center justify-center mx-auto">
        <Settings className="w-6 h-6 text-muted" />
      </div>
      <p className="text-sm text-muted font-bold">暂时还没有公开的内容</p>
    </div>
  );
}

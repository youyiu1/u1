/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ChevronLeft,
  MapPin,
  Grid,
  Bookmark,
  Settings,
  Bell,
  Lock,
  Eye,
  LogOut,
  ShoppingBag,
  Users,
  Heart,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { userApi, newsApi, marketApi, serviceApi, favoriteApi } from '../services/api';
import { FollowButton } from '../components/common/FollowButton';
import { useAuth } from '../context/AuthContext';
import { useAuthCheck } from '../context/useAuthCheck';
import { usePublish } from '../context/PublishContext';
import { ProfileInfoCard } from '../components/profile/ProfileInfoCard';
import { ProfilePostCard } from '../components/profile/ProfilePostCard';
import { ProfileMarketItem } from '../components/profile/ProfileMarketItem';
import { ProfileFavoriteItem } from '../components/profile/ProfileFavoriteItem';
import { ChangePasswordOverlay, NotificationSettingsOverlay, PrivacySettingsOverlay } from '../components/settings/SettingsOverlays';
import { Post, Item, Service, User } from '../types';
import { getToken } from '../services/api';
import { getFollowState, setFollowState } from '../utils/followStorage';

export default function Profile() {
  const { username: paramUsername } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user: currentUser, logout } = useAuth();
  const { requireAuth } = useAuthCheck();
  const { openPublish } = usePublish();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 收藏相关
  const [favorites, setFavorites] = useState<any[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<Record<string, Post | Item | Service>>({});
  const [activeFavoriteTab, setActiveFavoriteTab] = useState<'all' | 'news' | 'market'>('all');

  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'posts');
  const [passwordOverlayOpen, setPasswordOverlayOpen] = useState(false);
  const [notificationOverlayOpen, setNotificationOverlayOpen] = useState(false);
  const [privacyOverlayOpen, setPrivacyOverlayOpen] = useState(false);

  // 同步Tab到URL
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tabId);
    window.history.pushState({}, '', url.toString());
  };

  const username = paramUsername || currentUser?.name;
  // 无 token 时访问个人中心（无 username 参数）跳转登录
  const isOwnProfile = !paramUsername || paramUsername === currentUser?.name;

  // 未登录访问个人主页（自己的），跳转登录
  useEffect(() => {
    if (!getToken()) {
      const isOwnProfile = !paramUsername || paramUsername === currentUser?.name;
      if (isOwnProfile) {
        navigate('/login');
      }
    }
  }, [paramUsername, currentUser, navigate]);

  const [stats, setStats] = useState({
    followers: profileUser?.followersCount || 0,
    isFollowing: profileUser?.isFollowing || false
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!username) return;
      try {
        let user;
        if (!paramUsername && getToken()) {
          try {
            user = await userApi.getCurrentUser();
            setStats({ followers: user.followersCount || 0, isFollowing: false });
          } catch (err: any) {
            navigate('/login');
            return;
          }
        } else {
          user = await userApi.getUserByName(username);
          if (currentUser && user?.id) {
            const saved = getFollowState(user.id);
            setStats({ followers: user.followersCount || 0, isFollowing: saved });
            if (!saved) {
              try {
                const following = await userApi.isFollowing(currentUser.id, user.id);
                setStats({ followers: user.followersCount || 0, isFollowing: following });
                setFollowState(user.id, following);
              } catch {
                setStats({ followers: user.followersCount || 0, isFollowing: false });
              }
            }
          } else {
            setStats({ followers: user.followersCount || 0, isFollowing: false });
          }
        }
        setProfileUser(user);

        const userId = user.id;
        if (userId) {
          const [newsData, marketData, serviceData, followingData, favoriteList] = await Promise.all([
            newsApi.getByUserId(userId).catch(() => []),
            marketApi.getByUserId(userId).catch(() => []),
            serviceApi.getByUserId(userId).catch(() => []),
            userApi.getFollowingList(userId).catch(() => []),
            isOwnProfile ? favoriteApi.list(userId).catch(() => []) : [],
          ]);
          setPosts(newsData);
          setItems(marketData);
          setServices(serviceData);
          setFollowing(followingData);
          setFavorites(favoriteList);

          // 获取收藏项的完整数据
          if (favoriteList.length > 0) {
            const itemMap: Record<string, Post | Item | Service> = {};
            const newsIds: string[] = [];
            const marketIds: string[] = [];
            const serviceIds: string[] = [];

            favoriteList.forEach((f: any) => {
              const targetId = String(f.targetId);
              const mapKey = `${f.targetType}-${targetId}`;
              if (f.targetType === 'news') newsIds.push(targetId);
              else if (f.targetType === 'market') marketIds.push(targetId);
              else if (f.targetType === 'service') serviceIds.push(targetId);
            });

            const itemResults = await Promise.all([
              newsIds.length > 0 ? Promise.all(newsIds.map((id: string) => newsApi.get(id).catch(() => null))) : [],
              marketIds.length > 0 ? Promise.all(marketIds.map((id: string) => marketApi.get(id).catch(() => null))) : [],
              serviceIds.length > 0 ? Promise.all(serviceIds.map((id: string) => serviceApi.get(id).catch(() => null))) : [],
            ]);

            newsIds.forEach((id, idx) => {
              if (itemResults[0][idx]) itemMap[`news-${id}`] = itemResults[0][idx];
            });
            marketIds.forEach((id, idx) => {
              if (itemResults[1][idx]) itemMap[`market-${id}`] = itemResults[1][idx];
            });
            serviceIds.forEach((id, idx) => {
              if (itemResults[2][idx]) itemMap[`service-${id}`] = itemResults[2][idx];
            });

            setFavoriteItems(itemMap);
          }
        }
      } catch (err: any) {
        setError(err.message || '加载失败');
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [username, currentUser, paramUsername]);

  const handleFollowChange = (isFollowing: boolean) => {
    if (!profileUser) return;
    const targetId = profileUser.id || profileUser.name;
    setStats(prev => ({
      ...prev,
      isFollowing,
      followers: isFollowing ? prev.followers + 1 : Math.max(0, prev.followers - 1)
    }));
  };

  const handleUnfavorite = (targetId: string) => {
    setFavorites(prev => prev.filter(f => f.targetId !== targetId));
    setFavoriteItems(prev => {
      const next = { ...prev };
      delete next[targetId];
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

  const userData = profileUser || {
    name: username || '未知用户',
    avatar: `https://ui-avatars.com/api/?name=${username}&background=random&size=200`,
    tag: '新晋邻居',
    isVerified: false,
    followersCount: 0,
    followingCount: 0,
  };

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
          />

          <div className="flex-1 space-y-6 pb-0">
            <div className="bg-white md:border md:border-hairline md:rounded-2xl p-0 md:p-4 md:shadow-sm">
                <div className="flex items-center gap-6 md:gap-8 px-4 md:px-4 border-b border-hairline overflow-x-auto no-scrollbar scroll-smooth">
                  {[
                    ...(isOwnProfile ? [
                      { id: 'posts', name: '社区动态', icon: <Grid className="w-4 h-4" /> },
                      { id: 'market', name: '发布清单', icon: <ShoppingBag className="w-4 h-4" /> },
                      { id: 'bookmarks', name: '收藏夾', icon: <Bookmark className="w-4 h-4" /> },
                      { id: 'following', name: '关注邻里', icon: <Users className="w-4 h-4" /> },
                      { id: 'settings', name: '系统设置', icon: <Settings className="w-4 h-4" /> },
                    ] : [
                      { id: 'posts', name: '社区动态', icon: <Grid className="w-4 h-4" /> },
                      { id: 'likes', name: '点赞内容', icon: <Heart className="w-4 h-4" /> },
                    ])
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all relative shrink-0 group ${
                        activeTab === tab.id ? 'text-primary' : 'text-secondary hover:text-ink'
                      }`}
                    >
                      <span className="relative z-10 flex items-center gap-2 transition-transform duration-300 group-hover:scale-105 active:scale-95">
                        {tab.icon}
                        {tab.name}
                      </span>

                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="profileTabBottom"
                          transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 30,
                            mass: 1
                          }}
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary z-20 shadow-[0_2px_8px_rgba(255,54,92,0.3)]"
                        />
                      )}
                    </button>
                  ))}
                </div>

               <div className="py-8">
                 <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="grid md:grid-cols-2 gap-4"
                    >
                       {activeTab === 'posts' && (
                         posts.length > 0 ? (
                           <div className="space-y-3">
                             {posts.map(post => <ProfilePostCard key={post.id} post={post} />)}
                           </div>
                         ) : (
                            <div className="py-20 text-center">
                              <p className="text-sm text-muted font-bold">还没有发布过动态呢</p>
                            </div>
                         )
                       )}

                       {activeTab === 'market' && (
                         <div className="col-span-2">
                           {items.length > 0 || services.length > 0 ? (
                             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                               {[...items, ...services].map((item: any) => (
                                 <ProfileMarketItem key={item.id} item={item} />
                               ))}
                             </div>
                           ) : (
                             <div className="py-20 text-center bg-stone-50 rounded-[40px] border border-dashed border-hairline">
                                <ShoppingBag className="w-12 h-12 text-hairline mx-auto mb-4" />
                                <p className="text-sm font-bold text-muted">还没有发布过宝贝或服务呢</p>
                                <button
                                  onClick={() => requireAuth(() => openPublish())}
                                  className="mt-6 px-8 py-3 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest"
                                >
                                  去发布一个
                                </button>
                             </div>
                           )}
                         </div>
                       )}

                       {activeTab === 'bookmarks' && (
                         <div className="col-span-2 space-y-4">
                           {favorites.length > 0 ? (
                             <>
                               {/* 子Tab */}
                               <div className="flex items-center gap-2">
                                 {(['all', 'news', 'market', 'service'] as const).map(tab => (
                                   <button
                                     key={tab}
                                     onClick={() => setActiveFavoriteTab(tab)}
                                     className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                       activeFavoriteTab === tab
                                         ? 'bg-primary text-white'
                                         : 'bg-surface-soft text-secondary hover:text-ink'
                                     }`}
                                   >
                                     {tab === 'all' ? '全部' : tab === 'news' ? '动态' : tab === 'market' ? '闲置' : '服务'}
                                   </button>
                                 ))}
                               </div>
                               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                 {favorites
                                   .filter(f => activeFavoriteTab === 'all' || f.targetType === activeFavoriteTab)
                                   .map(fav => {
                                     const mapKey = `${fav.targetType}-${fav.targetId}`;
                                     const item = favoriteItems[mapKey];
                                     if (!item) return null;
                                     return (
                                       <ProfileFavoriteItem
                                         key={mapKey}
                                         favorite={fav}
                                         data={item}
                                         onUnfavorite={handleUnfavorite}
                                       />
                                     );
                                   })}
                               </div>
                             </>
                           ) : (
                             <div className="py-20 text-center bg-stone-50 rounded-[40px] border border-dashed border-hairline">
                               <Bookmark className="w-12 h-12 text-hairline mx-auto mb-4" />
                               <p className="text-sm font-bold text-muted">还没有收藏过任何内容</p>
                             </div>
                           )}
                         </div>
                       )}

                       {activeTab === 'following' && (
                         <div className="col-span-2">
                           {following.length === 0 ? (
                             <div className="py-20 text-center">
                               <Users className="w-16 h-16 text-hairline mx-auto mb-4" />
                               <p className="text-sm text-muted font-bold">还没有关注任何人</p>
                             </div>
                           ) : (
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                               {following.map(user => (
                                 <div key={user.id} className="bg-white p-4 rounded-2xl border border-hairline text-center cursor-pointer hover:border-primary/30 transition-colors"
                                   onClick={() => navigate(`/profile/${user.name}`)}>
                                   <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&size=100`}
                                     className="w-16 h-16 rounded-xl object-cover mx-auto mb-3 border border-hairline" alt={user.name} />
                                   <p className="font-bold text-sm text-ink truncate">{user.name}</p>
                                   {user.tag && <p className="text-xs text-primary mt-1">{user.tag}</p>}
                                 </div>
                               ))}
                             </div>
                           )}
                         </div>
                       )}

                       {activeTab === 'settings' && (
                         <div className="col-span-2 space-y-4">
                            <div className="bg-stone-50 rounded-[32px] p-8 border border-hairline">
                               <h4 className="text-sm font-black text-ink uppercase tracking-widest mb-6">账户安全</h4>
                               <div className="space-y-3">
                                  <button
                                    onClick={() => setPasswordOverlayOpen(true)}
                                    className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-hairline hover:border-primary/30 transition-all group"
                                  >
                                     <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-surface-soft rounded-xl flex items-center justify-center text-secondary group-hover:text-primary transition-colors">
                                           <Lock className="w-4 h-4" />
                                        </div>
                                        <div className="text-left">
                                           <p className="text-xs font-black text-ink">修改登录密码</p>
                                           <p className="text-[10px] text-muted font-medium">建议定期更换密码以保障账户安全</p>
                                        </div>
                                     </div>
                                     <ChevronLeft className="w-4 h-4 text-muted rotate-180" />
                                  </button>
                                  <button
                                    onClick={() => setNotificationOverlayOpen(true)}
                                    className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-hairline hover:border-primary/30 transition-all group"
                                  >
                                     <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-surface-soft rounded-xl flex items-center justify-center text-secondary group-hover:text-primary transition-colors">
                                           <Bell className="w-4 h-4" />
                                        </div>
                                        <div className="text-left">
                                           <p className="text-xs font-black text-ink">消息通知设置</p>
                                           <p className="text-[10px] text-muted font-medium">管理系统通知、私信及动态提醒</p>
                                        </div>
                                     </div>
                                     <ChevronLeft className="w-4 h-4 text-muted rotate-180" />
                                  </button>
                                  <button
                                    onClick={() => setPrivacyOverlayOpen(true)}
                                    className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-hairline hover:border-primary/30 transition-all group"
                                  >
                                     <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-surface-soft rounded-xl flex items-center justify-center text-secondary group-hover:text-primary transition-colors">
                                           <Eye className="w-4 h-4" />
                                        </div>
                                        <div className="text-left">
                                           <p className="text-xs font-black text-ink">隐私权限设置</p>
                                           <p className="text-[10px] text-muted font-medium">控制个人资料及动态的可见范围</p>
                                        </div>
                                     </div>
                                     <ChevronLeft className="w-4 h-4 text-muted rotate-180" />
                                  </button>
                               </div>
                            </div>

                            <div className="bg-red-50/30 rounded-[32px] p-8 border border-red-100">
                               <h4 className="text-sm font-black text-red-600 uppercase tracking-widest mb-6">危险区域</h4>
                               <button
                                 onClick={() => logout()}
                                 className="w-full flex items-center justify-center gap-3 p-5 bg-red-500 text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-red-600 transition-all shadow-xl shadow-red-500/20 active:scale-95"
                               >
                                  <LogOut className="w-4 h-4" />
                                  退出当前账号
                               </button>
                            </div>
                         </div>
                       )}

                       {activeTab !== 'posts' && activeTab !== 'market' && activeTab !== 'following' && activeTab !== 'settings' && (
                         <div className="col-span-2 py-20 text-center space-y-4">
                            <div className="w-16 h-16 bg-surface-soft rounded-full flex items-center justify-center mx-auto">
                              <Settings className="w-6 h-6 text-muted" />
                            </div>
                            <p className="text-sm text-muted font-bold">暂时还没有公开的内容...</p>
                         </div>
                       )}
                    </motion.div>
                 </AnimatePresence>
               </div>
            </div>
          </div>
        </div>
      </div>

      <ChangePasswordOverlay isOpen={passwordOverlayOpen} onClose={() => setPasswordOverlayOpen(false)} />
      <NotificationSettingsOverlay isOpen={notificationOverlayOpen} onClose={() => setNotificationOverlayOpen(false)} />
      <PrivacySettingsOverlay isOpen={privacyOverlayOpen} onClose={() => setPrivacyOverlayOpen(false)} />
    </div>
  );
}
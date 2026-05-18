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
import { userApi, newsApi, marketApi, serviceApi } from '../services/api';
import { FollowButton } from '../components/common/FollowButton';
import { useAuth } from '../context/AuthContext';
import { ProfileInfoCard } from '../components/profile/ProfileInfoCard';
import { ProfilePostCard } from '../components/profile/ProfilePostCard';
import { ProfileMarketItem } from '../components/profile/ProfileMarketItem';
import { Post, Item, Service, User } from '../types';

export default function Profile() {
  const { username: paramUsername } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user: currentUser, logout } = useAuth();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initialTab = searchParams.get('tab') || 'posts';
  const [activeTab, setActiveTab] = useState(initialTab);

  const username = paramUsername || currentUser?.name;
  const isOwnProfile = !paramUsername || paramUsername === currentUser?.name;

  const [stats, setStats] = useState({
    followers: profileUser?.followersCount || 0,
    isFollowing: profileUser?.isFollowing || false
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!username) return;
      try {
        if (currentUser && username === currentUser.name) {
          setProfileUser(currentUser);
        } else {
          setProfileUser({
            id: username,
            name: username,
            avatar: `https://ui-avatars.com/api/?name=${username}&background=random&size=200`,
            tag: '新晋邻居',
            isVerified: false,
            followersCount: 0,
            followingCount: 0,
          });
        }
        const [newsData, marketData, serviceData] = await Promise.all([
          newsApi.list().catch(() => []),
          marketApi.list().catch(() => []),
          serviceApi.list().catch(() => []),
        ]);
        setPosts(newsData.filter((p: Post) => p.author.name === username));
        setItems(marketData.filter((i: Item) => i.seller?.name === username));
        setServices(serviceData.filter((s: Service) => s.seller?.name === username));
      } catch (err: any) {
        setError(err.message || '加载失败');
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [username, currentUser]);

  useEffect(() => {
    if (profileUser) {
      setStats({
        followers: profileUser.followersCount || 0,
        isFollowing: profileUser.isFollowing || false
      });
    }
  }, [profileUser]);

  const handleFollowChange = async (isFollowing: boolean) => {
    if (!currentUser || !profileUser) return;
    try {
      if (isFollowing) {
        await userApi.follow(currentUser.id, profileUser.id || profileUser.name);
      } else {
        await userApi.unfollow(currentUser.id, profileUser.id || profileUser.name);
      }
      setStats(prev => ({
        ...prev,
        isFollowing,
        followers: isFollowing ? prev.followers + 1 : Math.max(0, prev.followers - 1)
      }));
    } catch (err) {
      console.error('关注操作失败', err);
    }
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
          onClick={() => navigate(-1)}
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
                      onClick={() => setActiveTab(tab.id)}
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
                           posts.map(post => <ProfilePostCard key={post.id} post={post} />)
                         ) : (
                            <div className="col-span-2 py-20 text-center">
                              <p className="text-sm text-muted font-bold">还没有发布过动态呢</p>
                            </div>
                         )
                       )}

                       {activeTab === 'market' && (
                         <div className="col-span-2">
                           {items.length > 0 || services.length > 0 ? (
                             <div className="grid sm:grid-cols-2 gap-6">
                               {[...items, ...services].map((item: any) => (
                                 <ProfileMarketItem key={item.id} item={item} />
                               ))}
                             </div>
                           ) : (
                             <div className="py-20 text-center bg-stone-50 rounded-[40px] border border-dashed border-hairline">
                                <ShoppingBag className="w-12 h-12 text-hairline mx-auto mb-4" />
                                <p className="text-sm font-bold text-muted">还没有发布过宝贝或服务呢</p>
                                <button
                                  onClick={() => navigate('/')}
                                  className="mt-6 px-8 py-3 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest"
                                >
                                  去发布一个
                                </button>
                             </div>
                           )}
                         </div>
                       )}

                       {activeTab === 'following' && (
                         <div className="col-span-2 py-20 text-center">
                            <p className="text-sm text-muted font-bold">暂无关注</p>
                         </div>
                       )}

                       {activeTab === 'settings' && (
                         <div className="col-span-2 space-y-4">
                            <div className="bg-stone-50 rounded-[32px] p-8 border border-hairline">
                               <h4 className="text-sm font-black text-ink uppercase tracking-widest mb-6">账户安全</h4>
                               <div className="space-y-3">
                                  {[
                                    { icon: <Lock className="w-4 h-4" />, label: '修改登录密码', desc: '建议定期更换密码以保障账户安全' },
                                    { icon: <Bell className="w-4 h-4" />, label: '消息通知设置', desc: '管理系统通知、私信及动态提醒' },
                                    { icon: <Eye className="w-4 h-4" />, label: '隐私权限设置', desc: '控制个人资料及动态的可见范围' },
                                  ].map((item, i) => (
                                    <button key={i} className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-hairline hover:border-primary/30 transition-all group">
                                       <div className="flex items-center gap-4">
                                          <div className="w-10 h-10 bg-surface-soft rounded-xl flex items-center justify-center text-secondary group-hover:text-primary transition-colors">
                                             {item.icon}
                                          </div>
                                          <div className="text-left">
                                             <p className="text-xs font-black text-ink">{item.label}</p>
                                             <p className="text-[10px] text-muted font-medium">{item.desc}</p>
                                          </div>
                                       </div>
                                       <ChevronLeft className="w-4 h-4 text-muted rotate-180" />
                                    </button>
                                  ))}
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
    </div>
  );
}
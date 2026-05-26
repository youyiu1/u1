/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MessageSquare, Heart, Share2, MoreHorizontal, MapPin, Image as ImageIcon, TrendingUp, Users, Bookmark } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { newsApi, userApi, favoriteApi } from '../services/api';
import { FollowButton } from '../components/common/FollowButton';
import { BackToTop } from '../components/common/BackToTop';
import { Post } from '../types';
import { getFollowState, setFollowState } from '../utils/followStorage';
import { useToast } from '../context/ToastContext';

const TRENDING = [
  { id: 't1', name: '五一小长假去哪玩', posts: '1.2k' },
  { id: 't2', name: '小区楼下新开的咖啡店', posts: '856' },
  { id: 't3', name: '寻找滨江公园慢跑搭子', posts: '432' },
  { id: 't4', name: '二手书共享计划', posts: '210' },
];

const SUGGESTED_USERS = [
  { id: 'u1', name: '王大厨', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100', desc: '资深美食家', isFollowing: false },
  { id: 'u2', name: '摄影师小林', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100', desc: '发现身边的美', isFollowing: true },
];

export default function News() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postText, setPostText] = useState('');
  const { showToast } = useToast();
  const [suggestedUsers, setSuggestedUsers] = useState<Array<{id: string, name: string, avatar: string, desc: string, isFollowing: boolean}>>(() => {
    return SUGGESTED_USERS.map(u => ({
      ...u,
      isFollowing: getFollowState('suggested_' + u.id)
    }));
  });

  // 解析images JSON字符串为数组
  const getImages = (imgs: any): string[] => {
    if (Array.isArray(imgs)) return imgs;
    if (typeof imgs === 'string' && imgs.startsWith('[')) {
      try { return JSON.parse(imgs); } catch { return []; }
    }
    return [];
  };

  const handleSuggestedFollowChange = async (userId: string, newState: boolean) => {
    const currentUser = JSON.parse(localStorage.getItem('neighborhood_user') || '{}');
    if (!currentUser.id) return;
    try {
      if (newState) {
        await userApi.follow(currentUser.id, userId);
      } else {
        await userApi.unfollow(currentUser.id, userId);
      }
      setSuggestedUsers(prev => {
        const updated = prev.map(u => u.id === userId ? { ...u, isFollowing: newState } : u);
        setFollowState('suggested_' + userId, newState);
        return updated;
      });
    } catch {}
  };

  const handlePostFollowChange = async (authorId: string, newState: boolean) => {
    const currentUser = JSON.parse(localStorage.getItem('neighborhood_user') || '{}');
    if (!currentUser.id || !authorId) return;
    try {
      if (newState) {
        await userApi.follow(currentUser.id, authorId);
      } else {
        await userApi.unfollow(currentUser.id, authorId);
      }
      // 更新posts中的isFollowing状态
      setPosts(prev => prev.map(p => {
        if (p.authorId === authorId || p.author?.id === authorId) {
          return { ...p, isFollowing: newState };
        }
        return p;
      }));
      setFollowState(authorId, newState);
    } catch {}
  };

  const toggleLike = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const currentUser = JSON.parse(localStorage.getItem('neighborhood_user') || '{}');
    if (!currentUser.id) {
      showToast('请先登录', 'warning');
      return;
    }
    // 先获取当前状态用于乐观更新
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const wasLiked = post.isLiked;
    try {
      await newsApi.like(postId);
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            isLiked: !wasLiked,
            likes: wasLiked ? Math.max(0, p.likes - 1) : p.likes + 1,
          };
        }
        return p;
      }));
    } catch {
      // 失败时回滚
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return { ...p, isLiked: wasLiked, likes: post.likes };
        }
        return p;
      }));
      showToast('操作失败', 'error');
    }
  };

  const toggleFavorite = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const currentUser = JSON.parse(localStorage.getItem('neighborhood_user') || '{}');
    if (!currentUser.id) {
      showToast('请先登录', 'warning');
      return;
    }
    // 先获取当前状态用于乐观更新
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const wasFavorited = post.isFavorited;
    try {
      if (wasFavorited) {
        await favoriteApi.remove(currentUser.id, 'news', postId);
      } else {
        await favoriteApi.add(currentUser.id, 'news', postId);
      }
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            isFavorited: !wasFavorited,
            collections: wasFavorited ? Math.max(0, p.collections - 1) : p.collections + 1,
          };
        }
        return p;
      }));
      showToast(wasFavorited ? '已取消收藏' : '已收藏', 'success');
    } catch {
      // 失败时回滚
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return { ...p, isFavorited: wasFavorited, collections: post.collections };
        }
        return p;
      }));
      showToast('操作失败', 'error');
    }
  };

  const handleShare = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/news/${postId}`);
      showToast('链接已复制', 'success');
    } catch {
      showToast('分享链接复制失败', 'error');
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await newsApi.list();
        setPosts(data);
      } catch (err: any) {
        setError(err.message || '加载失败');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleCreatePost = async () => {
    if (!postText.trim()) return;
    try {
      await newsApi.create({
        title: postText.slice(0, 50),
        content: postText,
        category: '生活记录',
      });
      setPostText('');
      const data = await newsApi.list();
      setPosts(data);
    } catch (err: any) {
      alert(err.message || '发布失败');
    }
  };

  return (
    <div className="bg-surface-soft/30 min-h-screen pb-20">
      <div className="max-w-[1280px] mx-auto px-6 md:px-20 py-12">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <header className="mb-10 text-left">
              <h1 className="text-3xl font-extrabold text-ink mb-2">同城动态</h1>
              <p className="text-secondary font-medium italic">发现身边有趣的事，连接真实的邻里</p>
            </header>

            <div className="bg-white border border-hairline rounded-3xl p-6 shadow-sm">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-surface-soft overflow-hidden border border-hairline shrink-0">
                  <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100" className="w-full h-full object-cover" alt="User avatar" />
                </div>
                <div className="flex-1 space-y-4">
                  <textarea
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    placeholder="分享你的邻里发现..."
                    className="w-full bg-transparent border-none p-2 focus:ring-0 text-sm font-medium text-ink placeholder:text-muted/60 resize-none min-h-[80px]"
                  />
                  <div className="flex items-center justify-between pt-4 border-t border-hairline">
                    <div className="flex items-center gap-3">
                       <button className="flex items-center gap-1.5 p-2 hover:bg-surface-soft rounded-xl transition-all">
                         <ImageIcon className="w-4 h-4 text-green-500" />
                         <span className="text-xs font-bold text-muted">图片</span>
                       </button>
                       <button className="flex items-center gap-1.5 p-2 hover:bg-surface-soft rounded-xl transition-all">
                         <MapPin className="w-4 h-4 text-primary" />
                         <span className="text-xs font-bold text-muted">地点</span>
                       </button>
                    </div>
                    <button
                      onClick={handleCreatePost}
                      disabled={!postText.trim()}
                      className={`px-6 py-2.5 rounded-2xl font-bold text-xs transition-all ${postText.trim() ? 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20' : 'bg-surface-soft text-muted cursor-not-allowed'}`}
                    >
                      发布动态
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-48 bg-stone-200 animate-pulse rounded-3xl" />
                ))
              ) : error ? (
                <div className="text-center text-red-500 py-8">{error}</div>
              ) : posts.length === 0 ? (
                <div className="text-center py-16 text-muted">暂无动态</div>
              ) : (
                posts.map((post) => {
                  // 兼容后端 NewsVO 扁平结构和旧 author 对象结构
                  const authorId = post.author?.id || post.authorId || '';
                  const authorName = post.author?.name || post.authorName || '匿名用户';
                  const authorAvatar = post.author?.avatar || post.authorAvatar || '';
                  const postTime = post.time || post.createTime || '';
                  return (
                  <article
                    key={post.id}
                    className="bg-white border border-hairline rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/news/${post.id}`)}
                  >
                    <header className="flex items-center justify-between mb-4">
                      <div
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/profile/${authorName}`);
                        }}
                      >
                        {authorAvatar && (
                        <img src={authorAvatar} className="w-10 h-10 rounded-xl object-cover border border-hairline group-hover:border-primary transition-all" alt={authorName} />
                        )}
                        <div>
                          <h4 className="text-sm font-bold text-ink group-hover:text-primary transition-colors">{authorName}</h4>
                          <span className="text-[10px] text-muted font-bold block">{postTime} · {post.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <FollowButton
                          size="sm"
                          variant="ghost"
                          isFollowingInitial={post.isFollowing ?? false}
                          onFollowChange={(newState) => handlePostFollowChange(authorId, newState)}
                        />
                        <button className="p-2 text-muted hover:bg-surface-soft rounded-xl transition-all">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </header>

                    <div className="space-y-4">
                      <p className="text-sm text-secondary font-medium leading-relaxed group-hover:text-ink transition-colors">
                        {post.content}
                      </p>

                      {(getImages(post.images) || []).length > 0 && (
                        <div className={`grid gap-2 overflow-hidden rounded-2xl border border-hairline ${getImages(post.images).length >= 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                          {getImages(post.images).map((img, i) => (
                            <div key={i} className="aspect-[16/9]">
                              <img src={img || undefined} className="w-full h-full object-cover" alt="Post content" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <footer className="flex items-center gap-6 mt-6 pt-4 border-t border-hairline">
                      <button
                        onClick={(e) => toggleLike(post.id, e)}
                        className={`flex items-center gap-1.5 transition-colors group ${post.isLiked ? 'text-red-500' : 'text-muted hover:text-red-500'}`}
                      >
                        <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : 'group-hover:fill-current'}`} />
                        <span className="text-xs font-bold">{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-1.5 text-muted hover:text-blue-500 transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-xs font-bold">{post.commentsCount}</span>
                      </button>
                      <button
                        onClick={(e) => handleShare(post.id, e)}
                        className="flex items-center gap-1.5 text-muted hover:text-green-500 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        <span className="text-xs font-bold">{post.shares}</span>
                      </button>
                      <button
                        onClick={(e) => toggleFavorite(post.id, e)}
                        className={`flex items-center gap-1.5 transition-colors ${post.isFavorited ? 'text-accent-gold' : 'text-muted hover:text-accent-gold'}`}
                      >
                        <Bookmark className={`w-4 h-4 ${post.isFavorited ? 'fill-current' : ''}`} />
                        <span className="text-xs font-bold">{post.collections}</span>
                      </button>
                    </footer>
                  </article>
                  );
                })
              )}
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-8">
            <div className="bg-white border border-hairline rounded-3xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                热门话题
              </h3>
              <div className="space-y-4">
                {TRENDING.map((item, idx) => (
                  <div key={idx} className="group cursor-pointer flex items-start gap-3">
                    <span className="text-xs font-bold text-muted">#{idx + 1}</span>
                    <div>
                      <p className="text-sm font-bold text-ink group-hover:text-primary transition-colors">#{item.name}</p>
                      <p className="text-[11px] text-muted font-medium">{item.posts} 条相关动态</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-hairline rounded-3xl p-6 shadow-sm">
               <h3 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
                 <Users className="w-5 h-5 text-primary" />
                 发现邻居
               </h3>
               <div className="space-y-6">
                 {suggestedUsers.map((user) => (
                   <div key={user.id} className="flex items-center justify-between group">
                     <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/profile/${user.name}`)}>
                       <img src={user.avatar || undefined} className="w-10 h-10 rounded-xl object-cover border border-hairline group-hover:scale-105 transition-all" alt={user.name} />
                       <div className="min-w-0">
                         <p className="text-xs font-black text-ink group-hover:text-primary transition-colors truncate">{user.name}</p>
                         <p className="text-[10px] text-muted font-bold truncate">{user.desc}</p>
                       </div>
                     </div>
                     <FollowButton
                        isFollowingInitial={user.isFollowing}
                        onFollowChange={(newState) => handleSuggestedFollowChange(user.id, newState)}
                        size="sm"
                        variant="ghost"
                        className="shrink-0"
                      />
                   </div>
                 ))}
               </div>
            </div>
          </aside>
        </div>
      </div>
      <BackToTop />
    </div>
  );
}
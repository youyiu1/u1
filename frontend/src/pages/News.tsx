/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Share2, MoreHorizontal, MapPin, Image as ImageIcon, TrendingUp, Users, X, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { newsApi, userApi, fileApi } from '../services/api';
import { FollowButton } from '../components/common/FollowButton';
import { BackToTop } from '../components/common/BackToTop';
import { PostItemActions } from '../components/common/PostItemActions';
import { PostMenu } from '../components/common/PostMenu';
import { Post, User } from '../types';
import { getFollowState, setFollowState } from '../utils/followStorage';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { LocationPicker } from '../components/common/LocationPicker';
import { formatDateTime } from '../utils/dateTime';
import { getStoredUser } from '../utils/authStorage';
import { parseImages } from '../utils/images';

export default function News() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postText, setPostText] = useState('');
  const [postImages, setPostImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [postLocation, setPostLocation] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  const [trending, setTrending] = useState<Array<{id: string, name: string, posts: string}>>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<Array<{id: string, name: string, avatar: string, tag: string, followersCount: number, isFollowing: boolean}>>([]);

  // 解析内容中的 #话题# 标签
  const parseContentWithHashtags = (content: string): React.ReactNode => {
    const hashtagRegex = /#([^#]+)#/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    while ((match = hashtagRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }
      parts.push(
        <span key={match.index} className="text-yellow-500 font-black">{match[0]}</span>
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }
    return parts.length > 0 ? <>{parts}</> : content;
  };

  const handleSuggestedFollowChange = async (userId: string, newState: boolean) => {
    const storedUser = getStoredUser();
    if (!storedUser?.id) return;
    try {
      if (newState) {
        await userApi.follow(storedUser.id, userId);
      } else {
        await userApi.unfollow(storedUser.id, userId);
      }
      setSuggestedUsers(prev => {
        const updated = prev.map(u => u.id === userId ? { ...u, isFollowing: newState } : u);
        setFollowState(userId, newState);
        return updated;
      });
    } catch {}
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

    // 获取热门话题
    const fetchTrending = async () => {
      try {
        const data = await newsApi.getTrending(4);
        setTrending(data.map((p: Post) => ({
          id: p.id,
          name: p.content?.slice(0, 20) || '热门话题',
          posts: String(p.commentsCount || 0),
        })));
      } catch {}
    };

    // 获取推荐用户
    const fetchSuggestedUsers = async () => {
      try {
        const data = await userApi.getSuggestedUsers(5);
        setSuggestedUsers(data.map((u: User) => ({
          id: u.id,
          name: u.name,
          avatar: u.avatar || '',
          tag: u.tag || '',
          followersCount: u.followersCount || 0,
          isFollowing: getFollowState(u.id) ?? false,
        })));
      } catch {}
    };

    fetchTrending();
    fetchSuggestedUsers();
  }, []);

  const handleCreatePost = async () => {
    if (!postText.trim()) return;
    try {
      await newsApi.create({
        title: postText.slice(0, 50),
        content: postText,
        category: '生活记录',
        images: postImages.length > 0 ? JSON.stringify(postImages) : undefined,
        location: postLocation || undefined,
      });
      setPostText('');
      setPostImages([]);
      setPostLocation('');
      const data = await newsApi.list();
      setPosts(data);
    } catch (err: any) {
      alert(err.message || '发布失败');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await fileApi.upload(file);
      setPostImages(prev => [...prev, url]);
      showToast('图片上传成功', 'success');
    } catch (err: any) {
      showToast(err.message || '图片上传失败', 'error');
    } finally {
      setIsUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setPostImages(prev => prev.filter((_, i) => i !== index));
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
                  {currentUser?.avatar ? (
                    <img src={currentUser.avatar} className="w-full h-full object-cover" alt="User avatar" />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-black text-lg">
                      {(currentUser?.name || '?')[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-4">
                  <textarea
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    placeholder="分享你的邻里发现... 输入#话题#添加标签"
                    className="w-full bg-transparent border-none p-2 focus:ring-0 text-sm font-medium text-ink placeholder:text-muted/60 resize-none min-h-[80px]"
                  />
                  {/* 已上传图片预览 */}
                  {postImages.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {postImages.map((url, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-hairline">
                          <img src={url} className="w-full h-full object-cover" alt="Preview" />
                          <button
                            onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 p-1 bg-ink/60 text-white rounded-full hover:bg-red-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* 地点展示 */}
                  {postLocation && (
                    <div className="flex items-center gap-2 bg-surface-soft rounded-xl px-3 py-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="flex-1 text-xs font-medium text-ink">{postLocation}</span>
                      <button onClick={() => setPostLocation('')} className="p-1 hover:bg-white rounded-full transition-colors">
                        <X className="w-3 h-3 text-muted" />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t border-hairline">
                    <div className="flex items-center gap-3">
                       <button
                         onClick={() => setPostText(prev => prev + '#话题#')}
                         className="flex items-center gap-1.5 p-2 hover:bg-surface-soft rounded-xl transition-all"
                       >
                         <span className="text-xs font-bold text-muted">#</span>
                       </button>
                       <input
                         ref={imageInputRef}
                         type="file"
                         accept="image/*"
                         onChange={handleImageUpload}
                         className="hidden"
                       />
                       <button
                         onClick={() => imageInputRef.current?.click()}
                         disabled={isUploading}
                         className="flex items-center gap-1.5 p-2 hover:bg-surface-soft rounded-xl transition-all disabled:opacity-50"
                       >
                         {isUploading ? <Loader2 className="w-4 h-4 text-green-500 animate-spin" /> : <ImageIcon className="w-4 h-4 text-green-500" />}
                         <span className="text-xs font-bold text-muted">图片</span>
                       </button>
                       <button
                         onClick={() => setShowLocationPicker(true)}
                         className="flex items-center gap-1.5 p-2 hover:bg-surface-soft rounded-xl transition-all"
                       >
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
                  const postTime = formatDateTime(post.time || post.createTime, '刚刚');
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
                          targetId={authorId}
                          size="sm"
                          variant="ghost"
                          isFollowingInitial={post.isFollowing ?? false}
                          onFollowChange={(newState) => {
                            setPosts(prev => prev.map(p => {
                              if (p.authorId === authorId || p.author?.id === authorId) {
                                return { ...p, isFollowing: newState };
                              }
                              return p;
                            }));
                          }}
                        />
                        <PostMenu
                          isOwner={currentUser?.id === authorId}
                          onDelete={async () => {
                            if (!window.confirm('确定要删除这条动态吗？')) return;
                            await newsApi.delete(post.id);
                            setPosts(prev => prev.filter(p => p.id !== post.id));
                          }}
                          onReport={async () => {
                            if (!window.confirm('确定要举报这条动态吗？')) return;
                            showToast('举报成功，我们会尽快处理', 'success');
                          }}
                        />
                      </div>
                    </header>

                    <div className="space-y-4">
                      <p className="text-sm text-secondary font-medium leading-relaxed group-hover:text-ink transition-colors">
                        {parseContentWithHashtags(post.content)}
                      </p>

                      {parseImages(post.images).length > 0 && (
                        <div className={`grid gap-2 overflow-hidden rounded-2xl border border-hairline ${parseImages(post.images).length >= 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                          {parseImages(post.images).map((img, i) => (
                            <div key={`${post.id}-${i}-${img}`} className="aspect-[16/9]">
                              <img src={img || undefined} className="w-full h-full object-cover" alt="Post content" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <PostItemActions post={post} />
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
                {trending.map((item, idx) => (
                  <div key={item.id || idx} className="group cursor-pointer flex items-start gap-3">
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
                         <p className="text-[10px] text-muted font-bold truncate">{user.followersCount} 粉丝</p>
                       </div>
                     </div>
                     <FollowButton
                        targetId={user.id}
                        isFollowingInitial={user.isFollowing}
                        onFollowChange={(newState) => {
                          setSuggestedUsers(prev => prev.map(u => u.id === user.id ? { ...u, isFollowing: newState } : u));
                        }}
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
      <LocationPicker
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSelect={(location) => setPostLocation(location.name)}
      />
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Newspaper, MessageCircle, Heart, Share2, MoreHorizontal, MapPin, Image as ImageIcon, Smile, Send, TrendingUp, Users, Bookmark, MessageSquare, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { POSTS, TRENDING, SUGGESTED_USERS } from '../constants';
import { FollowButton } from '../components/common/FollowButton';

export default function News() {
  const navigate = useNavigate();
  const [postText, setPostText] = useState('');

  return (
    <div className="bg-surface-soft/30 min-h-screen pb-20">
      <div className="max-w-[1280px] mx-auto px-6 md:px-20 py-12">
        <div className="grid lg:grid-cols-12 gap-10">
          {/* Main Feed */}
          <div className="lg:col-span-8 space-y-8">
            <header className="mb-10 text-left">
              <h1 className="text-3xl font-extrabold text-ink mb-2">同城动态</h1>
              <p className="text-secondary font-medium italic">发现身边有趣的事，连接真实的邻里</p>
            </header>

            {/* Post Creator */}
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
                      disabled={!postText.trim()}
                      className={`px-6 py-2.5 rounded-2xl font-bold text-xs transition-all ${postText.trim() ? 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20' : 'bg-surface-soft text-muted cursor-not-allowed'}`}
                    >
                      发布动态
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Post Feed */}
            <div className="space-y-6">
              {POSTS.map((post) => (
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
                        navigate(`/profile/${post.author.name}`);
                      }}
                    >
                      <img src={post.author.avatar} className="w-10 h-10 rounded-xl object-cover border border-hairline group-hover:border-primary transition-all" alt={post.author.name} />
                      <div>
                        <h4 className="text-sm font-bold text-ink group-hover:text-primary transition-colors">{post.author.name}</h4>
                        <span className="text-[10px] text-muted font-bold block">{post.time} · {post.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <FollowButton size="sm" variant="ghost" />
                      <button className="p-2 text-muted hover:bg-surface-soft rounded-xl transition-all">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </header>

                  <div className="space-y-4">
                    <p className="text-sm text-secondary font-medium leading-relaxed group-hover:text-ink transition-colors">
                      {post.content}
                    </p>
                    
                    {post.images.length > 0 && (
                      <div className={`grid gap-2 overflow-hidden rounded-2xl border border-hairline ${post.images.length >= 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {post.images.map((img, i) => (
                          <div key={i} className="aspect-[16/9]">
                            <img src={img} className="w-full h-full object-cover" alt="Post content" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <footer className="flex items-center gap-6 mt-6 pt-4 border-t border-hairline">
                    <button className="flex items-center gap-1.5 text-muted hover:text-red-500 transition-colors group">
                      <Heart className="w-4 h-4 group-hover:fill-current" />
                      <span className="text-xs font-bold">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-muted hover:text-blue-500 transition-colors">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-xs font-bold">{post.commentsCount}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-muted hover:text-green-500 transition-colors">
                      <Share2 className="w-4 h-4" />
                      <span className="text-xs font-bold font-bold">{post.shares}</span>
                    </button>
                  </footer>
                </article>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Trending topics */}
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

            {/* Suggested Neighbors */}
            <div className="bg-white border border-hairline rounded-3xl p-6 shadow-sm">
               <h3 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
                 <Users className="w-5 h-5 text-primary" />
                 发现邻居
               </h3>
               <div className="space-y-6">
                 {SUGGESTED_USERS.map((user) => (
                   <div key={user.id} className="flex items-center justify-between group">
                     <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/profile/${user.name}`)}>
                       <img src={user.avatar} className="w-10 h-10 rounded-xl object-cover border border-hairline group-hover:scale-105 transition-all" alt={user.name} />
                       <div className="min-w-0">
                         <p className="text-xs font-black text-ink group-hover:text-primary transition-colors truncate">{user.name}</p>
                         <p className="text-[10px] text-muted font-bold truncate">{user.desc}</p>
                       </div>
                     </div>
                     <FollowButton 
                        isFollowingInitial={user.isFollowing}
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
    </div>
  );
}

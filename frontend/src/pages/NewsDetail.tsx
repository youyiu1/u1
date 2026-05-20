/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, MessageSquare, Heart, Share2, Bookmark, MapPin, MoreHorizontal, Plus, Send, Smile, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { newsApi } from '../services/api';
import { FollowButton } from '../components/common/FollowButton';
import { CommentItem } from '../components/common/CommentItem';
import { Post, Comment } from '../types';
import { useAuth } from '../context/AuthContext';

export default function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await newsApi.get(Number(id));
        setPost(data);
        const commentData = await newsApi.getComments(Number(id));
        setComments(commentData);
      } catch (err: any) {
        setError(err.message || '加载失败');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPost();
  }, [id]);

  const handleLike = async () => {
    if (!post) return;
    try {
      await newsApi.like(Number(id));
      setIsLiked(!isLiked);
    } catch (err) {
      console.error('点赞失败', err);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !user) return;
    try {
      await newsApi.addComment(Number(id), {
        content: commentText,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
      });
      setCommentText('');
      const commentData = await newsApi.getComments(Number(id));
      setComments(commentData);
    } catch (err: any) {
      alert(err.message || '评论失败');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50/30">
        <div className="text-center">
          <p className="text-muted mb-4 font-bold">{error || '抱歉，未找到该动态'}</p>
          <button
            onClick={() => navigate('/news')}
            className="px-8 py-3 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
          >
            返回动态列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-50/30 min-h-screen pb-32">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-hairline transition-all">
        <div className="max-w-[720px] mx-auto px-6 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/news')}
              className="p-2.5 hover:bg-surface-soft rounded-2xl transition-all group"
            >
              <ChevronLeft className="w-6 h-6 text-ink group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-muted uppercase tracking-widest leading-none mb-1">Local Moments</span>
              <span className="text-sm font-black text-ink">同城动态</span>
            </div>
          </div>
          <button className="p-2.5 hover:bg-surface-soft rounded-2xl transition-all">
            <MoreHorizontal className="w-5 h-5 text-secondary" />
          </button>
        </div>
      </div>

      <div className="max-w-[720px] mx-auto px-4 md:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          className="bg-white border border-hairline rounded-[40px] overflow-hidden shadow-premium"
        >
          <div className="p-8 md:p-12">
            <div className="flex items-center justify-between mb-10">
              <div
                className="flex items-center gap-5 cursor-pointer group"
                onClick={() => navigate(`/profile/${post.author.name}`)}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                  <img src={post.author.avatar || undefined} className="w-16 h-16 rounded-2xl border border-hairline object-cover relative z-10 group-hover:scale-105 transition-transform duration-500" alt="Avatar" />
                  {post.author.verified && (
                    <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-lg p-1 border-2 border-white shadow-lg z-20">
                      <Plus className="w-3 h-3 rotate-45" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-black text-ink group-hover:text-primary transition-colors tracking-tight">{post.author.name}</span>
                    <span className="px-2.5 py-1 bg-primary/5 text-primary text-[10px] font-black rounded-lg border border-primary/10 uppercase tracking-widest">{post.author.tag}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-muted font-bold">{post.time}</span>
                    <div className="w-1 h-1 bg-hairline rounded-full" />
                    <div className="flex items-center gap-1.5 text-primary/80">
                      <MapPin className="w-3 h-3" />
                      <span className="text-xs font-black tracking-tight">{post.location}</span>
                    </div>
                  </div>
                </div>
              </div>
              <FollowButton
                isFollowingInitial={isFollowed}
                onFollowChange={setIsFollowed}
                size="lg"
              />
            </div>

            <div className="space-y-10 mb-10">
              <div className="relative">
                <div className="absolute -left-6 top-0 bottom-0 w-1 bg-primary/20 rounded-full opacity-50" />
                <p className="text-ink text-xl md:text-2xl leading-[1.6] font-medium tracking-tight">
                  {post.content}
                </p>
              </div>

              {(post.images || []).length > 0 && (
                <div className={`grid gap-4 ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {post.images.map((img, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      className="rounded-[32px] overflow-hidden border border-hairline shadow-sm relative group cursor-zoom-in"
                    >
                      <div className="absolute inset-0 bg-ink/20 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                      <img src={img || undefined} className="w-full h-full object-cover aspect-video md:aspect-[4/3]" alt="Post content" />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-10">
               {post.category && (
                 <span className="px-4 py-2 bg-primary/5 border border-primary/10 rounded-xl text-[10px] font-bold text-primary uppercase tracking-widest">
                    # {post.category}
                 </span>
               )}
               {['生活记录', '同城发现', '探店动态', '邻里闲情', '物业反馈'].filter(tag => tag !== post.category).map(tag => (
                 <span key={tag} className="px-4 py-2 bg-stone-50 border border-hairline rounded-xl text-[10px] font-bold text-secondary hover:bg-white hover:border-primary/30 cursor-pointer transition-all">
                    # {tag}
                 </span>
               ))}
            </div>

            <div className="flex items-center justify-between py-8 border-y border-hairline">
               <div className="flex items-center gap-10">
                  <button
                    onClick={handleLike}
                    className={`flex flex-col items-center gap-2 transition-all group ${isLiked ? 'text-primary' : 'text-secondary hover:text-primary'}`}
                  >
                    <div className={`p-4 rounded-3xl transition-all ${isLiked ? 'bg-primary/10 scale-110' : 'bg-surface-soft group-hover:bg-primary/5'}`}>
                      <Heart className={`w-7 h-7 ${isLiked ? 'fill-current' : ''}`} />
                    </div>
                    <span className="text-xs font-black">{post.likes + (isLiked ? 1 : 0)}</span>
                  </button>

                  <div className="flex flex-col items-center gap-2 text-secondary">
                    <div className="p-4 bg-surface-soft rounded-3xl">
                      <MessageSquare className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-black">{comments.length}</span>
                  </div>

                  <button className="flex flex-col items-center gap-2 text-secondary hover:text-primary transition-all group">
                    <div className="p-4 bg-surface-soft rounded-3xl group-hover:bg-primary/5">
                      <Share2 className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-black">{post.shares}</span>
                  </button>
               </div>

               <button
                 onClick={() => setIsBookmarked(!isBookmarked)}
                 className={`flex flex-col items-center gap-2 transition-all group ${
                   isBookmarked ? 'text-accent-gold' : 'text-secondary hover:text-accent-gold'
                 }`}
               >
                 <div className={`p-4 rounded-3xl transition-all ${isBookmarked ? 'bg-accent-gold/10' : 'bg-surface-soft group-hover:bg-accent-gold/5'}`}>
                   <Bookmark className={`w-7 h-7 ${isBookmarked ? 'fill-current' : ''}`} />
                 </div>
                 <span className="text-xs font-black">收藏</span>
               </button>
            </div>

            <div className="mt-12">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-ink tracking-tight">
                  精彩评论
                  <span className="ml-3 text-sm font-bold text-muted/60 tracking-normal uppercase">({comments.length})</span>
                </h3>
                <div className="flex items-center gap-4 bg-surface-soft p-1 rounded-xl">
                  <button className="px-4 py-1.5 bg-white shadow-sm rounded-lg text-[10px] font-black text-ink uppercase tracking-widest">最新</button>
                  <button className="px-4 py-1.5 rounded-lg text-[10px] font-black text-muted uppercase tracking-widest hover:text-ink transition-colors">最热</button>
                </div>
              </div>

              <div className="space-y-4">
                {comments.length > 0 ? (
                  <>
                    {comments.map((comment) => (
                      <CommentItem key={comment.id} comment={comment} />
                    ))}
                  </>
                ) : (
                  <div className="py-24 text-center bg-surface-soft rounded-[40px] border border-dashed border-hairline">
                    <MessageSquare className="w-14 h-14 text-hairline mx-auto mb-5" />
                    <p className="text-muted text-sm font-bold opacity-60">邻里正在赶来的路上，快来抢占首评吧~</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="fixed bottom-8 left-0 right-0 z-40 pointer-events-none">
        <div className="max-w-[720px] mx-auto px-6 pointer-events-auto">
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="bg-white/90 backdrop-blur-2xl border border-hairline/50 p-4 rounded-[32px] shadow-premium flex items-center gap-4"
          >
            <div className="flex-1 flex items-center gap-3 bg-surface-soft/80 rounded-2xl px-5 py-3 border border-hairline focus-within:border-primary/40 focus-within:bg-white focus-within:shadow-premium transition-all">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="分享你的邻里见解..."
                className="flex-1 bg-transparent border-none p-0 focus:ring-0 text-sm font-medium placeholder:text-muted/60 resize-none max-h-32 min-h-[24px] outline-none"
                rows={1}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />
              <div className="flex items-center gap-2 shrink-0 border-l border-hairline pl-3 ml-1">
                 <button className="p-2 text-secondary hover:text-accent-gold transition-colors">
                    <Smile className="w-5 h-5" />
                 </button>
                 <button className="p-2 text-secondary hover:text-accent-green transition-colors">
                    <ImageIcon className="w-5 h-5" />
                 </button>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddComment}
              disabled={!commentText.trim()}
              className={`h-[52px] px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${
                commentText.trim()
                  ? 'bg-primary text-white shadow-xl shadow-primary/20'
                  : 'bg-hairline text-muted cursor-not-allowed'
              }`}
            >
              发送
              <Send className="w-3 h-3" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, MessageSquare, Heart, Share2, Bookmark, MapPin, MoreHorizontal } from 'lucide-react';
import { motion } from 'motion/react';
import { newsApi, userApi, favoriteApi } from '../services/api';
import { FollowButton } from '../components/common/FollowButton';
import { CommentItem } from '../components/common/CommentItem';
import { Post, Comment } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLikeAndFavorite } from '../hooks/useLikeAndFavorite';

const FOLLOW_KEY = 'follow_states_v2';

export default function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const fromProfile = location.state?.from;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);

  const { isLiked, isFavorited, likes, collections, toggleLike, toggleFavorite } = useLikeAndFavorite(
    id || '',
    {
      isLiked: post?.isLiked ?? false,
      isFavorited: post?.isFavorited ?? false,
      likes: post?.likes ?? 0,
      collections: post?.collections ?? 0,
    },
    {
      onLikeChange: (newIsLiked, newLikes) => {
        setPost(prev => prev ? { ...prev, likes: newLikes, isLiked: newIsLiked } : null);
      },
      onFavoriteChange: (newIsFavorited, newCollections) => {
        setPost(prev => prev ? { ...prev, collections: newCollections, isFavorited: newIsFavorited } : null);
      },
    }
  );

  const authorId = post?.author?.id || (post as any)?.authorId || '';
  const authorName = post?.author?.name || (post as any)?.authorName || '';
  const authorAvatar = post?.author?.avatar || (post as any)?.authorAvatar || '';
  const authorVerified = post?.author?.verified ?? (post as any)?.authorVerified ?? false;
  const authorTag = post?.author?.tag || (post as any)?.authorTag || '';
  const postTime = post?.time || (post as any)?.createTime || '';
  const isOwnPost = user?.id && user.id === authorId;

  const getImages = (imgs: any): string[] => {
    if (Array.isArray(imgs)) return imgs;
    if (typeof imgs === 'string' && imgs.startsWith('[')) {
      try { return JSON.parse(imgs); } catch { return []; }
    }
    return [];
  };

  const getFollowState = (key: string) => {
    try {
      const saved = JSON.parse(localStorage.getItem(FOLLOW_KEY) || '{}');
      return saved[key] ?? false;
    } catch { return false; }
  };

  const setFollowState = (key: string, value: boolean) => {
    try {
      const saved = JSON.parse(localStorage.getItem(FOLLOW_KEY) || '{}');
      saved[key] = value;
      localStorage.setItem(FOLLOW_KEY, JSON.stringify(saved));
    } catch {}
  };

  const handleFollowChange = async (newState: boolean) => {
    const currentUser = JSON.parse(localStorage.getItem('neighborhood_user') || '{}');
    if (!currentUser.id || !authorId) return;
    try {
      if (newState) {
        await userApi.follow(currentUser.id, authorId);
      } else {
        await userApi.unfollow(currentUser.id, authorId);
      }
      setIsFollowed(newState);
      setFollowState(authorId, newState);
    } catch {}
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await newsApi.get(id as string);
        setPost(data);
        const commentData = await newsApi.getComments(id as string);
        setComments(commentData);
        if (data?.isFollowing !== undefined && data.isFollowing !== null) {
          setIsFollowed(data.isFollowing);
        }
      } catch (err: any) {
        setError(err.message || '加载失败');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPost();
  }, [id]);

  const handleAddComment = async () => {
    if (!commentText.trim() || !user) return;
    try {
      await newsApi.addComment(id as string, {
        content: commentText,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
      });
      setCommentText('');
      const commentData = await newsApi.getComments(id as string);
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
            onClick={() => navigate(fromProfile ? -1 : '/news')}
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
              onClick={() => navigate(fromProfile ? -1 : '/news')}
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
            <div className="flex items-center gap-4 mb-8">
              <div
                className="flex items-center gap-4 cursor-pointer group"
                onClick={() => navigate(`/profile/${authorName}`)}
              >
                <img src={authorAvatar || undefined} className="w-12 h-12 rounded-xl border border-hairline object-cover group-hover:scale-105 transition-transform" alt="Avatar" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-ink group-hover:text-primary transition-colors">{authorName}</span>
                    {authorVerified && <span className="text-xs text-primary">✓</span>}
                  </div>
                  <span className="text-xs text-muted">{postTime} · {post.location}</span>
                </div>
              </div>
              {!isOwnPost && (
                <FollowButton isFollowingInitial={isFollowed} onFollowChange={handleFollowChange} size="sm" variant="ghost" />
              )}
            </div>

            <div className="space-y-6 mb-8">
              {post.title && (
                <h1 className="text-xl md:text-2xl font-black text-ink tracking-tight leading-tight">
                  {post.title}
                </h1>
              )}
              <p className="text-ink text-base leading-relaxed font-medium">
                {post.content}
              </p>

              {(getImages(post.images) || []).length > 0 && (
                <div className={`grid gap-3 ${getImages(post.images).length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {getImages(post.images).map((img, idx) => (
                    <div key={idx} className="rounded-2xl overflow-hidden border border-hairline">
                      <img src={img || undefined} className="w-full object-cover aspect-video" alt="Post content" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-10">
               {post.category && (
                 <span className="px-3 py-1.5 bg-primary/5 border border-primary/10 rounded-lg text-[10px] font-bold text-primary uppercase tracking-widest">
                    #{post.category}
                 </span>
               )}
            </div>

            <div className="pt-6 border-t border-hairline">
              <h3 className="text-base font-black text-ink mb-6">评论 ({comments.length})</h3>
              <div className="space-y-4">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} />
                  ))
                ) : (
                  <div className="py-16 text-center bg-surface-soft rounded-3xl border border-dashed border-hairline">
                    <MessageSquare className="w-10 h-10 text-hairline mx-auto mb-4" />
                    <p className="text-muted text-sm font-bold">快来抢占首评吧~</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-hairline">
        <div className="max-w-[720px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={toggleLike}
                className={`flex items-center gap-2 transition-all ${isLiked ? 'text-primary' : 'text-secondary hover:text-primary'}`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-xs font-bold">{likes}</span>
              </button>

              <button
                onClick={toggleFavorite}
                className={`flex items-center gap-2 transition-all ${isFavorited ? 'text-accent-gold' : 'text-secondary hover:text-accent-gold'}`}
              >
                <Bookmark className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                <span className="text-xs font-bold">{isFavorited ? '已收藏' : '收藏'}</span>
              </button>

              <button className="flex items-center gap-2 text-secondary hover:text-primary transition-all">
                <Share2 className="w-5 h-5" />
                <span className="text-xs font-bold">{post?.shares || 0}</span>
              </button>
            </div>

            <button className="flex items-center gap-2 text-secondary hover:text-primary transition-all">
              <MessageSquare className="w-5 h-5" />
              <span className="text-xs font-bold">{comments.length}</span>
            </button>
          </div>

          <div className="flex items-center gap-3 mt-4 bg-surface-soft rounded-2xl px-4 py-2.5 border border-hairline focus-within:border-primary/40 focus-within:bg-white transition-all">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="写评论..."
              className="flex-1 bg-transparent border-none p-0 focus:ring-0 text-sm font-medium placeholder:text-muted/60 resize-none min-h-[24px] max-h-24 outline-none"
              rows={1}
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAddComment}
              disabled={!commentText.trim()}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                commentText.trim() ? 'bg-primary text-white' : 'bg-hairline text-muted cursor-not-allowed'
              }`}
            >
              发送
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
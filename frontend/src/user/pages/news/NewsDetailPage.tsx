import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Bookmark, ChevronLeft, Clock3, Heart, MessageSquare, MoreHorizontal, Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { newsApi } from '../../services/api';
import { CommentItem } from '../../components/common/CommentItem';
import { FollowButton } from '../../components/common/FollowButton';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLikeAndFavorite } from '../../hooks/useLikeAndFavorite';
import { Comment, Post } from '../../types';
import { formatDateTime } from '../../utils/dateTime';
import { fallbackText } from '../../utils/display';
import { getErrorMessage } from '../../utils/error';
import { parseImages } from '../../utils/images';
import { buildProfilePath, buildProfileRouteState } from '../../utils/profileRoute';
import { getPendingReviewState, getRejectedReviewState } from '../../utils/reviewState';

const COMMENT_FETCH_LIMIT = 200;
const DETAIL_ACTION_BUTTON_CLASS = 'flex items-center gap-2 text-secondary transition-all hover:text-primary';

interface CommentThread {
  root: Comment;
  replies: Comment[];
}

function buildCommentThreads(comments: Comment[]): CommentThread[] {
  const commentById = new Map<string, Comment>();
  const threadsByRootId = new Map<string, CommentThread>();

  comments.forEach((comment) => {
    commentById.set(String(comment.id), comment);
  });

  comments.forEach((comment) => {
    const parentId = getCommentParentId(comment);
    if (parentId === '0' || !commentById.has(parentId)) {
      threadsByRootId.set(String(comment.id), { root: comment, replies: [] });
    }
  });

  comments.forEach((comment) => {
    const parentId = getCommentParentId(comment);
    if (parentId === '0' || !commentById.has(parentId)) {
      return;
    }

    const rootParentId = getRootCommentId(commentById.get(parentId)!, commentById);
    const thread = threadsByRootId.get(rootParentId);
    if (thread) {
      thread.replies.push(comment);
    }
  });

  return Array.from(threadsByRootId.values());
}

function getCommentParentId(comment: Comment): string {
  const rawParentId = comment.parentId ?? comment.parent_id;
  return rawParentId ? String(rawParentId) : '0';
}

function getRootCommentId(comment: Comment, commentById: Map<string, Comment>): string {
  let current = comment;
  let parentId = getCommentParentId(current);

  while (parentId !== '0' && commentById.has(parentId)) {
    current = commentById.get(parentId)!;
    parentId = getCommentParentId(current);
  }

  return String(current.id);
}

export default function NewsDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { showToast } = useToast();
  const commentInputRef = useRef<HTMLTextAreaElement | null>(null);

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [replyTarget, setReplyTarget] = useState<Comment | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [isFollowed, setIsFollowed] = useState(false);

  const fromProfile = location.state?.from;

  const { isLiked, isFavorited, likes, collections, toggleLike, toggleFavorite } = useLikeAndFavorite(
    id || '',
    {
      isLiked: post?.isLiked ?? false,
      isFavorited: post?.isFavorited ?? false,
      likes: post?.likes ?? 0,
      collections: post?.collections ?? 0,
    },
    {
      onLikeChange: (nextLiked, nextLikes) => {
        setPost((current) => (current ? { ...current, isLiked: nextLiked, likes: nextLikes } : null));
      },
      onFavoriteChange: (nextFavorited, nextCollections) => {
        setPost((current) => (current ? { ...current, isFavorited: nextFavorited, collections: nextCollections } : null));
      },
    }
  );

  const authorId = post?.author?.id || post?.authorId || '';
  const authorName = fallbackText(post?.author?.name || post?.authorName, '匿名用户');
  const authorAvatar = post?.author?.avatar || post?.authorAvatar || '';
  const authorVerified = post?.author?.verified ?? post?.authorVerified ?? false;
  const postTime = formatDateTime(post?.time || post?.createTime, '刚刚');
  const isOwnPost = Boolean(user?.id && user.id === authorId);
  const reviewState = isOwnPost
    ? getPendingReviewState(post?.status, {
        label: '待平台审核，通过后才会公开展示',
      }) ||
      getRejectedReviewState(post?.status, post?.rejectReason, {
        label: '未通过审核',
        fallbackReason: '请根据原因调整后重新发布',
      })
    : null;
  const postImages = useMemo(() => parseImages(post?.images), [post?.images]);
  const locationLabel = fallbackText(post?.location, '同城社区');

  const commentById = useMemo(() => new Map(comments.map((comment) => [String(comment.id), comment])), [comments]);
  const commentThreads = useMemo(() => buildCommentThreads(comments), [comments]);

  const handleBack = () => {
    if (fromProfile) {
      navigate(-1);
      return;
    }
    navigate('/news');
  };

  const fetchComments = async () => {
    if (!id) {
      return;
    }
    try {
      const commentData = await newsApi.getComments(id, COMMENT_FETCH_LIMIT, 0, user?.id);
      setComments(commentData);
    } catch (fetchError: unknown) {
      showToast(getErrorMessage(fetchError, '评论加载失败，请稍后重试'), 'error');
    }
  };

  useEffect(() => {
    if (!id) {
      return;
    }

    const fetchPost = async () => {
      try {
        const data = await newsApi.get(id, user?.id);
        setPost(data);
        if (data.isFollowing !== undefined && data.isFollowing !== null) {
          setIsFollowed(data.isFollowing);
        }
      } catch (fetchError: unknown) {
        setError(getErrorMessage(fetchError, '动态详情加载失败'));
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, user?.id]);

  useEffect(() => {
    fetchComments();
  }, [id, user?.id]);

  const handleCommentLikeChange = (commentId: string, isLiked: boolean, likes: number) => {
    setComments((current) => current.map((comment) => (comment.id === commentId ? { ...comment, isLiked, likes } : comment)));
  };

  const handleReply = (targetComment: Comment) => {
    const targetName = targetComment.userName || targetComment.user || '邻居用户';
    const mention = `@${targetName} `;
    setReplyTarget(targetComment);
    setCommentText((current) => (current.trim() ? current : mention));
    requestAnimationFrame(() => commentInputRef.current?.focus());
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !user || !id) {
      return;
    }

    const replyParentId = replyTarget ? getRootCommentId(replyTarget, commentById) : undefined;

    try {
      await newsApi.addComment(id, {
        content: commentText,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        parentId: replyParentId,
      });
      setCommentText('');
      setReplyTarget(null);
      if (replyParentId) {
        setExpandedReplies((current) => ({ ...current, [replyParentId]: true }));
      }
      await fetchComments();
      showToast('评论成功', 'success');
    } catch (submitError: unknown) {
      showToast(getErrorMessage(submitError, '评论失败，请稍后重试'), 'error');
    }
  };

  const renderReplies = (parentId: string, replies: Comment[]): React.ReactNode => {
    if (replies.length === 0) {
      return null;
    }

    const isExpanded = expandedReplies[parentId] ?? false;

    return (
      <div className="mt-2">
        <button
          onClick={() => setExpandedReplies((current) => ({ ...current, [parentId]: !isExpanded }))}
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black text-primary transition-all hover:bg-primary/5"
        >
          <span>{isExpanded ? '收起回复' : `查看更多回复`}</span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">{replies.length}</span>
        </button>
        {isExpanded ? (
          <div className="mt-2 space-y-2 border-l-2 border-primary/10 pl-3">
            {replies.map((reply) => (
              <div key={reply.id} className="relative">
                <span className="absolute -left-3 top-5 h-px w-3 bg-primary/10" />
                <CommentItem
                  comment={reply}
                  currentUserId={user?.id}
                  onLikeChange={handleCommentLikeChange}
                  onAfterLike={fetchComments}
                  onReply={handleReply}
                  compact
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50/30">
        <div className="text-center">
          <p className="mb-4 font-bold text-muted">{error || '没有找到这条动态'}</p>
          <button onClick={handleBack} className="rounded-2xl bg-primary px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20">
            返回动态列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/30 pb-32">
      <div className="sticky top-0 z-30 border-b border-hairline bg-white/80 backdrop-blur-xl transition-all">
        <div className="mx-auto flex h-20 max-w-[720px] items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-4">
            <button onClick={handleBack} className="group rounded-2xl p-2.5 transition-all hover:bg-surface-soft">
              <ChevronLeft className="h-6 w-6 text-ink transition-transform group-hover:-translate-x-0.5" />
            </button>
            <div className="flex flex-col">
              <span className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted">Local Moments</span>
              <span className="text-sm font-black text-ink">同城动态详情</span>
            </div>
          </div>
          <button className="rounded-2xl p-2.5 transition-all hover:bg-surface-soft">
            <MoreHorizontal className="h-5 w-5 text-secondary" />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-[720px] px-4 py-8 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          className="overflow-hidden rounded-[40px] border border-hairline bg-white shadow-premium"
        >
          <div className="p-8 md:p-12">
            <PostAuthorHeader
              authorId={authorId}
              authorName={authorName}
              authorAvatar={authorAvatar}
              authorVerified={authorVerified}
              postTime={postTime}
              location={locationLabel}
              isOwnPost={isOwnPost}
              isFollowed={isFollowed}
              onFollowChange={setIsFollowed}
              onOpenProfile={() => navigate(buildProfilePath(authorId, authorName), {
                state: buildProfileRouteState({
                  id: authorId,
                  name: authorName,
                  avatar: authorAvatar,
                  isVerified: authorVerified,
                }),
              })}
            />

            <div className="mb-8 space-y-6">
              {reviewState ? (
                <div className={`flex items-start gap-2 rounded-2xl px-4 py-3 text-sm font-bold ${reviewState.className}`}>
                  {reviewState.status === 'pending' ? (
                    <Clock3 className="mt-0.5 h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  )}
                  <div>
                    <p>{reviewState.label}</p>
                    {reviewState.reason ? <p className="mt-1 text-xs font-medium opacity-80">{reviewState.reason}</p> : null}
                  </div>
                </div>
              ) : null}
              {post.title ? <h1 className="text-xl font-black leading-tight tracking-tight text-ink md:text-2xl">{post.title}</h1> : null}
              <p className="text-base font-medium leading-relaxed text-ink">{post.content}</p>

              {postImages.length > 0 ? <PostImageGrid images={postImages} /> : null}
            </div>

            {post.tags?.length ? (
              <div className="mb-10 flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span key={index} className="rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-yellow-600">
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="border-t border-hairline pt-6">
              <h3 className="mb-6 text-base font-black text-ink">评论区 ({comments.length})</h3>
              <div className="space-y-4">
                {comments.length > 0 ? (
                  commentThreads.map((thread) => (
                    <CommentItem
                      key={thread.root.id}
                      comment={thread.root}
                      currentUserId={user?.id}
                      onLikeChange={handleCommentLikeChange}
                      onAfterLike={fetchComments}
                      onReply={handleReply}
                    >
                      {renderReplies(String(thread.root.id), thread.replies)}
                    </CommentItem>
                  ))
                ) : <EmptyCommentState />}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-hairline bg-white/90 backdrop-blur-xl">
        <div className="mx-auto max-w-[720px] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <DetailStatButton
                active={isLiked}
                activeClassName="text-red-500"
                count={likes}
                icon={<Heart className={`h-5 w-5 ${isLiked ? 'fill-current text-red-500' : ''}`} />}
                onClick={toggleLike}
              />
              <DetailStatButton
                active={isFavorited}
                activeClassName="text-yellow-500"
                count={collections}
                icon={<Bookmark className={`h-5 w-5 ${isFavorited ? 'fill-current text-yellow-500' : ''}`} />}
                onClick={toggleFavorite}
              />
              <DetailStatButton count={post.shares || 0} icon={<Share2 className="h-5 w-5" />} />
            </div>
            <button className={DETAIL_ACTION_BUTTON_CLASS}>
              <MessageSquare className="h-5 w-5" />
              <span className="text-xs font-bold">{comments.length}</span>
            </button>
          </div>

          {replyTarget ? (
            <div className="mb-2 mt-4 flex items-center justify-between rounded-xl border border-hairline bg-surface-soft px-3 py-2">
              <span className="text-xs font-bold text-muted">正在回复 {replyTarget.userName || replyTarget.user || '邻居用户'}</span>
              <button onClick={() => setReplyTarget(null)} className="text-xs font-bold text-primary transition-opacity hover:opacity-70">
                取消
              </button>
            </div>
          ) : null}

          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-hairline bg-surface-soft px-4 py-2.5 transition-all focus-within:border-primary/40 focus-within:bg-white">
            <textarea
              ref={commentInputRef}
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder={replyTarget ? '写下你的回复...' : '写下你的评论...'}
              className="max-h-24 min-h-[24px] flex-1 resize-none border-none bg-transparent p-0 text-sm font-medium text-ink outline-none placeholder:text-muted/60 focus:ring-0"
              rows={1}
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAddComment}
              disabled={!commentText.trim()}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${commentText.trim() ? 'bg-primary text-white' : 'cursor-not-allowed bg-hairline text-muted'}`}
            >
              发布
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PostAuthorHeader({
  authorId,
  authorName,
  authorAvatar,
  authorVerified,
  postTime,
  location,
  isOwnPost,
  isFollowed,
  onFollowChange,
  onOpenProfile,
}: {
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorVerified: boolean;
  postTime: string;
  location?: string;
  isOwnPost: boolean;
  isFollowed: boolean;
  onFollowChange: (nextState: boolean) => void;
  onOpenProfile: () => void;
}) {
  return (
    <div className="mb-8 flex items-center gap-4">
      <div className="group flex cursor-pointer items-center gap-4" onClick={onOpenProfile}>
        {authorAvatar ? (
          <img src={authorAvatar} className="h-12 w-12 rounded-xl border border-hairline object-cover transition-transform group-hover:scale-105" alt="Avatar" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-soft text-sm font-black text-primary">{authorName[0]}</div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-ink transition-colors group-hover:text-primary">{authorName}</span>
            {authorVerified ? <span className="text-xs text-primary">已认证</span> : null}
          </div>
          <span className="text-xs text-muted">{postTime} · {fallbackText(location, '同城社区')}</span>
        </div>
      </div>
      {!isOwnPost ? (
        <FollowButton targetId={authorId} isFollowingInitial={isFollowed} onFollowChange={onFollowChange} size="sm" variant="ghost" />
      ) : null}
    </div>
  );
}

function PostImageGrid({ images }: { images: string[] }) {
  return (
    <div className={`grid gap-3 ${images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
      {images.map((image, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border border-hairline">
          <img src={image || undefined} className="aspect-video w-full object-cover" alt="Post content" />
        </div>
      ))}
    </div>
  );
}

function EmptyCommentState() {
  return (
    <div className="rounded-3xl border border-dashed border-hairline bg-surface-soft py-16 text-center">
      <MessageSquare className="mx-auto mb-4 h-10 w-10 text-hairline" />
      <p className="text-sm font-bold text-muted">快来留下第一条评论吧</p>
    </div>
  );
}

function DetailStatButton({
  icon,
  count,
  onClick,
  active = false,
  activeClassName = '',
}: {
  icon: React.ReactNode;
  count: number;
  onClick?: () => void;
  active?: boolean;
  activeClassName?: string;
}) {
  return (
    <button onClick={onClick} className={`${DETAIL_ACTION_BUTTON_CLASS} ${active ? activeClassName : ''}`}>
      {icon}
      <span className="text-xs font-bold">{count}</span>
    </button>
  );
}

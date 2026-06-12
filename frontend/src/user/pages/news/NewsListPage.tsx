import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Clock3, Image as ImageIcon, Loader2, MapPin, Share2, TrendingUp, Users, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fileApi, newsApi, userApi } from '../../services/api';
import { BackToTop } from '../../components/common/BackToTop';
import { FollowButton } from '../../components/common/FollowButton';
import { LocationPicker } from '../../components/common/LocationPicker';
import { Pagination } from '../../components/common/Pagination';
import { PostItemActions } from '../../components/common/PostItemActions';
import { PostMenu } from '../../components/common/PostMenu';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Post, User } from '../../types';
import { formatDateTime } from '../../utils/dateTime';
import { getErrorMessage } from '../../utils/error';
import { parseImages } from '../../utils/images';
import { buildProfilePath, buildProfileRouteState } from '../../utils/profileRoute';
import { getPendingReviewState, getRejectedReviewState } from '../../utils/reviewState';

interface TrendingItem {
  id: string;
  name: string;
  posts: string;
}

interface SuggestedUser {
  id: string;
  name: string;
  avatar: string;
  tag: string;
  followersCount: number;
  isFollowing: boolean;
}

type ComposerAction = {
  key: 'image' | 'location';
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
};

const DEFAULT_PAGE_SIZE = 6;

function renderHashtags(content: string): React.ReactNode {
  const hashtagRegex = /#([^#]+)#/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = hashtagRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    parts.push(
      <span key={match.index} className="font-black text-yellow-500">
        {match[0]}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts.length > 0 ? <>{parts}</> : content;
}

export default function NewsListPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postText, setPostText] = useState('');
  const [postImages, setPostImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [postLocation, setPostLocation] = useState('');
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendingData, suggestedData] = await Promise.all([newsApi.getTrending(4), userApi.getSuggestedUsers(5)]);
        setTrending(
          trendingData.map((post) => ({
            id: post.id,
            name: post.content?.slice(0, 20) || '热门话题',
            posts: String(post.commentsCount || 0),
          }))
        );
        setSuggestedUsers(
          suggestedData.map((user: User) => ({
            id: user.id,
            name: user.name,
            avatar: user.avatar || '',
            tag: user.tag || '',
            followersCount: user.followersCount || 0,
            isFollowing: false,
          }))
        );
      } catch (fetchError: unknown) {
        setError(getErrorMessage(fetchError, '动态加载失败'));
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await newsApi.list(currentPage, pageSize);
        setPosts(result.data);
        setTotalItems(result.total);
      } catch (fetchError: unknown) {
        setError(getErrorMessage(fetchError, '动态加载失败'));
      } finally {
        setLoading(false);
      }
    };

    void fetchPosts();
  }, [currentPage, pageSize]);

  const refreshPosts = async (targetPage = currentPage) => {
    const result = await newsApi.list(targetPage, pageSize);
    setPosts(result.data);
    setTotalItems(result.total);
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleShare = async (postId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/news/${postId}`);
      showToast('链接已复制', 'success');
    } catch {
      showToast('复制链接失败，请稍后重试', 'error');
    }
  };

  const handleCreatePost = async () => {
    if (!postText.trim()) {
      return;
    }

    try {
      await newsApi.create({
        title: postText.slice(0, 50),
        content: postText,
        category: '同城动态',
        images: postImages.length > 0 ? JSON.stringify(postImages) : undefined,
        location: postLocation || undefined,
      });
      setPostText('');
      setPostImages([]);
      setPostLocation('');
      if (currentPage === 1) {
        await refreshPosts(1);
      } else {
        setCurrentPage(1);
      }
      showToast('发布成功', 'success');
    } catch (createError: unknown) {
      showToast(getErrorMessage(createError, '发布失败，请稍后重试'), 'error');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsUploading(true);
    try {
      const url = await fileApi.upload(file);
      setPostImages((current) => [...current, url]);
      showToast('图片上传成功', 'success');
    } catch (uploadError: unknown) {
      showToast(getErrorMessage(uploadError, '图片上传失败'), 'error');
    } finally {
      setIsUploading(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    setPostImages((current) => current.filter((_, imageIndex) => imageIndex !== index));
  };

  const composerActions: ComposerAction[] = [
    {
      key: 'image',
      label: '图片',
      icon: isUploading ? <Loader2 className="h-4 w-4 animate-spin text-green-500" /> : <ImageIcon className="h-4 w-4 text-green-500" />,
      onClick: () => imageInputRef.current?.click(),
      disabled: isUploading,
    },
    {
      key: 'location',
      label: '位置',
      icon: <MapPin className="h-4 w-4 text-primary" />,
      onClick: () => setShowLocationPicker(true),
    },
  ];

  return (
    <div className="min-h-screen pb-20">
      <div className="pb-8 pt-10 sm:pt-12">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-20">
          <div className="px-1 py-3 sm:px-2 sm:py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 px-3 py-1.5 text-[11px] font-semibold tracking-[0.16em] text-primary">
                  <TrendingUp className="h-3.5 w-3.5" />
                  同城动态
                </div>
                <h1 className="mt-4 text-[26px] font-semibold tracking-[-0.03em] text-ink sm:text-[32px]">看看附近新鲜事，也分享你的此刻</h1>
              </div>

              <button
                onClick={() => document.getElementById('news-composer')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-black text-white shadow-lg shadow-primary/15 transition-all hover:bg-primary-hover"
              >
                发布动态
              </button>
            </div>

            <div className="mt-2.5">
              <p className="max-w-2xl text-[14px] font-normal leading-6 text-secondary sm:text-[15px]">
                记录社区里的新鲜事、生活感受和身边消息。
              </p>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-2 max-w-[1280px] px-4 sm:px-6 lg:px-20">
          <div className="h-px w-full bg-stone-200/80" />
        </div>
      </div>

      <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-10 lg:px-20">
        <div className="rounded-[24px] border border-stone-200/80 bg-white/90 px-3 py-5 shadow-[0_12px_32px_rgba(15,23,42,0.04)] sm:px-5 sm:py-6">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-8">
              <div id="news-composer" className="rounded-3xl border border-hairline bg-white p-5 shadow-sm sm:p-6">
                <div className="flex gap-4">
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-2xl border border-hairline bg-surface-soft">
                    {currentUser?.avatar ? (
                      <img src={currentUser.avatar} className="h-full w-full object-cover" alt="用户头像" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/10 text-base font-black text-primary">
                        {(currentUser?.name || '?')[0]}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-4">
                    <textarea
                      value={postText}
                      onChange={(event) => setPostText(event.target.value)}
                      placeholder="说说身边的新鲜事，或分享你的此刻。"
                      className="min-h-[72px] w-full resize-none border-none bg-transparent p-1 text-sm font-medium text-ink placeholder:text-muted/60 focus:ring-0"
                    />

                    {postImages.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {postImages.map((url, index) => (
                          <div key={index} className="relative h-20 w-20 overflow-hidden rounded-xl border border-hairline">
                            <img src={url} className="h-full w-full object-cover" alt="预览图片" />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute right-1 top-1 rounded-full bg-ink/60 p-1 text-white transition-colors hover:bg-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {postLocation ? (
                      <div className="flex items-center gap-2 rounded-xl bg-surface-soft px-3 py-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="flex-1 text-xs font-medium text-ink">{postLocation}</span>
                        <button onClick={() => setPostLocation('')} className="rounded-full p-1 transition-colors hover:bg-white">
                          <X className="h-3 w-3 text-muted" />
                        </button>
                      </div>
                    ) : null}

                    <div className="flex flex-col gap-3 border-t border-hairline pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        {composerActions.map((action) => (
                          <button
                            key={action.key}
                            onClick={action.onClick}
                            disabled={action.disabled}
                            className="flex items-center gap-1.5 rounded-xl px-2 py-1.5 transition-all hover:bg-surface-soft disabled:opacity-50"
                          >
                            {action.icon}
                            <span className="text-xs font-bold text-muted">{action.label}</span>
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={handleCreatePost}
                        disabled={!postText.trim()}
                        className={`rounded-2xl px-5 py-2.5 text-xs font-bold transition-all ${
                          postText.trim() ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-hover' : 'cursor-not-allowed bg-surface-soft text-muted'
                        }`}
                      >
                        立即发布
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                {loading ? (
                  Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-44 animate-pulse rounded-3xl bg-stone-200" />)
                ) : error ? (
                  <div className="py-8 text-center text-red-500">{error}</div>
                ) : posts.length === 0 ? (
                  <div className="py-16 text-center text-muted">暂时还没有动态</div>
                ) : (
                  posts.map((post) => (
                    <React.Fragment key={post.id}>
                      <NewsPostCard
                        post={post}
                        currentUserId={currentUser?.id}
                        onOpen={() => navigate(`/news/${post.id}`)}
                        onOpenProfile={(profileId, profileName, profileAvatar) =>
                          navigate(buildProfilePath(profileId, profileName), {
                            state: buildProfileRouteState({
                              id: profileId,
                              name: profileName,
                              avatar: profileAvatar,
                            }),
                          })
                        }
                        onFollowChange={(authorId, nextState) => {
                          setPosts((current) =>
                            current.map((currentPost) =>
                              currentPost.authorId === authorId || currentPost.author?.id === authorId
                                ? { ...currentPost, isFollowing: nextState }
                                : currentPost
                            )
                          );
                        }}
                        onDelete={async (postId) => {
                          if (!window.confirm('确认删除这条动态吗？')) {
                            return;
                          }
                          await newsApi.delete(postId);
                          if (posts.length === 1 && currentPage > 1) {
                            setCurrentPage((page) => page - 1);
                          } else {
                            await refreshPosts();
                          }
                        }}
                        onReport={async () => {
                          if (!window.confirm('确认举报这条动态吗？')) {
                            return;
                          }
                          showToast('举报已提交，平台会尽快处理', 'success');
                        }}
                        onShare={handleShare}
                      />
                    </React.Fragment>
                  ))
                )}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
              />
            </div>

            <aside className="space-y-5 lg:col-span-4">
              <SidebarPanel title="推荐关注" icon={<Users className="h-5 w-5 text-primary" />}>
                <div className="space-y-5">
                  {suggestedUsers.map((user) => (
                    <React.Fragment key={user.id}>
                      <SuggestedUserRow
                        user={user}
                        onOpen={() =>
                          navigate(buildProfilePath(user.id, user.name), {
                            state: buildProfileRouteState(user),
                          })
                        }
                        onFollowChange={(nextState) => {
                          setSuggestedUsers((current) =>
                            current.map((currentUser) => (currentUser.id === user.id ? { ...currentUser, isFollowing: nextState } : currentUser))
                          );
                        }}
                      />
                    </React.Fragment>
                  ))}
                </div>
              </SidebarPanel>

              <SidebarPanel title="热门话题" icon={<TrendingUp className="h-5 w-5 text-primary" />}>
                <div className="space-y-3">
                  {trending.map((item, index) => (
                    <div key={item.id || index} className="group flex cursor-pointer items-start gap-3">
                      <span className="text-xs font-bold text-muted">#{index + 1}</span>
                      <div>
                        <p className="text-sm font-bold text-ink transition-colors group-hover:text-primary">#{item.name}</p>
                        <p className="text-[11px] font-medium text-muted">{item.posts} 条讨论</p>
                      </div>
                    </div>
                  ))}
                </div>
              </SidebarPanel>
            </aside>
          </div>
        </div>
      </main>

      <BackToTop />
      <LocationPicker isOpen={showLocationPicker} onClose={() => setShowLocationPicker(false)} onSelect={(location) => setPostLocation(location.name)} />
    </div>
  );
}

function SidebarPanel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-hairline bg-white p-5 shadow-sm sm:p-6">
      <h3 className="mb-5 flex items-center gap-2 text-base font-bold text-ink">
        {icon} {title}
      </h3>
      {children}
    </div>
  );
}

function SuggestedUserRow({
  user,
  onOpen,
  onFollowChange,
}: {
  user: SuggestedUser;
  onOpen: () => void;
  onFollowChange: (nextState: boolean) => void;
}) {
  return (
    <div className="group flex items-center justify-between">
      <div className="flex cursor-pointer items-center gap-3" onClick={onOpen}>
        {user.avatar ? (
          <img
            src={user.avatar}
            className="h-10 w-10 rounded-xl border border-hairline object-cover transition-all group-hover:scale-105"
            alt={user.name}
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-soft text-sm font-black text-primary">
            {user.name[0]}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-xs font-black text-ink transition-colors group-hover:text-primary">{user.name}</p>
          <p className="truncate text-[10px] font-bold text-muted">{user.followersCount} 位关注</p>
        </div>
      </div>
      <FollowButton
        targetId={user.id}
        isFollowingInitial={user.isFollowing}
        onFollowChange={onFollowChange}
        size="sm"
        variant="ghost"
        className="shrink-0"
      />
    </div>
  );
}

function NewsPostCard({
  post,
  currentUserId,
  onOpen,
  onOpenProfile,
  onFollowChange,
  onDelete,
  onReport,
  onShare,
}: {
  post: Post;
  currentUserId?: string;
  onOpen: () => void;
  onOpenProfile: (profileId: string, profileName: string, profileAvatar?: string) => void;
  onFollowChange: (authorId: string, nextState: boolean) => void;
  onDelete: (postId: string) => Promise<void>;
  onReport: () => Promise<void>;
  onShare: (postId: string, event: React.MouseEvent) => Promise<void>;
}) {
  const authorId = post.author?.id || post.authorId || '';
  const authorName = post.author?.name || post.authorName || '匿名用户';
  const authorAvatar = post.author?.avatar || post.authorAvatar || '';
  const postTime = formatDateTime(post.time || post.createTime, '刚刚');
  const postImagesList = parseImages(post.images);
  const reviewState = currentUserId && currentUserId === authorId
    ? getPendingReviewState(post.status, {
        label: '待平台审核，通过后才会公开展示',
      }) ||
      getRejectedReviewState(post.status, post.rejectReason, {
        label: '未通过审核',
        fallbackReason: '请根据原因调整后重新发布',
      })
    : null;

  return (
    <article
      className={`cursor-pointer rounded-3xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6 ${
        reviewState?.status === 'pending'
          ? 'border-amber-100 bg-amber-50/30'
          : reviewState
            ? 'border-rose-100 bg-rose-50/30'
            : 'border-hairline'
      }`}
      onClick={onOpen}
    >
      <header className="mb-4 flex items-center justify-between">
        <div
          className="group flex cursor-pointer items-center gap-3"
          onClick={(event) => {
            event.stopPropagation();
            onOpenProfile(authorId, authorName, authorAvatar);
          }}
        >
          {authorAvatar ? (
            <img
              src={authorAvatar}
              className="h-10 w-10 rounded-xl border border-hairline object-cover transition-all group-hover:border-primary"
              alt={authorName}
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-soft text-sm font-black text-primary">
              {authorName[0]}
            </div>
          )}
          <div>
            <h4 className="text-sm font-bold text-ink transition-colors group-hover:text-primary">{authorName}</h4>
            <span className="block text-[10px] font-bold text-muted">
              {postTime} · {post.location || '同城社区'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
          <FollowButton
            targetId={authorId}
            size="sm"
            variant="ghost"
            isFollowingInitial={post.isFollowing ?? false}
            onFollowChange={(nextState) => onFollowChange(authorId, nextState)}
          />
          <PostMenu isOwner={currentUserId === authorId} onDelete={() => onDelete(post.id)} onReport={onReport} />
        </div>
      </header>

      <div className="space-y-4">
        {reviewState ? (
          <div className={`flex items-start gap-2 rounded-2xl px-4 py-3 text-xs font-bold ${reviewState.className}`}>
            {reviewState.status === 'pending' ? (
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <div>
              <p>{reviewState.label}</p>
              {reviewState.reason ? <p className="mt-1 font-medium opacity-80">{reviewState.reason}</p> : null}
            </div>
          </div>
        ) : null}
        <p className="text-sm font-medium leading-relaxed text-secondary transition-colors group-hover:text-ink">{renderHashtags(post.content)}</p>

        {postImagesList.length > 0 ? (
          <div className={`grid gap-2 overflow-hidden rounded-2xl border border-hairline ${postImagesList.length >= 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {postImagesList.map((image, index) => (
              <div key={`${post.id}-${index}-${image}`} className="aspect-[16/9]">
                <img src={image || undefined} className="h-full w-full object-cover" alt="动态图片" />
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <PostItemActions post={post} />
        <button
          onClick={(event) => void onShare(post.id, event)}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-secondary transition-colors hover:bg-surface-soft hover:text-primary"
        >
          <Share2 className="h-4 w-4" /> 分享
        </button>
      </div>
    </article>
  );
}

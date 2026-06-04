/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  BadgeAlert,
  Bookmark,
  Check,
  Clock,
  Eye,
  Flame,
  Gavel,
  Heart,
  Image as ImageIcon,
  MessageSquare,
  RotateCcw,
  Send,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Trash2,
  UserX,
  X,
} from 'lucide-react';
import { Dynamic } from '../types';
import { useToast } from '../hooks/useToast';
import { groupItemsByOwner, type EntityOwnerGroup } from '../utils/entityGrouping';
import { matchesAnyKeyword, normalizeSearchTerm } from '../utils/search';
import AdminFilterPills from './common/AdminFilterPills';
import AdminGroupHeader from './common/AdminGroupHeader';
import AdminSearchInput from './common/AdminSearchInput';
import AdminToast from './common/AdminToast';
import EmptyState from './common/EmptyState';
import UserSquareCard from './common/UserSquareCard';

interface DynamicManagementViewProps {
  dynamics: Dynamic[];
  onUpdateDynamicStatus: (dynId: string, status: 'normal' | 'removed' | 'pending', rejectReason?: string) => void;
  onBanUser: (userName: string) => void;
  onAddComment: (dynId: string, author: string, text: string) => void;
  onDeleteComment: (dynId: string, commentId: string) => void;
  initialTabFilter?: string;
}

type DynamicStatusFilter = 'all' | 'pending' | 'normal' | 'removed';
type AuthorGroup = EntityOwnerGroup<Dynamic>;

const CATEGORY_OPTIONS = ['生活记录', '同城发现', '探店动态', '邻里闲情', '物业反馈', '求助互助', '同城活动', '随手拍'] as const;

const DYNAMIC_STATUS_OPTIONS: { value: DynamicStatusFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待审核' },
  { value: 'normal', label: '已公开' },
  { value: 'removed', label: '违规下架' },
];

const REJECT_REASON_OPTIONS = [
  '涉嫌垃圾广告推广',
  '图片或文案包含违规敏感内容',
  '存在虚假信息或诱导欺诈',
  '存在人身攻击或低俗辱骂',
  'custom',
] as const;

const SKELETON_ITEMS = [1, 2, 3];

function normalizeCategory(category: string) {
  if (!category) return '生活记录';
  if (category === 'life') return '生活记录';
  if (category === 'help') return '求助互助';
  if (category === 'activity') return '同城活动';
  if (category === 'food') return '探店动态';
  return category;
}

function getCategoryColor(category: string) {
  switch (normalizeCategory(category)) {
    case '生活记录':
      return 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400 border border-sky-100 dark:border-sky-900/30';
    case '求助互助':
      return 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30';
    case '同城活动':
      return 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30';
    case '探店动态':
      return 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30';
    case '同城发现':
      return 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-900/30';
    case '邻里闲情':
      return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30';
    case '物业反馈':
      return 'bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30';
    case '随手拍':
      return 'bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-950/40 dark:text-fuchsia-400 border border-fuchsia-100 dark:border-fuchsia-900/30';
    default:
      return 'bg-gray-50 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400 border border-gray-200 dark:border-gray-700/30';
  }
}

function readNumberField(source: Dynamic, keys: string[], fallback = 0) {
  const bag = source as Dynamic & Record<string, unknown>;
  for (const key of keys) {
    const value = bag[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) return Number(value);
  }
  return fallback;
}

function readTextField(source: Dynamic, keys: string[], fallback = '') {
  const bag = source as Dynamic & Record<string, unknown>;
  for (const key of keys) {
    const value = bag[key];
    if (typeof value === 'string' && value.trim() !== '') return value;
  }
  return fallback;
}

function getDynamicMeta(item: Dynamic) {
  const createTime = readTextField(item, ['createTime', 'createdAt', 'publishTime'], item.time);
  return {
    favoriteCount: readNumberField(item, ['favoriteCount', 'favorites', 'collectCount', 'collectionCount'], 0),
    viewCount: readNumberField(item, ['viewCount', 'views', 'browseCount', 'readCount', 'pv'], 0),
    createTime,
    updateTime: readTextField(item, ['updateTime', 'updatedAt', 'lastUpdateTime'], createTime),
  };
}

export default function DynamicManagementView({
  dynamics,
  onUpdateDynamicStatus,
  onBanUser,
  onAddComment,
  onDeleteComment,
  initialTabFilter,
}: DynamicManagementViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<DynamicStatusFilter>('all');
  const [activeAuthor, setActiveAuthor] = useState<string | null>(null);
  const [selectedDyn, setSelectedDyn] = useState<Dynamic | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectReasonType, setRejectReasonType] = useState<(typeof REJECT_REASON_OPTIONS)[number]>('涉嫌垃圾广告推广');
  const [rejectReasonCustom, setRejectReasonCustom] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [banConfirmAuthor, setBanConfirmAuthor] = useState<string | null>(null);
  const [isSearchingLoad, setIsSearchingLoad] = useState(false);
  const { toast, showToast } = useToast();

  useEffect(() => {
    if (initialTabFilter === 'pending') {
      setStatusFilter('pending');
    }
  }, [initialTabFilter]);

  useEffect(() => {
    setIsSearchingLoad(true);
    const timer = window.setTimeout(() => setIsSearchingLoad(false), 300);
    return () => window.clearTimeout(timer);
  }, [searchTerm, categoryFilter, statusFilter]);

  const filteredDynamics = useMemo(() => {
    const keyword = normalizeSearchTerm(searchTerm);
    return dynamics.filter((item) => {
      const matchSearch = matchesAnyKeyword(keyword, [item.title, item.author, item.id]);
      const matchCategory = categoryFilter === 'all' || normalizeCategory(item.category) === categoryFilter;
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [categoryFilter, dynamics, searchTerm, statusFilter]);

  const groupedByUser = useMemo<AuthorGroup[]>(() => {
    return groupItemsByOwner<Dynamic>(filteredDynamics, {
      getId: (item) => item.author || item.id,
      getName: (item) => item.author,
      getAvatar: (item) => item.authorAvatar || '',
      getTag: (item) => item.authorTag,
      fallbackName: '匿名用户',
      fallbackTag: '未设置标签',
    });
  }, [filteredDynamics]);

  const activeAuthorGroup = useMemo(
    () => groupedByUser.find((group) => group.name === activeAuthor) || null,
    [activeAuthor, groupedByUser],
  );

  useEffect(() => {
    if (activeAuthor && !activeAuthorGroup) {
      setActiveAuthor(null);
    }
  }, [activeAuthor, activeAuthorGroup]);

  const activeItems = activeAuthorGroup?.items || [];

  const handleApprove = (dynId: string, closeDrawer = false) => {
    onUpdateDynamicStatus(dynId, 'normal');
    if (selectedDyn?.id === dynId) {
      setSelectedDyn({ ...selectedDyn, status: 'normal' });
      if (closeDrawer) setSelectedDyn(null);
    }
    showToast('该动态已审核通过并恢复公开展示', 'success');
  };

  const handleRejectSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!showRejectModal) return;
    const reason = rejectReasonType === 'custom' ? rejectReasonCustom.trim() : rejectReasonType;
    onUpdateDynamicStatus(showRejectModal, 'removed', reason);
    if (selectedDyn?.id === showRejectModal) {
      setSelectedDyn({ ...selectedDyn, status: 'removed', rejectReason: reason });
    }
    setShowRejectModal(null);
    setRejectReasonCustom('');
    showToast('该动态已下架并记录违规原因', 'info');
  };

  const handlePostComment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedDyn || !commentInput.trim()) return;
    await onAddComment(selectedDyn.id, '系统管理员', commentInput.trim());
    setCommentInput('');
    showToast('管理端评论已发送', 'success');
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!selectedDyn) return;
    await onDeleteComment(selectedDyn.id, commentId);
    showToast('评论已删除', 'info');
  };

  const handleConfirmBan = () => {
    if (!banConfirmAuthor) return;
    onBanUser(banConfirmAuthor);
    if (selectedDyn?.author === banConfirmAuthor) {
      setSelectedDyn({ ...selectedDyn, verifiedUser: false });
    }
    showToast(`用户“${banConfirmAuthor}”已被封禁`, 'error');
    setBanConfirmAuthor(null);
  };

  return (
    <div className="relative">
      <AdminToast toast={toast} />

      <AnimatePresence>
        {banConfirmAuthor && (
          <ConfirmDialog
            title="确认封禁该用户？"
            description={`确认将用户“${banConfirmAuthor}”加入封禁状态吗？该用户后续发布的动态、闲置商品和服务都将受到限制。`}
            confirmLabel="确认封禁"
            onCancel={() => setBanConfirmAuthor(null)}
            onConfirm={handleConfirmBan}
          />
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
        <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800/60 dark:bg-gray-900">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-1.5 pb-2 lg:pb-0">
              <span className="mr-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <Tag className="h-3.5 w-3.5 text-primary" />
                动态分类
              </span>
              {(['all', ...CATEGORY_OPTIONS] as const).map((category) => (
                <button
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                  className={`whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-semibold tracking-wide transition-all ${
                    categoryFilter === category
                      ? 'bg-primary font-bold text-white shadow-sm shadow-primary/25'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:bg-gray-800/40 dark:text-gray-300 dark:hover:bg-gray-800/80 dark:hover:text-white'
                  }`}
                >
                  {category === 'all' ? '全部动态' : category}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="mr-1 flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400">
                <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
                状态筛选
              </span>
              <div className="inline-flex rounded-xl border border-gray-100 bg-gray-50 p-1 dark:border-gray-800/60 dark:bg-gray-800/40">
                <AdminFilterPills options={DYNAMIC_STATUS_OPTIONS} activeValue={statusFilter} onChange={setStatusFilter} />
              </div>
            </div>
          </div>

          <AdminSearchInput
            value={searchTerm}
            placeholder="搜索动态内容、发布者昵称、动态 ID"
            onChange={setSearchTerm}
            inputClassName="w-full rounded-xl border border-gray-100 bg-gray-50 py-2 pl-9 pr-4 text-xs font-medium text-gray-800 outline-none transition-all placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-800 dark:bg-gray-850 dark:text-white dark:placeholder-gray-500"
          />
        </div>

        <div>
          {isSearchingLoad ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {SKELETON_ITEMS.map((item) => (
                <div key={item} className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 animate-pulse dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-800"></div>
                      <div className="h-3 w-1/4 rounded bg-gray-200 dark:bg-gray-800"></div>
                    </div>
                  </div>
                  <div className="h-16 rounded-lg bg-gray-200 dark:bg-gray-800"></div>
                  <div className="h-28 rounded-lg bg-gray-200 dark:bg-gray-800"></div>
                </div>
              ))}
            </div>
          ) : filteredDynamics.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-16 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4 rounded-full bg-gray-50 p-4 dark:bg-gray-800/50">
                <SlidersHorizontal className="h-10 w-10 text-gray-400" />
              </div>
              <EmptyState text="没有找到符合当前筛选条件的动态" />
              <p className="mt-2 text-xs text-gray-400">可以尝试切换分类、状态或调整搜索关键词。</p>
            </div>
          ) : !activeAuthor ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-2.5">
              {groupedByUser.map((group) => (
                <UserSquareCard
                  key={group.id}
                  title={group.name}
                  userType={group.tag}
                  subtitle={`${group.items.length} 条动态`}
                  avatar={group.avatar}
                  onClick={() => setActiveAuthor(group.name)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <AdminGroupHeader
                backLabel="返回用户列表"
                onBack={() => setActiveAuthor(null)}
                title={activeAuthorGroup?.name}
                subtitle={`${activeItems.length} 条动态`}
                avatar={activeAuthorGroup?.avatar}
                avatarClassName="h-7 w-7 rounded-full border border-gray-200 object-cover dark:border-gray-700"
              />
              <div className="space-y-1.5">
                {activeItems.map((item) => (
                  <DynamicListCard
                    key={item.id}
                    item={item}
                    onOpen={() => setSelectedDyn(item)}
                    onApprove={() => handleApprove(item.id)}
                    onReject={() => setShowRejectModal(item.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedDyn && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDyn(null)}
              className="fixed inset-0 z-45 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-gray-100 bg-white text-gray-800 shadow-2xl dark:border-gray-800 dark:bg-gray-900 dark:text-white"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white/80 p-5 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-primary" />
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">动态详情与互动管理</h3>
                </div>
                <button
                  onClick={() => setSelectedDyn(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800/85 dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-grow space-y-6 p-6">
                <DrawerAuthorPanel item={selectedDyn} onBan={() => setBanConfirmAuthor(selectedDyn.author)} />

                <div className="space-y-4">
                  <div className="flex items-center gap-2 select-none">
                    <span className={`rounded-lg px-2.5 py-0.5 text-[10px] font-bold ${getCategoryColor(selectedDyn.category)}`}>
                      {normalizeCategory(selectedDyn.category)}
                    </span>
                    <span className="font-mono text-[10px] font-semibold uppercase text-gray-400 dark:text-gray-500">Post ID: {selectedDyn.id}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] md:grid-cols-5">
                    <MetaChip icon={<Heart className="h-3 w-3" />} label="点赞" value={selectedDyn.likes} tone="rose" />
                    <MetaChip icon={<Bookmark className="h-3 w-3" />} label="收藏" value={getDynamicMeta(selectedDyn).favoriteCount} tone="amber" />
                    <MetaChip icon={<Eye className="h-3 w-3" />} label="浏览" value={getDynamicMeta(selectedDyn).viewCount} tone="sky" />
                    <MetaChip icon={<Clock className="h-3 w-3" />} label="创建" value={getDynamicMeta(selectedDyn).createTime} tone="slate" />
                    <MetaChip icon={<RotateCcw className="h-3 w-3" />} label="更新" value={getDynamicMeta(selectedDyn).updateTime} tone="slate" />
                  </div>

                  <p className="whitespace-pre-wrap rounded-2xl border border-gray-100 bg-gray-50 p-4 text-xs leading-relaxed text-gray-700 dark:border-gray-800/50 dark:bg-gray-800/20 dark:text-gray-200">
                    {selectedDyn.title}
                  </p>
                </div>

                {selectedDyn.images?.length ? (
                  <div className="space-y-2">
                    <h5 className="mb-1.5 flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-gray-500">
                      <ImageIcon className="h-3.5 w-3.5 text-primary" />
                      图片附件 ({selectedDyn.images.length})
                    </h5>
                    <div className="grid max-h-[300px] grid-cols-2 gap-2 overflow-y-auto rounded-2xl border border-gray-100 bg-gray-50 p-2 dark:border-gray-800 dark:bg-gray-850">
                      {selectedDyn.images.map((imageUrl, index) => (
                        <button
                          key={`${imageUrl}-${index}`}
                          type="button"
                          onClick={() => window.open(imageUrl)}
                          className="group relative aspect-video overflow-hidden rounded-xl border border-gray-200/40 bg-gray-100 dark:border-gray-800 dark:bg-gray-900"
                        >
                          <img src={imageUrl} alt={`dynamic-${index}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="space-y-4 border-t border-gray-100 pt-4 dark:border-gray-800">
                  <div className="mb-1 flex items-center justify-between select-none">
                    <h5 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gray-500">
                      <MessageSquare className="h-3.5 w-3.5 text-primary" />
                      评论记录
                      <span className="font-mono text-[10px] text-gray-400">({selectedDyn.commentsCount})</span>
                    </h5>
                  </div>

                  <form onSubmit={handlePostComment} className="relative flex gap-2">
                    <input
                      type="text"
                      placeholder="以管理端身份快速发送说明或提醒"
                      value={commentInput}
                      onChange={(event) => setCommentInput(event.target.value)}
                      className="flex-1 rounded-xl border border-gray-100 bg-gray-50 py-1.5 pl-3 pr-10 text-xs font-medium text-gray-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-800 dark:bg-gray-850 dark:text-white"
                      required
                    />
                    <button
                      type="submit"
                      className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg bg-primary text-white transition-all hover:bg-primary-container"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </form>

                  {selectedDyn.comments?.length ? (
                    <div className="max-h-[300px] space-y-2 overflow-y-auto pr-1">
                      {selectedDyn.comments.map((comment) => (
                        <div key={comment.id} className="group relative flex items-start gap-2.5 rounded-xl border border-gray-100/60 bg-gray-50/70 p-3 dark:border-gray-800/80 dark:bg-gray-850">
                          <img src={comment.avatar} alt={comment.author} className="h-8 w-8 rounded-full border border-gray-200 object-cover dark:border-gray-700" />
                          <div className="min-w-0 flex-grow">
                            <div className="mb-0.5 flex items-baseline justify-between">
                              <span className="truncate text-xs font-bold text-gray-800 dark:text-gray-100">{comment.author}</span>
                              <span className="font-mono text-[9px] text-gray-400">{comment.time}</span>
                            </div>
                            <p className="break-all text-xs leading-relaxed text-gray-600 dark:text-gray-300">{comment.text}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="flex h-6 w-6 items-center justify-center rounded-lg bg-transparent opacity-0 transition-all hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100 dark:hover:bg-rose-950/20 dark:hover:text-rose-400"
                            title="删除评论"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-8 text-center text-xs font-semibold text-gray-400 dark:border-gray-800 dark:bg-gray-800/20">
                      当前动态暂无评论记录
                    </p>
                  )}
                </div>
              </div>

              <DrawerActionFooter
                status={selectedDyn.status}
                onApprove={() => handleApprove(selectedDyn.id, true)}
                onReject={() => setShowRejectModal(selectedDyn.id)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRejectModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black"
              onClick={() => setShowRejectModal(null)}
            />
            <div className="fixed inset-0 z-[105] flex items-center justify-center overflow-y-auto p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="mb-4 flex items-center gap-2">
                  <div className="rounded-xl bg-rose-50 p-2 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
                    <BadgeAlert className="h-5 w-5" />
                  </div>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white">确认下架该动态？</h4>
                </div>

                <form onSubmit={handleRejectSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400">违规类别</label>
                    <select
                      value={rejectReasonType}
                      onChange={(event) => setRejectReasonType(event.target.value as (typeof REJECT_REASON_OPTIONS)[number])}
                      className="w-full rounded-xl border border-gray-200/80 bg-gray-50 p-2 text-xs font-semibold text-gray-800 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    >
                      {REJECT_REASON_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option === 'custom' ? '其他原因（手动填写）' : option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {rejectReasonType === 'custom' ? (
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400">自定义说明</label>
                      <textarea
                        rows={3}
                        value={rejectReasonCustom}
                        onChange={(event) => setRejectReasonCustom(event.target.value)}
                        placeholder="请输入具体下架原因，该内容会同步给前端展示"
                        className="w-full resize-none rounded-xl border border-gray-200/80 bg-gray-50 p-2.5 text-xs font-medium text-gray-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                        required
                      />
                    </div>
                  ) : null}

                  <div className="flex gap-3 pt-3 select-none">
                    <button type="submit" className="flex-1 rounded-xl bg-rose-600 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-rose-700">
                      确认下架
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRejectModal(null)}
                      className="flex-1 rounded-xl bg-gray-100 py-2 text-xs font-semibold text-gray-800 transition-all hover:bg-gray-200 focus:outline-none dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      取消
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function DynamicListCard({
  item,
  onOpen,
  onApprove,
  onReject,
}: {
  key?: React.Key;
  item: Dynamic;
  onOpen: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const meta = getDynamicMeta(item);

  return (
    <div className="w-full rounded-lg border border-gray-100 bg-white px-2.5 py-2 hover:border-primary/30 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-[11px] font-semibold text-gray-700 dark:text-gray-200">{item.title}</span>
        <span className={`shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-bold ${getCategoryColor(item.category)}`}>{normalizeCategory(item.category)}</span>
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-gray-500">
        <StatBadge icon={<Heart className="h-3 w-3" />} value={item.likes} tone="rose" />
        <StatBadge icon={<Bookmark className="h-3 w-3" />} value={meta.favoriteCount} tone="amber" />
        <StatBadge icon={<Eye className="h-3 w-3" />} value={meta.viewCount} tone="sky" />
        <StatBadge icon={<MessageSquare className="h-3 w-3" />} value={item.commentsCount} tone="slate" />
      </div>

      <div className="mt-1.5 grid grid-cols-1 gap-1 text-[10px] text-gray-400 md:grid-cols-2">
        <span className="truncate">创建：{meta.createTime}</span>
        <span className="truncate">更新：{meta.updateTime}</span>
      </div>

      <div className="mt-1.5 flex items-center justify-end gap-1">
        <button onClick={onOpen} className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] text-gray-700 dark:bg-gray-800 dark:text-gray-200">
          详情
        </button>
        {item.status !== 'normal' ? (
          <button onClick={onApprove} className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-600">
            通过
          </button>
        ) : null}
        {item.status !== 'removed' ? (
          <button onClick={onReject} className="rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] text-rose-600">
            下架
          </button>
        ) : null}
      </div>
    </div>
  );
}

function DrawerAuthorPanel({ item, onBan }: { item: Dynamic; onBan: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800/50 dark:bg-gray-800/40">
      <div className="flex items-center gap-3">
        <img src={item.authorAvatar} alt={item.author} className="h-12 w-12 rounded-full border border-gray-200 object-cover dark:border-gray-700" />
        <div>
          <h4 className={`flex items-center gap-1 text-sm font-bold ${!item.verifiedUser ? 'text-gray-400 line-through decoration-rose-500 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
            {item.author}
            {item.verifiedUser ? <Sparkles className="h-4 w-4 fill-primary text-primary" /> : null}
          </h4>
          <p className="mt-0.5 flex items-center gap-1 font-mono text-[10px] text-gray-400 dark:text-gray-500">
            <Clock className="h-3 w-3" />
            发布时间：{item.time}
          </p>
        </div>
      </div>

      <button
        onClick={onBan}
        disabled={!item.verifiedUser}
        className={`rounded-xl border px-3 py-1.5 text-[11px] font-bold transition-all ${
          item.verifiedUser
            ? 'border-rose-200 bg-rose-50/10 text-rose-600 hover:bg-rose-100/20 dark:border-rose-900/60 dark:text-rose-400'
            : 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 dark:border-gray-800 dark:bg-gray-800/40 dark:text-gray-500'
        }`}
      >
        {item.verifiedUser ? '封禁发布者账号' : '该账号已处于封禁状态'}
      </button>
    </div>
  );
}

function DrawerActionFooter({
  status,
  onApprove,
  onReject,
}: {
  status: Dynamic['status'];
  onApprove: () => void;
  onReject: () => void;
}) {
  if (status === 'pending') {
    return (
      <div className="sticky bottom-0 z-10 flex gap-2.5 border-t border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <button onClick={onApprove} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-emerald-700">
          <Check className="h-4 w-4" />
          一键通过
        </button>
        <button onClick={onReject} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-rose-700">
          <X className="h-4 w-4" />
          驳回下架
        </button>
      </div>
    );
  }

  if (status === 'removed') {
    return (
      <div className="sticky bottom-0 z-10 border-t border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <button onClick={onApprove} className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white transition-all hover:bg-emerald-700">
          <RotateCcw className="h-4 w-4" />
          撤销处罚并恢复公开
        </button>
      </div>
    );
  }

  return (
    <div className="sticky bottom-0 z-10 border-t border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <button onClick={onReject} className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white transition-all hover:bg-rose-700">
        <Gavel className="h-4 w-4" />
        判定违规并下架
      </button>
    </div>
  );
}

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] bg-black" onClick={onCancel} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="fixed left-1/2 top-1/2 z-[120] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="flex items-center gap-3 text-rose-600">
          <div className="rounded-xl bg-rose-50 p-2 dark:bg-rose-950/30">
            <UserX className="h-6 w-6" />
          </div>
          <h4 className="text-lg font-bold">{title}</h4>
        </div>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{description}</p>
        <div className="flex gap-3 pt-2">
          <button onClick={onConfirm} className="flex-1 rounded-xl bg-rose-600 py-2 text-sm font-bold text-white transition-all hover:bg-rose-700">
            {confirmLabel}
          </button>
          <button onClick={onCancel} className="flex-1 rounded-xl bg-gray-100 py-2 text-sm font-semibold text-gray-800 transition-all hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
            取消
          </button>
        </div>
      </motion.div>
    </>
  );
}

function StatBadge({
  icon,
  value,
  tone,
}: {
  icon: React.ReactNode;
  value: string | number;
  tone: 'rose' | 'amber' | 'sky' | 'slate';
}) {
  const toneClass = {
    rose: 'bg-rose-50 text-rose-600 border border-rose-100',
    amber: 'bg-amber-50 text-amber-600 border border-amber-100',
    sky: 'bg-sky-50 text-sky-600 border border-sky-100',
    slate: 'bg-gray-50 text-gray-600 border border-gray-200',
  }[tone];

  return (
    <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 ${toneClass}`}>
      {icon}
      {value}
    </span>
  );
}

function MetaChip({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  tone: 'rose' | 'amber' | 'sky' | 'slate';
}) {
  const toneClass = {
    rose: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/20 dark:text-rose-300 dark:border-rose-900/30',
    amber: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900/30',
    sky: 'bg-sky-50 text-sky-600 border-sky-100 dark:bg-sky-950/20 dark:text-sky-300 dark:border-sky-900/30',
    slate: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700/50',
  }[tone];

  return (
    <span className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 ${toneClass}`}>
      {icon}
      <span className="font-semibold">{label}</span>
      <span className="font-bold">{value}</span>
    </span>
  );
}

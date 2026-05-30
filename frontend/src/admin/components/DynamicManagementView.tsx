/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Tag, 
  SlidersHorizontal, 
  Heart, 
  MessageSquare, 
  Check, 
  X, 
  ShieldAlert, 
  Clock, 
  User, 
  Image as ImageIcon, 
  Gavel, 
  RotateCcw, 
  Flame, 
  AlertCircle, 
  Sparkles, 
  Trash2,
  Send,
  UserX,
  CheckCircle2,
  BadgeAlert,
  Info
} from 'lucide-react';
import { Dynamic } from '../types';

interface DynamicManagementViewProps {
  dynamics: Dynamic[];
  onUpdateDynamicStatus: (dynId: string, status: 'normal' | 'removed' | 'pending', rejectReason?: string) => void;
  onBanUser: (userName: string) => void;
  onAddComment: (dynId: string, author: string, text: string) => void;
  onDeleteComment: (dynId: string, commentId: string) => void;
  initialTabFilter?: string;
}

export default function DynamicManagementView({
  dynamics,
  onUpdateDynamicStatus,
  onBanUser,
  onAddComment,
  onDeleteComment,
  initialTabFilter
}: DynamicManagementViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'life' | 'help' | 'activity' | 'food'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'normal' | 'removed'>('all');

  // Modal / Drawer status
  const [selectedDyn, setSelectedDyn] = useState<Dynamic | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null); // holds dynId for rejection
  const [rejectReasonType, setRejectReasonType] = useState('涉嫌垃圾广告推广');
  const [rejectReasonCustom, setRejectReasonCustom] = useState('');
  const [commentInput, setCommentInput] = useState('');

  // Custom visual state alerts
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [banConfirmAuthor, setBanConfirmAuthor] = useState<string | null>(null);

  const showToastMsg = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Trigger from outside tabs (such as pending tasks in dashboard)
  useEffect(() => {
    if (initialTabFilter === 'pending') {
      setStatusFilter('pending');
    }
  }, [initialTabFilter]);

  // Loader
  const [isSearchingLoad, setIsSearchingLoad] = useState(false);

  useEffect(() => {
    setIsSearchingLoad(true);
    const timer = setTimeout(() => {
      setIsSearchingLoad(false);
    }, 3000); // 300ms is standard, but keeping it lively
    return () => clearTimeout(timer);
  }, [searchTerm, categoryFilter, statusFilter]);

  const getCategoryName = (cat: string) => {
    switch (cat) {
      case 'life': return '同城生活';
      case 'help': return '求助互助';
      case 'activity': return '同城活动';
      case 'food': return '美食探店';
      default: return '其他';
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'life': return 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400 border border-sky-100 dark:border-sky-900/30';
      case 'help': return 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30';
      case 'activity': return 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30';
      case 'food': return 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30';
      default: return 'bg-gray-50 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400 border border-gray-200 dark:border-gray-700/30';
    }
  };

  // Filter logic
  const filteredDynamics = dynamics.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = categoryFilter === 'all' ? true : d.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' ? true : d.status === statusFilter;

    return matchesSearch && matchesCat && matchesStatus;
  });

  const handleApprove = (dynId: string) => {
    onUpdateDynamicStatus(dynId, 'normal');
    // Sync current drawer
    if (selectedDyn && selectedDyn.id === dynId) {
      setSelectedDyn({ ...selectedDyn, status: 'normal' });
    }
    showToastMsg('该动态内容已成功通过审核并公开展示！', 'success');
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRejectModal) return;
    const finalReason = rejectReasonCustom.trim() || rejectReasonReasonText();
    onUpdateDynamicStatus(showRejectModal, 'removed', finalReason);

    // Sync state
    if (selectedDyn && selectedDyn.id === showRejectModal) {
      setSelectedDyn({ ...selectedDyn, status: 'removed', rejectReason: finalReason });
    }

    setShowRejectModal(null);
    setRejectReasonCustom('');
    showToastMsg('已安全下架该违规内容并通告作者！', 'info');
  };

  const rejectReasonReasonText = () => {
    return rejectReasonType === 'custom' ? '自定义违规项' : rejectReasonType;
  };

  const handlePostCommentInDrawer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !selectedDyn) return;

    onAddComment(selectedDyn.id, '系统管理员', commentInput.trim());

    // Update state inside drawer too
    const newComment = {
      id: Date.now().toString(),
      author: '系统管理员',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAutf8uw-UP_WcJF6DedJ7BJ-58j6AAoLLsPj5uet4SuxCOsbEVOsOt8J5Q8cq0EcOJjh94kvPemlbPGCcdd89_oNXUsQRyuMWCsUQlagzBJhnOTUtw94XVV1AIw494VL8MRVgRwo0k2vWHujUJ-JYDSlLcvmZOOau40QddlzoeAwLsvEYy0BeAyExWOUQIL9zD8ULX6ruVNErCoPp9-hFCH6zrLtpvJwLdnaYJ1EBsCdh4kv_Dyp_5tUU8mZI1XzDOqNQ03ZcnPHZ4',
      text: commentInput.trim(),
      time: '刚刚'
    };

    setSelectedDyn({
      ...selectedDyn,
      commentsCount: selectedDyn.commentsCount + 1,
      comments: [newComment, ...selectedDyn.comments]
    });

    setCommentInput('');
    showToastMsg('系统跟评发表成功！', 'success');
  };

  const handleDeleteCommentInDrawer = (commentId: string) => {
    if (!selectedDyn) return;
    onDeleteComment(selectedDyn.id, commentId);

    setSelectedDyn({
      ...selectedDyn,
      commentsCount: Math.max(0, selectedDyn.commentsCount - 1),
      comments: selectedDyn.comments.filter(c => c.id !== commentId)
    });
    showToastMsg('已直接抹除本条不规范评论！', 'info');
  };

  const handleConfirmBanAuthor = () => {
    if (!banConfirmAuthor) return;
    onBanUser(banConfirmAuthor);
    if (selectedDyn && selectedDyn.author === banConfirmAuthor) {
      setSelectedDyn({
        ...selectedDyn,
        verifiedUser: false
      });
    }
    showToastMsg(`用户 “${banConfirmAuthor}” 的账号已被无限期封锁惩罚！`, 'error');
    setBanConfirmAuthor(null);
  };

  return (
    <div className="relative">
      {/* Dynamic Native Custom Toast alert System */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800"
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-sky-500" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-500" />}
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Ban confirmation Popup modal */}
      <AnimatePresence>
        {banConfirmAuthor && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-[110]"
              onClick={() => setBanConfirmAuthor(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[120] max-w-sm w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-600">
                <div className="p-2 bg-rose-50 dark:bg-rose-950/30 rounded-xl">
                  <UserX className="w-6 h-6 animate-bounce" />
                </div>
                <h4 className="text-lg font-bold">无限期封锁此用户？</h4>
              </div>

              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                确认要将发表用户 <strong className="text-gray-900 dark:text-white">“{banConfirmAuthor}”</strong> 的账号实施封锁吗？
                封锁后该用户的所有同城动态、二手闲置和便民服务都会被标记为敏感或作冻结下架处理。
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleConfirmBanAuthor}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-sm shadow-rose-600/10"
                >
                  确认永久封锁
                </button>
                <button
                  type="button"
                  onClick={() => setBanConfirmAuthor(null)}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold text-sm rounded-xl transition-all cursor-pointer"
                >
                  我再想想
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-6"
      >
        {/* Category filters list config box */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Category tabs list */}
            <div className="flex flex-wrap items-center gap-1.5 pb-2 lg:pb-0">
              <span className="text-gray-500 dark:text-gray-400 text-xs font-bold mr-2 tracking-wider uppercase flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-primary" />
                动态版块分类:
              </span>
              {(['all', 'life', 'help', 'activity', 'food'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap focus:outline-none ${
                    categoryFilter === cat
                      ? 'bg-primary text-white shadow-sm shadow-primary/25 font-bold'
                      : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/40 dark:hover:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {cat === 'all' ? '全部动态' : getCategoryName(cat)}
                </button>
              ))}
            </div>

            {/* Status indicators and buttons select */}
            <div className="flex items-center gap-3">
              <span className="text-gray-500 dark:text-gray-400 text-xs font-bold flex items-center gap-1.5 mr-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
                状态筛选:
              </span>
              <div className="inline-flex rounded-xl bg-gray-50 dark:bg-gray-800/40 p-1 border border-gray-100 dark:border-gray-800/60">
                {(['all', 'pending', 'normal', 'removed'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 font-semibold rounded-lg text-xs transition-all cursor-pointer border-none focus:outline-none ${
                      statusFilter === st
                        ? 'bg-white dark:bg-gray-800 text-primary shadow-sm font-bold'
                        : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                    }`}
                  >
                    {st === 'all' ? '全部' : st === 'pending' ? '待审核' : st === 'normal' ? '已公开' : '违规屏蔽'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search box row bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top.5 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5 pointer-events-none" />
            <input
              type="text"
              placeholder="搜索同城发布文案、发布者昵称、动态ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-xl font-medium text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all dark:text-white"
            />
          </div>
        </div>

        {/* Dynamics List / Feed */}
        <div>
          {isSearchingLoad ? (
            /* Pulsing skeleton screen loader elements on change items query */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4 animate-pulse">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-full bg-gray-200 dark:bg-gray-800 h-10 w-10"></div>
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
                    </div>
                  </div>
                  <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                  <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                  <div className="flex space-x-2 pt-2">
                    <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/2"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredDynamics.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-16 text-center select-none flex flex-col items-center justify-center">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-full mb-4">
                <SlidersHorizontal className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-base font-bold text-gray-800 dark:text-gray-100">没有查找到符合该过滤条件的公开动态</p>
              <p className="text-xs text-gray-400 mt-1">您可以试着切换更丰富的大类或重新校正检索文字</p>
            </div>
          ) : (
            /* Premium layout cards feed spacing */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDynamics.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -4, boxShadow: '0 16px 24px -12px rgba(0,0,0,0.08)' }}
                  onClick={() => setSelectedDyn(item)}
                  className={`bg-white dark:bg-gray-900 rounded-2xl border p-5 flex flex-col justify-between cursor-pointer transition-all relative ${
                    item.status === 'removed'
                      ? 'border-rose-100 dark:border-rose-950 bg-rose-50/10'
                      : item.status === 'pending'
                      ? 'border-amber-200 dark:border-amber-900/60 shadow-md shadow-amber-500/5'
                      : 'border-gray-100 dark:border-gray-800 shadow-sm'
                  }`}
                >
                  <div>
                    {/* Header: User Profile of the post */}
                    <div className="flex justify-between items-start mb-3 select-none">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.authorAvatar}
                          alt={item.author}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200/50 dark:border-gray-700/50"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://lh3.googleusercontent.com/aida-public/AB6AXuB51BLmXrMHY3W_3w8lDMModFpDoXFpkEON0rvWsuR4TSbZDq63XDgYYu13h7muskvXx8GQfArBB5Aeb1BwnDeAxGZiFeN6A33g6O-xWwCXoplVZdCLi1mU2W--fIz1leAMb8JGnm5urSA40Dm5ExCbWsNSpr3XqujWCsxUzADuiE-4h_0E8oWAxQ9s2nDRgcouqlKl6nCuYrBrdMEXoWhJ0z38k-hx-jef_OcdV0Kq9xHZJ7O3K1_aL7SMjcZCpmTAK3odD-fEkDJJ';
                          }}
                        />
                        <div>
                          <p className={`font-bold text-gray-800 dark:text-gray-100 flex items-center gap-1 text-xs leading-normal ${!item.verifiedUser ? 'text-gray-400 dark:text-gray-500 line-through decoration-rose-500/80' : ''}`}>
                            {item.author}
                            {item.verifiedUser && (
                              <Sparkles className="w-3.5 h-3.5 text-primary fill-primary" />
                            )}
                          </p>
                          <p className="font-mono text-[9px] text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {item.time.slice(5, 16)}
                          </p>
                        </div>
                      </div>

                      {/* Info categories label tab */}
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${getCategoryColor(item.category)}`}>
                        {getCategoryName(item.category)}
                      </span>
                    </div>

                    {/* Content Text Body */}
                    <div className="mb-4">
                      <p className="font-medium text-gray-600 dark:text-gray-300 text-xs line-clamp-3 leading-relaxed break-all">
                        {item.title}
                      </p>
                    </div>

                    {/* Grid thumbnails view details images list */}
                    {item.images && item.images.length > 0 && (
                      <div className="grid grid-cols-3 gap-1.5 mb-4 max-h-[85px] overflow-hidden rounded-xl select-none">
                        {item.images.slice(0, 3).map((imgUrl, i) => (
                          <div key={i} className="aspect-square bg-gray-50 dark:bg-gray-800 relative overflow-hidden group">
                            <img
                              src={imgUrl}
                              alt="media"
                              className="w-full h-full object-cover transition-transform duration-350 group-hover:scale-105"
                            />
                            {i === 2 && item.images.length > 3 && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[11px] font-bold tracking-wider">
                                +{item.images.length - 3}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Discarded report reason if available */}
                  {item.status === 'removed' && item.rejectReason && (
                    <div className="mb-4 p-2.5 bg-rose-50/70 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-xl flex items-start gap-1.5 text-[11px] border border-rose-100/30">
                      <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <p className="leading-normal">
                        <strong>下架理由:</strong> {item.rejectReason}
                      </p>
                    </div>
                  )}

                  {/* Actions footer options layout panel */}
                  <div
                    className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800/80 pt-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex gap-4 font-mono text-[10px] font-semibold text-gray-400 dark:text-gray-500">
                      <span className="flex items-center gap-1 text-rose-500/80">
                        <Heart className="w-3.5 h-3.5" />
                        <span>{item.likes}</span>
                      </span>
                      <button
                        onClick={() => setSelectedDyn(item)}
                        className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer bg-transparent border-none p-0 focus:outline-none"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                        <span>{item.commentsCount}</span>
                      </button>
                    </div>

                    {/* High fidelity switch status handlers list */}
                    <div className="flex gap-1.5 select-none">
                      {item.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleApprove(item.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-[10px] font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer focus:outline-none"
                          >
                            审核通过
                          </button>
                          <button
                            onClick={() => setShowRejectModal(item.id)}
                            className="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-[10px] font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer focus:outline-none"
                          >
                            下架驳回
                          </button>
                        </>
                      ) : item.status === 'removed' ? (
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-[10px] font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer focus:outline-none border border-gray-200/40 dark:border-gray-700/30"
                        >
                          恢复上架
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowRejectModal(item.id)}
                          className="bg-transparent border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-bold text-[10px] px-2.5 py-1 rounded-xl transition-all cursor-pointer focus:outline-none"
                        >
                          违规下架
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Dynamic Detail Comments drawer overlay */}
      <AnimatePresence>
        {selectedDyn && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDyn(null)}
              className="fixed inset-0 bg-black/60 z-45 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="fixed top-0 right-0 h-full w-full max-w-lg bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800 shadow-2xl z-50 overflow-y-auto flex flex-col text-gray-800 dark:text-white"
            >
              {/* Drawer Header Layout */}
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white/80 dark:bg-gray-900/80 sticky top-0 backdrop-blur-md z-10">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-primary animate-pulse" />
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">动态详情 / 互动审查管理</h3>
                </div>
                <button
                  onClick={() => setSelectedDyn(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800/85 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer border-none bg-transparent focus:outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Body content details list */}
              <div className="p-6 space-y-6 flex-grow">
                
                {/* Author context line panel info */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800/50">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedDyn.authorAvatar}
                      alt={selectedDyn.author}
                      className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                    />
                    <div>
                      <h4 className={`text-sm font-bold flex items-center gap-1 text-gray-900 dark:text-white ${!selectedDyn.verifiedUser ? 'text-gray-400 dark:text-gray-500 line-through decoration-rose-500' : ''}`}>
                        {selectedDyn.author}
                        {selectedDyn.verifiedUser && (
                          <Sparkles className="w-4 h-4 text-primary fill-primary" />
                        )}
                      </h4>
                      <p className="font-mono text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        发帖时间: {selectedDyn.time}
                      </p>
                    </div>
                  </div>

                  {/* Disable block ban publisher user */}
                  <div className="text-right">
                    <button
                      onClick={() => setBanConfirmAuthor(selectedDyn.author)}
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border cursor-pointer transition-all ${
                        selectedDyn.verifiedUser
                          ? 'border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 bg-rose-50/10 hover:bg-rose-100/20 active:scale-95'
                          : 'border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed bg-gray-100 dark:bg-gray-800/40'
                      }`}
                      disabled={!selectedDyn.verifiedUser}
                    >
                      {selectedDyn.verifiedUser ? '封禁发布人账户' : '该作者已处于封锁中'}
                    </button>
                  </div>
                </div>

                {/* Main dynamics body text display */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 select-none">
                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${getCategoryColor(selectedDyn.category)}`}>
                      {getCategoryName(selectedDyn.category)}
                    </span>
                    <span className="font-mono text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase">Post ID: {selectedDyn.id}</span>
                  </div>

                  <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed p-4 bg-gray-50 dark:bg-gray-800/20 rounded-2xl border border-gray-100 dark:border-gray-800/50 whitespace-pre-wrap selection:bg-primary/20">
                    {selectedDyn.title}
                  </p>
                </div>

                {/* Grid details images layout list */}
                {selectedDyn.images && selectedDyn.images.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1 mb-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-primary" />
                      多媒体原图附件 ({selectedDyn.images.length})
                    </h5>
                    <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto p-2 bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-2xl">
                      {selectedDyn.images.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="aspect-video bg-gray-100 dark:bg-gray-900 border border-gray-200/40 dark:border-gray-800 rounded-xl overflow-hidden group select-none relative cursor-zoom-in"
                          onClick={() => window.open(imgUrl)}
                        >
                          <img
                            src={imgUrl}
                            alt={`large-${idx}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interactive comment reply controls simulator */}
                <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between items-center select-none mb-1">
                    <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-primary" />
                      评议回复记录群
                      <span className="font-mono text-[10px] text-gray-400">({selectedDyn.commentsCount})</span>
                    </h5>
                  </div>

                  {/* Add comment input form */}
                  <form onSubmit={handlePostCommentInDrawer} className="flex gap-2 relative">
                    <input
                      type="text"
                      placeholder="作为官方运营超管，快速注入引导回复内容..."
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      className="flex-1 py-1.5 pl-3 pr-10 border border-gray-100 dark:border-gray-800 rounded-xl font-medium text-xs bg-gray-50 dark:bg-gray-850 text-gray-800 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                      required
                    />
                    <button
                      type="submit"
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-primary text-white hover:bg-primary-container rounded-lg flex items-center justify-center transition-all cursor-pointer focus:outline-none"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>

                  {/* Comments lists display panel */}
                  <div className="space-y-3">
                    {selectedDyn.comments && selectedDyn.comments.length === 0 ? (
                      <p className="text-center font-semibold text-xs text-gray-400 py-8 bg-gray-50 dark:bg-gray-800/20 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">该同城帖子暂无评议记录</p>
                    ) : (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                        {selectedDyn.comments.map((comm) => (
                          <div
                            key={comm.id}
                            className="p-3 bg-gray-50/70 dark:bg-gray-850 border border-gray-100/60 dark:border-gray-800/80 rounded-xl flex items-start gap-2.5 group relative"
                          >
                            <img
                              src={comm.avatar}
                              alt={comm.author}
                              className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                            />
                            <div className="flex-grow min-w-0">
                              <div className="flex justify-between items-baseline mb-0.5">
                                <span className="font-bold text-gray-800 dark:text-gray-100 text-xs truncate">{comm.author}</span>
                                <span className="font-mono text-[9px] text-gray-400">{comm.time}</span>
                              </div>
                              <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed break-all select-all">{comm.text}</p>
                            </div>

                            {/* Delete single comment option button */}
                            <button
                              onClick={() => handleDeleteCommentInDrawer(comm.id)}
                              className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 transition-all cursor-pointer border-none bg-transparent p-0 focus:outline-none"
                              title="删除作违规抹除本条"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions slide bottom footer */}
              <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 gap-2.5 flex justify-end sticky bottom-0 z-10 select-none">
                {selectedDyn.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => {
                        handleApprove(selectedDyn.id);
                        setSelectedDyn(null);
                      }}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer border-none flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
                    >
                      <Check className="w-4 h-4" />
                      <span>合法合规・一键展示</span>
                    </button>
                    <button
                      onClick={() => setShowRejectModal(selectedDyn.id)}
                      className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer border-none flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
                    >
                      <X className="w-4 h-4" />
                      <span>审核下架驳回</span>
                    </button>
                  </>
                ) : selectedDyn.status === 'removed' ? (
                  <button
                    onClick={() => {
                      handleApprove(selectedDyn.id);
                      setSelectedDyn(null);
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 font-bold text-white text-xs rounded-xl transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 active:scale-[0.98]"
                  >
                    <RotateCcw className="w-4 h-4 animate-spin-slow" />
                    <span>撤销违规判罚・重新公开恢复</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowRejectModal(selectedDyn.id)}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 font-bold text-white text-xs rounded-xl transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 active:scale-[0.98]"
                  >
                    <Gavel className="w-4 h-4" />
                    <span>判定违规・强制驳回下架</span>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Reject template modal prompt */}
      <AnimatePresence>
        {showRejectModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-[100]"
              onClick={() => setShowRejectModal(null)}
            />
            <div className="fixed inset-0 overflow-y-auto z-[105] flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-gray-900 max-w-sm w-full rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl p-6 relative overflow-hidden"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-xl">
                    <BadgeAlert className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white">确定将此动态下架驳回？</h4>
                </div>

                <form onSubmit={handleRejectSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-gray-500 dark:text-gray-400 font-bold text-[10px] uppercase select-none">违规判定类别</label>
                    <select
                      value={rejectReasonType}
                      onChange={(e) => setRejectReasonType(e.target.value)}
                      className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 rounded-xl font-semibold text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer text-gray-800 dark:text-gray-100"
                    >
                      <option value="涉嫌垃圾广告推广">涉嫌垃圾广告推广</option>
                      <option value="图片/文案包含敏感涉密违法字眼">图片/文案包含敏感涉密违法字眼</option>
                      <option value="虚假信息宣传/诱导欺诈行为">虚假信息宣传/诱导欺诈行为</option>
                      <option value="人身攻击/低俗不雅谩骂">人身攻击/低俗不雅谩骂</option>
                      <option value="custom">由于其他特殊原因（手写描述）</option>
                    </select>
                  </div>

                  {rejectReasonType === 'custom' && (
                    <div className="space-y-1">
                      <label className="block text-gray-500 dark:text-gray-400 font-bold text-[10px] uppercase select-none">自定义描述违规事实</label>
                      <textarea
                        rows={3}
                        value={rejectReasonCustom}
                        onChange={(e) => setRejectReasonCustom(e.target.value)}
                        placeholder="请输入具体驳回及封停的原因，将实时反馈并在该用户手持终端展示"
                        className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 rounded-xl font-medium text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none text-gray-800 dark:text-gray-100"
                        required
                      />
                    </div>
                  )}

                  <div className="flex gap-3 pt-3 select-none">
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer border-none transition-all"
                    >
                      确认下架
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRejectModal(null)}
                      className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold text-xs rounded-xl cursor-pointer transition-all focus:outline-none"
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

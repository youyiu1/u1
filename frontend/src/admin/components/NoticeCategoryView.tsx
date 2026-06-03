/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Inbox,
  Info,
  Layers,
  MailCheck,
  Megaphone,
  PlusCircle,
  Send,
} from 'lucide-react';
import { CategoryItem, NotificationItem } from '../types';

interface NoticeCategoryViewProps {
  categories: CategoryItem[];
  notifications: NotificationItem[];
  onToggleCategoryStatus: (id: string) => void;
  onAddCategory: (name: string, type: 'dynamic' | 'goods' | 'service') => void;
  onToggleNotificationRead: (id: string) => void;
  onAddNotification: (title: string, content: string, target: 'all' | 'specific', isScheduled: boolean) => void;
  vMode?: 'notifications' | 'categories';
}

export default function NoticeCategoryView({
  categories,
  notifications,
  onToggleCategoryStatus,
  onAddCategory,
  onToggleNotificationRead,
  onAddNotification,
  vMode,
}: NoticeCategoryViewProps) {
  const [activeCategoryTab, setActiveCategoryTab] = useState<'dynamic' | 'goods' | 'service'>('dynamic');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [showAddNoticeModal, setShowAddNoticeModal] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeTarget, setNoticeTarget] = useState<'all' | 'specific'>('all');
  const [isScheduled, setIsScheduled] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToastMsg = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const categoryName = newCategoryName.trim();
    onAddCategory(categoryName, activeCategoryTab);
    setNewCategoryName('');
    setShowAddCatModal(false);
    showToastMsg(`已新增分类：${categoryName}`, 'success');
  };

  const handleAddNoticeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) return;

    onAddNotification(noticeTitle.trim(), noticeContent.trim(), noticeTarget, isScheduled);
    setNoticeTitle('');
    setNoticeContent('');
    setNoticeTarget('all');
    setIsScheduled(false);
    setShowAddNoticeModal(false);

    showToastMsg(isScheduled ? '定时公告已加入发送队列' : '公告已立即发送', 'success');
  };

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === activeCategoryTab),
    [activeCategoryTab, categories],
  );

  const tabLabel = (tab: 'dynamic' | 'goods' | 'service') => {
    if (tab === 'dynamic') return '社区动态';
    if (tab === 'goods') return '闲置商品';
    return '生活服务';
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.95 }}
            className="fixed top-6 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-2.5 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-xl dark:border-gray-800 dark:bg-gray-900"
          >
            {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
            {toast.type === 'info' && <Info className="h-5 w-5 text-sky-500" />}
            {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-500" />}
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="grid grid-cols-1 gap-6 text-gray-800 dark:text-white lg:grid-cols-12"
      >
        {(!vMode || vMode === 'categories') && (
          <div className={`${vMode === 'categories' ? 'lg:col-span-12' : 'lg:col-span-6'} flex min-h-[460px] flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800/60 dark:bg-gray-900`}>
            <div>
              <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-3.5 select-none dark:border-gray-800/80">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  <h3 className="font-headline-md text-sm font-black tracking-wide">分类管理</h3>
                </div>
                <button
                  onClick={() => setShowAddCatModal(true)}
                  className="flex cursor-pointer items-center gap-1 rounded-xl border border-primary/30 px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-white focus:outline-none"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>新增分类</span>
                </button>
              </div>

              <div className="mb-5 flex rounded-xl border border-gray-100 bg-gray-50 p-1 select-none dark:border-gray-800/50 dark:bg-gray-800">
                {(['dynamic', 'goods', 'service'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveCategoryTab(tab)}
                    className={`flex-1 rounded-lg border-none py-1.5 text-xs font-semibold transition-all focus:outline-none ${
                      activeCategoryTab === tab
                        ? 'bg-white font-black text-primary shadow-sm dark:bg-gray-700'
                        : 'text-gray-400 hover:text-gray-800 dark:hover:text-white'
                    }`}
                  >
                    {tabLabel(tab)}
                  </button>
                ))}
              </div>

              <div className="max-h-[320px] space-y-2.5 overflow-y-auto pr-1">
                {filteredCategories.map((cat, index) => (
                  <div
                    key={cat.id}
                    className={`flex items-center justify-between rounded-xl border p-3.5 transition-all ${
                      cat.status === 'disabled'
                        ? 'border-gray-200 bg-gray-50/40 opacity-60 dark:border-gray-700 dark:bg-gray-950/20'
                        : 'border-gray-100 bg-white hover:border-primary/20 dark:border-gray-800 dark:bg-gray-850'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 select-none font-mono text-xs font-bold text-gray-400">{index + 1}</span>
                      <div>
                        <span className={`text-xs font-bold ${cat.status === 'disabled' ? 'text-gray-400 line-through' : 'text-gray-800 dark:text-gray-100'}`}>
                          {cat.name}
                        </span>
                        <span className="ml-2 font-mono text-[9px] text-gray-400">({cat.id})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 select-none">
                      <span className="font-mono text-[9px] font-bold text-gray-400">排序: {cat.order}</span>
                      <button
                        onClick={() => {
                          onToggleCategoryStatus(cat.id);
                          showToastMsg(`已更新分类状态：${cat.name}`, 'info');
                        }}
                        className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition-colors focus:outline-none ${
                          cat.status === 'normal'
                            ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                            : 'bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white'
                        }`}
                      >
                        {cat.status === 'normal' ? '启用中' : '已停用'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-start gap-1.5 border-t border-gray-100 pt-4 text-[10px] leading-relaxed text-gray-400 select-none dark:border-gray-800/80">
              <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <p>
                <strong>说明：</strong>分类状态更新后会同步影响前端展示，停用分类后相关入口会自动隐藏。
              </p>
            </div>
          </div>
        )}

        {(!vMode || vMode === 'notifications') && (
          <div className={`${vMode === 'notifications' ? 'lg:col-span-12' : 'lg:col-span-6'} flex min-h-[460px] flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800/60 dark:bg-gray-900`}>
            <div>
              <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-3.5 select-none dark:border-gray-800/80">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-primary" />
                  <h3 className="font-headline-md text-sm font-black tracking-wide">公告通知</h3>
                </div>
                <button
                  onClick={() => setShowAddNoticeModal(true)}
                  className="flex cursor-pointer items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-primary/10 transition-colors hover:bg-primary-container focus:outline-none"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>新建公告</span>
                </button>
              </div>

              <div className="max-h-[350px] space-y-4 overflow-y-auto pr-1">
                {notifications.map((ntf) => (
                  <div
                    key={ntf.id}
                    className={`relative rounded-xl border p-4 transition-all ${
                      ntf.read
                        ? 'border-gray-100 bg-gray-50/50 opacity-65 hover:opacity-90 dark:border-gray-800/80 dark:bg-gray-850/50'
                        : 'border-primary/20 bg-primary/5 shadow-xs'
                    }`}
                  >
                    {!ntf.read && <span className="absolute right-14 top-4 h-1.5 w-1.5 animate-ping rounded-full bg-rose-500" />}

                    <button
                      onClick={() => {
                        onToggleNotificationRead(ntf.id);
                        showToastMsg(ntf.read ? '已恢复为未读' : '已标记为已读', 'info');
                      }}
                      className="absolute right-4 top-3.5 border-none bg-transparent text-gray-400 focus:outline-none dark:hover:text-white"
                      title={ntf.read ? '标记为未读' : '标记为已读'}
                    >
                      <Inbox className="h-4 w-4 text-primary" />
                    </button>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 font-mono text-[9px] font-bold select-none">
                        <span className={`rounded px-1.5 py-0.5 text-[8px] uppercase tracking-wider ${
                          ntf.status === 'scheduled' ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary'
                        }`}>
                          {ntf.status === 'scheduled' ? '定时发送' : '已发送'}
                        </span>
                        <span className="text-gray-400">范围: {ntf.target === 'all' ? '全体用户' : '指定用户'}</span>
                      </div>

                      <h4 className="truncate pr-6 text-xs font-bold text-gray-900 dark:text-gray-100">{ntf.title}</h4>
                      <p className="break-all text-xs font-medium leading-relaxed text-gray-600 dark:text-gray-300">{ntf.content}</p>
                      <p className="flex items-center gap-1 pt-1 font-mono text-[9px] text-gray-400 select-none">
                        <Calendar className="h-3 w-3" />
                        时间: {ntf.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 text-[10px] leading-normal text-gray-400 select-none dark:border-gray-800/80">
              <span className="flex items-center gap-1 font-semibold text-emerald-600">
                <MailCheck className="h-4 w-4" />
                自动同步顶部通知未读数
              </span>
              <span>点击卡片右上角按钮即可快速处理通知状态。</span>
            </div>
          </div>
        )}

        <AnimatePresence>
          {showAddCatModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black"
                onClick={() => setShowAddCatModal(false)}
              />
              <div className="fixed inset-0 z-[105] flex items-center justify-center overflow-y-auto p-4">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="w-full max-w-sm space-y-4 rounded-2xl border border-gray-100 bg-white p-6 text-gray-800 shadow-2xl dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                >
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3 select-none dark:border-gray-800">
                    <div className="rounded-xl bg-primary/10 p-2 text-primary">
                      <Layers className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="text-base font-extrabold">新增分类</h4>
                  </div>

                  <form onSubmit={handleAddCategorySubmit} className="space-y-4 text-xs font-sans">
                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-bold uppercase text-gray-400 select-none">所属板块</label>
                      <div className="block w-full rounded-xl border border-gray-200/80 bg-gray-50 p-2.5 text-xs font-bold text-primary select-all dark:border-gray-750 dark:bg-gray-800">
                        {tabLabel(activeCategoryTab)}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-bold uppercase text-gray-500 select-none" htmlFor="new-cat-name-input">分类名称 *</label>
                      <input
                        id="new-cat-name-input"
                        type="text"
                        placeholder="例如：家电维修 / 美食推荐"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs font-bold text-gray-900 outline-none dark:border-gray-705 dark:bg-gray-800 dark:text-white"
                        required
                      />
                    </div>

                    <div className="flex gap-3 pt-3 select-none">
                      <button type="submit" className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-white shadow-md">
                        提交
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddCatModal(false)}
                        className="flex-1 rounded-xl bg-gray-100 py-2.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
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

        <AnimatePresence>
          {showAddNoticeModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black backdrop-blur-xs"
                onClick={() => setShowAddNoticeModal(false)}
              />
              <div className="fixed inset-0 z-[105] flex items-center justify-center overflow-y-auto p-4">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="w-full max-w-md space-y-4 rounded-2xl border border-gray-100 bg-white p-6 text-gray-800 shadow-2xl dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                >
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3 select-none dark:border-gray-800">
                    <div className="animate-pulse rounded-xl bg-primary/10 p-2 text-primary">
                      <Megaphone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-gray-900 dark:text-white">新建公告</h4>
                      <p className="mt-0.5 text-[10px] text-gray-400">公告将推送到用户端通知区域</p>
                    </div>
                  </div>

                  <form onSubmit={handleAddNoticeSubmit} className="space-y-4 text-xs font-sans">
                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-bold uppercase text-gray-500 select-none" htmlFor="notice-title-input">公告标题 *</label>
                      <input
                        id="notice-title-input"
                        type="text"
                        placeholder="请输入 25 字以内标题"
                        value={noticeTitle}
                        onChange={(e) => setNoticeTitle(e.target.value)}
                        className="w-full rounded-xl border border-gray-205 bg-gray-50 px-3 py-2.5 text-xs font-bold text-gray-900 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        required
                        maxLength={25}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-bold uppercase text-gray-500 select-none" htmlFor="notice-content-input">公告内容 *</label>
                      <textarea
                        id="notice-content-input"
                        rows={4}
                        placeholder="请输入公告详细内容"
                        value={noticeContent}
                        onChange={(e) => setNoticeContent(e.target.value)}
                        className="w-full resize-none rounded-xl border border-gray-205 bg-gray-50 p-3 text-xs font-medium text-gray-800 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[9px] font-bold uppercase text-gray-550 select-none">推送范围</label>
                        <select
                          value={noticeTarget}
                          onChange={(e) => setNoticeTarget(e.target.value as 'all' | 'specific')}
                          className="w-full cursor-pointer rounded-xl border border-gray-205 bg-gray-50 p-2.5 text-xs font-bold text-gray-800 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        >
                          <option value="all">全体用户</option>
                          <option value="specific">指定用户</option>
                        </select>
                      </div>

                      <div className="space-y-1.5 select-none">
                        <label className="block text-[9px] font-bold uppercase text-gray-550">发送方式</label>
                        <div className="flex h-10 items-center">
                          <input
                            id="notice-scheduled-input"
                            type="checkbox"
                            checked={isScheduled}
                            onChange={(e) => setIsScheduled(e.target.checked)}
                            className="h-4.5 w-4.5 cursor-pointer rounded-md border border-gray-300 text-primary dark:border-gray-700"
                          />
                          <label className="ml-2 block cursor-pointer text-xs font-extrabold text-gray-600 dark:text-gray-300" htmlFor="notice-scheduled-input">
                            定时发送
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-3 select-none">
                      <button
                        type="submit"
                        className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-white shadow-md transition-all"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>发布公告</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddNoticeModal(false)}
                        className="flex-1 rounded-xl bg-gray-100 py-2.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
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
      </motion.div>
    </div>
  );
}

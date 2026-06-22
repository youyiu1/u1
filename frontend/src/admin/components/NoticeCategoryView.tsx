/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Calendar, Inbox, Info, Layers, MailCheck, Megaphone, PlusCircle, Send } from 'lucide-react';
import { CategoryItem, NotificationItem } from '../types';
import { useToast } from '../hooks/useToast';
import AdminToast from './common/AdminToast';

interface NoticeCategoryViewProps {
  categories: CategoryItem[];
  notifications: NotificationItem[];
  onToggleCategoryStatus: (id: string) => void;
  onAddCategory: (name: string, type: 'dynamic' | 'goods' | 'service') => void;
  onToggleNotificationRead: (id: string) => void;
  onAddNotification: (payload: {
    title: string;
    content: string;
    target: 'all' | 'specific';
    userIds: string[];
    isScheduled: boolean;
  }) => void;
  vMode?: 'notifications' | 'categories';
}

type CategoryTab = 'dynamic' | 'goods' | 'service';

const CATEGORY_TABS: { value: CategoryTab; label: string }[] = [
  { value: 'dynamic', label: '社区动态' },
  { value: 'goods', label: '闲置商品' },
  { value: 'service', label: '生活服务' },
];

function parseUserIds(value: string) {
  return value
    .split(/[\n,，\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
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
  const [activeCategoryTab, setActiveCategoryTab] = useState<CategoryTab>('dynamic');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddNoticeModal, setShowAddNoticeModal] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeTarget, setNoticeTarget] = useState<'all' | 'specific'>('all');
  const [noticeUserIdsText, setNoticeUserIdsText] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const { toast, showToast } = useToast();

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === activeCategoryTab),
    [activeCategoryTab, categories],
  );

  const handleAddCategorySubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const name = newCategoryName.trim();
    if (!name) return;
    onAddCategory(name, activeCategoryTab);
    setNewCategoryName('');
    setShowAddCategoryModal(false);
    showToast(`已新增分类：${name}`, 'success');
  };

  const handleAddNoticeSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const title = noticeTitle.trim();
    const content = noticeContent.trim();
    const userIds = parseUserIds(noticeUserIdsText);
    if (!title || !content) return;
    if (noticeTarget === 'specific' && userIds.length === 0) {
      showToast('请输入至少一个目标用户 ID', 'error');
      return;
    }
    onAddNotification({
      title,
      content,
      target: noticeTarget,
      userIds,
      isScheduled,
    });
    setNoticeTitle('');
    setNoticeContent('');
    setNoticeTarget('all');
    setNoticeUserIdsText('');
    setIsScheduled(false);
    setShowAddNoticeModal(false);
    showToast(isScheduled ? '定时公告已加入发送队列' : '公告已立即发送', 'success');
  };

  return (
    <div className="relative">
      <AdminToast toast={toast} />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="grid grid-cols-1 gap-6 text-gray-800 dark:text-white lg:grid-cols-12"
      >
        {(!vMode || vMode === 'categories') && (
          <section className={`${vMode === 'categories' ? 'lg:col-span-12' : 'lg:col-span-6'} flex min-h-[460px] flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800/60 dark:bg-gray-900`}>
            <div>
              <PanelHeader
                icon={<Layers className="h-5 w-5 text-primary" />}
                title="分类管理"
                action={(
                  <button
                    onClick={() => setShowAddCategoryModal(true)}
                    className="flex cursor-pointer items-center gap-1 rounded-xl border border-primary/30 px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-white focus:outline-none"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>新增分类</span>
                  </button>
                )}
              />

              <div className="mb-5 flex rounded-xl border border-gray-100 bg-gray-50 p-1 select-none dark:border-gray-800/50 dark:bg-gray-800">
                {CATEGORY_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveCategoryTab(tab.value)}
                    className={`flex-1 rounded-lg border-none py-1.5 text-xs font-semibold transition-all focus:outline-none ${
                      activeCategoryTab === tab.value
                        ? 'bg-white font-black text-primary shadow-sm dark:bg-gray-700'
                        : 'text-gray-400 hover:text-gray-800 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="max-h-[320px] space-y-2.5 overflow-y-auto pr-1">
                {filteredCategories.map((category, index) => (
                  <CategoryRow
                    key={category.id}
                    category={category}
                    index={index}
                    onToggle={() => {
                      onToggleCategoryStatus(category.id);
                      showToast(`已更新分类状态：${category.name}`, 'info');
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-start gap-1.5 border-t border-gray-100 pt-4 text-[10px] leading-relaxed text-gray-400 select-none dark:border-gray-800/80">
              <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <p>
                <strong>说明：</strong>
                分类状态更新后会同步影响前端展示，停用分类后对应入口会自动隐藏。
              </p>
            </div>
          </section>
        )}

        {(!vMode || vMode === 'notifications') && (
          <section className={`${vMode === 'notifications' ? 'lg:col-span-12' : 'lg:col-span-6'} flex min-h-[460px] flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800/60 dark:bg-gray-900`}>
            <div>
              <PanelHeader
                icon={<Megaphone className="h-5 w-5 text-primary" />}
                title="公告通知"
                action={(
                  <button
                    onClick={() => setShowAddNoticeModal(true)}
                    className="flex cursor-pointer items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-primary/10 transition-colors hover:bg-primary-container focus:outline-none"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>新建公告</span>
                  </button>
                )}
              />

              <div className="max-h-[350px] space-y-4 overflow-y-auto pr-1">
                {notifications.map((notification) => (
                  <NotificationRow
                    key={notification.id}
                    notification={notification}
                    onToggleRead={() => {
                      onToggleNotificationRead(notification.id);
                      showToast(notification.read ? '已恢复为未读' : '已标记为已读', 'info');
                    }}
                  />
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
          </section>
        )}
      </motion.div>

      <AnimatePresence>
        {showAddCategoryModal && (
          <ModalFrame onClose={() => setShowAddCategoryModal(false)}>
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3 select-none dark:border-gray-800">
              <div className="rounded-xl bg-primary/10 p-2 text-primary">
                <Layers className="h-5 w-5 text-primary" />
              </div>
              <h4 className="text-base font-extrabold">新增分类</h4>
            </div>

            <form onSubmit={handleAddCategorySubmit} className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold uppercase text-gray-400 select-none">所属板块</label>
                <div className="block w-full rounded-xl border border-gray-200/80 bg-gray-50 p-2.5 text-xs font-bold text-primary dark:border-gray-700 dark:bg-gray-800">
                  {CATEGORY_TABS.find((tab) => tab.value === activeCategoryTab)?.label}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold uppercase text-gray-500 select-none" htmlFor="new-cat-name-input">分类名称 *</label>
                <input
                  id="new-cat-name-input"
                  type="text"
                  placeholder="例如：家电维修 / 美食推荐"
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs font-bold text-gray-900 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>

              <ModalActions onCancel={() => setShowAddCategoryModal(false)} submitLabel="提交" />
            </form>
          </ModalFrame>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddNoticeModal && (
          <ModalFrame onClose={() => setShowAddNoticeModal(false)} maxWidthClassName="max-w-md">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3 select-none dark:border-gray-800">
              <div className="rounded-xl bg-primary/10 p-2 text-primary">
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
                  onChange={(event) => setNoticeTitle(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs font-bold text-gray-900 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
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
                  onChange={(event) => setNoticeContent(event.target.value)}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs font-medium text-gray-800 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold uppercase text-gray-500 select-none">推送范围</label>
                  <select
                    value={noticeTarget}
                    onChange={(event) => setNoticeTarget(event.target.value as 'all' | 'specific')}
                    className="w-full cursor-pointer rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-bold text-gray-800 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="all">全体用户</option>
                    <option value="specific">指定用户</option>
                  </select>
                </div>

                <div className="space-y-1.5 select-none">
                  <label className="block text-[9px] font-bold uppercase text-gray-500">发送方式</label>
                  <div className="flex h-10 items-center">
                    <input
                      id="notice-scheduled-input"
                      type="checkbox"
                      checked={isScheduled}
                      onChange={(event) => setIsScheduled(event.target.checked)}
                      className="h-4 w-4 cursor-pointer rounded-md border border-gray-300 text-primary dark:border-gray-700"
                    />
                    <label className="ml-2 block cursor-pointer text-xs font-extrabold text-gray-600 dark:text-gray-300" htmlFor="notice-scheduled-input">
                      定时发送
                    </label>
                  </div>
                </div>
              </div>

              {noticeTarget === 'specific' ? (
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold uppercase text-gray-500 select-none" htmlFor="notice-user-ids-input">目标用户 ID *</label>
                  <textarea
                    id="notice-user-ids-input"
                    rows={3}
                    placeholder="输入用户 ID，支持逗号、空格或换行分隔"
                    value={noticeUserIdsText}
                    onChange={(event) => setNoticeUserIdsText(event.target.value)}
                    className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs font-medium text-gray-800 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    required
                  />
                  <p className="text-[10px] leading-relaxed text-gray-400">当前版本按用户 ID 定向发送，后端会自动过滤不存在的用户。</p>
                </div>
              ) : null}

              <ModalActions onCancel={() => setShowAddNoticeModal(false)} submitLabel="发布公告" submitIcon={<Send className="h-3.5 w-3.5" />} />
            </form>
          </ModalFrame>
        )}
      </AnimatePresence>
    </div>
  );
}

function PanelHeader({
  icon,
  title,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  action: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-3.5 select-none dark:border-gray-800/80">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-headline-md text-sm font-black tracking-wide">{title}</h3>
      </div>
      {action}
    </div>
  );
}

function ModalFrame({
  children,
  onClose,
  maxWidthClassName = 'max-w-sm',
}: {
  children: React.ReactNode;
  onClose: () => void;
  maxWidthClassName?: string;
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[105] flex items-center justify-center overflow-y-auto p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className={`w-full ${maxWidthClassName} space-y-4 rounded-2xl border border-gray-100 bg-white p-6 text-gray-800 shadow-2xl dark:border-gray-800 dark:bg-gray-900 dark:text-white`}
        >
          {children}
        </motion.div>
      </div>
    </>
  );
}

function ModalActions({
  onCancel,
  submitLabel,
  submitIcon,
}: {
  onCancel: () => void;
  submitLabel: string;
  submitIcon?: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 pt-3 select-none">
      <button
        type="submit"
        className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-white shadow-md"
      >
        {submitIcon}
        <span>{submitLabel}</span>
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 rounded-xl bg-gray-100 py-2.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        取消
      </button>
    </div>
  );
}

function CategoryRow({
  category,
  index,
  onToggle,
}: {
  key?: React.Key;
  category: CategoryItem;
  index: number;
  onToggle: () => void;
}) {
  const isDisabled = category.status === 'disabled';

  return (
    <div
      className={`flex items-center justify-between rounded-xl border p-3.5 transition-all ${
        isDisabled
          ? 'border-gray-200 bg-gray-50/40 opacity-60 dark:border-gray-700 dark:bg-gray-950/20'
          : 'border-gray-100 bg-white hover:border-primary/20 dark:border-gray-800 dark:bg-gray-850'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="w-5 select-none font-mono text-xs font-bold text-gray-400">{index + 1}</span>
        <div>
          <span className={`text-xs font-bold ${isDisabled ? 'text-gray-400 line-through' : 'text-gray-800 dark:text-gray-100'}`}>{category.name}</span>
          <span className="ml-2 font-mono text-[9px] text-gray-400">({category.id})</span>
        </div>
      </div>

      <div className="flex items-center gap-3 select-none">
        <span className="font-mono text-[9px] font-bold text-gray-400">排序: {category.order}</span>
        <button
          onClick={onToggle}
          className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition-colors focus:outline-none ${
            category.status === 'normal'
              ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-600 hover:text-white'
              : 'bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white'
          }`}
        >
          {category.status === 'normal' ? '启用中' : '已停用'}
        </button>
      </div>
    </div>
  );
}

function NotificationRow({
  notification,
  onToggleRead,
}: {
  key?: React.Key;
  notification: NotificationItem;
  onToggleRead: () => void;
}) {
  const isScheduled = notification.status === 'scheduled';

  return (
    <div
      className={`relative rounded-xl border p-4 transition-all ${
        notification.read
          ? 'border-gray-100 bg-gray-50/50 opacity-65 hover:opacity-90 dark:border-gray-800/80 dark:bg-gray-850/50'
          : 'border-primary/20 bg-primary/5 shadow-xs'
      }`}
    >
      {!notification.read ? <span className="absolute right-14 top-4 h-1.5 w-1.5 animate-ping rounded-full bg-rose-500" /> : null}

      <button
        onClick={onToggleRead}
        className="absolute right-4 top-3.5 border-none bg-transparent text-gray-400 focus:outline-none dark:hover:text-white"
        title={notification.read ? '标记为未读' : '标记为已读'}
      >
        <Inbox className="h-4 w-4 text-primary" />
      </button>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2 font-mono text-[9px] font-bold select-none">
          <span className={`rounded px-1.5 py-0.5 text-[8px] uppercase tracking-wider ${isScheduled ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary'}`}>
            {isScheduled ? '定时发送' : '已发送'}
          </span>
          <span className="text-gray-400">范围: {notification.target === 'all' ? '全体用户' : '指定用户'}</span>
        </div>

        <h4 className="truncate pr-6 text-xs font-bold text-gray-900 dark:text-gray-100">{notification.title}</h4>
        <p className="break-all text-xs font-medium leading-relaxed text-gray-600 dark:text-gray-300">{notification.content}</p>
        <p className="flex items-center gap-1 pt-1 font-mono text-[9px] text-gray-400 select-none">
          <Calendar className="h-3 w-3" />
          时间: {notification.time}
        </p>
      </div>
    </div>
  );
}

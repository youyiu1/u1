/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Tag, 
  SlidersHorizontal, 
  PlusCircle, 
  RotateCcw, 
  Check, 
  X, 
  AlertCircle, 
  Compass, 
  Volume2, 
  CheckCircle2, 
  Info,
  Calendar,
  Send,
  Trash2,
  Bookmark,
  Sparkles,
  Inbox,
  MailCheck,
  Megaphone,
  Layers,
  Settings,
  Flame,
  BadgeAlert
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
  vMode
}: NoticeCategoryViewProps) {
  // Classification type selection tab
  const [activeCategoryTab, setActiveCategoryTab] = useState<'dynamic' | 'goods' | 'service'>('dynamic');

  // Input states for adding classification
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCatModal, setShowAddCatModal] = useState(false);

  // Input states for adding notice alerts triggers
  const [showAddNoticeModal, setShowAddNoticeModal] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeTarget, setNoticeTarget] = useState<'all' | 'specific'>('all');
  const [isScheduled, setIsScheduled] = useState(false);

  // Custom visual state Alert system
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToastMsg = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    onAddCategory(newCategoryName.trim(), activeCategoryTab);
    const catName = newCategoryName.trim();
    setNewCategoryName('');
    setShowAddCatModal(false);
    showToastMsg(`成功登入新子目类目：“${catName}”！`, 'success');
  };

  const handleAddNoticeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) return;

    onAddNotification(noticeTitle.trim(), noticeContent.trim(), noticeTarget, isScheduled);

    // reset
    setNoticeTitle('');
    setNoticeContent('');
    setNoticeTarget('all');
    setIsScheduled(false);
    setShowAddNoticeModal(false);

    showToastMsg(
      isScheduled ? '定时群发公告任务已成功排期至后台对账队列中！' : '该全网公告已即时群发发布至市民端大厅！',
      'success'
    );
  };

  const filteredCategories = categories.filter((c) => c.type === activeCategoryTab);

  return (
    <div className="relative">
      {/* Toast Alert System */}
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

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-gray-800 dark:text-white"
      >
        {/* LEFT COLUMN: Classification Management */}
        {(!vMode || vMode === 'categories') && (
          <div className={`${vMode === 'categories' ? 'lg:col-span-12' : 'lg:col-span-6'} bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm flex flex-col justify-between min-h-[460px]`}>
            <div>
              {/* Header */}
              <div className="flex justify-between items-center pb-3.5 border-b border-gray-100 dark:border-gray-800/80 mb-5 select-none">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" />
                  <h3 className="font-headline-md text-sm font-black tracking-wide">同城大分类字典目词设置</h3>
                </div>
                <button
                  onClick={() => setShowAddCatModal(true)}
                  className="py-1.5 px-3 border border-primary/30 text-primary hover:bg-primary hover:text-white text-xs font-bold rounded-xl cursor-pointer transition-colors focus:outline-none flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>添加细分大类</span>
                </button>
              </div>

              {/* Module Selector tabs */}
              <div className="flex bg-gray-50 dark:bg-gray-800 rounded-xl p-1 border border-gray-100 dark:border-gray-800/50 mb-5 select-none">
                {(['dynamic', 'goods', 'service'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveCategoryTab(tab)}
                    className={`flex-1 py-1.5 font-semibold text-xs rounded-lg transition-all cursor-pointer border-none focus:outline-none ${
                      activeCategoryTab === tab
                        ? 'bg-white dark:bg-gray-700 text-primary shadow-sm font-black'
                        : 'text-gray-400 hover:text-gray-800 dark:hover:text-white'
                    }`}
                  >
                    {tab === 'dynamic' ? '市民社区动态大类' : tab === 'goods' ? '二手闲置宝贝栏目' : '便民快捷服务的类'}
                  </button>
                ))}
              </div>

              {/* Classification list */}
              <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                {filteredCategories.map((cat, index) => (
                  <div
                    key={cat.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                      cat.status === 'disabled'
                        ? 'bg-gray-50/40 dark:bg-gray-950/20 border-dashed border-gray-200 dark:border-gray-805 opacity-60'
                        : 'bg-white dark:bg-gray-850 border-gray-100 dark:border-gray-800 hover:border-primary/20 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-xs text-gray-400 w-5 select-none">{index + 1}</span>
                      <div>
                        <span className={`font-bold text-xs ${cat.status === 'disabled' ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-100'}`}>
                          {cat.name}
                        </span>
                        <span className="ml-2 font-mono text-[9px] text-gray-400">({cat.id})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 select-none">
                      <span className="font-mono text-[9px] text-gray-400 font-bold">排位代号: {cat.order}</span>
                      <button
                        onClick={() => {
                          onToggleCategoryStatus(cat.id);
                          showToastMsg(`已成功将分类 “${cat.name}” 的状态重置！`, 'info');
                        }}
                        className={`text-[10px] px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-colors border-none focus:outline-none ${
                          cat.status === 'normal'
                            ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                            : 'bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white'
                        }`}
                      >
                        {cat.status === 'normal' ? '可用中' : '已停售'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footnotes */}
            <div className="text-[10px] text-gray-450 leading-relaxed border-t border-gray-100 dark:border-gray-800/80 pt-4 mt-4 select-none flex items-start gap-1.5 text-gray-400">
              <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p>
                <strong>实时热更规则明晰：</strong>字典大类目的修改实时热更至同城小程序、公众号双端。
                如若对大类状态设为“已停用”屏蔽展示，前端入口会于 5 秒内自适应剔除该项录入菜单。
              </p>
            </div>
          </div>
        )}

        {/* RIGHT COLUMN: Notification Bulletins */}
        {(!vMode || vMode === 'notifications') && (
          <div className={`${vMode === 'notifications' ? 'lg:col-span-12' : 'lg:col-span-6'} bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm flex flex-col justify-between min-h-[460px]`}>
            <div>
              {/* Header */}
              <div className="flex justify-between items-center pb-3.5 border-b border-gray-100 dark:border-gray-800/80 mb-5 select-none">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-primary" />
                  <h3 className="font-headline-md text-sm font-black tracking-wide">全城公告群发广播大厅</h3>
                </div>
                <button
                  onClick={() => setShowAddNoticeModal(true)}
                  className="py-1.5 px-3 bg-primary hover:bg-primary-container text-white text-xs font-bold rounded-xl shadow-md shadow-primary/10 cursor-pointer transition-colors focus:outline-none flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>拟新群发公告</span>
                </button>
              </div>

              {/* Bulletin Feed */}
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {notifications.map((ntf) => (
                  <div
                    key={ntf.id}
                    className={`p-4 rounded-xl border transition-all relative ${
                      ntf.read
                        ? 'bg-gray-50/50 dark:bg-gray-850/50 border-gray-100 dark:border-gray-800/80 opacity-65 hover:opacity-90'
                        : 'bg-primary/5 border-primary/20 shadow-xs'
                    }`}
                  >
                    {/* Floating check flag */}
                    {!ntf.read && (
                      <span className="absolute top-4 right-14 w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping select-none border-none" />
                    )}

                    {/* Read toggle on corner */}
                    <button
                      onClick={() => {
                        onToggleNotificationRead(ntf.id);
                        showToastMsg(ntf.read ? '由于未读重新标记' : '此轮推文已成功阅卷归档', 'info');
                      }}
                      className="absolute top-3.5 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer border-none bg-transparent select-none focus:outline-none"
                      title={ntf.read ? '直接标回未读' : '快速标记归档'}
                    >
                      <Inbox className="w-4 h-4 text-primary" />
                    </button>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 select-none text-[9px] font-mono font-bold">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] tracking-wider uppercase ${
                          ntf.status === 'scheduled' ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary'
                        }`}>
                          {ntf.status === 'scheduled' ? '定时审核' : '群发成功'}
                        </span>
                        <span className="text-gray-400">
                          覆盖: {ntf.target === 'all' ? '同城全体商网' : '指定个体行业'}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-gray-900 dark:text-gray-100 truncate pr-6">
                        {ntf.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed select-text font-medium break-all">
                        {ntf.content}
                      </p>
                      <p className="font-mono text-[9px] text-gray-400 pt-1 select-none flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        推送时戳戳记: {ntf.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Read All */}
            <div className="border-t border-gray-100 dark:border-gray-800/80 pt-4 mt-4 text-right select-none flex justify-between items-center text-[10px] text-gray-400 leading-normal">
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <MailCheck className="w-4 h-4" />
                自动连通顶部通知栏未读计数
              </span>
              <span>点按卡盘信件或收件箱按钮即可直接将本轮通知归档。</span>
            </div>
          </div>
        )}

        {/* CLASSIFICATION APPEND MODAL POPUP */}
        <AnimatePresence>
          {showAddCatModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black z-[100]"
                onClick={() => setShowAddCatModal(false)}
              />
              <div className="fixed inset-0 overflow-y-auto z-[105] flex items-center justify-center p-4">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white dark:bg-gray-900 max-w-sm w-full rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-2xl space-y-4 text-gray-800 dark:text-white"
                >
                  <div className="flex items-center gap-2 select-none border-b border-gray-100 dark:border-gray-800 pb-3">
                    <div className="p-2 bg-primary/10 text-primary rounded-xl">
                      <Layers className="w-5 h-5 text-primary" />
                    </div>
                    <h4 className="font-extrabold text-base">添加大分类细分子目录</h4>
                  </div>

                  <form onSubmit={handleAddCategorySubmit} className="space-y-4 font-sans text-xs">
                    <div className="space-y-1.5">
                      <label className="block text-gray-400 font-bold uppercase text-[9px] select-none">绑定的父级系统板块</label>
                      <div className="block w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-750 rounded-xl font-bold text-xs select-all text-primary">
                        {activeCategoryTab === 'dynamic' ? '市民社区动态板块字典' : activeCategoryTab === 'goods' ? '二手闲置宝贝板块字典' : '同城便民快捷服务板块字典'}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-gray-500 font-bold uppercase text-[9px] select-none" htmlFor="new-cat-name-input">新类目子目名称 *</label>
                      <input
                        id="new-cat-name-input"
                        type="text"
                        placeholder="例：数码摄影 / 美食街区"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-705 rounded-xl outline-none font-bold text-xs text-gray-900 dark:text-white"
                        required
                      />
                    </div>

                    <div className="flex gap-3 pt-3 select-none">
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-primary hover:bg-primary-container text-white font-bold text-xs rounded-xl shadow-md cursor-pointer border-none"
                      >
                        提交字典类目
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddCatModal(false)}
                        className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-xs rounded-xl cursor-pointer transition-colors focus:outline-none"
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

        {/* NOTICE BROADCAST POST MODAL POPUP */}
        <AnimatePresence>
          {showAddNoticeModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black z-[100] backdrop-blur-xs"
                onClick={() => setShowAddNoticeModal(false)}
              />
              <div className="fixed inset-0 overflow-y-auto z-[105] flex items-center justify-center p-4">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white dark:bg-gray-900 max-w-md w-full rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-2xl space-y-4 text-gray-800 dark:text-white"
                >
                  <div className="flex items-center gap-2 select-none border-b border-gray-100 dark:border-gray-800 pb-3">
                    <div className="p-2 bg-primary/10 text-primary rounded-xl animate-pulse">
                      <Megaphone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-gray-900 dark:text-white">拟草撰写全城推文广播</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">本公告将在全网市民小程序主屏幕即时浮动推送</p>
                    </div>
                  </div>

                  <form onSubmit={handleAddNoticeSubmit} className="space-y-4 text-xs font-sans">
                    <div className="space-y-1.5">
                      <label className="block text-gray-500 font-bold uppercase text-[9px] select-none" htmlFor="notice-title-input">群发推文主题标语 *</label>
                      <input
                        id="notice-title-input"
                        type="text"
                        placeholder="请输入25字以内公告核心标语..."
                        value={noticeTitle}
                        onChange={(e) => setNoticeTitle(e.target.value)}
                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-205 dark:border-gray-700 rounded-xl outline-none font-bold text-xs text-gray-900 dark:text-white"
                        required
                        maxLength={25}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-gray-500 font-bold uppercase text-[9px] select-none" htmlFor="notice-content-input">广播详细正文描述 *</label>
                      <textarea
                        id="notice-content-input"
                        rows={4}
                        placeholder="请输入要通知群发到用户端主界面的正文，建议包含时间地点及官方解释，支持多段落文字排版..."
                        value={noticeContent}
                        onChange={(e) => setNoticeContent(e.target.value)}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-205 dark:border-gray-700 rounded-xl outline-none font-medium text-xs resize-none text-gray-800 dark:text-white"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Targeting */}
                      <div className="space-y-1.5 border-none p-0 bg-transparent">
                        <label className="block text-gray-550 font-bold uppercase text-[9px] select-none">接收人覆盖网络</label>
                        <select
                          value={noticeTarget}
                          onChange={(e) => setNoticeTarget(e.target.value as any)}
                          className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-205 dark:border-gray-700 rounded-xl outline-none font-bold text-xs cursor-pointer text-gray-800 dark:text-white"
                        >
                          <option value="all">全体同城市民 (广播群发)</option>
                          <option value="specific">特定商户匠人 (定向委派)</option>
                        </select>
                      </div>

                      {/* Timeline scheduling calendar checkbox options */}
                      <div className="space-y-1.5 select-none">
                        <label className="block text-gray-550 font-bold uppercase text-[9px]">群发执行执行时点</label>
                        <div className="flex items-center h-10 select-none">
                          <input
                            id="notice-scheduled-input"
                            type="checkbox"
                            checked={isScheduled}
                            onChange={(e) => setIsScheduled(e.target.checked)}
                            className="h-4.5 w-4.5 text-primary border-gray-250 border border-gray-300 dark:border-gray-700 rounded-md cursor-pointer"
                          />
                          <label className="ml-2 block text-xs text-gray-600 dark:text-gray-300 font-extrabold cursor-pointer" htmlFor="notice-scheduled-input">
                            预设定时：夜间例会集中推送
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-3 select-none">
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-primary hover:bg-primary-container text-white font-bold text-xs rounded-xl shadow-md border-none transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>下达执行群发</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddNoticeModal(false)}
                        className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-xs rounded-xl cursor-pointer transition-colors focus:outline-none"
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

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, MessageSquareText, RefreshCw, Search, Trash2 } from 'lucide-react';
import { ManagedMessage } from '../types';

interface Props {
  messages: ManagedMessage[];
  onMarkRead: (id: string) => void;
  onDeleteMessage: (id: string) => void;
  onRefresh: () => void;
}

export default function MessageManagementView({ messages, onMarkRead, onDeleteMessage, onRefresh }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredMessages = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    return messages.filter((item) => {
      const matchesSearch =
        !keyword ||
        item.senderName.toLowerCase().includes(keyword) ||
        item.receiverName.toLowerCase().includes(keyword) ||
        item.content.toLowerCase().includes(keyword) ||
        item.id.toLowerCase().includes(keyword);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'read' && item.isRead) ||
        (statusFilter === 'unread' && !item.isRead);
      return matchesSearch && matchesStatus;
    });
  }, [messages, searchQuery, statusFilter]);

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 2200);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-amber-600 uppercase tracking-wider select-none">
            <MessageSquareText className="w-3.5 h-3.5" /> 消息管理
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">私信审核与治理</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 max-w-2xl">用于查看、标记已读和删除站内私信，支持文字与图片消息。</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={onRefresh} className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border-none bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" /> 刷新
          </button>
        </div>
      </div>

      <AnimatePresence>
        {toastMessage && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold">
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-sm outline-none"
              placeholder="搜索发送者、接收者、内容或消息ID"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'read' | 'unread')}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-sm outline-none"
          >
            <option value="all">全部消息</option>
            <option value="unread">未读</option>
            <option value="read">已读</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filteredMessages.map((msg) => (
          <div key={msg.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img src={msg.senderAvatar || msg.receiverAvatar || undefined} alt="" className="w-11 h-11 rounded-2xl object-cover border border-slate-200 dark:border-slate-800" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{msg.senderName}</div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{msg.messageType}</span>
                    {!msg.isRead && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">未读</span>}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 truncate">发给 {msg.receiverName} · {msg.createTime}</div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!msg.isRead && (
                  <button
                    onClick={() => {
                      onMarkRead(msg.id);
                      showToast('已标记已读');
                    }}
                    className="p-2 rounded-lg border-none bg-emerald-50 text-emerald-600 hover:bg-emerald-100 cursor-pointer"
                    title="标记已读"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => {
                    if (window.confirm('确定删除这条消息吗？')) {
                      onDeleteMessage(msg.id);
                      showToast('消息已删除');
                    }
                  }}
                  className="p-2 rounded-lg border-none bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                  title="删除消息"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 p-4">
              <div className="text-xs text-slate-500 break-words whitespace-pre-wrap">
                {msg.messageType === 'image' && msg.mediaUrl ? (
                  <img src={msg.mediaUrl} alt="message" className="max-w-full rounded-xl mb-3" />
                ) : null}
                {msg.content || '（空消息）'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

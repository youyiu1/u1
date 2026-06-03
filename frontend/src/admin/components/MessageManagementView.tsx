/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, MessageSquareText, RefreshCw, Trash2 } from 'lucide-react';
import { ManagedMessage } from '../types';
import { useToast } from '../hooks/useToast';
import { groupItemsByOwner, type EntityOwnerGroup } from '../utils/entityGrouping';
import { matchesAnyKeyword, normalizeSearchTerm } from '../utils/search';
import AdminGroupHeader from './common/AdminGroupHeader';
import AdminSearchInput from './common/AdminSearchInput';
import AdminToast from './common/AdminToast';
import UserSquareCard from './common/UserSquareCard';

interface Props {
  messages: ManagedMessage[];
  onMarkRead: (id: string) => void;
  onDeleteMessage: (id: string) => void;
  onRefresh: () => void;
}

export default function MessageManagementView({ messages, onMarkRead, onDeleteMessage, onRefresh }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [activeSender, setActiveSender] = useState<string | null>(null);
  const { toast, showToast } = useToast(1800);

  const filteredMessages = useMemo(() => {
    const keyword = normalizeSearchTerm(searchQuery);
    return messages.filter((item) => {
      const matchesSearch = matchesAnyKeyword(keyword, [
        item.senderName,
        item.receiverName,
        item.content,
        item.id,
      ]);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'read' && item.isRead) ||
        (statusFilter === 'unread' && !item.isRead);
      return matchesSearch && matchesStatus;
    });
  }, [messages, searchQuery, statusFilter]);

  const groupedBySender = useMemo<EntityOwnerGroup<ManagedMessage>[]>(() => {
    return groupItemsByOwner<ManagedMessage>(filteredMessages, {
      getId: (item) => item.senderId || item.senderName,
      getName: (item) => item.senderName,
      getAvatar: (item) => item.senderAvatar || item.receiverAvatar || '',
      getTag: (item) => item.senderTag,
      fallbackName: '未知用户',
    });
  }, [filteredMessages]);

  const activeSenderGroup = useMemo(
    () => groupedBySender.find((group) => group.name === activeSender) || null,
    [groupedBySender, activeSender]
  );

  useEffect(() => {
    if (activeSender && !activeSenderGroup) setActiveSender(null);
  }, [activeSender, activeSenderGroup]);

  const tableMessages = activeSenderGroup?.items || [];

  return (
    <div className="space-y-4 sm:space-y-6 pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-amber-600 uppercase tracking-wider select-none">
            <MessageSquareText className="w-3.5 h-3.5" /> 消息管理
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">私信审核与治理</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 max-w-2xl">按用户聚合私信，点击查看详情后展示该用户的消息内容表格。</p>
        </div>
        <button onClick={onRefresh} className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border-none bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer">
          <RefreshCw className="w-3.5 h-3.5" /> 刷新
        </button>
      </div>

      <AdminToast toast={toast ? { ...toast, type: 'success' } : null} />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <AdminSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="搜索发送者、接收者、内容或消息ID"
            containerClassName="relative md:col-span-2"
            inputClassName="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-sm outline-none"
          />
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

      {!activeSender ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-2.5">
          {groupedBySender.map((group) => (
            <UserSquareCard
              key={group.id}
              title={group.name}
              userType={group.tag}
              subtitle={`${group.items.length} 条消息`}
              avatar={group.avatar}
              onClick={() => setActiveSender(group.name)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <AdminGroupHeader
            backLabel="返回用户列表"
            onBack={() => setActiveSender(null)}
            title={activeSenderGroup?.name}
            subtitle={`${tableMessages.length} 条消息`}
            avatar={activeSenderGroup?.avatar || tableMessages[0]?.senderAvatar || tableMessages[0]?.receiverAvatar}
            containerClassName="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5"
            backButtonClassName="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0"
            avatarClassName="w-7 h-7 rounded-lg object-cover border border-slate-200 dark:border-slate-800"
            titleClassName="text-[11px] font-bold text-slate-800 dark:text-slate-100"
            subtitleClassName="text-[10px] text-slate-400"
          />

          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-slate-600 dark:text-slate-350">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold border-b border-slate-200/60 dark:border-slate-800/60">
                  <tr>
                    <th className="p-4">发送人</th>
                    <th className="p-4">接收人</th>
                    <th className="p-4 md:w-1/3">消息内容</th>
                    <th className="p-4">时间</th>
                    <th className="p-4 text-center">状态</th>
                    <th className="p-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {tableMessages.map((msg) => (
                    <tr key={msg.id}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={msg.senderAvatar || msg.receiverAvatar || undefined} alt={msg.senderName} className="w-8 h-8 rounded-full object-cover" />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{msg.senderName}</div>
                            <div className="text-[10px] font-mono text-slate-400">ID: {msg.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs font-bold text-slate-500">{msg.receiverName}</div>
                        <div className="text-[10px] text-slate-400">{msg.messageType}</div>
                      </td>
                      <td className="p-4 text-xs font-medium">
                        {msg.messageType === 'image' && msg.mediaUrl ? <img src={msg.mediaUrl} alt="message" className="w-14 h-14 rounded-lg object-cover mb-2" /> : null}
                        <p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap break-all line-clamp-2">{msg.content || '（空消息）'}</p>
                      </td>
                      <td className="p-4 whitespace-nowrap text-xs text-slate-400 font-semibold dark:text-slate-500">{msg.createTime}</td>
                      <td className="p-4 text-center whitespace-nowrap">
                        {msg.isRead ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">已读</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">未读</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {!msg.isRead && (
                            <button onClick={() => { onMarkRead(msg.id); showToast('已标记为已读'); }} className="text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 p-1.5 rounded border-none bg-transparent cursor-pointer transition-all" title="标记已读">
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                          )}
                          <button onClick={() => { if (window.confirm('确定删除这条消息吗？')) { onDeleteMessage(msg.id); showToast('消息已删除'); } }} className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 p-1.5 rounded border-none bg-transparent cursor-pointer transition-all" title="删除">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

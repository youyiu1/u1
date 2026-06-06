/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  Trash2, CheckCircle, AlertTriangle, EyeOff, MessageSquare,
  RotateCcw, HelpCircle
} from 'lucide-react';
import { ManagedComment } from '../types';
import { groupItemsByOwner, type EntityOwnerGroup } from '../utils/entityGrouping';
import { matchesAnyKeyword, normalizeSearchTerm } from '../utils/search';
import AdminGroupHeader from './common/AdminGroupHeader';
import AdminSearchInput from './common/AdminSearchInput';
import AdminStatCard from './common/AdminStatCard';
import EmptyState from './common/EmptyState';
import UserSquareCard from './common/UserSquareCard';

interface CommentManagementViewProps {
  comments: ManagedComment[];
  onUpdateCommentStatus: (id: string, status: 'pending' | 'normal' | 'flagged' | 'hidden') => void;
  onDeleteComment: (id: string) => void;
  onAddOperationLog?: (action: string, target: string, details?: string) => void;
}

export default function CommentManagementView({ comments, onUpdateCommentStatus, onDeleteComment, onAddOperationLog }: CommentManagementViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [targetFilter, setTargetFilter] = useState<'all' | 'dynamic' | 'goods' | 'service'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'normal' | 'flagged' | 'hidden'>('all');
  const [activeCommentAuthor, setActiveCommentAuthor] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredComments = useMemo(() => {
    const q = normalizeSearchTerm(searchQuery);
    return comments.filter(comment => {
    const matchSearch = matchesAnyKeyword(q, [comment.content, comment.authorName, comment.targetTitle, comment.id]);
    const matchTarget = targetFilter === 'all' || comment.targetType === targetFilter;
    const matchStatus = statusFilter === 'all' || comment.status === statusFilter;
    return matchSearch && matchTarget && matchStatus;
    });
  }, [comments, searchQuery, targetFilter, statusFilter]);

  const groupedByUser = useMemo<EntityOwnerGroup<ManagedComment>[]>(() => {
    return groupItemsByOwner<ManagedComment>(filteredComments, {
      getId: (item) => item.authorName,
      getName: (item) => item.authorName,
      getAvatar: (item) => item.authorAvatar || '',
      getTag: (item) => item.authorTag,
      fallbackName: '未知用户',
    });
  }, [filteredComments]);

  const activeCommentAuthorGroup = useMemo(() => groupedByUser.find((group) => group.name === activeCommentAuthor) || null, [groupedByUser, activeCommentAuthor]);

  const commentStats = useMemo(() => ({
    pending: comments.filter((comment) => comment.status === 'pending').length,
    flagged: comments.filter((comment) => comment.status === 'flagged').length,
    hidden: comments.filter((comment) => comment.status === 'hidden').length,
  }), [comments]);

  useEffect(() => {
    if (activeCommentAuthor && !activeCommentAuthorGroup) setActiveCommentAuthor(null);
  }, [activeCommentAuthor, activeCommentAuthorGroup]);

  const tableComments = activeCommentAuthorGroup?.items || [];

  const toggleSelected = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  const toggleSelectAll = () => setSelectedIds(selectedIds.length === tableComments.length ? [] : tableComments.map(c => c.id));

  const bulkUpdate = (status: 'pending' | 'normal' | 'flagged' | 'hidden') => {
    selectedIds.forEach(id => onUpdateCommentStatus(id, status));
    onAddOperationLog?.('批量更新评论状态', `IDs: ${selectedIds.join(', ')}`, `状态: ${status}`);
    setSelectedIds([]);
  };

  const bulkDelete = () => {
    if (!window.confirm(`确认删除选中的 ${selectedIds.length} 条评论吗？`)) return;
    selectedIds.forEach(id => onDeleteComment(id));
    onAddOperationLog?.('批量删除评论', `IDs: ${selectedIds.join(', ')}`, `数量: ${selectedIds.length}`);
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6" id="comments-view-root">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[28px] text-primary">chat_bubble</span>
            评论管理
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">按用户聚合评论，点击查看详情后展示该用户的评论内容表格。</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AdminStatCard title="评论总数" value={comments.length} colorClassName="text-slate-800" unitText="条" />
        <AdminStatCard title="待审核" value={commentStats.pending} colorClassName="text-sky-500" unitText="条" />
        <AdminStatCard title="可疑/标记" value={commentStats.flagged} colorClassName="text-amber-500" unitText="条" />
        <AdminStatCard title="已屏蔽" value={commentStats.hidden} colorClassName="text-rose-500" unitText="条" />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl shadow-sm p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <AdminSearchInput
            value={searchQuery}
            placeholder="搜索评论内容、用户、帖子标题或ID..."
            onChange={setSearchQuery}
            containerClassName="relative md:col-span-2"
            inputClassName="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select value={targetFilter} onChange={(e) => setTargetFilter(e.target.value as any)} className="w-full py-2 px-3 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="all">全部模块</option><option value="dynamic">动态</option><option value="goods">商品</option><option value="service">服务</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="w-full py-2 px-3 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="all">全部状态</option><option value="pending">待审核</option><option value="normal">正常</option><option value="flagged">可疑</option><option value="hidden">屏蔽</option>
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <button onClick={() => setSearchQuery('')} className="text-xs text-rose-500 font-semibold flex items-center gap-1"><RotateCcw className="h-3 w-3" /> 重置搜索</button>
          {selectedIds.length > 0 && (
            <>
              <span className="text-xs text-primary font-bold px-1 select-none">已选 {selectedIds.length} 项</span>
              <button onClick={() => bulkUpdate('pending')} className="text-xs bg-sky-500 text-white font-semibold py-1 px-2 rounded">待审</button>
              <button onClick={() => bulkUpdate('normal')} className="text-xs bg-emerald-500 text-white font-semibold py-1 px-2 rounded">放行</button>
              <button onClick={() => bulkUpdate('hidden')} className="text-xs bg-amber-500 text-white font-semibold py-1 px-2 rounded">屏蔽</button>
              <button onClick={bulkDelete} className="text-xs bg-rose-500 text-white font-semibold py-1 px-2 rounded flex items-center gap-1"><Trash2 className="h-3 w-3" /> 删除</button>
            </>
          )}
        </div>
      </div>

      <div className="rounded-xl overflow-hidden">
        {filteredComments.length === 0 ? (
          <div className="space-y-3">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400"><MessageSquare className="h-6 w-6" /></div>
            <EmptyState text="没有符合条件的评论" />
          </div>
        ) : !activeCommentAuthor ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-2.5">
            {groupedByUser.map((group) => <UserSquareCard key={group.id} title={group.name} userType={group.tag} subtitle={`${group.items.length} 条评论`} avatar={group.avatar} onClick={() => setActiveCommentAuthor(group.name)} />)}
          </div>
        ) : (
          <div className="space-y-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl shadow-sm overflow-hidden">
            <div className="mx-3 mt-3">
              <AdminGroupHeader
                backLabel="返回用户列表"
                onBack={() => setActiveCommentAuthor(null)}
                title={activeCommentAuthorGroup?.name}
                subtitle={`${tableComments.length} 条评论`}
                avatar={activeCommentAuthorGroup?.avatar || tableComments[0]?.authorAvatar}
                containerClassName="flex items-center gap-2 rounded-lg border border-slate-200/60 dark:border-slate-800/80 px-2.5 py-1.5"
                backButtonClassName="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0"
                avatarClassName="w-6 h-6 rounded-full object-cover"
                titleClassName="text-[11px] font-bold text-slate-900 dark:text-white"
                subtitleClassName="text-[10px] text-slate-400"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-slate-600 dark:text-slate-350">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold border-b border-slate-200/60 dark:border-slate-800/60">
                  <tr><th className="p-4 w-12 text-center"><input type="checkbox" checked={selectedIds.length === tableComments.length && tableComments.length > 0} onChange={toggleSelectAll} /></th><th className="p-4">发布人</th><th className="p-4">关联主体</th><th className="p-4 md:w-1/3">评论内容</th><th className="p-4">时间</th><th className="p-4 text-center">状态</th><th className="p-4 text-right">操作</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {tableComments.map(comment => {
                    const selected = selectedIds.includes(comment.id);
                    return (
                      <tr key={comment.id} className={selected ? 'bg-primary/5' : ''}>
                        <td className="p-4 text-center"><input type="checkbox" checked={selected} onChange={() => toggleSelected(comment.id)} /></td>
                        <td className="p-4"><div className="flex items-center gap-3"><img src={comment.authorAvatar} alt={comment.authorName} referrerPolicy="no-referrer" className="w-8 h-8 rounded-full object-cover" /><div><div className="font-bold text-slate-900 dark:text-white">{comment.authorName}</div><div className="text-[10px] font-mono text-slate-400">ID: {comment.id}</div></div></div></td>
                        <td className="p-4"><div className="text-xs font-bold text-slate-500">{comment.targetType}</div><div className="text-xs text-slate-700 dark:text-slate-300 truncate max-w-[180px]">{comment.targetTitle}</div></td>
                        <td className="p-4 text-xs font-medium"><p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap break-all">{comment.content}</p></td>
                        <td className="p-4 whitespace-nowrap text-xs text-slate-400 font-semibold dark:text-slate-500">{comment.time}</td>
                        <td className="p-4 text-center whitespace-nowrap">{comment.status === 'pending' && <Badge color="sky"><HelpCircle className="w-3 h-3" /> 待审核</Badge>}{comment.status === 'normal' && <Badge color="emerald"><CheckCircle className="w-3 h-3" /> 正常</Badge>}{comment.status === 'flagged' && <Badge color="amber"><AlertTriangle className="w-3 h-3" /> 可疑</Badge>}{comment.status === 'hidden' && <Badge color="slate"><EyeOff className="w-3 h-3" /> 屏蔽</Badge>}</td>
                        <td className="p-4 text-right"><div className="flex items-center justify-end gap-1">{comment.status !== 'normal' && <ActionButton title="放行" color="emerald" icon={<CheckCircle className="h-4 w-4" />} onClick={() => onUpdateCommentStatus(comment.id, 'normal')} />}{comment.status !== 'pending' && <ActionButton title="待审" color="sky" icon={<HelpCircle className="h-4 w-4" />} onClick={() => onUpdateCommentStatus(comment.id, 'pending')} />}{comment.status !== 'flagged' && <ActionButton title="标记可疑" color="amber" icon={<AlertTriangle className="h-4 w-4" />} onClick={() => onUpdateCommentStatus(comment.id, 'flagged')} />}{comment.status !== 'hidden' && <ActionButton title="屏蔽" color="slate" icon={<EyeOff className="h-4 w-4" />} onClick={() => onUpdateCommentStatus(comment.id, 'hidden')} />}<div className="relative inline-block border-l border-slate-200/50 dark:border-slate-800/80 pl-1 ml-1">{confirmDeleteId === comment.id ? <div className="flex items-center gap-1"><button onClick={() => { onDeleteComment(comment.id); setConfirmDeleteId(null); }} className="text-[10px] bg-rose-600 hover:bg-rose-700 text-white font-bold py-1 px-2 rounded">确认</button><button onClick={() => setConfirmDeleteId(null)} className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-1 px-2 rounded">取消</button></div> : <button onClick={() => setConfirmDeleteId(comment.id)} className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 p-1.5 rounded border-none bg-transparent cursor-pointer transition-all" title="删除"><Trash2 className="h-4 w-4" /></button>}</div></div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Badge({ color, children }: { color: 'sky' | 'emerald' | 'amber' | 'slate'; children: React.ReactNode }) {
  const classes = { sky: 'bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400', emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400', amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400', slate: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' }[color];
  return <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold ${classes}`}>{children}</span>;
}

function ActionButton({ title, color, icon, onClick }: { title: string; color: 'emerald' | 'sky' | 'amber' | 'slate'; icon: React.ReactNode; onClick: () => void; }) {
  const classes = { emerald: 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20', sky: 'text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/20', amber: 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20', slate: 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800' }[color];
  return <button onClick={onClick} className={`${classes} p-1.5 rounded border-none bg-transparent cursor-pointer transition-all`} title={title}>{icon}</button>;
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Trash2, CheckCircle, AlertTriangle, EyeOff, MessageSquare, 
  Filter, RotateCcw, AlertOctagon, HelpCircle 
} from 'lucide-react';
import { ManagedComment } from '../types';

interface CommentManagementViewProps {
  comments: ManagedComment[];
  onUpdateCommentStatus: (id: string, status: 'normal' | 'flagged' | 'hidden') => void;
  onDeleteComment: (id: string) => void;
  onAddOperationLog?: (action: string, target: string, details?: string) => void;
}

export default function CommentManagementView({
  comments,
  onUpdateCommentStatus,
  onDeleteComment,
  onAddOperationLog
}: CommentManagementViewProps) {
  // Filters and Query State
  const [searchQuery, setSearchQuery] = useState('');
  const [targetFilter, setTargetFilter] = useState<'all' | 'dynamic' | 'goods' | 'service'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'normal' | 'flagged' | 'hidden'>('all');
  const [sortBy, setSortBy] = useState<'time-desc' | 'time-asc'>('time-desc');

  // Multi-select / Bulk states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Double Check states
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Clear all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setTargetFilter('all');
    setStatusFilter('all');
    setSortBy('time-desc');
    setSelectedIds([]);
  };

  // Run filtering
  const filteredComments = comments
    .filter(comment => {
      const matchSearch = 
        comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comment.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comment.targetTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comment.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchTarget = targetFilter === 'all' || comment.targetType === targetFilter;
      const matchStatus = statusFilter === 'all' || comment.status === statusFilter;

      return matchSearch && matchTarget && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'time-desc') {
        return new Date(b.time).getTime() - new Date(a.time).getTime();
      } else {
        return new Date(a.time).getTime() - new Date(b.time).getTime();
      }
    });

  // Toggle selection for individual items
  const handleToggleSelectItem = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Toggle select standard
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredComments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredComments.map(c => c.id));
    }
  };

  // Collective actions
  const handleBulkStatusChange = (status: 'normal' | 'flagged' | 'hidden') => {
    selectedIds.forEach(id => {
      onUpdateCommentStatus(id, status);
    });
    if (onAddOperationLog) {
      onAddOperationLog(
        `批量变更评论状态为：${status === 'normal' ? '正常' : status === 'flagged' ? '可疑' : '屏蔽'}`,
        `批量 IDs: ${selectedIds.join(', ')}`,
        `操作对象数: ${selectedIds.length}`
      );
    }
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`确认要彻底删除选中的 ${selectedIds.length} 条评论吗？此操作不可逆`)) {
      selectedIds.forEach(id => {
        onDeleteComment(id);
      });
      if (onAddOperationLog) {
        onAddOperationLog(
          '批量删除系统评论',
          `批量 IDs: ${selectedIds.join(', ')}`,
          `彻底删除评论计数: ${selectedIds.length} 条`
        );
      }
      setSelectedIds([]);
    }
  };

  return (
    <div className="space-y-6" id="comments-view-root">
      
      {/* Page Title & Meta Block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[28px] text-primary">chat_bubble</span>
            论坛评论互动审核管理
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            审核、预警、屏蔽、或彻底清理发布在同城圈子动态、二手商品库以及便民快服板块的评论回复
          </p>
        </div>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">评论总记录</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">{comments.length}</span>
            <span className="text-xs text-slate-500">条</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">已标记举报</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-amber-500">{comments.filter(c => c.status === 'flagged').length}</span>
            <span className="text-xs text-slate-500">条待审</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">隐藏/已屏蔽</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-rose-500">{comments.filter(c => c.status === 'hidden').length}</span>
            <span className="text-xs text-slate-500">条垃圾箱</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">今日净增评论</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-500">+12</span>
            <span className="text-xs text-emerald-500">↑ 18.5%</span>
          </div>
        </div>
      </div>

      {/* Interactive Controls Filter Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl shadow-sm p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Search bar widget */}
          <div className="relative md:col-span-2">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="搜索评论内容、发布人账号、目标主体标题..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          {/* Module scope filter */}
          <div>
            <select
              value={targetFilter}
              onChange={(e) => setTargetFilter(e.target.value as any)}
              className="w-full py-2 px-3 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              <option value="all">所属板块：全部互动</option>
              <option value="dynamic">同城圈子动态</option>
              <option value="goods">闲置二手市场</option>
              <option value="service">便民同城服务</option>
            </select>
          </div>

          {/* Health/Review Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full py-2 px-3 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              <option value="all">审查状态：全部记录</option>
              <option value="normal">正常上线刊载</option>
              <option value="flagged">被标记为可疑/敏感</option>
              <option value="hidden">已屏蔽隐藏</option>
            </select>
          </div>

        </div>

        {/* Sorting, Reset and Bulk commands row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
              <Filter className="h-3 w-3" /> 过滤排序:
            </span>
            <button
              onClick={() => setSortBy(sortBy === 'time-desc' ? 'time-asc' : 'time-desc')}
              className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 py-1 px-2.5 rounded-md border-none transition-all cursor-pointer font-semibold"
            >
              按时间：{sortBy === 'time-desc' ? '最新的在前' : '最老的在前'}
            </button>
            {(searchQuery || targetFilter !== 'all' || statusFilter !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-500 hover:text-rose-600 bg-transparent border-none cursor-pointer flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="h-3 w-3" /> 重置筛选
              </button>
            )}
          </div>

          {/* Bulk operation buttons */}
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2 bg-primary/10 dark:bg-primary/20 p-1 px-2 rounded-lg"
            >
              <span className="text-xs text-primary font-bold px-1 select-none">
                已选 {selectedIds.length} 项:
              </span>
              <button
                onClick={() => handleBulkStatusChange('normal')}
                className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-1 px-2 rounded border-none cursor-pointer"
              >
                批量放行
              </button>
              <button
                onClick={() => handleBulkStatusChange('hidden')}
                className="text-xs bg-amber-500 hover:bg-amber-600 text-white font-semibold py-1 px-2 rounded border-none cursor-pointer"
              >
                批量屏蔽
              </button>
              <button
                onClick={handleBulkDelete}
                className="text-xs bg-rose-500 hover:bg-rose-600 text-white font-semibold py-1 px-2 rounded border-none cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" /> 彻底清除
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Main Comment Records Canvas Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl shadow-sm overflow-hidden">
        {filteredComments.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <MessageSquare className="h-6 w-6" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">无符合条件的评论互动记录</p>
            <p className="text-slate-400 dark:text-slate-500 text-xs">推荐更换搜索字段、过滤状态或清除筛选重新拉取数据</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-600 dark:text-slate-350">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold border-b border-slate-200/60 dark:border-slate-800/60">
                <tr>
                  <th className="p-4 w-12 text-center select-none">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredComments.length && filteredComments.length > 0}
                      onChange={handleToggleSelectAll}
                      className="rounded text-primary focus:ring-primary"
                    />
                  </th>
                  <th className="p-4">发布人 / 账号</th>
                  <th className="p-4">帖子关联主体</th>
                  <th className="p-4 md:w-1/3">评论具体内容</th>
                  <th className="p-4">发表时间</th>
                  <th className="p-4 text-center">状态</th>
                  <th className="p-4 text-right">人工介入动作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredComments.map((comment, index) => {
                  const isSelected = selectedIds.includes(comment.id);
                  return (
                    <tr
                      key={comment.id}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all ${
                        isSelected ? 'bg-primary/5 dark:bg-primary/5' : ''
                      }`}
                    >
                      {/* Batch Checkbox */}
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectItem(comment.id)}
                          className="rounded text-primary focus:ring-primary"
                        />
                      </td>

                      {/* Author */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={comment.authorAvatar}
                            alt={comment.authorName}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full border border-slate-200/70 dark:border-slate-700/75 flex-shrink-0 object-cover"
                          />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block hover:text-primary cursor-pointer transition-colors">
                              {comment.authorName}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 block mt-0.5 uppercase">ID: {comment.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Associated Entity */}
                      <td className="p-4">
                        <div>
                          <div className="flex items-center gap-1.5">
                            {comment.targetType === 'dynamic' && (
                              <span className="bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 text-[10px] uppercase font-bold tracking-tight px-1.5 py-0.5 rounded">
                                同城动态
                              </span>
                            )}
                            {comment.targetType === 'goods' && (
                              <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] uppercase font-bold tracking-tight px-1.5 py-0.5 rounded">
                                闲置商品
                              </span>
                            )}
                            {comment.targetType === 'service' && (
                              <span className="bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 text-[10px] uppercase font-bold tracking-tight px-1.5 py-0.5 rounded">
                                同城服务
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1 truncate max-w-[180px] font-medium" title={comment.targetTitle}>
                            {comment.targetTitle}
                          </span>
                        </div>
                      </td>

                      {/* Comment content */}
                      <td className="p-4 text-xs font-medium">
                        <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-sans line-clamp-3 whitespace-pre-wrap break-all">
                          {comment.content}
                        </p>
                      </td>

                      {/* Creation time */}
                      <td className="p-4 whitespace-nowrap text-xs text-slate-400 font-semibold dark:text-slate-500">
                        {comment.time}
                      </td>

                      {/* Status Badges */}
                      <td className="p-4 text-center whitespace-nowrap">
                        {comment.status === 'normal' && (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs px-2.5 py-1 rounded-full font-bold">
                            <CheckCircle className="w-3 w-3" /> 正常刊载
                          </span>
                        )}
                        {comment.status === 'flagged' && (
                          <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 text-xs px-2.5 py-1 rounded-full font-bold animate-pulse">
                            <AlertTriangle className="w-3 w-3" /> 标记嫌疑
                          </span>
                        )}
                        {comment.status === 'hidden' && (
                          <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs px-2.5 py-1 rounded-full font-bold">
                            <EyeOff className="w-3 w-3" /> 已拦截屏蔽
                          </span>
                        )}
                      </td>

                      {/* Action Triggers */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {comment.status !== 'normal' && (
                            <button
                              onClick={() => {
                                onUpdateCommentStatus(comment.id, 'normal');
                                if (onAddOperationLog) {
                                  onAddOperationLog('审核放行评论刊载', `ID: ${comment.id}`, `内容: "${comment.content.slice(0, 15)}..."`);
                                }
                              }}
                              className="text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 p-1.5 rounded border-none bg-transparent cursor-pointer transition-all"
                              title="设为正常并重新发布"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          {comment.status !== 'flagged' && (
                            <button
                              onClick={() => {
                                onUpdateCommentStatus(comment.id, 'flagged');
                                if (onAddOperationLog) {
                                  onAddOperationLog('设评论状态为疑似违规', `ID: ${comment.id}`, `标注为需要人工深度研判`);
                                }
                              }}
                              className="text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 p-1.5 rounded border-none bg-transparent cursor-pointer transition-all"
                              title="标记可疑待审"
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </button>
                          )}
                          {comment.status !== 'hidden' && (
                            <button
                              onClick={() => {
                                onUpdateCommentStatus(comment.id, 'hidden');
                                if (onAddOperationLog) {
                                  onAddOperationLog('屏蔽敏感屏蔽评论', `ID: ${comment.id}`, `屏蔽原因：内容包含违规引流敏感词句`);
                                }
                              }}
                              className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded border-none bg-transparent cursor-pointer transition-all"
                              title="屏蔽隐藏"
                            >
                              <EyeOff className="h-4 w-4" />
                            </button>
                          )}

                          {/* Absolute Delete Button */}
                          <div className="relative inline-block border-l border-slate-200/50 dark:border-slate-800/80 pl-1 ml-1">
                            {confirmDeleteId === comment.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    onDeleteComment(comment.id);
                                    setConfirmDeleteId(null);
                                    if (onAddOperationLog) {
                                      onAddOperationLog('彻底抹除论坛评论', `ID: ${comment.id}`, `永久自数据库中销毁记录`);
                                    }
                                  }}
                                  className="text-[10px] bg-rose-600 hover:bg-rose-700 text-white font-bold py-1 px-2 rounded border-none cursor-pointer"
                                >
                                  确
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-1 px-2 rounded border-none cursor-pointer"
                                >
                                  否
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteId(comment.id)}
                                className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 p-1.5 rounded border-none bg-transparent cursor-pointer transition-all"
                                title="彻底物理删除"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

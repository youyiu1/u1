/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Check, Trash2, AlertTriangle, X, ZoomIn, Minimize2 } from 'lucide-react';
import { ManagedImage } from '../types';
import { getPrimaryImage } from '../../utils/images';
import UserSquareCard from './common/UserSquareCard';

interface ImageManagementViewProps {
  images: ManagedImage[];
  onUpdateImageStatus: (id: string, status: 'approved' | 'pending' | 'flagged') => void;
  onDeleteImage: (id: string) => void;
  onAddOperationLog?: (action: string, target: string, details?: string) => void;
}

const categoryLabel: Record<ManagedImage['category'], string> = {
  dynamic: '动态图片',
  goods: '闲置商品',
  avatar: '用户头像',
  banner: '轮播横幅',
};

export default function ImageManagementView({ images, onUpdateImageStatus, onDeleteImage, onAddOperationLog }: ImageManagementViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'dynamic' | 'goods' | 'avatar' | 'banner'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'flagged'>('all');
  const [activeUploader, setActiveUploader] = useState<string | null>(null);
  const [zoomImgUrl, setZoomImgUrl] = useState<string | null>(null);

  const filteredImages = useMemo(() => {
    const seen = new Set<string>();
    return images.filter((img) => {
      const identity = img.url || img.id;
      if (seen.has(identity)) return false;
      seen.add(identity);

      const query = searchQuery.toLowerCase();
      const matchSearch = img.name.toLowerCase().includes(query) || img.uploader.toLowerCase().includes(query) || img.id.toLowerCase().includes(query);
      const matchCat = categoryFilter === 'all' || img.category === categoryFilter;
      const matchStatus = statusFilter === 'all' || img.status === statusFilter;
      return matchSearch && matchCat && matchStatus;
    });
  }, [images, searchQuery, categoryFilter, statusFilter]);

  const groupedByUploader = useMemo(() => {
    const map = new Map<string, ManagedImage[]>();
    filteredImages.forEach((img) => {
      const key = img.uploader || '未知用户';
      const existing = map.get(key);
      if (existing) existing.push(img);
      else map.set(key, [img]);
    });
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [filteredImages]);

  const activeUploaderGroup = useMemo(
    () => groupedByUploader.find(([name]) => name === activeUploader) || null,
    [groupedByUploader, activeUploader]
  );

  useEffect(() => {
    if (activeUploader && !activeUploaderGroup) setActiveUploader(null);
  }, [activeUploader, activeUploaderGroup]);

  const tableImages = activeUploaderGroup?.[1] || [];
  const getUploaderTag = (items: ManagedImage[]) => items.find((item) => item.uploaderTag?.trim())?.uploaderTag || '未设置身份标签';
  const getImageUrl = (img: ManagedImage) => getPrimaryImage(img.url);

  return (
    <div className="space-y-6" id="images-view-root">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">图片管理</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">按用户聚合图片，点击查看详情后展示该用户的图片内容表格。</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="图片总数" value={images.length} color="text-slate-800" />
        <StatCard title="待审核" value={images.filter((i) => i.status === 'pending').length} color="text-amber-500" />
        <StatCard title="已放行" value={images.filter((i) => i.status === 'approved').length} color="text-emerald-500" />
        <StatCard title="已封禁" value={images.filter((i) => i.status === 'flagged').length} color="text-rose-500" />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input type="text" placeholder="搜索图片名、上传人或ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)} className="w-full py-2 px-3 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="all">全部分类</option>
            <option value="dynamic">动态图片</option>
            <option value="goods">闲置商品</option>
            <option value="avatar">用户头像</option>
            <option value="banner">轮播横幅</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="w-full py-2 px-3 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="all">全部状态</option>
            <option value="approved">已放行</option>
            <option value="pending">待审核</option>
            <option value="flagged">已封禁</option>
          </select>
        </div>
      </div>

      {!activeUploader ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-2.5">
          {groupedByUploader.map(([uploader, uploaderImages]) => (
            <UserSquareCard key={uploader} title={uploader} userType={getUploaderTag(uploaderImages)} subtitle={`${uploaderImages.length} 张图片`} avatar={uploaderImages[0]?.url} onClick={() => setActiveUploader(uploader)} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-lg px-2.5 py-1.5">
            <button type="button" onClick={() => setActiveUploader(null)} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">返回用户列表</button>
            <div>
              <p className="text-[11px] font-bold text-slate-800 dark:text-slate-100">{activeUploaderGroup?.[0]}</p>
              <p className="text-[10px] text-slate-400">{tableImages.length} 张图片</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-slate-600 dark:text-slate-350">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold border-b border-slate-200/60 dark:border-slate-800/60">
                  <tr>
                    <th className="p-4">图片</th>
                    <th className="p-4">图片信息</th>
                    <th className="p-4">上传人</th>
                    <th className="p-4">分类/大小</th>
                    <th className="p-4">时间</th>
                    <th className="p-4 text-center">状态</th>
                    <th className="p-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {tableImages.map((img) => (
                    <tr key={img.id}>
                      <td className="p-4"><button type="button" onClick={() => { const url = getImageUrl(img); if (url) setZoomImgUrl(url); }} className="border-none bg-transparent p-0 cursor-pointer">{getImageUrl(img) ? <img src={getImageUrl(img)} alt={img.name} referrerPolicy="no-referrer" className="w-12 h-12 rounded-lg object-cover" /> : <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] text-slate-400">无图</div>}</button></td>
                      <td className="p-4"><div className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]" title={img.name}>{img.name}</div><div className="text-[10px] font-mono text-slate-400">ID: {img.id}</div></td>
                      <td className="p-4 text-xs font-bold text-slate-500">{img.uploader}</td>
                      <td className="p-4"><div className="text-xs font-bold text-slate-500">{categoryLabel[img.category]}</div><div className="text-xs text-slate-700 dark:text-slate-300">{img.size}</div></td>
                      <td className="p-4 whitespace-nowrap text-xs text-slate-400 font-semibold dark:text-slate-500">{img.uploadedAt}</td>
                      <td className="p-4 text-center whitespace-nowrap">
                        {img.status === 'approved' && <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">已放行</span>}
                        {img.status === 'pending' && <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">待审核</span>}
                        {img.status === 'flagged' && <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">已封禁</span>}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { const url = getImageUrl(img); if (url) setZoomImgUrl(url); }} className="text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/20 p-1.5 rounded border-none bg-transparent cursor-pointer transition-all" title="查看"><ZoomIn className="h-4 w-4" /></button>
                          {img.status !== 'approved' && <button onClick={() => { onUpdateImageStatus(img.id, 'approved'); onAddOperationLog?.('图片放行', img.id, img.name); }} className="text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 p-1.5 rounded border-none bg-transparent cursor-pointer transition-all" title="放行"><Check className="h-4 w-4" /></button>}
                          {img.status !== 'flagged' && <button onClick={() => { onUpdateImageStatus(img.id, 'flagged'); onAddOperationLog?.('图片封禁', img.id, img.name); }} className="text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 p-1.5 rounded border-none bg-transparent cursor-pointer transition-all" title="封禁"><AlertTriangle className="h-4 w-4" /></button>}
                          <button onClick={() => { if (window.confirm(`确认删除图片【${img.name}】吗？`)) { onDeleteImage(img.id); onAddOperationLog?.('图片删除', img.id, img.name); } }} className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 p-1.5 rounded border-none bg-transparent cursor-pointer transition-all" title="删除"><Trash2 className="h-4 w-4" /></button>
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

      <AnimatePresence>
        {zoomImgUrl && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 z-50 overflow-hidden select-none" onClick={() => setZoomImgUrl(null)}>
            <div className="absolute top-5 right-5 flex items-center gap-2">
              <button onClick={() => setZoomImgUrl(null)} className="p-2 bg-white/15 hover:bg-white/30 text-white rounded-full border-none cursor-pointer transition-colors"><Minimize2 className="h-5 w-5" /></button>
            </div>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="max-w-4xl max-h-[80vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <img src={zoomImgUrl} alt="preview" className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain border border-slate-800" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-4 shadow-sm">
      <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">{title}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className={`text-2xl font-bold tracking-tight ${color}`}>{value}</span>
        <span className="text-xs text-slate-500">张</span>
      </div>
    </div>
  );
}

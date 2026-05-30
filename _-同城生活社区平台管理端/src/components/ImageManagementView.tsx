/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Check, Trash2, Eye, Filter, AlertTriangle, HelpCircle, 
  X, Calendar, HardDrive, User, ChevronRight, Minimize2, ZoomIn 
} from 'lucide-react';
import { ManagedImage } from '../types';

interface ImageManagementViewProps {
  images: ManagedImage[];
  onUpdateImageStatus: (id: string, status: 'approved' | 'pending' | 'flagged') => void;
  onDeleteImage: (id: string) => void;
  onAddOperationLog?: (action: string, target: string, details?: string) => void;
}

export default function ImageManagementView({
  images,
  onUpdateImageStatus,
  onDeleteImage,
  onAddOperationLog
}: ImageManagementViewProps) {
  // Queries
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'dynamic' | 'goods' | 'avatar' | 'banner'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'flagged'>('all');

  // Preview Overlay State
  const [zoomImgUrl, setZoomImgUrl] = useState<string | null>(null);

  // Filters calculation
  const filteredImages = images.filter(img => {
    const matchSearch =
      img.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.uploader.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchCat = categoryFilter === 'all' || img.category === categoryFilter;
    const matchStatus = statusFilter === 'all' || img.status === statusFilter;

    return matchSearch && matchCat && matchStatus;
  });

  return (
    <div className="space-y-6" id="images-view-root">
      
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[28px] text-emerald-500">photo_library</span>
            多媒体资源安全审核
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            可视化监控同城平台全部二进制静态图片附件。审核低俗、敏感违法内容并实施一键阻拦或放行
          </p>
        </div>
      </div>

      {/* Overview Analytics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-400 dark:text-slate-505 font-bold uppercase">图片资产总数</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">{images.length}</span>
            <span className="text-xs text-slate-500">张</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-400 dark:text-slate-505 font-bold uppercase">待审查图片</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-amber-500">{images.filter(i => i.status === 'pending').length}</span>
            <span className="text-xs text-slate-500">张待定</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-400 dark:text-slate-505 font-bold uppercase font-sans">涉嫌敏感下架</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-rose-500">{images.filter(i => i.status === 'flagged').length}</span>
            <span className="text-xs text-slate-500 font-sans">张下线</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-400 dark:text-slate-505 font-bold uppercase">网传流量及空间</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800 dark:text-white">1.03</span>
            <span className="text-xs text-slate-500">MB</span>
          </div>
        </div>
      </div>

      {/* Filter and query criteria console bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Keyword Search */}
          <div className="relative md:col-span-2">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="搜索图片原始名、发布者绰号、ID地址..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Category drop down selection */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="w-full py-2 px-3 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            >
              <option value="all">资源分类：全部载体</option>
              <option value="dynamic">同城圈子动态配图</option>
              <option value="goods">二手商品详情切图</option>
              <option value="avatar">市民注册用户头像</option>
              <option value="banner">公共页面横幅广告</option>
            </select>
          </div>

          {/* Audit state selection */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full py-2 px-3 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            >
              <option value="all">安全审查：全部附件方式</option>
              <option value="approved">审核通过在线放行</option>
              <option value="pending">待风控部门终核</option>
              <option value="flagged">已被封禁、下架拦截</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Grid showing pictures with beautiful card overlays */}
      {filteredImages.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl py-16 px-4 text-center space-y-4">
          <div className="w-12 h-12 bg-slate-105 dark:bg-slate-850 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <X className="h-6 w-6" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">媒体数据库未搜索到命中图片</p>
          <p className="text-slate-410 dark:text-slate-505 text-xs max-w-sm mx-auto">
            请确认上传条件、更改检索关键字或状态分类设置重新尝试
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((img) => (
            <motion.div
              layout
              key={img.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group"
            >
              {/* Visual Canvas containing Image */}
              <div className="relative h-48 bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-100 dark:border-slate-800/50">
                <img
                  src={img.url}
                  alt={img.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                />

                {/* Status Badges Overlay */}
                <div className="absolute top-3 left-3 select-none">
                  {img.status === 'approved' && (
                    <span className="bg-emerald-500 text-white text-[10px] uppercase font-extrabold tracking-wider px-2 py-1 rounded-md shadow-sm">
                      已安全放行
                    </span>
                  )}
                  {img.status === 'pending' && (
                    <span className="bg-amber-500 text-white text-[10px] uppercase font-extrabold tracking-wider px-2 py-1 rounded-md shadow-sm animate-pulse">
                      待安全终核
                    </span>
                  )}
                  {img.status === 'flagged' && (
                    <span className="bg-rose-500 text-white text-[10px] uppercase font-extrabold tracking-wider px-2 py-1 rounded-md shadow-sm">
                      安全封禁拦截
                    </span>
                  )}
                </div>

                {/* ID Stamp corner */}
                <div className="absolute top-3 right-3 select-none font-mono text-[9px] uppercase tracking-wide bg-slate-900/65 text-slate-100 px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                  {img.id}
                </div>

                {/* Interactive Tooltips overlay on Hover */}
                <div className="absolute inset-0 bg-slate-950/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => setZoomImgUrl(img.url)}
                    className="p-2.5 bg-white text-slate-900 rounded-full hover:scale-110 shadow-lg border-none transition-all cursor-pointer"
                    title="高精度放大图片"
                  >
                    <ZoomIn className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

              {/* Text context & Metadata card body */}
              <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                
                {/* Specific stats */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    {img.category === 'dynamic' && '圈子发帖配图'}
                    {img.category === 'goods' && '二手发布主图'}
                    {img.category === 'avatar' && '市民成员头像'}
                    {img.category === 'banner' && '主页展示横幅广告'}
                  </span>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate" title={img.name}>
                    {img.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-semibold pt-1">
                    <HardDrive className="h-3.5 w-3.5" /> 附件大小：<span>{img.size}</span>
                  </div>
                </div>

                {/* Uploader credits and actions */}
                <div className="border-t border-slate-100 dark:border-slate-850/60 pt-3 space-y-3">
                  
                  {/* Uploader profile */}
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <User className="h-3.5 w-3.5" /> 提交市民：
                      <span className="text-slate-700 dark:text-slate-300">{img.uploader}</span>
                    </span>
                    <span className="text-slate-400 block dark:text-slate-500">{img.uploadedAt.slice(0, 10)}</span>
                  </div>

                  {/* Operation Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    {img.status !== 'approved' && (
                      <button
                        onClick={() => {
                          onUpdateImageStatus(img.id, 'approved');
                          if (onAddOperationLog) {
                            onAddOperationLog(`图片审核放行`, img.id, `图片名称: ${img.name}`);
                          }
                        }}
                        className="flex-1 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-500/90 hover:text-white text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50 py-1.5 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all"
                      >
                        <Check className="h-3.5 w-3.5" /> 放行
                      </button>
                    )}
                    {img.status !== 'flagged' && (
                      <button
                        onClick={() => {
                          onUpdateImageStatus(img.id, 'flagged');
                          if (onAddOperationLog) {
                            onAddOperationLog(`屏蔽/封杀违规图片`, img.id, `违法图片名: ${img.name}`);
                          }
                        }}
                        className="flex-1 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-500/90 hover:text-white text-rose-700 dark:text-rose-400 border border-rose-250/50 dark:border-rose-850/50 py-1.5 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all"
                      >
                        <AlertTriangle className="h-3.5 w-3.5" /> 封禁
                      </button>
                    )}

                    {/* Hard Delete Button */}
                    <button
                      onClick={() => {
                        if (window.confirm(`确认要从静态资源服务器物理上永久删除图片 [${img.name}] 吗？一旦彻底物理清除，将无法逆转！`)) {
                          onDeleteImage(img.id);
                          if (onAddOperationLog) {
                            onAddOperationLog(`永久抹除服务器图片`, img.id, `物理文件名: "${img.name}"`);
                          }
                        }
                      }}
                      className="p-1 px-2 border border-slate-200 dark:border-slate-800 bg-transparent hover:bg-rose-500 hover:text-white text-rose-500 hover:border-transparent rounded-lg cursor-pointer transition-all"
                      title="彻底物理清除"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                </div>

              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Lightbox full overlay screen preview selection logic */}
      <AnimatePresence>
        {zoomImgUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 z-50 overflow-hidden select-none"
            onClick={() => setZoomImgUrl(null)}
          >
            {/* Top Close Button */}
            <div className="absolute top-5 right-5 flex items-center gap-2">
              <span className="text-white text-xs font-medium bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                点击任意背景区域均可安全退出预览
              </span>
              <button
                onClick={() => setZoomImgUrl(null)}
                className="p-2 bg-white/15 hover:bg-white/30 text-white rounded-full border-none cursor-pointer transition-colors backdrop-blur-xs focus:outline-none"
              >
                <Minimize2 className="h-5 w-5" />
              </button>
            </div>

            {/* Scale visual container */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-4xl max-h-[80vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()} // Stop bubbling
            >
              <img
                src={zoomImgUrl}
                alt="Enlarged gallery preview"
                className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain border border-slate-800"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

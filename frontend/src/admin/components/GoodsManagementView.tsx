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
  X, 
  MapPin, 
  Clock, 
  DollarSign, 
  ShieldAlert, 
  RotateCcw, 
  Check, 
  Star, 
  Info,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Gem,
  Compass,
  CheckCircle2,
  Trash2,
  Scale,
  Image as ImageIcon,
  Gavel
} from 'lucide-react';
import { Goods } from '../types';

interface GoodsManagementViewProps {
  goods: Goods[];
  onUpdateGoodsStatus: (goodsId: string, status: 'active' | 'sold' | 'removed' | 'pending', rejectReason?: string) => void;
}

export default function GoodsManagementView({ goods, onUpdateGoodsStatus }: GoodsManagementViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'electronics' | 'furniture' | 'clothing' | 'books' | 'other'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'sold' | 'removed'>('all');
  
  // Price boundaries filter
  const [priceMin, setPriceMin] = useState<number | ''>('');
  const [priceMax, setPriceMax] = useState<number | ''>('');

  const [selectedItem, setSelectedItem] = useState<Goods | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('商品内容描述不符');

  // Custom inline Toast notification system
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToastMsg = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Interactive Loader
  const [isSearchingLoad, setIsSearchingLoad] = useState(false);

  useEffect(() => {
    setIsSearchingLoad(true);
    const timer = setTimeout(() => {
      setIsSearchingLoad(false);
    }, 300); // skeletal delays
    return () => clearTimeout(timer);
  }, [searchTerm, categoryFilter, statusFilter, priceMin, priceMax]);

  const getCategoryName = (cat: string) => {
    switch (cat) {
      case 'electronics': return '数码电子';
      case 'furniture': return '家居日用';
      case 'clothing': return '服饰鞋包';
      case 'books': return '图书音像';
      case 'other': return '其他闲置';
      default: return '其他';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">在售中</span>;
      case 'sold':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200">已售出</span>;
      case 'removed':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-50 text-rose-500 border border-rose-100">已下架驳回</span>;
      case 'pending':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">待审核</span>;
      default:
        return null;
    }
  };

  // Filter application
  const filteredGoods = goods.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sellerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = categoryFilter === 'all' ? true : item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' ? true : item.status === statusFilter;

    // Price query
    const itemPrice = item.price;
    const matchesMin = priceMin === '' ? true : itemPrice >= priceMin;
    const matchesMax = priceMax === '' ? true : itemPrice <= priceMax;

    return matchesSearch && matchesCat && matchesStatus && matchesMin && matchesMax;
  });

  const handleApprove = (id: string) => {
    onUpdateGoodsStatus(id, 'active');
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem({ ...selectedItem, status: 'active' });
    }
    showToastMsg('该商品已通过平台审核公开在售！', 'success');
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRejectModal) return;
    onUpdateGoodsStatus(showRejectModal, 'removed', rejectReason);
    
    if (selectedItem && selectedItem.id === showRejectModal) {
      setSelectedItem({ ...selectedItem, status: 'removed', rejectReason });
    }

    setShowRejectModal(null);
    showToastMsg('该二手闲置商品已被限制下架！', 'info');
  };

  const handleMarkSold = (id: string) => {
    onUpdateGoodsStatus(id, 'sold');
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem({ ...selectedItem, status: 'sold' });
    }
    showToastMsg('已将该宝贝标记为已售状态！', 'success');
  };

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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-6"
      >
        {/* Seek Filtering panel */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm space-y-4">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Category tabs */}
            <div className="flex flex-wrap items-center gap-1.5 pb-2 lg:pb-0 select-none">
              <span className="text-gray-505 text-gray-500 dark:text-gray-400 text-xs font-bold mr-2 tracking-wider uppercase flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-primary" />
                类目模块筛选:
              </span>
              {(['all', 'electronics', 'furniture', 'clothing', 'books', 'other'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap focus:outline-none ${
                    categoryFilter === cat
                      ? 'bg-primary text-white shadow-sm shadow-primary/25 font-bold'
                      : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/40 dark:hover:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {cat === 'all' ? '全部二手' : getCategoryName(cat)}
                </button>
              ))}
            </div>

            {/* Status indicators split controller */}
            <div className="flex items-center gap-3 select-none">
              <span className="text-gray-500 dark:text-gray-400 text-xs font-bold flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
                状态归大类:
              </span>
              <div className="inline-flex rounded-xl bg-gray-50 dark:bg-gray-800/40 p-1 border border-gray-100 dark:border-gray-800/60">
                {(['all', 'active', 'sold', 'removed'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 font-semibold rounded-lg text-xs transition-all cursor-pointer border-none focus:outline-none ${
                      statusFilter === st
                        ? 'bg-white dark:bg-gray-800 text-primary shadow-sm font-bold'
                        : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                    }`}
                  >
                    {st === 'all' ? '总览' : st === 'active' ? '在售宝贝' : st === 'sold' ? '已出手' : '屏蔽违规'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Searching text */}
            <div className="md:col-span-6 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5 pointer-events-none" />
              <input
                type="text"
                placeholder="快速检索二手宝贝名称、宝贝ID、卖家昵称..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-xl font-medium text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
              />
            </div>

            {/* Price section boundaries */}
            <div className="md:col-span-4 flex items-center gap-2 select-none">
              <span className="text-gray-550 dark:text-gray-400 text-xs font-bold flex-shrink-0 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                价格区间:
              </span>
              <input
                type="number"
                placeholder="最低元"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-xl font-medium text-xs text-center outline-none focus:ring-1 focus:ring-primary dark:text-white"
              />
              <span className="text-gray-300 dark:text-gray-750 text-xs">—</span>
              <input
                type="number"
                placeholder="最高元"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-xl font-medium text-xs text-center outline-none focus:ring-1 focus:ring-primary dark:text-white"
              />
            </div>

            {/* Reset */}
            <div className="md:col-span-2 text-right">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setStatusFilter('all');
                  setPriceMin('');
                  setPriceMax('');
                  showToastMsg('筛选条件已完全排空重置', 'info');
                }}
                className="w-full py-2 border border-gray-100 dark:border-gray-800/50 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700/80 text-gray-600 dark:text-gray-200 font-bold text-xs rounded-xl cursor-pointer transition-all focus:outline-none flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>一键还原置空</span>
              </button>
            </div>
          </div>
        </div>

        {/* Catalog layout items list */}
        {isSearchingLoad ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 space-y-4 animate-pulse">
                <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : filteredGoods.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-16 text-center select-none flex flex-col items-center justify-center">
            <div className="p-4 bg-gray-50 dark:bg-gray-850 rounded-full mb-3 text-gray-400">
              <Compass className="w-10 h-10 animate-spin-slow" />
            </div>
            <p className="text-base font-bold text-gray-800 dark:text-gray-100">暂未能寻找到指定的闲置商品</p>
            <p className="text-xs text-gray-400 mt-1.5">试着调优最高或最低价格区间、栏目板块</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredGoods.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -4, scale: 1.006, boxShadow: '0 16px 24px -12px rgba(0,0,0,0.08)' }}
                onClick={() => setSelectedItem(item)}
                className={`bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden flex flex-col justify-between cursor-pointer transition-all relative ${
                  item.status === 'removed' ? 'opacity-70 border-rose-100 dark:border-rose-950 bg-rose-50/5' : 'shadow-sm shadow-gray-100/40 dark:shadow-none'
                }`}
              >
                <div>
                  {/* Photo content */}
                  <div className="aspect-square bg-gray-50 dark:bg-gray-950 relative select-none">
                    {item.images && item.images.length > 0 ? (
                      <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 p-4 font-body-sm">
                        <ImageIcon className="w-12 h-12 text-gray-400/60" />
                        <span className="text-[10px] mt-2">卖家未刊登产品实配图</span>
                      </div>
                    )}
                    {/* Status ribbon float */}
                    <div className="absolute top-3 left-3 z-10 font-bold select-none text-[10px]">
                      {getStatusBadge(item.status)}
                    </div>
                  </div>

                  {/* Body textual list items specs */}
                  <div className="p-4 space-y-2">
                    <span className="inline-block px-1.5 py-0.5 rounded-lg text-[9px] font-bold bg-primary-fixed bg-primary/10 text-primary uppercase select-none">
                      {item.condition}
                    </span>
                    <h4 className="font-bold text-gray-800 dark:text-gray-100 text-xs truncate group-hover:text-primary">
                      {item.title}
                    </h4>
                    <p className="font-mono text-base text-rose-500 dark:text-rose-400 font-extrabold leading-none flex items-baseline">
                      <span className="text-[11px] font-semibold mr-0.5">¥</span>
                      {item.price.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Footer specs */}
                <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-805 flex justify-between items-center select-none bg-gray-50/50 dark:bg-gray-850/30">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <img src={item.sellerAvatar} alt="seller" className="w-5 h-5 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
                    <span className="truncate max-w-[80px] font-semibold text-gray-600 dark:text-gray-300">{item.sellerName}</span>
                  </div>
                  <span className="font-mono text-[9px] text-gray-400 font-bold flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5 text-primary" />
                    {item.location.split(' ').pop()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Item drawer detail overlay panels */}
      <AnimatePresence>
        {selectedItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="fixed inset-0 bg-black/60 z-45"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="fixed top-0 right-0 h-full w-full max-w-lg bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800 shadow-2xl z-50 overflow-y-auto flex flex-col text-gray-800 dark:text-white"
            >
              {/* Drawer Header layout config */}
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white/80 dark:bg-gray-900/80 sticky top-0 backdrop-blur-md z-10 select-none">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-bold">二手闲置宝贝多维审核详情</h3>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800/85 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer border-none bg-transparent focus:outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body elements details */}
              <div className="p-6 space-y-6 flex-grow">
                {/* Image display */}
                <div className="bg-gray-50 dark:bg-gray-950 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 text-center relative max-h-[240px] flex items-center justify-center">
                  {selectedItem.images && selectedItem.images.length > 0 ? (
                    <img src={selectedItem.images[0]} alt="main" className="w-full h-full max-h-[240px] object-cover" />
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-gray-300">
                      <ImageIcon className="w-16 h-16 text-gray-400" />
                      <span className="text-xs text-gray-400 mt-2">暂无该闲置的配图文件</span>
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3 text-status-normal font-bold z-10 scale-95 origin-bottom-right">
                    {getStatusBadge(selectedItem.status)}
                  </div>
                </div>

                {/* Seller specs cards box */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800/50">
                  <div className="flex items-center gap-3">
                    <img src={selectedItem.sellerAvatar} alt="seller" className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">卖家：{selectedItem.sellerName}</h4>
                      <p className="text-[11px] text-amber-500 font-semibold flex items-center gap-1 mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        信誉评级: 5 分满分得 {selectedItem.sellerRating.toFixed(1)} 分
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold text-[10px] uppercase border border-teal-500/20">
                      <ShieldCheck className="w-3 h-3" />
                      信用良好
                    </span>
                  </div>
                </div>

                {/* Main product writeups specs */}
                <div className="space-y-4">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-primary-fixed bg-primary/10 text-primary mr-1.5 select-none">{selectedItem.condition}</span>
                    <h4 className="text-base font-black text-gray-900 dark:text-white mt-1 leading-normal">{selectedItem.title}</h4>
                    <p className="font-mono text-xl text-rose-500 dark:text-rose-400 font-extrabold mt-1.5 flex items-baseline leading-none">
                      <span className="text-xs font-semibold mr-0.5">¥</span>
                      {selectedItem.price.toFixed(2)}
                    </p>
                  </div>

                  <p className="text-xs text-gray-650 text-gray-600 dark:text-gray-350 leading-relaxed p-4 bg-gray-50 dark:bg-gray-800/20 rounded-2xl border border-gray-100 dark:border-gray-805 whitespace-pre-wrap select-all">
                    {selectedItem.description}
                  </p>
                </div>

                {/* Geological radar overlay tracker (high design, no telemetry logs) */}
                <div className="space-y-2.5">
                  <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 select-none">
                    <MapPin className="w-4 h-4 text-primary" />
                    同城交易辐射段：{selectedItem.location}
                  </h5>
                  <div className="bg-[#0c101b] p-4 rounded-2xl border border-slate-800/60 relative h-[180px] overflow-hidden select-none group shadow-inner">
                    <svg className="w-full h-full opacity-30" viewBox="0 0 100 100">
                      <path d="M0,25 L100,25 M0,50 L100,50 M0,75 L100,75 M25,0 L25,100 M50,0 L50,100 M75,0 L75,100" stroke="#1e293b" strokeWidth="0.25" />
                      <circle cx="50" cy="50" r="10" stroke="#3b82f6" strokeWidth="0.4" fill="none" className="animate-ping" style={{ animationDuration: '4s' }} />
                      <circle cx="50" cy="50" r="26" stroke="#3b82f6" strokeWidth="0.3" fill="none" />
                      <circle cx="50" cy="50" r="42" stroke="#1d4ed8" strokeWidth="0.2" fill="none" />
                      <path d="M10,20 Q30,60 50,50 T90,20" stroke="#f8fafc" strokeWidth="0.3" strokeDasharray="3,3" fill="none" />
                    </svg>

                    <div className="absolute inset-x-3 bottom-3 flex justify-between items-end text-[10px] font-mono text-slate-500">
                      <div>
                        <p className="text-teal-400 font-extrabold tracking-widest text-[10px]">COORDINATE ACTIVE</p>
                      </div>
                      <p className="text-slate-400">预估辐射周边：~ {selectedItem.id === 'GDS-20231027-01' ? '2.5 km' : '4.8 km'}</p>
                    </div>

                    <div className="absolute left-1/2 top-11 -translate-x-1/2 text-center transition-transform hover:scale-105 duration-200">
                      <div className="inline-flex flex-col items-center">
                        <div className="px-2.5 py-1 bg-primary text-white font-bold text-[10px] rounded-lg shadow-xl flex items-center gap-1 border border-primary/20">
                          <MapPin className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                          <span>{selectedItem.location.split(' ').pop()}</span>
                        </div>
                        <div className="w-2 h-2 bg-primary rotate-45 -translate-y-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions footer tools list */}
              <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 gap-2 flex justify-end sticky bottom-0 z-10 select-none animate-shimmer">
                {selectedItem.status === 'removed' ? (
                  <button
                    onClick={() => {
                      handleApprove(selectedItem.id);
                      setSelectedItem(null);
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 font-bold text-white text-xs rounded-xl transition-all cursor-pointer border-none flex items-center justify-center gap-1 shadow-sm font-sans"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>同意并公开对外发布此二手商品</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        handleMarkSold(selectedItem.id);
                      }}
                      disabled={selectedItem.status === 'sold'}
                      className={`px-5 py-2.5 border text-xs font-bold rounded-xl transition-all cursor-pointer select-none focus:outline-none ${
                        selectedItem.status === 'sold'
                          ? 'border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-850 cursor-not-allowed'
                          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      标记已售转手
                    </button>
                    <button
                      onClick={() => setShowRejectModal(selectedItem.id)}
                      className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer border-none flex items-center gap-1 shadow-md shadow-rose-600/10"
                    >
                      <Gavel className="w-4 h-4" />
                      <span>违规强退下架书</span>
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Reject dialog goods popup */}
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
                className="bg-white dark:bg-gray-900 max-w-sm w-full rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-2xl space-y-4 text-gray-800 dark:text-white"
              >
                <div className="flex items-center gap-2 select-none">
                  <div className="p-2 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-xl">
                    <ShieldAlert className="w-5 h-5 text-rose-600" />
                  </div>
                  <h4 className="font-extrabold text-base">确认驳回强制下架该二手？</h4>
                </div>

                <form onSubmit={handleRejectSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-gray-500 dark:text-gray-400 font-bold text-[10px] uppercase select-none">违规理由指控</label>
                    <select
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 rounded-xl font-semibold text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer text-gray-800 dark:text-white"
                    >
                      <option value="宝贝内容描述与大类明显不符">宝贝内容描述与大类明显不符</option>
                      <option value="图片涉嫌搬运剽窃盗图嫌疑">图片涉嫌搬运剽窃盗图嫌疑</option>
                      <option value="包含夸大引流敏感违法涉黄字符">包含夸大引流敏感违法涉黄字符</option>
                      <option value="销售违禁二手产品或国家管制品">销售违禁二手产品或国家管制品</option>
                      <option value="含有微信外链二维码不规范导流">含有微信外链二维码不规范导流</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-3 select-none">
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl cursor-pointer border-none shadow-md"
                    >
                      下架宝贝
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRejectModal(null)}
                      className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-805 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200 font-semibold text-xs rounded-xl cursor-pointer transition-colors focus:outline-none"
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

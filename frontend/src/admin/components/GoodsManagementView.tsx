/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, CheckCircle2, Compass, Image as ImageIcon, Info, MapPin, RotateCcw, Search, ShieldAlert, Star, X } from 'lucide-react';
import { Goods } from '../types';
import UserSquareCard from './common/UserSquareCard';

interface GoodsManagementViewProps {
  goods: Goods[];
  onUpdateGoodsStatus: (goodsId: string, status: 'active' | 'sold' | 'removed' | 'pending', rejectReason?: string) => void;
}

type GoodsStatusFilter = 'all' | 'active' | 'sold' | 'removed' | 'pending';

export default function GoodsManagementView({ goods, onUpdateGoodsStatus }: GoodsManagementViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<GoodsStatusFilter>('all');
  const [activeSeller, setActiveSeller] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<Goods | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('商品内容不符合平台规范');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToastMsg = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 2200);
  };

  const filteredGoods = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return goods.filter((item) => {
      const matchesSearch =
        !keyword ||
        item.title.toLowerCase().includes(keyword) ||
        item.id.toLowerCase().includes(keyword) ||
        item.sellerName.toLowerCase().includes(keyword) ||
        item.category.toLowerCase().includes(keyword);
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [goods, searchTerm, statusFilter]);

  const groupedBySeller = useMemo(() => {
    const map = new Map<string, Goods[]>();
    filteredGoods.forEach((item) => {
      const key = item.sellerName || '未知用户';
      const current = map.get(key);
      if (current) current.push(item);
      else map.set(key, [item]);
    });
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [filteredGoods]);

  const activeSellerGroup = useMemo(() => groupedBySeller.find(([name]) => name === activeSeller) || null, [groupedBySeller, activeSeller]);

  useEffect(() => {
    if (activeSeller && !activeSellerGroup) setActiveSeller(null);
  }, [activeSeller, activeSellerGroup]);

  const sellerGoods = activeSellerGroup?.[1] || [];
  const getSellerTag = (items: Goods[]) => items.find((item) => item.sellerTag?.trim())?.sellerTag || '未设置身份标签';
  const getSellerAvatar = (items: Goods[]) => items.find((item) => item.sellerAvatar)?.sellerAvatar;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">在售</span>;
      case 'sold': return <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200">已售出</span>;
      case 'removed': return <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-50 text-rose-500 border border-rose-100">已下架</span>;
      case 'pending': return <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">待审核</span>;
      default: return null;
    }
  };

  const handleApprove = (id: string) => {
    onUpdateGoodsStatus(id, 'active');
    if (selectedItem?.id === id) setSelectedItem({ ...selectedItem, status: 'active' });
    showToastMsg('商品已上架', 'success');
  };

  const handleMarkSold = (id: string) => {
    onUpdateGoodsStatus(id, 'sold');
    if (selectedItem?.id === id) setSelectedItem({ ...selectedItem, status: 'sold' });
    showToastMsg('商品已标记为已售', 'success');
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRejectModal) return;
    onUpdateGoodsStatus(showRejectModal, 'removed', rejectReason);
    if (selectedItem?.id === showRejectModal) setSelectedItem({ ...selectedItem, status: 'removed', rejectReason });
    setShowRejectModal(null);
    showToastMsg('商品已下架', 'info');
  };

  return (
    <div className="relative space-y-6">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg border bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-sky-500" />}
            {toast.type === 'error' && <ShieldAlert className="w-4 h-4 text-rose-500" />}
            <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'active', 'sold', 'removed', 'pending'] as const).map((status) => (
            <button key={status} onClick={() => setStatusFilter(status)} className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border-none cursor-pointer ${statusFilter === status ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-300'}`}>
              {status === 'all' ? '全部' : status === 'active' ? '在售' : status === 'sold' ? '已售' : status === 'removed' ? '下架' : '待审'}
            </button>
          ))}
          {activeSeller && <button onClick={() => { setActiveSeller(null); setSelectedItem(null); }} className="ml-auto text-[10px] px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">返回用户列表</button>}
        </div>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input type="text" placeholder="搜索商品、卖家、分类或ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-xl text-xs outline-none dark:text-white" />
        </div>
      </div>

      {filteredGoods.length === 0 ? (
        <EmptyState text="暂无匹配商品" />
      ) : !activeSeller ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-2.5">
          {groupedBySeller.map(([sellerName, items]) => (
            <UserSquareCard key={sellerName} title={sellerName} userType={getSellerTag(items)} subtitle={`${items.length} 件商品`} avatar={getSellerAvatar(items)} buttonLabel="查看商品" onClick={() => setActiveSeller(sellerName)} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 px-2.5 py-1.5">
            <button onClick={() => setActiveSeller(null)} className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 shrink-0">返回用户列表</button>
            <div><p className="text-[11px] font-bold text-gray-800 dark:text-gray-100">{activeSellerGroup?.[0]}</p><p className="text-[10px] text-gray-400">{sellerGoods.length} 件商品</p></div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-slate-600 dark:text-slate-350">
                <thead><tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold border-b border-slate-200/60 dark:border-slate-800/60"><th className="p-4">商品</th><th className="p-4">分类/成色</th><th className="p-4">价格</th><th className="p-4">状态</th><th className="p-4 text-right">操作</th></tr></thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 dark:text-white">
                  {sellerGoods.map((item) => (
                    <tr key={item.id} onClick={() => setSelectedItem(item)} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer">
                      <td className="p-4"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">{item.images?.[0] ? <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 m-3.5 text-gray-400" />}</div><div><p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[240px]">{item.title}</p><p className="text-[10px] text-slate-400 font-mono">{item.id}</p></div></div></td>
                      <td className="p-4 text-xs"><p>{item.category}</p><p className="text-[10px] text-slate-400">{item.condition}</p></td>
                      <td className="p-4 text-xs font-bold text-rose-500">¥{item.price.toFixed(2)}</td>
                      <td className="p-4">{getStatusBadge(item.status)}</td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}><button onClick={() => setSelectedItem(item)} className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">详情</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedItem && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setSelectedItem(null)} className="fixed inset-0 bg-black/60 z-45" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 240 }} className="fixed top-0 right-0 h-full w-full max-w-lg bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800 shadow-2xl z-50 overflow-y-auto flex flex-col text-gray-800 dark:text-white">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-10"><div className="flex items-center gap-2"><Compass className="w-4 h-4 text-primary" /><h3 className="text-sm font-bold">商品详情</h3></div><button onClick={() => setSelectedItem(null)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 border-none bg-transparent"><X className="w-4 h-4" /></button></div>
              <div className="p-4 space-y-4 text-xs">
                <div className="aspect-[4/3] rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center">{selectedItem.images?.[0] ? <img src={selectedItem.images[0]} alt={selectedItem.title} className="w-full h-full object-cover" /> : <ImageIcon className="w-12 h-12 text-gray-400" />}</div>
                <div className="flex items-center justify-between"><div><h4 className="text-base font-black text-gray-900 dark:text-white">{selectedItem.title}</h4><p className="mt-1 text-[10px] text-gray-400 font-mono">{selectedItem.id}</p></div>{getStatusBadge(selectedItem.status)}</div>
                <div className="grid grid-cols-2 gap-2"><InfoCard label="卖家" value={selectedItem.sellerName} /><InfoCard label="身份标签" value={selectedItem.sellerTag || '未设置'} /><InfoCard label="分类" value={selectedItem.category} /><InfoCard label="成色" value={selectedItem.condition} /><InfoCard label="价格" value={`¥${selectedItem.price.toFixed(2)}`} /><InfoCard label="地点" value={selectedItem.location} /></div>
                <div className="rounded-xl border border-gray-100 dark:border-gray-800 p-3"><p className="text-gray-400">商品描述</p><p className="mt-2 leading-5 whitespace-pre-wrap">{selectedItem.description || '暂无描述'}</p></div>
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 sticky bottom-0 bg-white dark:bg-gray-900 flex gap-2">
                <button onClick={() => handleApprove(selectedItem.id)} className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg border-none flex items-center justify-center gap-1"><Check className="w-4 h-4" />上架</button>
                <button onClick={() => handleMarkSold(selectedItem.id)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-lg border-none">标记已售</button>
                <button onClick={() => setShowRejectModal(selectedItem.id)} className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg border-none">下架</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRejectModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black z-[100]" onClick={() => setShowRejectModal(null)} />
            <div className="fixed inset-0 z-[105] flex items-center justify-center p-4"><motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-gray-900 max-w-sm w-full rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-2xl space-y-4 text-gray-800 dark:text-white"><h4 className="font-bold text-sm">确认下架商品？</h4><form onSubmit={handleRejectSubmit} className="space-y-3"><textarea rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs outline-none" /><div className="flex gap-2"><button type="submit" className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg border-none">确认下架</button><button type="button" onClick={() => setShowRejectModal(null)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-xs rounded-lg border-none">取消</button></div></form></motion.div></div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-12 text-center"><p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{text}</p></div>;
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-gray-100 dark:border-gray-800 p-2.5 bg-gray-50/40 dark:bg-gray-800/20"><p className="text-[10px] text-gray-400">{label}</p><p className="mt-1 text-[11px] font-semibold text-gray-700 dark:text-gray-200">{value}</p></div>;
}

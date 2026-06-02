/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Check,
  CheckCircle2,
  Gavel,
  Image as ImageIcon,
  Info,
  MapPin,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Star,
  X,
} from 'lucide-react';
import { Goods } from '../types';
import { getPrimaryImage } from '../../utils/images';
import UserSquareCard from './common/UserSquareCard';

interface GoodsManagementViewProps {
  goods: Goods[];
  onUpdateGoodsStatus: (goodsId: string, status: 'active' | 'sold' | 'removed' | 'pending', rejectReason?: string) => void;
}

type GoodsStatusFilter = 'all' | 'active' | 'sold' | 'removed' | 'pending';

type SellerGroup = {
  id: string;
  name: string;
  avatar: string;
  tag: string;
  items: Goods[];
};

export default function GoodsManagementView({ goods, onUpdateGoodsStatus }: GoodsManagementViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<GoodsStatusFilter>('all');
  const [activeSellerId, setActiveSellerId] = useState<string | null>(null);
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

  const groupedBySeller = useMemo<SellerGroup[]>(() => {
    const map = new Map<string, SellerGroup>();
    filteredGoods.forEach((item) => {
      const key = item.sellerId || item.sellerName || `unknown-${item.id}`;
      const current = map.get(key);
      if (current) {
        current.items.push(item);
        if (!current.avatar) {
          current.avatar = getPrimaryImage(item.sellerAvatar);
        }
        if (!current.tag && item.sellerTag?.trim()) {
          current.tag = item.sellerTag;
        }
        return;
      }
      map.set(key, {
        id: key,
        name: item.sellerName || '未知用户',
        avatar: getPrimaryImage(item.sellerAvatar),
        tag: item.sellerTag?.trim() || '未设置身份标签',
        items: [item],
      });
    });
    return Array.from(map.values()).sort((a, b) => b.items.length - a.items.length);
  }, [filteredGoods]);

  const activeSellerGroup = useMemo(
    () => groupedBySeller.find((seller) => seller.id === activeSellerId) || null,
    [groupedBySeller, activeSellerId]
  );

  useEffect(() => {
    if (activeSellerId && !activeSellerGroup) setActiveSellerId(null);
  }, [activeSellerId, activeSellerGroup]);

  useEffect(() => {
    setSelectedItem(null);
  }, [activeSellerId, statusFilter, searchTerm]);

  useEffect(() => {
    if (!selectedItem) return;
    const nextItem = goods.find((item) => item.id === selectedItem.id);
    if (nextItem) {
      setSelectedItem(nextItem);
    }
  }, [goods, selectedItem]);

  const sellerGoods = activeSellerGroup?.items || [];
  const getGoodsImage = (item: Goods) => getPrimaryImage(item.images);
  const getSellerAvatar = (value?: string) => getPrimaryImage(value);

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
    setSelectedItem((current) => (current?.id === id ? { ...current, status: 'active', rejectReason: undefined } : current));
    showToastMsg('商品已上架', 'success');
  };

  const handleMarkSold = (id: string) => {
    onUpdateGoodsStatus(id, 'sold');
    setSelectedItem((current) => (current?.id === id ? { ...current, status: 'sold' } : current));
    showToastMsg('商品已标记为已售', 'success');
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRejectModal) return;
    onUpdateGoodsStatus(showRejectModal, 'removed', rejectReason);
    setSelectedItem((current) => (
      current?.id === showRejectModal ? { ...current, status: 'removed', rejectReason } : current
    ));
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
          {activeSellerId && (
            <button
              onClick={() => {
                setActiveSellerId(null);
                setSelectedItem(null);
              }}
              className="ml-auto text-[10px] px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
            >
              返回用户列表
            </button>
          )}
        </div>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input type="text" placeholder="搜索商品、卖家、分类或ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-xl text-xs outline-none dark:text-white" />
        </div>
      </div>

      {filteredGoods.length === 0 ? (
        <EmptyState text="暂无匹配商品" />
      ) : !activeSellerId ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-2.5">
          {groupedBySeller.map((seller) => (
            <UserSquareCard
              key={seller.id}
              title={seller.name}
              userType={seller.tag}
              subtitle={`${seller.items.length} 件商品`}
              avatar={seller.avatar}
              buttonLabel="查看商品"
              onClick={() => setActiveSellerId(seller.id)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 px-2.5 py-1.5">
            <button onClick={() => setActiveSellerId(null)} className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 shrink-0">返回用户列表</button>
            <div className="flex items-center gap-2 min-w-0">
              {activeSellerGroup?.avatar ? (
                <img
                  src={activeSellerGroup.avatar}
                  alt={activeSellerGroup.name}
                  className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                />
              ) : null}
              <div>
                <p className="text-[11px] font-bold text-gray-800 dark:text-gray-100">{activeSellerGroup?.name}</p>
                <p className="text-[10px] text-gray-400">{sellerGoods.length} 件商品</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-slate-600 dark:text-slate-350">
                <thead><tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold border-b border-slate-200/60 dark:border-slate-800/60"><th className="p-4">商品</th><th className="p-4">分类/成色</th><th className="p-4">价格</th><th className="p-4">状态</th><th className="p-4 text-right">操作</th></tr></thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 dark:text-white">
                  {sellerGoods.map((item) => {
                    const goodsImage = getGoodsImage(item);
                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer ${selectedItem?.id === item.id ? 'bg-slate-50 dark:bg-slate-800/30' : ''}`}
                        onClick={() => setSelectedItem(item)}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0 flex items-center justify-center">
                              {goodsImage ? (
                                <img src={goodsImage} alt={item.title} className="w-full h-full object-cover" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
                              ) : (
                                <ImageIcon className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[240px]">{item.title}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{item.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-xs"><p>{item.category}</p><p className="text-[10px] text-slate-400">{item.condition}</p></td>
                        <td className="p-4 text-xs font-bold text-rose-500">¥{item.price.toFixed(2)}</td>
                        <td className="p-4">{getStatusBadge(item.status)}</td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex flex-wrap justify-end gap-1.5">
                            <button onClick={() => setSelectedItem(item)} className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">详情</button>
                            <button onClick={() => handleApprove(item.id)} disabled={item.status === 'active'} className={`text-[10px] px-2 py-0.5 rounded-md ${item.status === 'active' ? 'bg-emerald-100/60 text-emerald-400 cursor-not-allowed' : 'bg-emerald-600 text-white'}`}>上架</button>
                            <button onClick={() => handleMarkSold(item.id)} disabled={item.status === 'sold'} className={`text-[10px] px-2 py-0.5 rounded-md ${item.status === 'sold' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}>标记已售</button>
                            <button onClick={() => setShowRejectModal(item.id)} disabled={item.status === 'removed'} className={`text-[10px] px-2 py-0.5 rounded-md ${item.status === 'removed' ? 'bg-rose-100/60 text-rose-300 cursor-not-allowed' : 'bg-rose-600 text-white'}`}>下架</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

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
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white/80 dark:bg-gray-900/80 sticky top-0 backdrop-blur-md z-10 select-none">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-bold">闲置商品详情</h3>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800/85 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer border-none bg-transparent focus:outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-6 flex-grow">
                <div className="bg-gray-50 dark:bg-gray-950 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 text-center relative max-h-[260px] flex items-center justify-center">
                  {getGoodsImage(selectedItem) ? (
                    <img src={getGoodsImage(selectedItem)} alt={selectedItem.title} className="w-full h-full max-h-[260px] object-cover" />
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-gray-300">
                      <ImageIcon className="w-16 h-16 text-gray-400" />
                      <span className="text-xs text-gray-400 mt-2">暂无商品图片</span>
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3 text-status-normal font-bold z-10 scale-95 origin-bottom-right">
                    {getStatusBadge(selectedItem.status)}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800/50">
                  <div className="flex items-center gap-3 min-w-0">
                    {getSellerAvatar(selectedItem.sellerAvatar) ? (
                      <img src={getSellerAvatar(selectedItem.sellerAvatar)} alt={selectedItem.sellerName} className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-sm font-bold text-gray-500">
                        {selectedItem.sellerName.slice(0, 1)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">卖家：{selectedItem.sellerName}</h4>
                      <p className="text-[11px] text-amber-500 font-semibold flex items-center gap-1 mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        信誉评分 {selectedItem.sellerRating.toFixed(1)}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold text-[10px] uppercase border border-teal-500/20">
                    <ShieldCheck className="w-3 h-3" />
                    {selectedItem.sellerTag || '身份已记录'}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-primary/10 text-primary mr-1.5 select-none">{selectedItem.condition}</span>
                    <h4 className="text-base font-black text-gray-900 dark:text-white mt-1 leading-normal">{selectedItem.title}</h4>
                    <p className="font-mono text-xl text-rose-500 dark:text-rose-400 font-extrabold mt-1.5 flex items-baseline leading-none">
                      <span className="text-xs font-semibold mr-0.5">¥</span>
                      {selectedItem.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <InfoCard label="卖家" value={selectedItem.sellerName} />
                    <InfoCard label="身份标签" value={selectedItem.sellerTag || '未设置'} />
                    <InfoCard label="分类" value={selectedItem.category} />
                    <InfoCard label="成色" value={selectedItem.condition} />
                    <InfoCard label="价格" value={`¥${selectedItem.price.toFixed(2)}`} />
                    <InfoCard label="地点" value={selectedItem.location || '-'} />
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed p-4 bg-gray-50 dark:bg-gray-800/20 rounded-2xl border border-gray-100 dark:border-gray-805 whitespace-pre-wrap">
                    {selectedItem.description || '暂无描述'}
                  </p>
                </div>

                <div className="space-y-2.5">
                  <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 select-none">
                    <MapPin className="w-4 h-4 text-primary" />
                    交易位置：{selectedItem.location || '未设置'}
                  </h5>
                  <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-4 text-xs text-slate-600 dark:text-slate-300 space-y-2">
                    <p>商品编号：{selectedItem.id}</p>
                    <p>卖家距离：{selectedItem.distance || '未提供'}</p>
                    {selectedItem.rejectReason ? <p className="text-rose-500">下架原因：{selectedItem.rejectReason}</p> : null}
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 gap-2 flex justify-end sticky bottom-0 z-10">
                <button
                  onClick={() => handleApprove(selectedItem.id)}
                  disabled={selectedItem.status === 'active'}
                  className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all border-none flex items-center gap-1 ${
                    selectedItem.status === 'active'
                      ? 'bg-emerald-100/60 text-emerald-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  上架
                </button>
                <button
                  onClick={() => handleMarkSold(selectedItem.id)}
                  disabled={selectedItem.status === 'sold'}
                  className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all border ${
                    selectedItem.status === 'sold'
                      ? 'border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-850 cursor-not-allowed'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  标记已售
                </button>
                <button
                  onClick={() => setShowRejectModal(selectedItem.id)}
                  disabled={selectedItem.status === 'removed'}
                  className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all border-none flex items-center gap-1 ${
                    selectedItem.status === 'removed'
                      ? 'bg-rose-100/60 text-rose-300 cursor-not-allowed'
                      : 'bg-rose-600 hover:bg-rose-700 text-white'
                  }`}
                >
                  <Gavel className="w-3.5 h-3.5" />
                  下架
                </button>
                {selectedItem.status === 'removed' ? (
                  <button
                    onClick={() => handleApprove(selectedItem.id)}
                    className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl border-none flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    重新上架
                  </button>
                ) : null}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRejectModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black z-[100]" onClick={() => setShowRejectModal(null)} />
            <div className="fixed inset-0 z-[105] flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-gray-900 max-w-sm w-full rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-2xl space-y-4 text-gray-800 dark:text-white">
                <h4 className="font-bold text-sm">确认下架商品？</h4>
                <form onSubmit={handleRejectSubmit} className="space-y-3">
                  <textarea rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs outline-none" />
                  <div className="flex gap-2"><button type="submit" className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg border-none">确认下架</button><button type="button" onClick={() => setShowRejectModal(null)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-xs rounded-lg border-none">取消</button></div>
                </form>
              </motion.div>
            </div>
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

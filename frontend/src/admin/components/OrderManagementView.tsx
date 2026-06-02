/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  AlertTriangle,
  Ban,
  CheckCircle2,
  Info,
  MapPin,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from 'lucide-react';
import { Order } from '../types';
import { getPrimaryImage } from '../../utils/images';
import UserSquareCard from './common/UserSquareCard';

interface OrderManagementViewProps {
  orders: Order[];
  onForceCancelOrder: (orderId: string, cancelReason: string) => void;
  initialSelectedOrderId?: string;
  initialTabFilter?: string;
}

type OrderStatus = 'all' | 'pending_payment' | 'pending_execution' | 'completed' | 'canceled' | 'abnormal';

type BuyerGroup = {
  id: string;
  name: string;
  avatar: string;
  tag: string;
  items: Order[];
};

export default function OrderManagementView({ orders, onForceCancelOrder, initialSelectedOrderId, initialTabFilter }: OrderManagementViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus>('all');
  const [activeBuyerId, setActiveBuyerId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('买卖双方协商一致，申请平台关闭订单并退款');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 2200);
  };

  const getBuyerGroupKey = (order: Order) => order.buyerId || order.buyerName || `unknown-${order.id}`;

  useEffect(() => {
    if (initialTabFilter === 'abnormal') setStatusFilter('abnormal');
  }, [initialTabFilter]);

  const filteredOrders = useMemo(
    () =>
      orders.filter((o) => {
        const q = searchTerm.trim().toLowerCase();
        const matchesSearch = !q || o.id.toLowerCase().includes(q) || o.buyerName.toLowerCase().includes(q) || o.sellerName.toLowerCase().includes(q) || o.serviceName.toLowerCase().includes(q);
        const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [orders, searchTerm, statusFilter]
  );

  const groupedByBuyer = useMemo<BuyerGroup[]>(() => {
    const map = new Map<string, BuyerGroup>();
    filteredOrders.forEach((order) => {
      const key = getBuyerGroupKey(order);
      const current = map.get(key);
      if (current) {
        current.items.push(order);
        if (!current.avatar) {
          current.avatar = getPrimaryImage(order.buyerAvatar);
        }
        if (current.tag === '未设置身份标签' && order.buyerTag?.trim()) {
          current.tag = order.buyerTag;
        }
        return;
      }
      map.set(key, {
        id: key,
        name: order.buyerName || '未知用户',
        avatar: getPrimaryImage(order.buyerAvatar),
        tag: order.buyerTag?.trim() || '未设置身份标签',
        items: [order],
      });
    });
    return Array.from(map.values()).sort((a, b) => b.items.length - a.items.length);
  }, [filteredOrders]);

  const activeBuyerGroup = useMemo(
    () => groupedByBuyer.find((buyer) => buyer.id === activeBuyerId) || null,
    [groupedByBuyer, activeBuyerId]
  );

  useEffect(() => {
    if (!initialSelectedOrderId) return;
    const match = orders.find((o) => o.id === initialSelectedOrderId);
    if (match) {
      setActiveBuyerId(getBuyerGroupKey(match));
      setSelectedOrder(match);
    }
  }, [initialSelectedOrderId, orders]);

  useEffect(() => {
    if (activeBuyerId && !activeBuyerGroup) setActiveBuyerId(null);
  }, [activeBuyerId, activeBuyerGroup]);

  useEffect(() => {
    setSelectedOrder(null);
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    if (!selectedOrder) return;
    const nextOrder = orders.find((item) => item.id === selectedOrder.id);
    if (nextOrder) {
      setSelectedOrder(nextOrder);
    }
  }, [orders, selectedOrder]);

  const tableOrders = activeBuyerGroup?.items || [];

  const getStatusLabelText = (st: string) => {
    switch (st) {
      case 'completed':
        return '已完成';
      case 'pending_payment':
        return '待付款';
      case 'pending_execution':
        return '待服务';
      case 'canceled':
        return '已取消';
      case 'abnormal':
        return '异常单';
      default:
        return '其他';
    }
  };

  const getStatusBadgeStyle = (st: string) => {
    switch (st) {
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20';
      case 'pending_payment':
        return 'bg-amber-500/10 text-amber-600 border border-amber-500/20';
      case 'pending_execution':
        return 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20';
      case 'canceled':
        return 'bg-gray-100 text-gray-500 border border-gray-200';
      case 'abnormal':
        return 'bg-rose-500/10 text-rose-600 border border-rose-500/20';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showCancelModal) return;
    onForceCancelOrder(showCancelModal, cancelReason);
    setSelectedOrder((current) =>
      current?.id === showCancelModal ? { ...current, status: 'canceled', cancelReason } : current
    );
    setShowCancelModal(null);
    showToast('订单已关闭，退款流程已触发', 'info');
  };

  const canForceCancel = (order: Order) => order.status !== 'completed' && order.status !== 'canceled';

  return (
    <div className="relative space-y-6">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg border bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-sky-500" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-500" />}
            <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'pending_payment', 'pending_execution', 'completed', 'canceled', 'abnormal'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border-none cursor-pointer ${statusFilter === st ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-300'}`}
            >
              {st === 'all' ? '全部' : st === 'pending_payment' ? '待付款' : st === 'pending_execution' ? '待服务' : st === 'completed' ? '已完成' : st === 'canceled' ? '已取消' : '异常单'}
            </button>
          ))}
          {activeBuyerId && (
            <button
              onClick={() => {
                setActiveBuyerId(null);
                setSelectedOrder(null);
              }}
              className="ml-auto text-[10px] px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
            >
              返回买家列表
            </button>
          )}
        </div>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="搜索订单号、买家、商家、服务名..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-xl text-xs outline-none dark:text-white"
          />
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <EmptyState text="暂无匹配订单" />
      ) : !activeBuyerId ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-2.5">
          {groupedByBuyer.map((buyer) => (
            <UserSquareCard
              key={buyer.id}
              title={buyer.name}
              userType={buyer.tag}
              subtitle={`${buyer.items.length} 笔订单`}
              avatar={buyer.avatar}
              buttonLabel="查看订单"
              onClick={() => setActiveBuyerId(buyer.id)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 px-2.5 py-1.5">
            <button onClick={() => setActiveBuyerId(null)} className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 shrink-0">
              返回买家列表
            </button>
            <div className="flex items-center gap-2 min-w-0">
              {activeBuyerGroup?.avatar ? (
                <img
                  src={activeBuyerGroup.avatar}
                  alt={activeBuyerGroup.name}
                  className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                />
              ) : null}
              <div>
                <p className="text-[11px] font-bold text-gray-800 dark:text-gray-100">{activeBuyerGroup?.name}</p>
                <p className="text-[10px] text-gray-400">{tableOrders.length} 笔订单</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-slate-600 dark:text-slate-350">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold border-b border-slate-200/60 dark:border-slate-800/60 select-none">
                    <th className="p-4">服务 / 订单</th>
                    <th className="p-4">买家 / 商家</th>
                    <th className="p-4">金额</th>
                    <th className="p-4">状态</th>
                    <th className="p-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 dark:text-white">
                  {tableOrders.map((ord) => (
                    <tr
                      key={ord.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer ${selectedOrder?.id === ord.id ? 'bg-slate-50 dark:bg-slate-800/30' : ''}`}
                      onClick={() => setSelectedOrder(ord)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[220px]">{ord.serviceName}</p>
                            <p className="text-[10px] text-slate-400 truncate max-w-[220px] font-mono">{ord.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-slate-600 dark:text-slate-300">
                        <p>买：{ord.buyerName}</p>
                        <p>卖：{ord.sellerName}</p>
                      </td>
                      <td className="p-4 text-xs font-bold text-rose-500">¥{ord.paymentPrice.toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getStatusBadgeStyle(ord.status)}`}>{getStatusLabelText(ord.status)}</span>
                      </td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setSelectedOrder(ord)} className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                            详情
                          </button>
                          {canForceCancel(ord) && (
                            <button onClick={() => setShowCancelModal(ord.id)} className="text-[10px] px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200">
                              关闭
                            </button>
                          )}
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
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
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
                  <h3 className="text-base font-bold">订单详情</h3>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800/85 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer border-none bg-transparent focus:outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-6 flex-grow">
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-6 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getStatusBadgeStyle(selectedOrder.status)}`}>{getStatusLabelText(selectedOrder.status)}</span>
                    <h4 className="text-lg font-black text-gray-900 dark:text-white mt-3 leading-normal">{selectedOrder.serviceName}</h4>
                    <p className="mt-2 text-[11px] text-gray-400 font-mono">订单号：{selectedOrder.id}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-gray-400">实付金额</p>
                    <p className="font-mono text-2xl text-rose-500 font-extrabold mt-1">¥{selectedOrder.paymentPrice.toFixed(2)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <PersonCard title="买家" name={selectedOrder.buyerName} tag={selectedOrder.buyerTag} avatar={selectedOrder.buyerAvatar} />
                  <PersonCard title="商家" name={selectedOrder.sellerName} tag={selectedOrder.sellerTag} avatar={selectedOrder.sellerAvatar} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <InfoCard label="预约时间" value={selectedOrder.scheduleTime || '-'} />
                  <InfoCard label="创建时间" value={selectedOrder.buildTime || '-'} />
                  <InfoCard label="买家标签" value={selectedOrder.buyerTag || '未设置'} />
                  <InfoCard label="商家标签" value={selectedOrder.sellerTag || '未设置'} />
                  <InfoCard label="买家电话" value={selectedOrder.buyerPhone || '-'} />
                  <InfoCard label="商家电话" value={selectedOrder.sellerPhone || '-'} />
                </div>

                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-4 bg-gray-50/50 dark:bg-gray-800/20 space-y-3">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">服务与地址</p>
                  <p className="text-sm font-semibold">{selectedOrder.serviceName}</p>
                  <p className="flex items-start gap-1.5 text-sm">
                    <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{selectedOrder.buyerAddress || '未填写买家地址'}</span>
                  </p>
                  <div>
                    <p className="text-[11px] text-gray-400">备注</p>
                    <p className="mt-1 text-sm whitespace-pre-wrap">{selectedOrder.remark || '无'}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">费用明细</p>
                  <div className="space-y-2 mt-3 text-sm">
                    {selectedOrder.feeBreakdown.map((fee, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-3">
                        <span>{fee.name}</span>
                        <span className="font-mono">{fee.isDiscount ? '-' : ''}¥{fee.value.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between font-bold">
                      <span>实付</span>
                      <span className="text-rose-500 font-mono">¥{selectedOrder.paymentPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">流程记录</p>
                  <div className="space-y-2 mt-3 text-sm">
                    {selectedOrder.steps.map((step, index) => (
                      <div key={index} className="flex items-start justify-between gap-3">
                        <p className="font-medium">{step.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono text-right">{step.time}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedOrder.status === 'canceled' && selectedOrder.cancelReason && (
                  <div className="p-3 bg-rose-50/70 dark:bg-rose-950/25 border border-rose-100 text-rose-600 rounded-lg flex items-start gap-1.5 text-sm">
                    <AlertTriangle className="w-4 h-4 mt-0.5" />
                    <div>
                      <p className="font-semibold">该订单已关闭</p>
                      <p className="mt-0.5">原因：{selectedOrder.cancelReason}</p>
                    </div>
                  </div>
                )}
              </div>

              {canForceCancel(selectedOrder) ? (
                <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 gap-2 flex justify-end sticky bottom-0 z-10">
                  <button onClick={() => setShowCancelModal(selectedOrder.id)} className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl border-none flex items-center gap-1">
                    <Ban className="w-3.5 h-3.5" />
                    强制关闭并退款
                  </button>
                </div>
              ) : null}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCancelModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black z-[100]" onClick={() => setShowCancelModal(null)} />
            <div className="fixed inset-0 z-[105] flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-gray-900 max-w-sm w-full rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-2xl space-y-4 text-gray-800 dark:text-white"
              >
                <h4 className="font-bold text-sm">确认关闭订单并退款？</h4>
                <form onSubmit={handleCancelSubmit} className="space-y-3">
                  <textarea rows={3} value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs outline-none" />
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg border-none">确认关闭</button>
                    <button type="button" onClick={() => setShowCancelModal(null)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-xs rounded-lg border-none">取消</button>
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

function EmptyState({ text }: { text: string }) {
  return <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-12 text-center"><p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{text}</p></div>;
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-gray-100 dark:border-gray-800 p-2.5 bg-gray-50/40 dark:bg-gray-800/20"><p className="text-[10px] text-gray-400">{label}</p><p className="mt-1 text-[11px] font-semibold text-gray-700 dark:text-gray-200 break-words">{value}</p></div>;
}

function PersonCard({ title, name, tag, avatar }: { title: string; name: string; tag?: string; avatar?: string }) {
  const avatarSrc = getPrimaryImage(avatar);

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-4 bg-gray-50/50 dark:bg-gray-800/20 flex items-center gap-3 min-w-0">
      {avatarSrc ? (
        <img src={avatarSrc} alt={name} className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700 shrink-0" />
      ) : (
        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-sm font-bold text-gray-500 shrink-0">
          <UserRound className="w-5 h-5" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[11px] text-gray-400">{title}</p>
        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{name}</p>
        <p className="text-[11px] text-teal-600 dark:text-teal-400 truncate mt-0.5">{tag || '未设置身份标签'}</p>
      </div>
    </div>
  );
}

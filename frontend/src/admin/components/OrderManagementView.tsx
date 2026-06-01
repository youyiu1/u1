/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, AlertTriangle, Ban, CheckCircle2, ClipboardList, Info, Search, ShoppingBag, X } from 'lucide-react';
import { Order } from '../types';
import UserSquareCard from './common/UserSquareCard';

interface OrderManagementViewProps {
  orders: Order[];
  onForceCancelOrder: (orderId: string, cancelReason: string) => void;
  initialSelectedOrderId?: string;
  initialTabFilter?: string;
}

type OrderStatus = 'all' | 'pending_payment' | 'pending_execution' | 'completed' | 'canceled' | 'abnormal';

export default function OrderManagementView({ orders, onForceCancelOrder, initialSelectedOrderId, initialTabFilter }: OrderManagementViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus>('all');
  const [activeBuyer, setActiveBuyer] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('买卖双方协商一致，申请平台关闭订单并退款');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  useEffect(() => {
    if (initialTabFilter === 'abnormal') setStatusFilter('abnormal');
  }, [initialTabFilter]);

  useEffect(() => {
    if (!initialSelectedOrderId) return;
    const match = orders.find((o) => o.id === initialSelectedOrderId);
    if (match) setSelectedOrder(match);
  }, [initialSelectedOrderId, orders]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 2200);
  };

  const filteredOrders = useMemo(() => orders.filter((o) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch = !q || o.id.toLowerCase().includes(q) || o.buyerName.toLowerCase().includes(q) || o.sellerName.toLowerCase().includes(q) || o.serviceName.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [orders, searchTerm, statusFilter]);

  const groupedByBuyer = useMemo(() => {
    const map = new Map<string, Order[]>();
    filteredOrders.forEach((order) => {
      const key = order.buyerName || '未知用户';
      const current = map.get(key);
      if (current) current.push(order);
      else map.set(key, [order]);
    });
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [filteredOrders]);

  const activeBuyerGroup = useMemo(() => groupedByBuyer.find(([name]) => name === activeBuyer) || null, [groupedByBuyer, activeBuyer]);

  useEffect(() => {
    if (activeBuyer && !activeBuyerGroup) setActiveBuyer(null);
  }, [activeBuyer, activeBuyerGroup]);

  const tableOrders = activeBuyerGroup?.[1] || [];
  const getBuyerTag = (items: Order[]) => items.find((item) => item.buyerTag?.trim())?.buyerTag || '未设置身份标签';

  const getStatusLabelText = (st: string) => {
    switch (st) {
      case 'completed': return '已完成';
      case 'pending_payment': return '待付款';
      case 'pending_execution': return '待服务';
      case 'canceled': return '已取消';
      case 'abnormal': return '异常单';
      default: return '其他';
    }
  };

  const getStatusBadgeStyle = (st: string) => {
    switch (st) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20';
      case 'pending_payment': return 'bg-amber-500/10 text-amber-600 border border-amber-500/20';
      case 'pending_execution': return 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20';
      case 'canceled': return 'bg-gray-100 text-gray-500 border border-gray-200';
      case 'abnormal': return 'bg-rose-500/10 text-rose-600 border border-rose-500/20';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showCancelModal) return;
    onForceCancelOrder(showCancelModal, cancelReason);
    if (selectedOrder?.id === showCancelModal) setSelectedOrder({ ...selectedOrder, status: 'canceled', cancelReason });
    setShowCancelModal(null);
    showToast('订单已关闭，退款流程已触发', 'info');
  };

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
            <button key={st} onClick={() => setStatusFilter(st)} className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border-none cursor-pointer ${statusFilter === st ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-300'}`}>
              {st === 'all' ? '全部' : st === 'pending_payment' ? '待付款' : st === 'pending_execution' ? '待服务' : st === 'completed' ? '已完成' : st === 'canceled' ? '已取消' : '异常单'}
            </button>
          ))}
          {activeBuyer && <button onClick={() => { setActiveBuyer(null); setSelectedOrder(null); }} className="ml-auto text-[10px] px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">返回用户列表</button>}
        </div>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input type="text" placeholder="搜索订单号、买家、商家、服务名..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-xl text-xs outline-none dark:text-white" />
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <EmptyState text="暂无匹配订单" />
      ) : !activeBuyer ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-2.5">
          {groupedByBuyer.map(([buyerName, buyerOrders]) => (
            <UserSquareCard key={buyerName} title={buyerName} userType={getBuyerTag(buyerOrders)} subtitle={`${buyerOrders.length} 笔订单`} buttonLabel="查看订单" onClick={() => setActiveBuyer(buyerName)} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 px-2.5 py-1.5">
            <button onClick={() => setActiveBuyer(null)} className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 shrink-0">返回用户列表</button>
            <div><p className="text-[11px] font-bold text-gray-800 dark:text-gray-100">{activeBuyerGroup?.[0]}</p><p className="text-[10px] text-gray-400">{tableOrders.length} 笔订单</p></div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-slate-600 dark:text-slate-350">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold border-b border-slate-200/60 dark:border-slate-800/60 select-none">
                    <th className="p-4">服务 / 订单</th><th className="p-4">买家 / 商家</th><th className="p-4">金额</th><th className="p-4">状态</th><th className="p-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 dark:text-white">
                  {tableOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4"><div className="flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-primary" /><div><p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{ord.serviceName}</p><p className="text-[10px] text-slate-400 truncate max-w-[220px]">{ord.id}</p></div></div></td>
                      <td className="p-4 text-xs text-slate-600 dark:text-slate-300"><p>买：{ord.buyerName}</p><p>卖：{ord.sellerName}</p></td>
                      <td className="p-4 text-xs font-bold text-rose-500">¥{ord.paymentPrice.toFixed(2)}</td>
                      <td className="p-4"><span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getStatusBadgeStyle(ord.status)}`}>{getStatusLabelText(ord.status)}</span></td>
                      <td className="p-4 text-right"><div className="flex items-center justify-end gap-1"><button onClick={() => setSelectedOrder(ord)} className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">详情</button>{ord.status !== 'completed' && ord.status !== 'canceled' && <button onClick={() => setShowCancelModal(ord.id)} className="text-[10px] px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200">关闭</button>}</div></td>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setSelectedOrder(null)} className="fixed inset-0 bg-black/60 z-45" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 240 }} className="fixed top-0 right-0 h-full w-full max-w-lg bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800 shadow-2xl z-50 overflow-y-auto flex flex-col text-gray-800 dark:text-white">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-10"><div className="flex items-center gap-2"><ClipboardList className="w-4 h-4 text-primary" /><h3 className="text-sm font-bold">订单详情</h3></div><button onClick={() => setSelectedOrder(null)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 border-none bg-transparent"><X className="w-4 h-4" /></button></div>
              <div className="p-4 space-y-4 text-xs">
                <div className="rounded-xl border border-gray-100 dark:border-gray-800 p-3 bg-gray-50/60 dark:bg-gray-800/30"><p className="text-gray-400">订单号</p><p className="font-mono text-[11px] mt-1">{selectedOrder.id}</p></div>
                <div className="grid grid-cols-2 gap-2"><InfoCard label="买家" value={selectedOrder.buyerName} /><InfoCard label="商家" value={selectedOrder.sellerName} /><InfoCard label="买家标签" value={selectedOrder.buyerTag || '未设置'} /><InfoCard label="商家标签" value={selectedOrder.sellerTag || '未设置'} /><InfoCard label="预约时间" value={selectedOrder.scheduleTime} /><InfoCard label="创建时间" value={selectedOrder.buildTime} /></div>
                <div className="rounded-xl border border-gray-100 dark:border-gray-800 p-3"><p className="text-gray-400">服务内容</p><p className="mt-1 font-semibold">{selectedOrder.serviceName}</p><p className="mt-2 text-gray-400">买家地址</p><p>{selectedOrder.buyerAddress}</p><p className="mt-2 text-gray-400">备注</p><p>{selectedOrder.remark || '无'}</p></div>
                <div className="rounded-xl border border-gray-100 dark:border-gray-800 p-3"><p className="text-gray-400">费用明细</p><div className="space-y-1 mt-2">{selectedOrder.feeBreakdown.map((fee, idx) => <div key={idx} className="flex items-center justify-between"><span>{fee.name}</span><span className="font-mono">{fee.isDiscount ? '-' : ''}¥{fee.value.toFixed(2)}</span></div>)}<div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between font-bold"><span>实付</span><span className="text-rose-500 font-mono">¥{selectedOrder.paymentPrice.toFixed(2)}</span></div></div></div>
                <div className="rounded-xl border border-gray-100 dark:border-gray-800 p-3"><p className="text-gray-400">流程记录</p><div className="space-y-2 mt-2">{selectedOrder.steps.map((step, index) => <div key={index} className="flex items-start justify-between gap-2"><p className="font-medium">{step.name}</p><p className="text-[10px] text-gray-400 font-mono">{step.time}</p></div>)}</div></div>
                {selectedOrder.status === 'canceled' && selectedOrder.cancelReason && <div className="p-2.5 bg-rose-50/70 dark:bg-rose-950/25 border border-rose-100 text-rose-600 rounded-lg flex items-start gap-1.5"><AlertTriangle className="w-4 h-4 mt-0.5" /><div><p className="font-semibold">该订单已关闭</p><p className="mt-0.5">原因：{selectedOrder.cancelReason}</p></div></div>}
              </div>
              {selectedOrder.status !== 'completed' && selectedOrder.status !== 'canceled' && <div className="p-4 border-t border-gray-100 dark:border-gray-800 sticky bottom-0 bg-white dark:bg-gray-900"><button onClick={() => setShowCancelModal(selectedOrder.id)} className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg border-none flex items-center justify-center gap-1"><Ban className="w-4 h-4" /> 强制关闭订单并退款</button></div>}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCancelModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black z-[100]" onClick={() => setShowCancelModal(null)} />
            <div className="fixed inset-0 z-[105] flex items-center justify-center p-4"><motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-gray-900 max-w-sm w-full rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-2xl space-y-4 text-gray-800 dark:text-white"><h4 className="font-bold text-sm">确认关闭订单并退款？</h4><form onSubmit={handleCancelSubmit} className="space-y-3"><textarea rows={3} value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs outline-none" /><div className="flex gap-2"><button type="submit" className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg border-none">确认关闭</button><button type="button" onClick={() => setShowCancelModal(null)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-xs rounded-lg border-none">取消</button></div></form></motion.div></div>
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

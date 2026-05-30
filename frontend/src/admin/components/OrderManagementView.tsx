/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  X, 
  FileText, 
  SlidersHorizontal, 
  ClipboardList, 
  MapPin, 
  Phone, 
  Clock, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  ChevronRight, 
  Info, 
  Coins, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  Ban,
  ArrowUpDown,
  ShoppingBag,
  CircleDot
} from 'lucide-react';
import { Order } from '../types';

interface OrderManagementViewProps {
  orders: Order[];
  onForceCancelOrder: (orderId: string, cancelReason: string) => void;
  initialSelectedOrderId?: string;
  initialTabFilter?: string;
}

export default function OrderManagementView({
  orders,
  onForceCancelOrder,
  initialSelectedOrderId,
  initialTabFilter
}: OrderManagementViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending_payment' | 'pending_execution' | 'completed' | 'canceled' | 'abnormal'>('all');

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('买家/商家经平台友好协商人道退款');

  // Custom Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToastMsg = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // EXTERNAL ROUTINGS INTEGRATOR
  useEffect(() => {
    if (initialTabFilter === 'abnormal') {
      setStatusFilter('abnormal');
    }
  }, [initialTabFilter]);

  useEffect(() => {
    if (initialSelectedOrderId) {
      const match = orders.find(o => o.id === initialSelectedOrderId);
      if (match) setSelectedOrder(match);
    }
  }, [initialSelectedOrderId, orders]);

  // Loading indicator on search
  const [isSearchingLoad, setIsSearchingLoad] = useState(false);

  useEffect(() => {
    setIsSearchingLoad(true);
    const timer = setTimeout(() => {
      setIsSearchingLoad(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter]);

  const getStatusLabelText = (st: string) => {
    switch (st) {
      case 'completed': return '交易已成功';
      case 'pending_payment': return '待买家付款';
      case 'pending_execution': return '待服务上门';
      case 'canceled': return '交易已取消';
      case 'abnormal': return '异常维权申诉';
      default: return '其他';
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
        return 'bg-rose-500/10 text-rose-600 border border-rose-500/20 animate-pulse';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.serviceName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' ? true : o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showCancelModal) return;

    onForceCancelOrder(showCancelModal, cancelReason);

    // Sync state in open drawer too
    if (selectedOrder && selectedOrder.id === showCancelModal) {
      setSelectedOrder({
        ...selectedOrder,
        status: 'canceled',
        cancelReason: cancelReason,
        steps: [
          ...selectedOrder.steps,
          { name: '平台治理中心强制退款关闭', time: new Date().toISOString().replace('T', ' ').slice(0, 19) }
        ]
      });
    }

    setShowCancelModal(null);
    showToastMsg('强制关闭该交易订单成功，款项正原路退还！', 'info');
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
        {/* Seek top controls */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
          
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-gray-500 dark:text-gray-400 text-xs font-bold flex items-center gap-1.5 mr-1">
              <ClipboardList className="w-4 h-4 text-primary" />
              订单状态筛选:
            </span>
            <div className="inline-flex rounded-xl bg-gray-50 dark:bg-gray-800 p-0.5 border border-gray-100 dark:border-gray-800/60">
              {(['all', 'pending_payment', 'pending_execution', 'completed', 'canceled', 'abnormal'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 font-semibold rounded-lg text-xs transition-all cursor-pointer border-none focus:outline-none ${
                    statusFilter === st
                      ? 'bg-white dark:bg-gray-700 text-primary shadow-sm font-bold'
                      : 'text-gray-400 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  {st === 'all' ? '总览' : st === 'pending_payment' ? '待付款' : st === 'pending_execution' ? '待服务' : st === 'completed' ? '已完成' : st === 'canceled' ? '已取消' : '异常单'}
                </button>
              ))}
            </div>

            {/* Seeking bar */}
            <div className="relative min-w-[260px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5 pointer-events-none" />
              <input
                type="text"
                placeholder="搜索订单编号、买家姓名、商家名称、服务名..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-xl font-medium text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
              />
            </div>
          </div>

          <div className="text-right text-[11px] text-gray-400 font-bold hidden md:block">
            系统当前托管交易总额：<span className="text-emerald-500 font-mono text-xs">¥{orders.reduce((acc, current) => acc + current.paymentPrice, 0).toFixed(2)}</span> 元
          </div>
        </div>

        {/* Tabular Lists display */}
        {isSearchingLoad ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 space-y-4 animate-pulse">
            {[1, 2, 3].map((v) => (
              <div key={v} className="flex justify-between items-center py-4 border-b border-gray-100 dark:border-gray-800 last:border-none">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-805 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-805 rounded w-1/4"></div>
                </div>
                <div className="h-8 bg-gray-200 dark:bg-gray-850 rounded w-20"></div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-805 shadow-sm p-16 text-center select-none flex flex-col items-center justify-center">
            <div className="p-4 bg-gray-50 dark:bg-gray-850 rounded-full mb-3 text-gray-400">
              <ClipboardList className="w-10 h-10 animate-bounce" />
            </div>
            <p className="text-base font-bold text-gray-850 dark:text-gray-100">暂无可匹配的托管担保交易单据</p>
            <p className="text-xs text-gray-400 mt-1">支持与顶部导航二级搜索框或异常申诉快捷联动透传</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-bento-card-bg/10 border-b border-gray-100 dark:border-gray-800 text-gray-500 font-bold text-[11px] uppercase tracking-wider select-none">
                    <th className="py-3.5 px-5">服务名称 / 订单项</th>
                    <th className="py-3.5 px-5">订单编号</th>
                    <th className="py-3.5 px-5">买/卖双向对象</th>
                    <th className="py-3.5 px-5">实付总价</th>
                    <th className="py-3.5 px-5">交易成立时刻</th>
                    <th className="py-3.5 px-5">状态</th>
                    <th className="py-3.5 px-5 text-right">操作管理</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 dark:text-white">
                  {filteredOrders.map((ord) => (
                    <tr
                      key={ord.id}
                      onClick={() => setSelectedOrder(ord)}
                      className={`hover:bg-gray-50 hover:bg-opacity-5 dark:hover:bg-gray-850 hover:scale-[1.002] transition-all cursor-pointer ${
                        ord.status === 'abnormal' ? 'bg-rose-500/5' : ''
                      }`}
                    >
                      {/* Service details */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl relative">
                            <ShoppingBag className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-bold text-xs text-gray-800 dark:text-gray-150 max-w-[170px] truncate">{ord.serviceName}</p>
                            <p className="text-[10px] text-gray-400 font-medium">预约时点: {ord.scheduleTime}</p>
                          </div>
                        </div>
                      </td>

                      {/* Order Code */}
                      <td className="py-4 px-5 font-mono text-xs font-bold text-gray-700 dark:text-gray-200">
                        {ord.id}
                      </td>

                      {/* Buyer and Seller info */}
                      <td className="py-4 px-5">
                        <div className="space-y-0.5">
                          <p className="text-xs text-gray-700 dark:text-gray-200 font-semibold flex items-center gap-1">
                            <span className="text-sky-500">买:</span>
                            {ord.buyerName}
                          </p>
                          <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold flex items-center gap-1">
                            <span className="text-amber-500">卖:</span>
                            {ord.sellerName}
                          </p>
                        </div>
                      </td>

                      {/* Real Pricing */}
                      <td className="py-4 px-5 font-mono text-xs font-bold text-rose-500">
                        ¥ {ord.paymentPrice.toFixed(2)}
                      </td>

                      {/* Build Time */}
                      <td className="py-4 px-5 font-mono text-[10px] text-gray-450 text-gray-450">
                        {ord.buildTime}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5 select-none">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${getStatusBadgeStyle(ord.status)}`}>
                          {getStatusLabelText(ord.status)}
                        </span>
                      </td>

                      {/* Cancel controller action list */}
                      <td className="py-4 px-5 text-right select-none" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2 text-xs font-bold">
                          {ord.status !== 'completed' && ord.status !== 'canceled' ? (
                            <button
                              onClick={() => setShowCancelModal(ord.id)}
                              className="bg-transparent border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer focus:outline-none flex items-center gap-1"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>退款强关</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="text-gray-400 hover:text-primary transition-colors cursor-pointer border-none bg-transparent p-0 focus:outline-none flex items-center gap-1"
                            >
                              <span>详情</span>
                              <ChevronRight className="w-4 h-4" />
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
        )}
      </motion.div>

      {/* Detail drawer overlay orders */}
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
                  <ClipboardList className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-bold">同城交易担保金托管详情</h3>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-850 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer border-none bg-transparent focus:outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 flex-grow font-sans">
                {/* Header overview status */}
                <div className="p-4 bg-gray-50/50 dark:bg-gray-850 rounded-2xl border border-gray-100 dark:border-gray-800 flex justify-between items-center select-none">
                  <div>
                    <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-widest">担保交易订单编码</span>
                    <span className="font-mono text-sm font-black text-gray-900 dark:text-white mt-0.5 block">{selectedOrder.id}</span>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-[10px] font-black ${getStatusBadgeStyle(selectedOrder.status)}`}>
                    {getStatusLabelText(selectedOrder.status)}
                  </span>
                </div>

                {/* Double sided cards details */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Buyer */}
                  <div className="p-4 bg-sky-500/5 border border-sky-100/10 rounded-2xl space-y-2 relative">
                    <span className="absolute top-3.5 right-3.5 text-[9px] font-bold text-sky-500 px-1.5 py-0.5 rounded bg-sky-500/10">买家端</span>
                    <h5 className="font-black text-xs text-gray-900 dark:text-white">{selectedOrder.buyerName}</h5>
                    <p className="text-[11px] text-gray-400 font-mono mt-1 flex items-center gap-1 select-all">
                      <Phone className="w-3 h-3 text-sky-500" />
                      {selectedOrder.buyerPhone}
                    </p>
                    <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      地址: {selectedOrder.buyerAddress}
                    </p>
                  </div>

                  {/* Seller */}
                  <div className="p-4 bg-amber-500/5 border border-amber-100/10 rounded-2xl space-y-2 relative">
                    <span className="absolute top-3.5 right-3.5 text-[9px] font-bold text-amber-500 px-1.5 py-0.5 rounded bg-amber-500/10">商家端</span>
                    <h5 className="font-black text-xs text-gray-900 dark:text-white">{selectedOrder.sellerName}</h5>
                    <p className="text-[11px] text-gray-400 font-mono mt-1 flex items-center gap-1 select-all">
                      <Phone className="w-3 h-3 text-amber-500" />
                      {selectedOrder.sellerPhone}
                    </p>
                    <p className="text-[10px] text-amber-500 flex items-center gap-0.5 mt-0.5 font-semibold">
                      <CircleDot className="w-3 h-3" />
                      好评等级: {selectedOrder.sellerRating}
                    </p>
                  </div>
                </div>

                {/* Sub details description */}
                <div className="space-y-4">
                  <div className="pb-3 border-b border-gray-100 dark:border-gray-800">
                    <span className="block text-[10px] text-gray-400 tracking-wider font-semibold uppercase select-none">约购的便民服务条款</span>
                    <h4 className="text-xs font-extrabold text-gray-800 dark:text-gray-150 mt-1">{selectedOrder.serviceName}</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4 select-all">
                    <div>
                      <span className="block text-[10px] text-gray-400 uppercase select-none">预约上门时段</span>
                      <p className="font-mono text-xs font-semibold text-gray-700 dark:text-gray-200 mt-1">{selectedOrder.scheduleTime}</p>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400 uppercase select-none">交易组建时间戳</span>
                      <p className="font-mono text-xs font-medium text-gray-700 dark:text-gray-300 mt-1">{selectedOrder.buildTime}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-500 font-semibold select-none">买家留言细节备注</span>
                    <p className="text-xs text-gray-600 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl whitespace-pre-wrap select-all border border-gray-100 dark:border-gray-850 leading-relaxed font-semibold">
                      {selectedOrder.remark || '（买家无额外订单留言备注）'}
                    </p>
                  </div>
                </div>

                {/* Timeline status track updates details */}
                <div className="space-y-3 p-4 bg-gray-50/50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-2xl select-text">
                  <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider select-none flex items-center gap-1 pb-1">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    物流及服务流控制轨迹
                  </h5>
                  <div className="relative pl-4 border-l border-indigo-250 border-indigo-500/20 space-y-4">
                    {selectedOrder.steps.map((step, index) => (
                      <div key={index} className="relative">
                        <div className="absolute -left-[20.5px] top-1 h-2 w-2 rounded-full border bg-white dark:bg-gray-900 border-indigo-500 flex items-center justify-center">
                          <div className="h-1 w-1 rounded-full bg-indigo-500" />
                        </div>
                        <p className="font-bold text-xs text-gray-800 dark:text-gray-100">{step.name}</p>
                        <p className="font-mono text-[9px] text-gray-400 mt-0.5">{step.time}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cost tables */}
                <div className="space-y-3 select-none">
                  <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 pt-1">
                    <Coins className="w-3.5 h-3.5 text-primary" />
                    官方托管资金账单流水
                  </h5>
                  <div className="bg-gray-50 dark:bg-gray-850 p-4 border border-gray-100 dark:border-gray-800 rounded-2xl space-y-2">
                    {selectedOrder.feeBreakdown.map((fee, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="text-gray-600 dark:text-gray-400 font-semibold">{fee.name}</span>
                        <span className={`font-mono font-bold ${fee.isDiscount ? 'text-emerald-500' : 'text-gray-700 dark:text-gray-250'}`}>
                          {fee.isDiscount ? '-' : ''}¥ {fee.value.toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 dark:border-gray-800 pt-2.5 mt-2.5 flex justify-between items-center text-sm">
                      <span className="font-bold text-gray-800 dark:text-gray-100">买家托管端最终实付：</span>
                      <span className="font-mono font-extrabold text-base text-rose-500 flex items-baseline">
                        ¥ {selectedOrder.paymentPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Canceled reason */}
                {selectedOrder.status === 'canceled' && selectedOrder.cancelReason && (
                  <div className="p-3 bg-rose-50/70 dark:bg-rose-950/25 border border-rose-100/50 text-rose-600 dark:text-rose-400 rounded-xl flex items-start gap-1.5 text-xs">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-bold">该款项已强制退还（交易关闭）</p>
                      <p className="mt-0.5 font-medium">原因: {selectedOrder.cancelReason}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Cancel actions drawer footer */}
              {selectedOrder.status !== 'completed' && selectedOrder.status !== 'canceled' && (
                <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky bottom-0 z-10 select-none">
                  <button
                    onClick={() => setShowCancelModal(selectedOrder.id)}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 font-bold text-white text-xs rounded-xl transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/10 active:scale-[0.98]"
                  >
                    <Ban className="w-4 h-4" />
                    <span>强制关单并打回托管保障金（退款）</span>
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Force cancellation modal dialog */}
      <AnimatePresence>
        {showCancelModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-[100]"
              onClick={() => setShowCancelModal(null)}
            />
            <div className="fixed inset-0 overflow-y-auto z-[105] flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-gray-900 max-w-sm w-full rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-2xl space-y-4 text-gray-800 dark:text-white"
              >
                <div className="flex items-center gap-2 select-none">
                  <div className="p-2 bg-rose-50 dark:bg-rose-950/30 text-rose-600 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-rose-600 animate-bounce" />
                  </div>
                  <h4 className="font-extrabold text-base">一键干预强制退款注销订单</h4>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed font-semibold">
                  注意：官方超管一键关单将会通过微信/支付宝托管网关将资金实时 100% 打回用户原支付卡中，双方服务中止，账务无法被回滚恢复！
                </p>

                <form onSubmit={handleCancelSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-gray-500 font-bold text-[9px] uppercase select-none">官方通告退款判定根源</label>
                    <select
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200/85 dark:border-gray-750 rounded-xl font-semibold text-xs focus:ring-1 focus:ring-primary outline-none cursor-pointer text-gray-800 dark:text-white"
                    >
                      <option value="买家/商家经平台友好协商人道退款">买家/商家经平台友好协商人道退款</option>
                      <option value="巡查判定服务商恶意欺诈拒绝提供服务">巡查判定服务商恶意欺诈拒绝提供服务</option>
                      <option value="用户由于突发特殊原因主动申请协商终止">用户由于突发特殊原因主动申请协商终止</option>
                      <option value="订单长时间待付款/待接单属于废除死单">订单长时间待付款/待接单属于废除死单</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-3 select-none">
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl cursor-pointer border-none shadow-md"
                    >
                      强制关款关闭
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCancelModal(null)}
                      className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-xs rounded-xl cursor-pointer transition-colors focus:outline-none"
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

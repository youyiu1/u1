/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, CheckCircle2, Info, MapPin, PlusCircle, Search, ShieldAlert, ShieldCheck, Star, Wrench, X } from 'lucide-react';
import { Service } from '../types';
import AdminToast from './common/AdminToast';
import UserSquareCard from './common/UserSquareCard';
import { useToast } from '../hooks/useToast';

type ServiceDraft = Pick<Service, 'title' | 'category' | 'providerName' | 'price' | 'unit' | 'status' | 'area' | 'phone' | 'description'>;
type ServiceStatusFilter = 'all' | 'pending' | 'active' | 'rejected';

interface ServiceManagementViewProps {
  services: Service[];
  onUpdateServiceStatus: (serviceId: string, status: 'pending' | 'active' | 'rejected', rejectReason?: string) => void;
  onAddNewService: (newSrv: ServiceDraft) => void;
  initialTabFilter?: string;
}

export default function ServiceManagementView({ services, onUpdateServiceStatus, onAddNewService, initialTabFilter }: ServiceManagementViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ServiceStatusFilter>('all');
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [selectedSrv, setSelectedSrv] = useState<Service | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('服务资质或内容不符合平台规范');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('家政清洁');
  const [newProvider, setNewProvider] = useState('社区服务商');
  const [newPrice, setNewPrice] = useState(60);
  const [newUnit, setNewUnit] = useState('/小时');
  const [newArea, setNewArea] = useState('全城服务');
  const [newPhone, setNewPhone] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const { toast, showToast: showToastMsg } = useToast();

  useEffect(() => {
    if (initialTabFilter === 'pending') setStatusFilter('pending');
  }, [initialTabFilter]);

  const filteredServices = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return services.filter((srv) => {
      const matchesSearch =
        !keyword ||
        srv.title.toLowerCase().includes(keyword) ||
        srv.providerName.toLowerCase().includes(keyword) ||
        srv.category.toLowerCase().includes(keyword) ||
        srv.id.toLowerCase().includes(keyword);
      const matchesStatus = statusFilter === 'all' || srv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [services, searchTerm, statusFilter]);

  const groupedByProvider = useMemo(() => {
    const map = new Map<string, Service[]>();
    filteredServices.forEach((srv) => {
      const key = srv.providerName || '未知用户';
      const current = map.get(key);
      if (current) current.push(srv);
      else map.set(key, [srv]);
    });
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [filteredServices]);

  const activeProviderGroup = useMemo(() => groupedByProvider.find(([name]) => name === activeProvider) || null, [groupedByProvider, activeProvider]);

  useEffect(() => {
    if (activeProvider && !activeProviderGroup) setActiveProvider(null);
  }, [activeProvider, activeProviderGroup]);

  const providerServices = activeProviderGroup?.[1] || [];
  const getProviderTag = (items: Service[]) => items.find((item) => item.providerTag?.trim())?.providerTag || '未设置身份标签';
  const getProviderAvatar = (items: Service[]) => items.find((item) => item.providerAvatar)?.providerAvatar;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/10">已上架</span>;
      case 'pending': return <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/10">待审核</span>;
      case 'rejected': return <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/10">已拒绝</span>;
      default: return null;
    }
  };

  const handleApprove = (id: string) => {
    onUpdateServiceStatus(id, 'active');
    if (selectedSrv?.id === id) setSelectedSrv({ ...selectedSrv, status: 'active' });
    showToastMsg('服务已上架', 'success');
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRejectModal) return;
    onUpdateServiceStatus(showRejectModal, 'rejected', rejectReason);
    if (selectedSrv?.id === showRejectModal) setSelectedSrv({ ...selectedSrv, status: 'rejected', rejectReason });
    setShowRejectModal(null);
    showToastMsg('服务已下架', 'info');
  };

  const handleAddNewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddNewService({ title: newTitle, category: newCategory, providerName: newProvider, price: newPrice, unit: newUnit, status: 'pending', area: newArea, phone: newPhone, description: newDesc });
    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);
    showToastMsg('服务已录入，等待审核', 'success');
  };

  return (
    <div className="relative space-y-6">
      <AdminToast toast={toast} />

      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'pending', 'active', 'rejected'] as const).map((status) => (
            <button key={status} onClick={() => setStatusFilter(status)} className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border-none cursor-pointer ${statusFilter === status ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-300'}`}>
              {status === 'all' ? '全部' : status === 'pending' ? '待审核' : status === 'active' ? '已上架' : '已拒绝'}
            </button>
          ))}
          {activeProvider && <button onClick={() => { setActiveProvider(null); setSelectedSrv(null); }} className="ml-auto text-[10px] px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">返回用户列表</button>}
          <button onClick={() => setShowAddModal(true)} className="text-[10px] px-2 py-1 rounded-md bg-primary text-white flex items-center gap-1"><PlusCircle className="w-3 h-3" />新增服务</button>
        </div>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input type="text" placeholder="搜索服务、商家、分类或ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-xl text-xs outline-none dark:text-white" />
        </div>
      </div>

      {filteredServices.length === 0 ? (
        <EmptyState text="暂无匹配服务" />
      ) : !activeProvider ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-2.5">
          {groupedByProvider.map(([providerName, items]) => (
            <UserSquareCard key={providerName} title={providerName} userType={getProviderTag(items)} subtitle={`${items.length} 项服务`} avatar={getProviderAvatar(items)} buttonLabel="查看服务" onClick={() => setActiveProvider(providerName)} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 px-2.5 py-1.5">
            <button onClick={() => setActiveProvider(null)} className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 shrink-0">返回用户列表</button>
            <div><p className="text-[11px] font-bold text-gray-800 dark:text-gray-100">{activeProviderGroup?.[0]}</p><p className="text-[10px] text-gray-400">{providerServices.length} 项服务</p></div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-slate-600 dark:text-slate-350">
                <thead><tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold border-b border-slate-200/60 dark:border-slate-800/60"><th className="p-4">服务</th><th className="p-4">分类/区域</th><th className="p-4">价格</th><th className="p-4">评分</th><th className="p-4">状态</th><th className="p-4 text-right">操作</th></tr></thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 dark:text-white">
                  {providerServices.map((srv) => (
                    <tr key={srv.id} onClick={() => setSelectedSrv(srv)} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer">
                      <td className="p-4"><div className="flex items-center gap-3"><Wrench className="w-4 h-4 text-primary" /><div><p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[240px]">{srv.title}</p><p className="text-[10px] text-slate-400 font-mono">{srv.id}</p></div></div></td>
                      <td className="p-4 text-xs"><p>{srv.category}</p><p className="text-[10px] text-slate-400">{srv.area}</p></td>
                      <td className="p-4 text-xs font-bold text-rose-500">¥{Number(srv.price).toFixed(2)}<span className="text-[10px] text-gray-400 ml-0.5">{srv.unit}</span></td>
                      <td className="p-4 text-xs"><span className="inline-flex items-center gap-1"><Star className="w-3 h-3 fill-amber-500 text-amber-500" />{srv.rating}</span></td>
                      <td className="p-4">{getStatusBadge(srv.status)}</td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}><button onClick={() => setSelectedSrv(srv)} className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">详情</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedSrv && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setSelectedSrv(null)} className="fixed inset-0 bg-black/60 z-45" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 240 }} className="fixed top-0 right-0 h-full w-full max-w-lg bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800 shadow-2xl z-50 overflow-y-auto flex flex-col text-gray-800 dark:text-white">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-10"><div className="flex items-center gap-2"><Wrench className="w-4 h-4 text-primary" /><h3 className="text-sm font-bold">服务详情</h3></div><button onClick={() => setSelectedSrv(null)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 border-none bg-transparent"><X className="w-4 h-4" /></button></div>
              <div className="p-4 space-y-4 text-xs">
                <div className="flex items-center justify-between"><div><h4 className="text-base font-black text-gray-900 dark:text-white">{selectedSrv.title}</h4><p className="mt-1 text-[10px] text-gray-400 font-mono">{selectedSrv.id}</p></div>{getStatusBadge(selectedSrv.status)}</div>
                <div className="flex items-center gap-3 rounded-xl border border-gray-100 dark:border-gray-800 p-3 bg-gray-50/40 dark:bg-gray-800/20"><img src={selectedSrv.providerAvatar} alt={selectedSrv.providerName} className="w-11 h-11 rounded-full object-cover border border-gray-200 dark:border-gray-700" /><div><p className="font-bold flex items-center gap-1">{selectedSrv.providerName}{selectedSrv.isVerifiedProvider && <ShieldCheck className="w-3.5 h-3.5 text-primary" />}</p><p className="text-[10px] text-gray-400 mt-1">{selectedSrv.providerTag || '未设置身份标签'}</p></div></div>
                <div className="grid grid-cols-2 gap-2"><InfoCard label="分类" value={selectedSrv.category} /><InfoCard label="价格" value={`¥${Number(selectedSrv.price).toFixed(2)}${selectedSrv.unit}`} /><InfoCard label="评分" value={`${selectedSrv.rating} (${selectedSrv.reviewCount}评)`} /><InfoCard label="电话" value={selectedSrv.phone || '-'} /><InfoCard label="区域" value={selectedSrv.area || '-'} /><InfoCard label="状态" value={selectedSrv.status} /></div>
                <div className="rounded-xl border border-gray-100 dark:border-gray-800 p-3"><p className="text-gray-400">服务描述</p><p className="mt-2 leading-5 whitespace-pre-wrap">{selectedSrv.description || '暂无描述'}</p></div>
                <div className="rounded-xl border border-gray-100 dark:border-gray-800 p-3 bg-gray-50/40 dark:bg-gray-800/20"><p className="text-gray-400 flex items-center gap-1"><MapPin className="w-3 h-3" />覆盖区域</p><p className="mt-2">{selectedSrv.area || '未设置'}</p></div>
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 sticky bottom-0 bg-white dark:bg-gray-900 flex gap-2">
                <button onClick={() => handleApprove(selectedSrv.id)} className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg border-none flex items-center justify-center gap-1"><Check className="w-4 h-4" />上架</button>
                <button onClick={() => setShowRejectModal(selectedSrv.id)} className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg border-none">下架/拒绝</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black z-[100]" onClick={() => setShowAddModal(false)} />
            <div className="fixed inset-0 z-[105] flex items-center justify-center p-4"><motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-gray-900 max-w-md w-full rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-2xl space-y-4 text-gray-800 dark:text-white"><h4 className="font-bold text-sm">新增服务</h4><form onSubmit={handleAddNewSubmit} className="space-y-3 text-xs"><input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="服务标题" className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none" required /><div className="grid grid-cols-2 gap-2"><input value={newProvider} onChange={(e) => setNewProvider(e.target.value)} placeholder="服务商" className="p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none" /><input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="电话" className="p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none" /><input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="分类" className="p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none" /><input type="number" value={newPrice} onChange={(e) => setNewPrice(Number(e.target.value))} placeholder="价格" className="p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none" /></div><input value={newUnit} onChange={(e) => setNewUnit(e.target.value)} placeholder="单位" className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none" /><input value={newArea} onChange={(e) => setNewArea(e.target.value)} placeholder="服务区域" className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none" /><textarea rows={3} value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="服务描述" className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none" /><div className="flex gap-2"><button type="submit" className="flex-1 py-2 bg-primary text-white font-semibold text-xs rounded-lg border-none">保存</button><button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold text-xs rounded-lg border-none">取消</button></div></form></motion.div></div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRejectModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black z-[100]" onClick={() => setShowRejectModal(null)} />
            <div className="fixed inset-0 z-[105] flex items-center justify-center p-4"><motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-gray-900 max-w-sm w-full rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-2xl space-y-4 text-gray-800 dark:text-white"><h4 className="font-bold text-sm">确认下架服务？</h4><form onSubmit={handleRejectSubmit} className="space-y-3"><textarea rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs outline-none" /><div className="flex gap-2"><button type="submit" className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg border-none">确认</button><button type="button" onClick={() => setShowRejectModal(null)} className="flex-1 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold text-xs rounded-lg border-none">取消</button></div></form></motion.div></div>
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

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Check,
  Gavel,
  Info,
  MapPin,
  Phone,
  PlusCircle,
  RotateCcw,
  ShieldCheck,
  Star,
  Wrench,
  X,
} from 'lucide-react';
import { Service } from '../types';
import { getPrimaryImage } from '../utils/images';
import { groupItemsByOwner, type EntityOwnerGroup } from '../utils/entityGrouping';
import { matchesAnyKeyword, normalizeSearchTerm } from '../utils/search';
import AdminToast from './common/AdminToast';
import AdminBackButton from './common/AdminBackButton';
import AdminFilterPills from './common/AdminFilterPills';
import AdminGroupHeader from './common/AdminGroupHeader';
import AdminInfoCard from './common/AdminInfoCard';
import AdminSearchInput from './common/AdminSearchInput';
import AdminStatusBadge, { serviceStatusMap } from './common/AdminStatusBadge';
import EmptyState from './common/EmptyState';
import UserSquareCard from './common/UserSquareCard';
import { useToast } from '../hooks/useToast';

type ServiceDraft = Pick<Service, 'title' | 'category' | 'providerName' | 'price' | 'unit' | 'status' | 'area' | 'phone' | 'description'>;
type ServiceStatusFilter = 'all' | 'pending' | 'active' | 'rejected';

type ProviderGroup = EntityOwnerGroup<Service>;

const SERVICE_FILTER_OPTIONS: { value: ServiceStatusFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待审核' },
  { value: 'active', label: '已上架' },
  { value: 'rejected', label: '已下架' },
];

const ROW_ACTION_CLASSNAME = 'text-[10px] px-2 py-0.5 rounded-md';
const PANEL_ACTION_CLASSNAME = 'px-4 py-2.5 text-xs font-bold rounded-xl transition-all';

interface ServiceManagementViewProps {
  services: Service[];
  onUpdateServiceStatus: (serviceId: string, status: 'pending' | 'active' | 'rejected', rejectReason?: string) => void;
  onAddNewService: (newSrv: ServiceDraft) => void;
  initialTabFilter?: string;
}

export default function ServiceManagementView({ services, onUpdateServiceStatus, onAddNewService, initialTabFilter }: ServiceManagementViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ServiceStatusFilter>('all');
  const [activeProviderId, setActiveProviderId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
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
    const keyword = normalizeSearchTerm(searchTerm);
    return services.filter((srv) => {
      const matchesSearch = matchesAnyKeyword(keyword, [
        srv.title,
        srv.providerName,
        srv.category,
        srv.id,
      ]);
      const matchesStatus = statusFilter === 'all' || srv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [services, searchTerm, statusFilter]);

  const groupedByProvider = useMemo<ProviderGroup[]>(() => {
    return groupItemsByOwner<Service>(filteredServices, {
      getId: (item) => item.providerId,
      getName: (item) => item.providerName,
      getAvatar: (item) => getPrimaryImage(item.providerAvatar),
      getTag: (item) => item.providerTag,
      fallbackName: '未知服务商',
    });
  }, [filteredServices]);

  const activeProviderGroup = useMemo(
    () => groupedByProvider.find((provider) => provider.id === activeProviderId) || null,
    [groupedByProvider, activeProviderId]
  );

  useEffect(() => {
    if (activeProviderId && !activeProviderGroup) setActiveProviderId(null);
  }, [activeProviderId, activeProviderGroup]);

  useEffect(() => {
    setSelectedService(null);
  }, [activeProviderId, statusFilter, searchTerm]);

  useEffect(() => {
    if (!selectedService) return;
    const nextService = services.find((item) => item.id === selectedService.id);
    if (nextService) {
      setSelectedService(nextService);
    }
  }, [services, selectedService]);

  const providerServices = activeProviderGroup?.items || [];
  const selectService = (service: Service) => setSelectedService(service);

  const handleApprove = (id: string) => {
    onUpdateServiceStatus(id, 'active');
    setSelectedService((current) => (current?.id === id ? { ...current, status: 'active', rejectReason: undefined } : current));
    showToastMsg('服务已上架', 'success');
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRejectModal) return;
    onUpdateServiceStatus(showRejectModal, 'rejected', rejectReason);
    setSelectedService((current) =>
      current?.id === showRejectModal ? { ...current, status: 'rejected', rejectReason } : current
    );
    setShowRejectModal(null);
    showToastMsg('服务已下架', 'info');
  };

  const handleAddNewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddNewService({
      title: newTitle,
      category: newCategory,
      providerName: newProvider,
      price: newPrice,
      unit: newUnit,
      status: 'pending',
      area: newArea,
      phone: newPhone,
      description: newDesc,
    });
    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);
    showToastMsg('服务已录入，等待审核', 'success');
  };

  const renderRowActionButton = ({
    onClick,
    disabled = false,
    label,
    activeClassName,
    disabledClassName,
  }: {
    onClick: () => void;
    disabled?: boolean;
    label: string;
    activeClassName: string;
    disabledClassName: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${ROW_ACTION_CLASSNAME} ${disabled ? disabledClassName : activeClassName}`}
    >
      {label}
    </button>
  );

  const renderPanelActionButton = ({
    onClick,
    disabled = false,
    icon,
    label,
    activeClassName,
    disabledClassName,
  }: {
    onClick: () => void;
    disabled?: boolean;
    icon?: React.ReactNode;
    label: string;
    activeClassName: string;
    disabledClassName: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${PANEL_ACTION_CLASSNAME} ${disabled ? disabledClassName : activeClassName}`}
    >
      <span className="flex items-center gap-1">
        {icon}
        {label}
      </span>
    </button>
  );

  return (
    <div className="relative space-y-6">
      <AdminToast toast={toast} />

      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <AdminFilterPills
            options={SERVICE_FILTER_OPTIONS}
            activeValue={statusFilter}
            onChange={setStatusFilter}
          />
          {activeProviderId && (
            <AdminBackButton
              onClick={() => {
                setActiveProviderId(null);
                setSelectedService(null);
              }}
              label="返回服务商列表"
              className="ml-auto text-[10px] px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
            />
          )}
          <button onClick={() => setShowAddModal(true)} className="text-[10px] px-2 py-1 rounded-md bg-primary text-white flex items-center gap-1">
            <PlusCircle className="w-3 h-3" />
            新增服务
          </button>
        </div>
        <AdminSearchInput value={searchTerm} placeholder="搜索服务、商家、分类或ID..." onChange={setSearchTerm} />
      </div>

      {filteredServices.length === 0 ? (
        <EmptyState text="暂无匹配服务" />
      ) : !activeProviderId ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-2.5">
          {groupedByProvider.map((provider) => (
            <UserSquareCard
              key={provider.id}
              title={provider.name}
              userType={provider.tag}
              subtitle={`${provider.items.length} 项服务`}
              avatar={provider.avatar}
              buttonLabel="查看服务"
              onClick={() => setActiveProviderId(provider.id)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <AdminGroupHeader
            backLabel="返回服务商列表"
            onBack={() => setActiveProviderId(null)}
            title={activeProviderGroup?.name}
            subtitle={`${providerServices.length} 项服务`}
            avatar={activeProviderGroup?.avatar}
          />

          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-slate-600 dark:text-slate-350">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold border-b border-slate-200/60 dark:border-slate-800/60">
                    <th className="p-4">服务</th>
                    <th className="p-4">分类/区域</th>
                    <th className="p-4">价格</th>
                    <th className="p-4">评分</th>
                    <th className="p-4">状态</th>
                    <th className="p-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 dark:text-white">
                  {providerServices.map((srv) => (
                    <tr
                      key={srv.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer ${selectedService?.id === srv.id ? 'bg-slate-50 dark:bg-slate-800/30' : ''}`}
                      onClick={() => selectService(srv)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[240px]">{srv.title}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{srv.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-xs">
                        <p>{srv.category}</p>
                        <p className="text-[10px] text-slate-400">{srv.area || '-'}</p>
                      </td>
                      <td className="p-4 text-xs font-bold text-rose-500">
                        ¥{Number(srv.price).toFixed(2)}
                        <span className="text-[10px] text-gray-400 ml-0.5">{srv.unit}</span>
                      </td>
                      <td className="p-4 text-xs">
                        <span className="inline-flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {srv.rating}
                        </span>
                      </td>
                      <td className="p-4"><AdminStatusBadge status={srv.status} statusMap={serviceStatusMap} /></td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {renderRowActionButton({
                            onClick: () => selectService(srv),
                            label: '详情',
                            activeClassName: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200',
                            disabledClassName: '',
                          })}
                          {renderRowActionButton({
                            onClick: () => handleApprove(srv.id),
                            disabled: srv.status === 'active',
                            label: '上架',
                            activeClassName: 'bg-emerald-600 text-white',
                            disabledClassName: 'bg-emerald-100/60 text-emerald-400 cursor-not-allowed',
                          })}
                          {renderRowActionButton({
                            onClick: () => setShowRejectModal(srv.id),
                            disabled: srv.status === 'rejected',
                            label: '下架',
                            activeClassName: 'bg-rose-600 text-white',
                            disabledClassName: 'bg-rose-100/60 text-rose-300 cursor-not-allowed',
                          })}
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
        {selectedService && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
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
                  <h3 className="text-base font-bold">生活服务详情</h3>
                </div>
                <button
                  onClick={() => setSelectedService(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800/85 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer border-none bg-transparent focus:outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-6 flex-grow">
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-6 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Wrench className="w-8 h-8" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <AdminStatusBadge status={selectedService.status} statusMap={serviceStatusMap} />
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-primary/10 text-primary font-bold text-[10px] border border-primary/20">
                        {selectedService.category}
                      </span>
                    </div>
                    <h4 className="text-lg font-black text-gray-900 dark:text-white mt-2 leading-normal">{selectedService.title}</h4>
                    <p className="font-mono text-xl text-rose-500 dark:text-rose-400 font-extrabold mt-1.5 flex items-baseline leading-none">
                      <span className="text-xs font-semibold mr-0.5">¥</span>
                      {Number(selectedService.price).toFixed(2)}
                      <span className="text-xs text-gray-400 ml-1">{selectedService.unit}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800/50 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {getPrimaryImage(selectedService.providerAvatar) ? (
                      <img
                        src={getPrimaryImage(selectedService.providerAvatar)}
                        alt={selectedService.providerName}
                        className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-sm font-bold text-gray-500">
                        {selectedService.providerName.slice(0, 1)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate flex items-center gap-1.5">
                        服务商：{selectedService.providerName}
                        {selectedService.isVerifiedProvider ? <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" /> : null}
                      </h4>
                      <p className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold mt-0.5 truncate">{selectedService.providerTag || '未设置身份标签'}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-gray-400">评分</p>
                    <p className="text-sm font-bold text-amber-500 flex items-center gap-1 justify-end">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {selectedService.rating}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <AdminInfoCard label="服务商" value={selectedService.providerName} />
                  <AdminInfoCard label="身份标签" value={selectedService.providerTag || '未设置'} />
                  <AdminInfoCard label="分类" value={selectedService.category} />
                  <AdminInfoCard label="价格" value={`¥${Number(selectedService.price).toFixed(2)}${selectedService.unit}`} />
                  <AdminInfoCard label="服务区域" value={selectedService.area || '-'} />
                  <AdminInfoCard label="创建时间" value={selectedService.time || '-'} />
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-4 bg-gray-50/50 dark:bg-gray-800/20">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">服务描述</p>
                    <p className="mt-2 text-sm leading-6 whitespace-pre-wrap">{selectedService.description || '暂无描述'}</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-4 text-xs text-slate-600 dark:text-slate-300 space-y-2">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      覆盖区域：{selectedService.area || '未设置'}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-primary" />
                      联系电话：{selectedService.phone || '未提供'}
                    </p>
                    <p>服务编号：{selectedService.id}</p>
                    <p>累计评价：{selectedService.reviewCount} 条</p>
                    {selectedService.rejectReason ? <p className="text-rose-500">下架原因：{selectedService.rejectReason}</p> : null}
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 gap-2 flex justify-end sticky bottom-0 z-10">
                {renderPanelActionButton({
                  onClick: () => handleApprove(selectedService.id),
                  disabled: selectedService.status === 'active',
                  icon: <Check className="w-3.5 h-3.5" />,
                  label: '上架',
                  activeClassName: 'border-none bg-emerald-600 hover:bg-emerald-700 text-white',
                  disabledClassName: 'border-none bg-emerald-100/60 text-emerald-400 cursor-not-allowed',
                })}
                {renderPanelActionButton({
                  onClick: () => setShowRejectModal(selectedService.id),
                  disabled: selectedService.status === 'rejected',
                  icon: <Gavel className="w-3.5 h-3.5" />,
                  label: '下架',
                  activeClassName: 'border-none bg-rose-600 hover:bg-rose-700 text-white',
                  disabledClassName: 'border-none bg-rose-100/60 text-rose-300 cursor-not-allowed',
                })}
                {selectedService.status === 'rejected' ? (
                  renderPanelActionButton({
                    onClick: () => handleApprove(selectedService.id),
                    icon: <RotateCcw className="w-3.5 h-3.5" />,
                    label: '重新上架',
                    activeClassName: 'border-none bg-primary hover:bg-primary/90 text-white',
                    disabledClassName: '',
                  })
                ) : null}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black z-[100]" onClick={() => setShowAddModal(false)} />
            <div className="fixed inset-0 z-[105] flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-gray-900 max-w-md w-full rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-2xl space-y-4 text-gray-800 dark:text-white"
              >
                <h4 className="font-bold text-sm">新增服务</h4>
                <form onSubmit={handleAddNewSubmit} className="space-y-3 text-xs">
                  <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="服务标题" className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none" required />
                  <div className="grid grid-cols-2 gap-2">
                    <input value={newProvider} onChange={(e) => setNewProvider(e.target.value)} placeholder="服务商" className="p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none" />
                    <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="电话" className="p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none" />
                    <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="分类" className="p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none" />
                    <input type="number" value={newPrice} onChange={(e) => setNewPrice(Number(e.target.value))} placeholder="价格" className="p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none" />
                  </div>
                  <input value={newUnit} onChange={(e) => setNewUnit(e.target.value)} placeholder="单位" className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none" />
                  <input value={newArea} onChange={(e) => setNewArea(e.target.value)} placeholder="服务区域" className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none" />
                  <textarea rows={3} value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="服务描述" className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none" />
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 py-2 bg-primary text-white font-semibold text-xs rounded-lg border-none">保存</button>
                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold text-xs rounded-lg border-none">取消</button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRejectModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black z-[100]" onClick={() => setShowRejectModal(null)} />
            <div className="fixed inset-0 z-[105] flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-gray-900 max-w-sm w-full rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-2xl space-y-4 text-gray-800 dark:text-white"
              >
                <h4 className="font-bold text-sm">确认下架服务？</h4>
                <form onSubmit={handleRejectSubmit} className="space-y-3">
                  <textarea rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs outline-none" />
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg border-none">确认</button>
                    <button type="button" onClick={() => setShowRejectModal(null)} className="flex-1 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold text-xs rounded-lg border-none">取消</button>
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

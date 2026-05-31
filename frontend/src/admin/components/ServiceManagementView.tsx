/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wrench, 
  Search, 
  PlusCircle, 
  RotateCcw, 
  Check, 
  X, 
  Star, 
  ShieldCheck, 
  AlertCircle, 
  Compass, 
  Trash2, 
  User, 
  MapPin, 
  Phone, 
  ShieldAlert, 
  DollarSign, 
  Calendar, 
  ChevronRight,
  Gavel,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { Service } from '../types';
import AdminToast from './common/AdminToast';
import { useDelayedBusy } from '../hooks/useDelayedBusy';
import { useToast } from '../hooks/useToast';

type ServiceDraft = Pick<Service, 'title' | 'category' | 'providerName' | 'price' | 'unit' | 'status' | 'area' | 'phone' | 'description'>;

interface ServiceManagementViewProps {
  services: Service[];
  onUpdateServiceStatus: (serviceId: string, status: 'pending' | 'active' | 'rejected', rejectReason?: string) => void;
  onAddNewService: (newSrv: ServiceDraft) => void;
  initialTabFilter?: string;
}

export default function ServiceManagementView({
  services,
  onUpdateServiceStatus,
  onAddNewService,
  initialTabFilter
}: ServiceManagementViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'rejected'>('all');

  // External trigger (such as dashboard summary tiles linking with filter)
  useEffect(() => {
    if (initialTabFilter === 'pending') {
      setStatusFilter('pending');
    }
  }, [initialTabFilter]);

  // Modal / Drawer visibility state indicators
  const [selectedSrv, setSelectedSrv] = useState<Service | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('服务商资质不合规或刊登内容包含敏感引流文字');

  // Add service modal form states
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('家政清洁 / 暖通保洁');
  const [newProvider, setNewProvider] = useState('张小区服务商');
  const [newPrice, setNewPrice] = useState(60);
  const [newUnit, setNewUnit] = useState('/小时');
  const [newArea, setNewArea] = useState('全市常态化服务小区');
  const [newPhone, setNewPhone] = useState('13955684423');
  const [newDesc, setNewDesc] = useState('');

  const { toast, showToast: showToastMsg } = useToast();
  const isSearchingLoad = useDelayedBusy([searchTerm, statusFilter], 300);

  const filteredServices = services.filter((srv) => {
    const matchesSearch =
      srv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      srv.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      srv.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      srv.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' ? true : srv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/10">已上架在售</span>;
      case 'pending':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/10">超管待审核</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/10">拒绝并停用</span>;
      default:
        return null;
    }
  };

  const handleApprove = (id: string) => {
    onUpdateServiceStatus(id, 'active');
    if (selectedSrv && selectedSrv.id === id) {
      setSelectedSrv({ ...selectedSrv, status: 'active' });
    }
    showToastMsg('该便民服务信息已通过安全自研审核推荐！', 'success');
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRejectModal) return;
    onUpdateServiceStatus(showRejectModal, 'rejected', rejectReason);

    if (selectedSrv && selectedSrv.id === showRejectModal) {
      setSelectedSrv({ ...selectedSrv, status: 'rejected', rejectReason });
    }

    setShowRejectModal(null);
    showToastMsg('已拒绝此项服务上架至客户端大厅。', 'info');
  };

  const handleAddNewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newSrvObj: ServiceDraft = {
      title: newTitle,
      category: newCategory,
      providerName: newProvider,
      price: newPrice,
      unit: newUnit,
      status: 'pending',
      area: newArea,
      phone: newPhone,
      description: newDesc,
    };

    onAddNewService(newSrvObj);

    // Reset controls
    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);
    showToastMsg('新优质服务刊登录入成功！现已入驻待审流程。', 'success');
  };

  return (
    <div className="relative">
      <AdminToast toast={toast} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-6"
      >
        {/* Seek Filtering panel */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Status indicators */}
            <span className="text-gray-500 dark:text-gray-400 text-xs font-bold mr-1 flex items-center gap-1 select-none">
              <Compass className="w-4 h-4 text-primary" />
              刊登状态筛选:
            </span>
            <div className="inline-flex rounded-xl bg-gray-50 dark:bg-gray-800 p-0.5 border border-gray-100 dark:border-gray-800/60 select-none">
              {(['all', 'pending', 'active', 'rejected'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 font-semibold rounded-lg text-xs transition-all cursor-pointer border-none focus:outline-none ${
                    statusFilter === st
                      ? 'bg-white dark:bg-gray-700 text-primary shadow-sm font-bold'
                      : 'text-gray-400 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  {st === 'all' ? '全部项目' : st === 'pending' ? '安全审核' : st === 'active' ? '正常展出' : '不予通过'}
                </button>
              ))}
            </div>

            {/* Input seeker info */}
            <div className="relative min-w-[260px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5 pointer-events-none" />
              <input
                type="text"
                placeholder="搜索同城服务名称、细分类别、服务匠人..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-xl font-medium text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
              />
            </div>
          </div>

          {/* Add service launcher */}
          <div className="text-right select-none">
            <button
              onClick={() => setShowAddModal(true)}
              className="py-2.5 px-4 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary-container shadow-md shadow-primary/10 cursor-pointer transition-all flex items-center justify-center gap-1 w-full md:w-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>快速登记录入直营服务</span>
            </button>
          </div>
        </div>

        {/* Database records list displays */}
        {isSearchingLoad ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 space-y-4 animate-pulse">
            {[1, 2, 3].map((v) => (
              <div key={v} className="flex justify-between items-center py-4 border-b border-gray-100 dark:border-gray-800 last:border-none">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-205 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-205 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
                </div>
                <div className="h-8 bg-gray-205 bg-gray-200 dark:bg-gray-800 rounded w-20"></div>
              </div>
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-16 text-center select-none flex flex-col items-center justify-center">
            <div className="p-4 bg-gray-50 dark:bg-gray-850 rounded-full mb-3 text-gray-400">
              <Wrench className="w-10 h-10 animate-bounce" />
            </div>
            <p className="text-base font-bold text-gray-800 dark:text-gray-100">该安全分类内尚无可刊登的便民服务</p>
            <p className="text-xs text-gray-400 mt-1.5">您可以在右上方自主拟写并登记一项直营服务项目</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            {/* Desktop items table view */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-bento-card-bg/10 border-b border-gray-100 dark:border-gray-800 text-gray-500 font-bold text-[11px] uppercase tracking-wider select-none">
                    <th className="py-3.5 px-5">服务匠人 / 主线供给者</th>
                    <th className="py-3.5 px-5">服务项目标题</th>
                    <th className="py-3.5 px-5">大类目组</th>
                    <th className="py-3.5 px-5">参考定价(区间价)</th>
                    <th className="py-3.5 px-5">综合评级</th>
                    <th className="py-3.5 px-5">状态</th>
                    <th className="py-3.5 px-5 text-right">操作管理</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 dark:text-white">
                  {filteredServices.map((srv) => (
                    <tr
                      key={srv.id}
                      onClick={() => setSelectedSrv(srv)}
                      className={`hover:bg-gray-50 hover:bg-opacity-5 dark:hover:bg-gray-850 hover:scale-[1.002] transition-all cursor-pointer ${
                        srv.status === 'rejected' ? 'bg-rose-50/5 dark:bg-rose-950/5' : ''
                      }`}
                    >
                      {/* Provider name info */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={srv.providerAvatar}
                            alt="avatar"
                            className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnptQFBS0zmjRhJeXxO1tHXMbz6Ex3j_HEvwrbqg6pNEET__9uPNpn6R4yRYqU7myyNC9MXf1342qtpuqlY-NybWk4FaIugm_YpZ6DwahAH1PtmplMsFv0hL9a_KqEUDIcjLn_uI5ebIm-i7yqvEWAEO-zv0MewXlVvZAV9bmegFJ-DmmZRzKN6LUemTCVRsnMWL4QolbPUVn-TqgndXXDRrB1MF4Yy7sFAJcXcDp-04nzw8nFXlq4JxZzOOsVs5PtI4s2Yz-5lW_N';
                            }}
                          />
                          <div>
                            <p className="font-bold text-xs flex items-center gap-1 text-gray-800 dark:text-gray-100">
                              {srv.providerName}
                              {srv.isVerifiedProvider && (
                                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                              )}
                            </p>
                            <p className="font-mono text-[9px] text-gray-400 mt-0.5">{srv.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Service item title */}
                      <td className="py-4 px-5 font-bold text-xs text-gray-800 dark:text-gray-200 max-w-[200px] truncate">
                        {srv.title}
                      </td>

                      {/* Category tag */}
                      <td className="py-4 px-5 text-xs text-gray-600 dark:text-gray-300 font-semibold">
                        {srv.category}
                      </td>

                      {/* Price / pricing unit */}
                      <td className="py-4 px-5 font-mono text-xs font-bold text-rose-500 dark:text-rose-400">
                        ¥ {srv.price.toFixed(2)}
                        <span className="text-[10px] text-gray-400 ml-0.5 font-sans font-medium">{srv.unit}</span>
                      </td>

                      {/* Provider rates */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1 select-none">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span className="font-mono font-bold text-xs text-gray-700 dark:text-gray-200">{srv.rating}</span>
                          <span className="text-[9px] text-gray-400">({srv.reviewCount}人评)</span>
                        </div>
                      </td>

                      {/* Status badge */}
                      <td className="py-4 px-5 select-none">
                        {getStatusBadge(srv.status)}
                      </td>

                      {/* Quick action controls panel */}
                      <td className="py-4 px-5 text-right select-none" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1.5 justify-end">
                          {srv.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleApprove(srv.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-xl transition-all cursor-pointer focus:outline-none flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>上架</span>
                              </button>
                              <button
                                onClick={() => setShowRejectModal(srv.id)}
                                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-xl transition-all cursor-pointer focus:outline-none flex items-center gap-1"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>拒绝</span>
                              </button>
                            </>
                          ) : srv.status === 'rejected' ? (
                            <button
                              onClick={() => handleApprove(srv.id)}
                              className="border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 font-bold text-[10px] px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer focus:outline-none"
                            >
                              恢复上架
                            </button>
                          ) : (
                            <button
                              onClick={() => setShowRejectModal(srv.id)}
                              className="border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-bold text-[10px] px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer focus:outline-none"
                            >
                              责令下架
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

      {/* Detail drawer overlay services */}
      <AnimatePresence>
        {selectedSrv && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSrv(null)}
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
                  <Wrench className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-bold">便民生活服务多项监管详情</h3>
                </div>
                <button
                  onClick={() => setSelectedSrv(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800/85 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer border-none bg-transparent focus:outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body lists */}
              <div className="p-6 space-y-6 flex-grow">
                {/* Status indicator banner and specs */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800/50">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedSrv.providerAvatar}
                      alt="avatar"
                      className="w-12 h-12 rounded-full object-cover border border-gray-205 dark:border-gray-700"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1">
                        {selectedSrv.providerName}
                        {selectedSrv.isVerifiedProvider && <ShieldCheck className="w-4 h-4 text-primary" />}
                      </h4>
                      <p className="font-mono text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-primary" />
                        提供商热线: {selectedSrv.phone}
                      </p>
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(selectedSrv.status)}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-1.5 select-none text-[10px] font-mono text-gray-400 uppercase">
                    <span className="px-2 py-0.5 rounded-lg bg-teal-500/10 text-teal-600 border border-teal-500/10 font-sans font-extrabold text-[9px]">{selectedSrv.category}</span>
                    <span className="font-semibold">Project Code: {selectedSrv.id}</span>
                  </div>

                  <h3 className="text-base font-black text-gray-900 dark:text-white leading-normal">{selectedSrv.title}</h3>
                  
                  <div className="flex items-center gap-6 p-4 bg-rose-500/5 dark:bg-rose-950/10 rounded-2xl border border-rose-100/10">
                    <div>
                      <span className="block text-[10px] text-gray-400 uppercase select-none font-semibold">参考标价 (指导价)</span>
                      <span className="font-mono text-lg font-black text-rose-500 flex items-baseline leading-none mt-1">
                        ¥ {selectedSrv.price.toFixed(2)}
                        <span className="text-xs text-gray-400 font-sans font-medium ml-0.5">{selectedSrv.unit}</span>
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400 uppercase select-none font-semibold">服务质量评级</span>
                      <div className="flex items-baseline mt-1 gap-1">
                        <span className="font-mono text-base font-extrabold text-amber-500 flex items-center gap-0.5">
                          <Star className="w-4 h-4 fill-amber-500" />
                          {selectedSrv.rating}
                        </span>
                        <span className="text-[10px] text-gray-400">({selectedSrv.reviewCount}次同城回访反馈)</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider select-none">服务描述与具体指引</h5>
                    <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed p-4 bg-gray-50 dark:bg-gray-800/20 rounded-2xl border border-gray-100 dark:border-gray-805 whitespace-pre-wrap select-all">
                      {selectedSrv.description}
                    </p>
                  </div>
                </div>

                {/* Sub regional details */}
                <div className="p-4 bg-gray-50/50 dark:bg-gray-850 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 font-semibold select-none">
                    <MapPin className="w-4 h-4 text-primary" />
                    覆盖地理网格：{selectedSrv.area}
                  </div>
                  <p className="text-[11px] text-gray-450 text-gray-400 leading-relaxed pr-2">
                    服务商已承诺对上述指定的覆盖网格（同城生活商圈及核心小区）提供 1 小时内极速免费接驳或快修上门。
                  </p>
                </div>
              </div>

              {/* Bottom drawers actions */}
              <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 gap-2.5 flex justify-end sticky bottom-0 z-10 select-none">
                {selectedSrv.status === 'rejected' ? (
                  <button
                    onClick={() => {
                      handleApprove(selectedSrv.id);
                      setSelectedSrv(null);
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 font-bold text-white text-xs rounded-xl shadow-md transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 font-sans"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>通过超级审核・强制恢复上架</span>
                  </button>
                ) : (
                  <>
                    {selectedSrv.status === 'pending' && (
                      <button
                        onClick={() => {
                          handleApprove(selectedSrv.id);
                          setSelectedSrv(null);
                        }}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer border-none flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
                      >
                        <Check className="w-4 h-4" />
                        <span>快速放行通过</span>
                      </button>
                    )}
                    <button
                      onClick={() => setShowRejectModal(selectedSrv.id)}
                      className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer border-none flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
                    >
                      <X className="w-4 h-4" />
                      <span>审核下架不规范服务</span>
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add registered service Modal dialog */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-[100] backdrop-blur-xs"
              onClick={() => setShowAddModal(false)}
            />
            <div className="fixed inset-0 overflow-y-auto z-[105] flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-gray-900 max-w-md w-full rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl p-6 space-y-4 text-gray-800 dark:text-white"
              >
                <div className="flex items-center gap-2 select-none border-b border-gray-100 dark:border-gray-800 pb-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-xl">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-gray-900 dark:text-white">录入登记社区专享便民服务</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">本操作由官方超管主导，自动绑入特批服务资质</p>
                  </div>
                </div>

                <form onSubmit={handleAddNewSubmit} className="space-y-4 font-sans text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-gray-500 font-bold uppercase text-[9px] select-none" htmlFor="add-srv-provider">匠人名称 / 连锁商标</label>
                      <input
                        id="add-srv-provider"
                        type="text"
                        value={newProvider}
                        onChange={(e) => setNewProvider(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700 rounded-xl outline-none text-xs font-semibold"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-gray-500 font-bold uppercase text-[9px] select-none" htmlFor="add-srv-phone">供给匠人接驳固话手机</label>
                      <input
                        id="add-srv-phone"
                        type="text"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700 rounded-xl outline-none text-xs font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-gray-500 font-bold uppercase text-[9px] select-none" htmlFor="add-srv-title">服务大名主题 *</label>
                    <input
                      id="add-srv-title"
                      type="text"
                      placeholder="例：同城 1 小时快修家电 + 清洗维护"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 rounded-xl outline-none text-xs font-semibold text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1 space-y-1.5">
                      <label className="block text-gray-500 font-bold uppercase text-[9px] select-none">最低单价 *</label>
                      <input
                        type="number"
                        value={newPrice}
                        onChange={(e) => setNewPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 rounded-xl outline-none text-xs text-center font-bold"
                        required
                        min={1}
                      />
                    </div>
                    <div className="col-span-1 space-y-1.5">
                      <label className="block text-gray-500 font-bold uppercase text-[9px] select-none">收费单位 *</label>
                      <select
                        value={newUnit}
                        onChange={(e) => setNewUnit(e.target.value)}
                        className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 rounded-xl outline-none text-xs font-semibold cursor-pointer"
                      >
                        <option value="/小时">/小时收费</option>
                        <option value="/次">/单次包干</option>
                        <option value="/平米">/按平米定</option>
                        <option value="/项目">/项目估价</option>
                      </select>
                    </div>
                    <div className="col-span-1 space-y-1.5">
                      <label className="block text-gray-500 font-bold uppercase text-[9px] select-none">细化类目所属</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 rounded-xl outline-none text-xs font-semibold cursor-pointer"
                      >
                        <option value="家政清洁 / 暖通保洁">暖通保洁</option>
                        <option value="维修安装 / 主线水电">水电快修</option>
                        <option value="搬家拉货 / 师傅代驾">代驾货运</option>
                        <option value="开锁换锁 / 社区安防">安防开锁</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-gray-500 font-bold uppercase text-[9px] select-none" htmlFor="add-srv-area">服务直营辐射圈</label>
                    <input
                      id="add-srv-area"
                      type="text"
                      value={newArea}
                      onChange={(e) => setNewArea(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 rounded-xl outline-none text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-gray-500 font-bold uppercase text-[9px] select-none" htmlFor="add-srv-[description">服务承诺详细说明 *</label>
                    <textarea
                      id="add-srv-[description"
                      rows={3}
                      placeholder="请详细描述具体的作业模式，如超出同城边界或夜间加班的具体资费标准等约定"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 rounded-xl outline-none text-xs font-medium resize-none text-gray-800 dark:text-white"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-3 select-none">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-primary hover:bg-primary-container text-white font-bold text-xs rounded-xl shadow-md cursor-pointer border-none transition-all"
                    >
                      录入档案库
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold text-xs rounded-xl cursor-pointer transition-all focus:outline-none"
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

      {/* Reject template modal services */}
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
                  <h4 className="font-extrabold text-base">确认拒绝下架此便民服务？</h4>
                </div>

                <form onSubmit={handleRejectSubmit} className="space-y-4">
                  <div className="space-y-1.5 border-none p-0 bg-transparent">
                    <label className="block text-gray-500 dark:text-gray-400 font-bold text-[10px] uppercase select-none">违规治理理由</label>
                    <select
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 rounded-xl font-semibold text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer text-gray-800 dark:text-white"
                    >
                      <option value="服务商资质证明造假或已过期失效">服务商资质证明造假或已过期失效</option>
                      <option value="图文或定价中包含外部平台链接导流微信">图文或定价中包含外部平台链接导流微信</option>
                      <option value="同城巡查发现该服务包含严重夸大及欺诈欺瞒">同城巡查发现该服务包含严重夸大及欺诈欺瞒</option>
                      <option value="服务评价遭到恶意做差刷评行为判定">服务评价遭到恶意做差刷评行为判定</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-3 select-none">
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl cursor-pointer border-none shadow-md"
                    >
                      驳回刊登服务
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRejectModal(null)}
                      className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-205 dark:bg-gray-805 dark:hover:bg-gray-750 text-gray-800 dark:text-gray-200 font-semibold text-xs rounded-xl cursor-pointer transition-colors focus:outline-none"
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

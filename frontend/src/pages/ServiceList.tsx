/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Star, MapPin, CheckCircle2, Heart, Sparkles, Clock, ShieldCheck, Wrench, Brush, Scissors, Dumbbell } from 'lucide-react';
import { motion } from 'motion/react';
import { serviceApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Service } from '../types';
import { FavoriteButton } from '../components/common/FavoriteButton';
import { BackToTop } from '../components/common/BackToTop';

const CATEGORIES = [
  { id: 'all', name: '全部分类', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'domestic', name: '家政保洁', icon: <Brush className="w-4 h-4" /> },
  { id: 'repair', name: '家庭维修', icon: <Wrench className="w-4 h-4" /> },
  { id: 'pet', name: '宠物生活', icon: <Scissors className="w-4 h-4" /> },
  { id: 'sports', name: '运动私教', icon: <Dumbbell className="w-4 h-4" /> },
];

export default function ServiceList() {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await serviceApi.list();
        setServices(data);
      } catch (err: any) {
        setError(err.message || '加载失败');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const filteredServices = services.filter(s =>
    (activeCategory === 'all' || s.category === activeCategory) &&
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 解析highlights JSON字符串为数组
  const getHighlights = (h: any): string[] => {
    if (Array.isArray(h)) return h;
    if (typeof h === 'string' && h.startsWith('[')) {
      try { return JSON.parse(h); } catch { return []; }
    }
    return [];
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="bg-primary/5 pt-12 pb-8">
        <div className="max-w-[1280px] mx-auto px-6 md:px-20">
           <h1 className="text-3xl font-bold text-ink mb-6">发现周边的专业服务</h1>
           <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-muted group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="搜索服务名称、关键词..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-hairline rounded-2xl focus:ring-2 focus:ring-primary/10 transition-all outline-none text-sm font-medium"
                />
              </div>
              <button className="px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/10 hover:bg-primary-hover transition-all">
                立即搜索
              </button>
           </div>

           <div className="flex items-center gap-4 mt-8 overflow-x-auto no-scrollbar pb-2">
             {CATEGORIES.map((cat) => (
               <button
                 key={cat.id}
                 onClick={() => setActiveCategory(cat.id)}
                 className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                   activeCategory === cat.id
                     ? 'bg-primary text-white shadow-md'
                     : 'bg-white border border-hairline text-secondary hover:border-primary/20'
                 }`}
               >
                 {cat.icon}
                 {cat.name}
               </button>
             ))}
          </div>
        </div>
      </div>

      <main className="max-w-[1280px] mx-auto px-6 md:px-20 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold text-ink">精选服务商</h2>
            <p className="text-xs text-muted mt-1">覆盖全城，专业、准时、省心</p>
          </div>
        </div>

        {error && <div className="text-center text-red-500 py-8">{error}</div>}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-80 bg-stone-100 animate-pulse rounded-3xl" />
            ))
          ) : filteredServices.length === 0 ? (
            <div className="col-span-3 text-center py-16 text-muted">暂无服务</div>
          ) : (
            filteredServices.map((service) => (
              <div
                key={service.id}
                className="bg-white border border-hairline rounded-3xl overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
                onClick={() => navigate(`/service/${service.id}`)}
              >
                <div className="relative h-48 overflow-hidden">
                  {service.images && service.images[0] && service.images[0].trim() ? (
                    <img src={service.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={service.title} />
                  ) : (
                    <div className="w-full h-full bg-stone-200 flex items-center justify-center text-stone-400 text-xs">暂无图片</div>
                  )}
                  <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-lg flex items-center gap-1.5 shadow-sm">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-xs font-bold text-ink">{service.rating}</span>
                    <span className="text-[10px] text-muted font-medium">({service.reviews} 评价)</span>
                  </div>
                  <FavoriteButton targetId={service.id} targetType="service" />
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                     <span className="px-2 py-0.5 bg-primary/5 text-primary text-[10px] font-bold rounded">
                       {CATEGORIES.find(c => c.id === service.category)?.name || service.category}
                     </span>
                     <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        <span className="text-[10px] text-green-600 font-bold">平台认证</span>
                     </div>
                  </div>
                  <h3 className="text-lg font-bold text-ink mb-2 group-hover:text-primary transition-colors">{service.title}</h3>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {(getHighlights(service.highlights) || []).map((h, i) => (
                      <span key={i} className="text-[10px] text-secondary bg-surface-soft px-2 py-0.5 rounded">
                        {h}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-hairline">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[10px] text-muted font-medium">起步价</span>
                      <span className="text-xl font-bold text-primary">¥{service.price}</span>
                      <span className="text-[10px] text-muted">/{service.unit}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-secondary">
                       <MapPin className="w-3 h-3 text-muted" />
                       <span className="text-[10px] font-medium">{service.distance}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      <BackToTop />
    </div>
  );
}
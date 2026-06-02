/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Heart, MapPin, CheckCircle2, Plus, Sparkles, Smartphone, Sofa, Shirt, Bike, MoreHorizontal } from 'lucide-react';
import { motion } from 'motion/react';
import { marketApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Item } from '../types';
import { PublishOverlay } from '../components/publish/PublishOverlay';
import { getPrimaryImage } from '../utils/images';
import { useAuthCheck } from '../context/useAuthCheck';
import { FavoriteButton } from '../components/common/FavoriteButton';
import { BackToTop } from '../components/common/BackToTop';

const CATEGORIES = [
  { id: 'all', name: '全部', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'tech', name: '数码', icon: <Smartphone className="w-4 h-4" /> },
  { id: 'home', name: '家居', icon: <Sofa className="w-4 h-4" /> },
  { id: 'fashion', name: '美妆', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'clothing', name: '穿搭', icon: <Shirt className="w-4 h-4" /> },
  { id: 'sports', name: '户外', icon: <Bike className="w-4 h-4" /> },
  { id: 'others', name: '其它', icon: <MoreHorizontal className="w-4 h-4" /> },
];

export default function MarketList() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const { requireAuth } = useAuthCheck();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await marketApi.list();
        setItems(data);
      } catch (err: any) {
        setError(err.message || '加载失败');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const filteredItems = items.filter(item =>
    (activeCategory === 'all' || item.category === activeCategory) &&
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="bg-surface-soft pt-10 sm:pt-12 pb-8">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-20">
          <div className="flex flex-col md:flex-row gap-4 sm:gap-6 items-stretch md:items-end justify-between">
            <div className="flex-1 max-w-2xl">
               <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-4 sm:mb-6">�������ߵĺ���</h1>
               <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <Search className="w-5 h-5 text-muted group-focus-within:text-primary transition-colors" />
                 </div>
                 <input
                   type="text"
                   placeholder="搜索商品..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-white border border-hairline rounded-2xl focus:ring-2 focus:ring-primary/10 transition-all outline-none text-sm font-medium"
                 />
               </div>
            </div>
            <button onClick={() => requireAuth(() => setIsPublishOpen(true))} className="w-full md:w-auto justify-center px-6 sm:px-8 py-3.5 sm:py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/10 hover:bg-primary-hover transition-all flex items-center gap-2">
                <Plus className="w-5 h-5" /> 发布闲置
              </button>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 mt-6 sm:mt-8 overflow-x-auto no-scrollbar pb-2">
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

      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-20 py-10 sm:py-12">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-ink">附近好物</h2>
        </div>

        {error && <div className="text-center text-red-500 py-8">{error}</div>}

        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-10">
          {loading ? (
            Array(10).fill(0).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square bg-stone-200 animate-pulse rounded-2xl" />
                <div className="h-4 bg-stone-200 animate-pulse rounded" />
                <div className="h-3 bg-stone-200 animate-pulse rounded w-1/2" />
              </div>
            ))
          ) : filteredItems.length === 0 ? (
            <div className="col-span-full text-center py-16 text-muted">暂无商品</div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="group cursor-pointer"
                onClick={() => navigate(`/item/${item.id}`)}
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 bg-surface-soft">
                  {getPrimaryImage(item.images) ? (
                    <img src={getPrimaryImage(item.images)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={item.title} />
                  ) : (
                    <div className="w-full h-full bg-stone-200 flex items-center justify-center text-stone-400 text-xs">暂无图片</div>
                  )}
                  <div className="absolute top-3 left-3 px-2 py-1 bg-red-400/90 backdrop-blur-md text-white text-[10px] font-bold rounded">
                    {item.itemCondition || item.condition || '全新'}
                  </div>
                  <FavoriteButton targetId={item.id} targetType="market" />
                </div>
                <h3 className="text-sm font-bold text-ink mb-1 line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-3 h-3 text-muted" />
                  <span className="text-[10px] text-muted">{item.location || '附近'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-ink">¥{item.price}</span>
                    {item.originalPrice && (
                      <span className="text-[10px] text-muted line-through ml-1">¥{item.originalPrice}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <img src={item.seller?.avatar || undefined} className="w-4 h-4 rounded-full border border-hairline" alt="" />
                    <span className="text-[9px] font-medium text-secondary">{item.seller?.name}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      <BackToTop />
      <PublishOverlay isOpen={isPublishOpen} onClose={() => setIsPublishOpen(false)} defaultSelectedId="market" />
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Camera, ArrowRightLeft, ShieldCheck, Tag, Plus, Filter, Smartphone, Sofa, Sparkles, Shirt, Bike, MoreHorizontal, Heart, MapPin, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ITEMS } from '../constants';
import { useNavigate, Link } from 'react-router-dom';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Search Header */}
      <div className="bg-surface-soft pt-12 pb-8">
        <div className="max-w-[1280px] mx-auto px-6 md:px-20">
          <div className="flex flex-col md:flex-row gap-6 items-end justify-between">
            <div className="flex-1 max-w-2xl">
               <h1 className="text-3xl font-bold text-ink mb-6">发现身边的好物</h1>
               <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <Search className="w-5 h-5 text-muted group-focus-within:text-primary transition-colors" />
                 </div>
                 <input 
                   type="text"
                   placeholder="搜索商品..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full pl-12 pr-4 py-4 bg-white border border-hairline rounded-2xl focus:ring-2 focus:ring-primary/10 transition-all outline-none text-sm font-medium"
                 />
               </div>
            </div>
            <Link to="/publish">
              <button className="px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/10 hover:bg-primary-hover transition-all flex items-center gap-2">
                <Plus className="w-5 h-5" /> 发布闲置
              </button>
            </Link>
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
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-ink">附近好物</h2>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 text-xs font-bold text-secondary px-4 py-2 bg-surface-soft rounded-lg">
              <Filter className="w-4 h-4" /> 筛选
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
          {ITEMS.filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
            <div 
              key={item.id} 
              className="group cursor-pointer"
              onClick={() => navigate(`/item/${item.id}`)}
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 bg-surface-soft">
                <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={item.title} />
                <div className="absolute top-3 left-3 px-2 py-1 bg-ink/70 backdrop-blur-md text-white text-[10px] font-bold rounded">
                  {item.condition}
                </div>
                <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-md rounded-full text-secondary hover:text-red-500 hover:bg-white transition-all shadow-sm">
                  <Heart className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-sm font-bold text-ink mb-1 line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h3>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-3 h-3 text-muted" />
                <span className="text-[10px] text-muted">{item.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold text-ink">¥{item.price}</span>
                  {item.originalPrice && (
                    <span className="text-[10px] text-muted line-through ml-1">¥{item.originalPrice}</span>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <img src={item.seller.avatar} className="w-4 h-4 rounded-full border border-hairline" alt="" />
                  <span className="text-[9px] font-medium text-secondary">{item.seller.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

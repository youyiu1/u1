/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  Share, 
  Heart, 
  ShieldCheck, 
  MessageCircle, 
  MapPin, 
  ArrowRightLeft,
  Verified,
  Sparkles,
  Grid,
  ChevronLeft,
  Info,
  Clock,
  Truck,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useChat } from '../context/ChatContext';
import { ITEMS } from '../constants';
import { FollowButton } from '../components/common/FollowButton';

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openChat } = useChat();
  const categoryMap: Record<string, string> = {
    'domestic': '家政服务',
    'repair': '家庭维修',
    'sports': '运动健身',
    'pets': '宠物生活',
    'market': '闲置交易',
  };

  const item = ITEMS.find(i => i.id === id) || ITEMS[0];
  const categoryName = categoryMap[item.category] || item.category;
  const [isLiked, setIsLiked] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  const images = [item.image, ...(item.images || [])];

  return (
    <div className="bg-[#fcfdff] min-h-screen pb-20">
      {/* Mobile Top Bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-hairline md:hidden">
        <button onClick={() => navigate(-1)} className="p-2 bg-surface-soft rounded-xl">
          <ChevronLeft className="w-5 h-5 text-ink" />
        </button>
        <div className="flex items-center gap-2">
          <button className="p-2 bg-surface-soft rounded-xl"><Share2 className="w-5 h-5 text-ink" /></button>
          <button 
            onClick={() => setIsLiked(!isLiked)}
            className="p-2 bg-surface-soft rounded-xl"
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-primary text-primary' : 'text-ink'}`} />
          </button>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-8">
        {/* Breadcrumb - Desktop hidden mobile? */}
        <div className="hidden md:flex items-center gap-2 text-xs font-black text-muted mb-8 uppercase tracking-widest">
          <Link to="/" className="hover:text-primary transition-colors">首页</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/market" className="hover:text-primary transition-colors">闲置交易</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-ink">{item.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Gallery & Content */}
          <div className="lg:col-span-8 space-y-10">
            {/* Gallery Section */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-12 aspect-[16/10] rounded-[40px] overflow-hidden border border-hairline relative shadow-2xl shadow-ink/5">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={activeImg}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    src={images[activeImg % images.length]} 
                    className="w-full h-full object-cover" 
                    alt="Main" 
                  />
                </AnimatePresence>
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                   <span className="px-4 py-2 bg-black/60 backdrop-blur-md text-white rounded-2xl text-[10px] font-black tracking-widest uppercase">
                     {item.condition}
                   </span>
                </div>
              </div>
              <div className="md:col-span-12 flex items-center gap-4 mt-2">
                {images.slice(0, 4).map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImg(idx)}
                    className={`relative w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all ${
                      activeImg === idx ? 'border-primary scale-105 shadow-lg shadow-primary/20' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt={`Thumb ${idx}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Badges */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { icon: <CheckCircle2 className="w-5 h-5" />, title: '验货宝', desc: '平台核验 真实描述' },
                { icon: <Truck className="w-5 h-5" />, title: '闪电发货', desc: '卖家承诺 24h内发出' },
                { icon: <ArrowRightLeft className="w-5 h-5" />, title: '无忧退', desc: '协商一致 官方保障' },
              ].map((b, i) => (
                <div key={i} className="flex flex-col p-5 bg-white border border-hairline rounded-3xl group hover:border-primary/20 transition-colors">
                  <div className="p-2.5 bg-primary/5 text-primary rounded-xl w-fit mb-3 group-hover:scale-110 transition-transform">
                    {b.icon}
                  </div>
                  <h4 className="font-black text-sm text-ink mb-1">{b.title}</h4>
                  <p className="text-[11px] font-bold text-muted">{b.desc}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="bg-white border border-hairline rounded-[40px] p-8 md:p-12">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-ink">宝贝详情</h2>
                <div className="flex items-center gap-1.5 text-xs font-black text-primary bg-primary/5 px-3 py-1.5 rounded-full">
                  <Sparkles className="w-3 h-3" /> 好货推荐
                </div>
              </div>
              <div className="text-secondary text-lg leading-relaxed font-medium whitespace-pre-line space-y-4">
                {item.description}
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-12 pt-12 border-t border-hairline">
                <div>
                  <p className="text-xs font-bold text-muted mb-2 uppercase tracking-widest">成色</p>
                  <p className="font-black text-ink">{item.condition}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted mb-2 uppercase tracking-widest">运费</p>
                  <p className="font-black text-ink">{item.freeShipping ? '包邮' : '与卖家协商'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted mb-2 uppercase tracking-widest">支持当面付</p>
                  <p className="font-black text-ink">是</p>
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="bg-white border border-hairline rounded-[40px] p-8 md:p-12 relative overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-ink">物品位置</h2>
                <span className="text-sm font-bold text-muted flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {item.location}
                </span>
              </div>
              <div className="w-full h-80 rounded-3xl overflow-hidden grayscale contrast-[0.9] opacity-90 border border-hairline">
                 <img 
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200" 
                  className="w-full h-full object-cover" 
                  alt="Location"
                 />
                 <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center border-4 border-white shadow-2xl animate-bounce">
                      <MapPin className="w-7 h-7 fill-current" />
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Right: Seller & Action Sticky */}
          <div className="lg:col-span-4 sticky top-28">
            <div className="bg-white border border-hairline rounded-[40px] p-8 shadow-2xl shadow-ink/5 space-y-10">
              {/* Price Block */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-muted uppercase tracking-widest">转让价</span>
                  <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-md text-[10px] font-black border border-green-100 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> 可议价
                  </span>
                </div>
                <div className="flex items-end gap-3">
                  <span className="text-5xl font-black text-ink tracking-tighter">¥{item.price}</span>
                  {item.originalPrice && (
                    <span className="text-lg font-bold text-muted line-through mb-1.5 opacity-50">¥{item.originalPrice}</span>
                  )}
                </div>
              </div>

              {/* Seller Interaction Card */}
              <div className="p-6 bg-surface-soft rounded-3xl space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative group cursor-pointer" onClick={() => navigate(`/profile/${item.seller.name}`)}>
                      <img src={item.seller.avatar} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform" alt="Seller" />
                      <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-lg p-0.5 border-2 border-white">
                        <Verified className="w-3 h-3" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-black text-ink group cursor-pointer hover:text-primary transition-colors" onClick={() => navigate(`/profile/${item.seller.name}`)}>{item.seller.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md">芝麻信用 {item.seller.rating}</span>
                      </div>
                    </div>
                  </div>
                  <FollowButton 
                    isFollowingInitial={item.seller.isFollowing}
                    size="sm"
                    variant="ghost"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/80 p-3 rounded-2xl text-center border border-white/50">
                    <p className="text-sm font-black text-ink">{item.seller.followersCount || 0}</p>
                    <p className="text-[10px] font-black text-muted uppercase tracking-wider">粉丝</p>
                  </div>
                  <div className="bg-white/80 p-3 rounded-2xl text-center border border-white/50">
                    <p className="text-sm font-black text-ink">{item.seller.onSaleCount}</p>
                    <p className="text-[10px] font-black text-muted uppercase tracking-wider">在售</p>
                  </div>
                  <div className="bg-white/80 p-3 rounded-2xl text-center border border-white/50">
                    <p className="text-sm font-black text-ink">{item.seller.soldCount}</p>
                    <p className="text-[10px] font-black text-muted uppercase tracking-wider">成交</p>
                  </div>
                </div>
              </div>

              {/* Primary Actions */}
              <div className="space-y-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openChat({
                    id: item.seller.name,
                    name: item.seller.name,
                    avatar: item.seller.avatar,
                    isOnline: true
                  })}
                  className="w-full h-16 bg-ink text-white rounded-2xl font-black shadow-xl shadow-ink/20 flex items-center justify-center gap-3 group"
                >
                  <div className="p-2 bg-white/10 rounded-xl group-hover:bg-primary transition-colors">
                     <MessageCircle className="w-5 h-5" />
                  </div>
                  立即聊一聊
                </motion.button>
                
                <div className="grid grid-cols-2 gap-4">
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsLiked(!isLiked)}
                    className="h-14 bg-white border-2 border-hairline rounded-2xl font-black text-ink flex items-center justify-center gap-2 hover:bg-surface-soft transition-all"
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-primary text-primary border-primary' : ''}`} />
                    {isLiked ? '已收藏' : '收藏'}
                  </motion.button>
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    className="h-14 bg-surface-soft border-2 border-transparent rounded-2xl font-black text-ink flex items-center justify-center gap-2 hover:border-primary/20 transition-all"
                  >
                    <Share2 className="w-5 h-5" />
                    分享
                  </motion.button>
                </div>
              </div>

              {/* Trust Footer */}
              <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <ShieldCheck className="w-6 h-6 text-primary shrink-0" />
                <p className="text-[10px] font-black text-primary leading-relaxed uppercase tracking-wider">
                  邻里生活担保 · 本地实名认证交易记录 · 极速理赔支持
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

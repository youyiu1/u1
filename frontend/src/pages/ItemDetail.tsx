/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
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
  ChevronLeft,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { marketApi, userApi, favoriteApi, getToken } from '../services/api';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FollowButton } from '../components/common/FollowButton';
import { Item } from '../types';
import { getFollowState, setFollowState } from '../utils/followStorage';
import { getStoredUser } from '../utils/authStorage';
import { parseImages } from '../utils/images';

const categoryMap: Record<string, string> = {
  'domestic': '家政服务',
  'repair': '家庭维修',
  'sports': '运动健身',
  'pets': '宠物生活',
  'market': '闲置交易',
};

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { openChat } = useChat();
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const fromProfile = location.state?.from;

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  // 兼容扁平化的卖家信息 - 先计算sellerId
  const sellerId = item?.seller?.id || (item as any)?.sellerId || '';

  // 从localStorage读取初始关注状态
  const [isFollowing, setIsFollowing] = useState(false);

  // 是否是自己的商品
  const isOwnItem = currentUser?.id && currentUser.id === sellerId;

  const sellerName = item?.seller?.name || item?.sellerName || '';
  const sellerAvatar = item?.seller?.avatar || item?.sellerAvatar || '';
  const sellerVerified = item?.seller?.verified ?? item?.sellerVerified ?? false;
  const itemCondition = item?.itemCondition || item?.condition || '';
  const sellerOnSaleCount = item?.seller?.onSaleCount ?? item?.sellerOnSaleCount ?? 0;
  const sellerSoldCount = item?.seller?.soldCount ?? item?.sellerSoldCount ?? 0;
  const sellerFollowersCount = item?.seller?.followersCount ?? item?.sellerFollowersCount ?? 0;

  const handleFollowChange = (newState: boolean) => {
    setIsFollowing(newState);
  };

  const handleBack = () => {
    if (fromProfile) {
      navigate(-1);
      return;
    }
    navigate('/market');
  };

  const handleToggleFavorite = async () => {
    if (!item || !currentUser?.id) {
      showToast('请先登录', 'warning');
      return;
    }
    const wasLiked = isLiked;
    try {
      if (wasLiked) {
        await favoriteApi.remove(currentUser.id, 'market', Number(item.id));
      } else {
        await favoriteApi.add(currentUser.id, 'market', Number(item.id));
      }
      setIsLiked(!wasLiked);
      showToast(wasLiked ? '已取消收藏' : '已收藏', 'success');
    } catch {
      showToast('操作失败', 'error');
    }
  };

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const data = await marketApi.get(id as string);
        setItem(data);
        const currentUser = getStoredUser();
        const dataSellerId = data?.seller?.id || (data as any)?.sellerId || '';
        if (currentUser?.id && dataSellerId && currentUser.id !== dataSellerId) {
          const saved = getFollowState(dataSellerId);
          setIsFollowing(saved);
          if (!saved) {
            try {
              const following = await userApi.isFollowing(currentUser.id, dataSellerId);
              setIsFollowing(following);
              setFollowState(dataSellerId, following);
            } catch {}
          }
        }
        // 获取初始收藏状态
        if (currentUser?.id && getToken() && id) {
          try {
            const favorited = await favoriteApi.check(currentUser.id, 'market', Number(id));
            setIsLiked(favorited);
          } catch {}
        }
      } catch (err: any) {
        setError(err.message || '加载失败');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchItem();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted mb-4 font-bold">{error || '商品不存在'}</p>
          <button onClick={handleBack} className="px-8 py-3 bg-primary text-white rounded-2xl font-black">
            返回闲置市场
          </button>
        </div>
      </div>
    );
  }

  const categoryName = categoryMap[item.category] || item.category;
  const images = parseImages(item.images);
  const activeImage = images[activeImg] || images[0] || item.image || '';

  return (
    <div className="bg-[#fcfdff] min-h-screen pb-20">
      <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-hairline md:hidden">
        <button onClick={() => navigate(-1)} className="p-2 bg-surface-soft rounded-xl">
          <ChevronLeft className="w-5 h-5 text-ink" />
        </button>
        <div className="flex items-center gap-2">
          <button className="p-2 bg-surface-soft rounded-xl"><Share2 className="w-5 h-5 text-ink" /></button>
          <button
            onClick={() => handleToggleFavorite()}
            className="p-2 bg-surface-soft rounded-xl"
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-primary text-primary' : 'text-ink'}`} />
          </button>
        </div>
      </div>

      <div className="bg-white border-b border-hairline py-6 hidden md:block">
        <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <button onClick={handleBack} className="p-2 hover:bg-surface-soft rounded-xl transition-colors">
               <ChevronLeft className="w-6 h-6" />
             </button>
             <div className="flex items-center gap-2 text-xs font-black text-muted uppercase tracking-widest">
               <span>首页</span>
               <ChevronRight className="w-3 h-3" />
               <span>闲置交易</span>
               <ChevronRight className="w-3 h-3" />
               <span className="text-ink">{item.title}</span>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-4 py-2 hover:bg-surface-soft rounded-xl transition-all text-xs font-black">
               <Share2 className="w-4 h-4" /> 分享闲置
             </button>
             <button
               onClick={() => handleToggleFavorite()}
               className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${isLiked ? 'bg-primary/5 text-primary' : 'hover:bg-surface-soft'}`}
             >
               <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} /> {isLiked ? '取消保存' : '保存闲置'}
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-8 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-12 aspect-[16/10] rounded-[40px] overflow-hidden border border-hairline relative shadow-2xl shadow-ink/5">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImg}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    src={activeImage || undefined}
                    className="w-full h-full object-cover"
                    alt="Main"
                  />
                </AnimatePresence>
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                   <span className="px-4 py-2 bg-black/60 backdrop-blur-md text-white rounded-2xl text-[10px] font-black tracking-widest uppercase">
                     {itemCondition}
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
                    <img src={img || undefined} className="w-full h-full object-cover" alt={`Thumb ${idx}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { icon: <CheckCircle2 className="w-5 h-5" />, title: '验货宝', desc: '平台核验 真实描述' },
                { icon: <ArrowRightLeft className="w-5 h-5" />, title: '闪电发货', desc: '卖家承诺 24h内发出' },
                { icon: <ShieldCheck className="w-5 h-5" />, title: '无忧退', desc: '协商一致 官方保障' },
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

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-12 pt-12 border-t border-hairline">
                <div>
                  <p className="text-xs font-bold text-muted mb-2 uppercase tracking-widest">成色</p>
                  <p className="font-black text-ink">{itemCondition}</p>
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

            <div className="bg-white border border-hairline rounded-[40px] p-8 md:p-12 relative overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-ink">物品位置</h2>
                <span className="text-sm font-bold text-muted flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {item.location}
                </span>
              </div>
              <div className="w-full h-80 rounded-3xl overflow-hidden grayscale contrast-[0.9] opacity-90 border border-hairline">
                 <div className="w-full h-full bg-[radial-gradient(circle_at_20%_30%,_rgba(255,56,92,0.18),_transparent_35%),radial-gradient(circle_at_80%_20%,_rgba(74,144,226,0.18),_transparent_35%),radial-gradient(circle_at_70%_75%,_rgba(80,195,142,0.2),_transparent_40%),linear-gradient(135deg,_#f7f7f7_0%,_#ececec_100%)] flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-xs font-black text-ink uppercase tracking-widest">附近位置示意</p>
                    <p className="text-[11px] font-bold text-muted mt-1">{item.location}</p>
                  </div>
                 </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 sticky top-28">
            <div className="bg-white border border-hairline rounded-[40px] p-8 shadow-2xl shadow-ink/5 space-y-10">
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

              <div className="p-6 bg-surface-soft rounded-3xl space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative group cursor-pointer" onClick={() => navigate(`/profile/${sellerName}`)}>
                      <img src={sellerAvatar || undefined} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform" alt="Seller" />
                      {sellerVerified && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-lg p-0.5 border-2 border-white">
                          <Verified className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-black text-ink group cursor-pointer hover:text-primary transition-colors" onClick={() => navigate(`/profile/${sellerName}`)}>{sellerName}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md">芝麻信用 {item.seller?.rating || '优秀'}</span>
                      </div>
                    </div>
                  </div>
                  {!isOwnItem && (
                    <FollowButton
                      targetId={sellerId}
                      isFollowingInitial={isFollowing}
                      onFollowChange={handleFollowChange}
                      size="sm"
                      variant="ghost"
                    />
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/80 p-3 rounded-2xl text-center border border-white/50">
                    <p className="text-sm font-black text-ink">{sellerFollowersCount}</p>
                    <p className="text-[10px] font-black text-muted uppercase tracking-wider">粉丝</p>
                  </div>
                  <div className="bg-white/80 p-3 rounded-2xl text-center border border-white/50">
                    <p className="text-sm font-black text-ink">{sellerOnSaleCount}</p>
                    <p className="text-[10px] font-black text-muted uppercase tracking-wider">在售</p>
                  </div>
                  <div className="bg-white/80 p-3 rounded-2xl text-center border border-white/50">
                    <p className="text-sm font-black text-ink">{sellerSoldCount}</p>
                    <p className="text-[10px] font-black text-muted uppercase tracking-wider">成交</p>
                  </div>
                </div>
              </div>

              {!isOwnItem && (
                <div className="space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openChat({
                      id: sellerId,
                      name: sellerName,
                      avatar: sellerAvatar,
                      isOnline: true
                    })}
                    className="w-full h-16 bg-ink text-white rounded-2xl font-black shadow-xl shadow-ink/20 flex items-center justify-center gap-3 group"
                  >
                    <div className="p-2 bg-white/10 rounded-xl group-hover:bg-primary transition-colors">
                       <MessageCircle className="w-5 h-5" />
                    </div>
                    立即聊一聊
                  </motion.button>
                </div>
              )}

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

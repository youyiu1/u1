/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Star,
  ChevronRight,
  Heart,
  ShieldCheck,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  Share2,
  Sparkles,
  MapPin,
  Calendar,
  Zap,
  Info,
  User,
  ThumbsUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { serviceApi, userApi } from '../services/api';
import { FollowButton } from '../components/common/FollowButton';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ServiceDetail as ServiceDetailType, Review } from '../types';

function ReviewSection({ serviceId, rating }: { serviceId: string; rating: number }) {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await serviceApi.getReviews(serviceId);
        setReviews(data);
      } catch (err) {
        console.error('获取评价失败', err);
      }
    };
    fetchReviews();
  }, [serviceId]);

  return (
    <div className="space-y-12">
      <header className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-ink tracking-tight">邻友评价</h2>
        <div className="flex items-center gap-2 text-primary font-black">
          <Star className="w-5 h-5 fill-current" />
          <span className="text-xl">{rating.toFixed(1)}</span>
          <span className="text-sm text-muted">/ 5.0</span>
        </div>
      </header>

      <div className="space-y-8">
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-muted">暂无评价</div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white p-8 rounded-[32px] border border-hairline shadow-sm space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-surface-soft rounded-2xl flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                    {review.userAvatar ? (
                      <img src={review.userAvatar} alt={review.userName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-muted" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-ink">{review.userName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-muted/20'}`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{review.createTime}</span>
                    </div>
                  </div>
                </div>
                <button className="flex items-center gap-2 text-xs font-black text-muted hover:text-primary transition-colors group">
                  <ThumbsUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                  <span>{review.likes}</span>
                </button>
              </div>

              <p className="text-secondary font-medium leading-relaxed">
                {review.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { openChat } = useChat();
  const fromProfile = location.state?.from;

  const [service, setService] = useState<ServiceDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const now = new Date();
  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  const formatTime = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:00`;
  const [bookingDate, setBookingDate] = useState(formatDate(now));
  const [bookingTime, setBookingTime] = useState(formatTime(now));
  const [duration, setDuration] = useState(4);

  // 是否是自己的服务
  const sellerId = service?.seller?.id || (service as any)?.sellerId;
  const isOwnService = user?.id && user.id === sellerId;

  const handleFollowChange = async (newState: boolean) => {
    const currentUser = JSON.parse(localStorage.getItem('neighborhood_user') || '{}');
    const sellerId = service?.seller?.id || (service as any)?.sellerId;
    if (!currentUser.id || !sellerId) return;
    try {
      if (newState) {
        await userApi.follow(currentUser.id, sellerId);
      } else {
        await userApi.unfollow(currentUser.id, sellerId);
      }
      setIsFollowing(newState);
    } catch {}
  };

  useEffect(() => {
    const fetchService = async () => {
      try {
        const data = await serviceApi.get(id);
        setService(data);
        // 获取关注状态
        const currentUser = JSON.parse(localStorage.getItem('neighborhood_user') || '{}');
        const sellerId = data.seller?.id || (data as any).sellerId;
        if (currentUser.id && sellerId) {
          try {
            const following = await userApi.isFollowing(currentUser.id, sellerId);
            setIsFollowing(following);
          } catch {}
        }
      } catch (err: any) {
        setError(err.message || '加载失败');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchService();
  }, [id]);

  const { user } = useAuth();
  const { increaseUnread } = useNotification();

  const handleBooking = async () => {
    if (!service) return;
    const sellerId = service.seller?.id || (service as any).sellerId;
    if (!sellerId) return;
    if (!user) {
      navigate('/login');
      return;
    }
    setShowConfirm(false);
    setIsBooking(true);
    try {
      await serviceApi.book({
        serviceId: id as string,
        buyerId: user.id,
        sellerId,
        bookingDate,
        bookingTime,
        duration,
      });
      setBookingSuccess(true);
      increaseUnread();
      window.dispatchEvent(new Event('notification-created'));
    } catch (err: any) {
      alert(err.message || '预约失败');
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted mb-4 font-bold">{error || '服务不存在'}</p>
          <button onClick={() => navigate(fromProfile ? -1 : '/service')} className="px-8 py-3 bg-primary text-white rounded-2xl font-black">
            返回服务列表
          </button>
        </div>
      </div>
    );
  }

  const getCategoryName = (category: string) => {
    const map: Record<string, string> = {
      'domestic': '家政服务',
      'repair': '家庭维修',
      'sports': '运动健身',
      'pets': '宠物生活',
      'beauty': '美容美发',
      'education': '教育培训',
      'medical': '医疗健康'
    };
    return map[category] || category;
  };

  const categoryName = getCategoryName(service.category);
  const totalPrice = (service.price * (duration / 4)) + 20;

  return (
    <div className="bg-[#fcfdff] min-h-screen pb-20">
      <AnimatePresence>
        {bookingSuccess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBookingSuccess(false)}
              className="absolute inset-0 bg-ink/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-sm bg-white rounded-[48px] p-10 text-center shadow-2xl border border-white"
            >
              <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h3 className="text-3xl font-black text-ink mb-4">预约发送成功</h3>
              <p className="text-secondary font-medium mb-10 leading-relaxed">
                您的预约需求已发往 <span className="text-primary font-black">{service.seller?.name}</span>。卖家将通过系统消息与您确认具体时间。
              </p>
              <button
                onClick={() => setBookingSuccess(false)}
                className="w-full py-4 bg-ink text-white rounded-[24px] font-black shadow-xl shadow-ink/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                好的，我知道了
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-hairline md:hidden">
        <button onClick={() => navigate(fromProfile ? -1 : -1)} className="p-2 bg-surface-soft rounded-xl">
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

      <div className="bg-white border-b border-hairline py-6 hidden md:block">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <button onClick={() => navigate(fromProfile ? -1 : '/service')} className="p-2 hover:bg-surface-soft rounded-xl transition-colors">
               <ChevronLeft className="w-6 h-6" />
             </button>
             <div className="flex items-center gap-2 text-xs font-black text-muted uppercase tracking-widest">
               <span>首页</span>
               <ChevronRight className="w-3 h-3" />
               <span>生活服务</span>
               <ChevronRight className="w-3 h-3" />
               <span className="text-ink">{categoryName}</span>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-4 py-2 hover:bg-surface-soft rounded-xl transition-all text-xs font-black">
               <Share2 className="w-4 h-4" /> 分享服务
             </button>
             <button
               onClick={() => setIsLiked(!isLiked)}
               className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${isLiked ? 'bg-primary/5 text-primary' : 'hover:bg-surface-soft'}`}
             >
               <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} /> {isLiked ? '取消保存' : '保存服务'}
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          <div className="lg:col-span-8 space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black rounded-lg border border-primary/10 tracking-widest uppercase">
                  {categoryName}
                </span>
                <div className="flex items-center gap-1.5 text-xs font-black text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  <ShieldCheck className="w-4 h-4" /> 官方核验
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-ink leading-tight tracking-tight">
                {service.title}
              </h1>
              <div className="flex items-center gap-6 text-sm font-bold text-muted">
                <div className="flex items-center gap-1.5 p-1 px-3 bg-white border border-hairline rounded-full shadow-sm">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-ink">{service.rating}</span>
                  <span className="opacity-50">({service.reviews}评价)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>滨江区 · {service.distance}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[400px] md:h-[540px]">
              <div className="md:col-span-8 h-full rounded-[48px] overflow-hidden shadow-2xl shadow-ink/5 border border-hairline group">
                <img src={service.image || undefined} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Main" />
              </div>
              <div className="md:col-span-4 grid grid-rows-2 gap-4 h-full">
                <div className="rounded-[32px] overflow-hidden border border-hairline group">
                  <img src={service.image || undefined} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="Detail 1" />
                </div>
                <div className="relative rounded-[32px] overflow-hidden border border-hairline group cursor-pointer">
                  <img src={service.image || undefined} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="Detail 2" />
                  <div className="absolute inset-x-4 bottom-4 px-4 py-3 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center gap-2 font-black text-xs shadow-xl">
                    <Sparkles className="w-4 h-4" /> 查看全景
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white border border-hairline rounded-[40px] shadow-sm flex flex-col md:flex-row items-center gap-8 group">
              <div className="relative shrink-0">
                <img src={service.seller?.avatar || undefined} alt="Seller" className="w-24 h-24 rounded-[32px] object-cover border-4 border-white shadow-xl group-hover:rotate-6 transition-transform" />
                <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-1.5 rounded-xl border-4 border-white shadow-lg">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                 <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                   <h3 className="text-2xl font-black text-ink">{service.seller?.name}</h3>
                   <span className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                     极好口碑商家
                   </span>
                   {!isOwnService && (
                   <FollowButton
                    isFollowingInitial={isFollowing}
                    onFollowChange={handleFollowChange}
                    size="sm"
                    variant="outline"
                    className="md:ml-auto"
                   />
                   )}
                 </div>
                 <p className="text-secondary font-medium leading-relaxed max-w-lg mb-4">
                   "致力于为邻居提供五星级的管家式服务，细节决定品质。每一次服务都是我诚信的积累。"
                 </p>
                 <div className="flex items-center justify-center md:justify-start gap-8">
                   <div>
                     <p className="text-xs font-black text-muted uppercase tracking-widest mb-1">成交记录</p>
                     <p className="text-lg font-black text-ink">{service.seller?.soldCount || 0}+</p>
                   </div>
                   <div>
                     <p className="text-xs font-black text-muted uppercase tracking-widest mb-1">粉丝</p>
                     <p className="text-lg font-black text-ink">{service.seller?.followersCount || 0}</p>
                   </div>
                   <div>
                     <p className="text-xs font-black text-muted uppercase tracking-widest mb-1">平均响应</p>
                     <p className="text-lg font-black text-ink">15min</p>
                   </div>
                 </div>
              </div>
              {!isOwnService && (
              <button
                onClick={() => openChat({
                  id: service.seller?.id || '',
                  name: service.seller?.name || '',
                  avatar: service.seller?.avatar || '',
                  isOnline: true
                })}
                className="px-6 py-3 bg-surface-soft hover:bg-hairline rounded-2xl font-black text-xs transition-all"
              >
                沟通需求
              </button>
              )}
            </div>

            <div className="space-y-16 px-2">
              <div>
                <h2 className="text-3xl font-black text-ink mb-6">服务内容描述</h2>
                <div className="text-lg text-secondary leading-relaxed font-medium whitespace-pre-line space-y-4">
                  {service.description}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: <ShieldCheck className="w-5 h-5 text-green-500" />, title: '隐私防护', desc: '身份认证保密，服务过程全程记录' },
                  { icon: <Zap className="w-5 h-5 text-blue-500" />, title: '极速反馈', desc: '一小时内预约受理，爽约包赔' },
                  { icon: <Clock className="w-5 h-5 text-orange-500" />, title: '透明定价', desc: '明码标价，中途无额外加价行为' },
                  { icon: <Info className="w-5 h-5 text-purple-500" />, title: '官方售后', desc: '平台担保交易，满意后再放款' },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-6 bg-white border border-hairline rounded-3xl hover:border-primary/20 transition-all shadow-sm">
                    <div className="shrink-0">{item.icon}</div>
                    <div>
                      <h4 className="font-black text-ink mb-1">{item.title}</h4>
                      <p className="text-xs font-medium text-muted">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <ReviewSection serviceId={id as string} rating={service.rating} />
            </div>
          </div>

          <aside className="lg:col-span-4 sticky top-28">
            <div className="bg-white border border-hairline rounded-[48px] p-8 md:p-10 shadow-2xl shadow-ink/5 space-y-8">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-xs font-black text-muted uppercase tracking-widest mb-2 block">预约起步价</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-ink tracking-tighter">¥{service.price}</span>
                    <span className="text-sm font-bold text-muted">/{service.unit}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1.5 text-xs font-black bg-primary/5 text-primary px-3 py-1.5 rounded-xl border border-primary/10">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{service.rating}</span>
                  </div>
                </div>
              </div>

              <div className="bg-surface-soft rounded-3xl p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">选择日期</label>
                    <div className="relative">
                       <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                       <input
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-3 bg-white border border-white rounded-xl text-xs font-black focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none"
                       />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">开始时间</label>
                    <div className="relative">
                       <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                       <input
                        type="time"
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="w-full pl-9 pr-3 py-3 bg-white border border-white rounded-xl text-xs font-black focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none"
                       />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">时长/份数</label>
                  <div className="relative">
                    <select
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-white border border-white rounded-xl text-xs font-black focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none appearance-none cursor-pointer"
                    >
                      <option value={4}>标准版 · 4 小时</option>
                      <option value={8}>精细版 · 8 小时 (推荐)</option>
                      <option value={12}>套餐版 · 3次保养服务</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowConfirm(true)}
                  disabled={isBooking}
                  className="w-full h-16 bg-ink text-white rounded-[24px] font-black shadow-xl shadow-ink/20 flex items-center justify-center gap-3 group transition-all"
                >
                  {isBooking ? (
                    <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Zap className="w-5 h-5 group-hover:text-primary transition-colors" />
                      立即发送预约
                    </>
                  )}
                </motion.button>

                <p className="text-center text-[10px] font-black text-muted uppercase tracking-widest py-2">
                  邻里生活担保 · 服务完成前平台代管资金
                </p>
              </div>

              <div className="space-y-4 pt-6 mt-6 border-t border-hairline">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-muted">基础服务费用</span>
                  <span className="font-black text-ink">¥{service.price * (duration / 4)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-muted">物料/交通补贴</span>
                  <span className="font-black text-green-600">免费</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-muted">平台保障费 (2% )</span>
                  <span className="font-black text-ink">¥20</span>
                </div>
                <div className="pt-6 flex justify-between items-center group">
                  <span className="text-lg font-black text-ink">预计总额</span>
                  <span className="text-3xl font-black text-primary group-hover:scale-110 transition-transform">¥{totalPrice}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-surface-soft border border-hairline rounded-3xl flex items-center gap-4">
               <div className="p-3 bg-white rounded-2xl shadow-sm text-primary">
                  <ShieldCheck className="w-6 h-6" />
               </div>
               <div>
                 <p className="text-sm font-black text-ink">邻里安心购保障</p>
                 <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-0.5">不满意退全款 · 官方介入仲裁</p>
               </div>
            </div>
          </aside>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="确认预约"
        message={`确定预约 ${service.title} 吗？`}
        confirmText="确认预约"
        cancelText="取消"
        onConfirm={handleBooking}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
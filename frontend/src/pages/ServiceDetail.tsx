/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  Info,
  MapPin,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsUp,
  User,
  Zap,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { FollowButton } from '../components/common/FollowButton';
import { useAuth } from '../context/AuthContext';
import { useAuthCheck } from '../context/useAuthCheck';
import { useChat } from '../context/ChatContext';
import { useNotification } from '../context/NotificationContext';
import { useToast } from '../context/ToastContext';
import { chatApi, favoriteApi, getToken, reviewApi, serviceApi, userApi } from '../services/api';
import { Review, ServiceDetail as ServiceDetailType } from '../types';
import { getStoredUser } from '../utils/authStorage';
import { formatDateTime } from '../utils/dateTime';
import { getFollowState, setFollowState } from '../utils/followStorage';
import { readCachedLocation } from '../utils/location';

const categoryNames: Record<string, string> = {
  domestic: '家政服务',
  repair: '家庭维修',
  sports: '运动健身',
  pets: '宠物生活',
  beauty: '美容美发',
  education: '教育培训',
  medical: '医疗健康',
};

const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function formatDateValue(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function initialBookingTime(): string {
  const hour = new Date().getHours();
  const nextHour = Math.min(20, Math.max(8, hour + 1));
  return `${String(nextHour).padStart(2, '0')}:00`;
}

function ReviewSection({ serviceId, rating }: { serviceId: string; rating: number }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [likedReviews, setLikedReviews] = useState<Set<string>>(new Set());
  const [likeLoading, setLikeLoading] = useState<string | null>(null);
  const { requireAuth } = useAuthCheck();

  useEffect(() => {
    let mounted = true;

    const fetchReviews = async () => {
      try {
        const data = await serviceApi.getReviews(serviceId);
        if (!mounted) return;
        setReviews(data);
        setLikedReviews(new Set(data.filter((review) => review.isLiked).map((review) => review.id)));
      } catch (err) {
        console.error('加载评价失败', err);
      }
    };

    fetchReviews();
    return () => {
      mounted = false;
    };
  }, [serviceId]);

  const handleLike = async (reviewId: string) => {
    if (!requireAuth() || likeLoading === reviewId) return;

    const wasLiked = likedReviews.has(reviewId);
    const prevReviews = reviews;
    const prevLiked = new Set(likedReviews);
    setLikeLoading(reviewId);
    setLikedReviews((prev) => {
      const next = new Set(prev);
      if (wasLiked) {
        next.delete(reviewId);
      } else {
        next.add(reviewId);
      }
      return next;
    });
    setReviews((prev) =>
      prev.map((review) =>
        review.id === reviewId
          ? { ...review, likes: wasLiked ? Math.max(0, review.likes - 1) : review.likes + 1 }
          : review
      )
    );

    try {
      if (wasLiked) {
        await reviewApi.unlikeReview(reviewId);
      } else {
        await reviewApi.likeReview(reviewId);
      }
    } catch {
      setLikedReviews(prevLiked);
      setReviews(prevReviews);
    } finally {
      setLikeLoading(null);
    }
  };

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
                            className={`w-3.5 h-3.5 ${
                              star <= review.rating ? 'text-yellow-400 fill-current' : 'text-muted/20'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-muted uppercase tracking-widest">
                        {formatDateTime(review.createTime, '刚刚')}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleLike(review.id)}
                  disabled={likeLoading === review.id}
                  className={`flex items-center gap-2 text-xs font-black transition-colors group ${
                    likedReviews.has(review.id) ? 'text-primary' : 'text-muted hover:text-primary'
                  }`}
                >
                  <ThumbsUp
                    className={`w-4 h-4 group-hover:-translate-y-0.5 transition-transform ${
                      likedReviews.has(review.id) ? 'fill-primary' : ''
                    }`}
                  />
                  <span>{review.likes}</span>
                </button>
              </div>

              <p className="text-secondary font-medium leading-relaxed">{review.content}</p>
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
  const routeLocation = useLocation();
  const { openChat } = useChat();
  const { user } = useAuth();
  const { increaseUnread } = useNotification();
  const { showToast } = useToast();

  const [service, setService] = useState<ServiceDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isBooked, setIsBooked] = useState(() => localStorage.getItem(`booked_${id}`) === 'true');
  const [showConfirm, setShowConfirm] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingDate, setBookingDate] = useState(() => formatDateValue(new Date()));
  const [bookingTime, setBookingTime] = useState(initialBookingTime);
  const [duration, setDuration] = useState(4);

  const fromProfile = routeLocation.state?.from;
  const sellerId = service?.seller?.id || (service as any)?.sellerId;
  const isOwnService = Boolean(user?.id && sellerId && user.id === sellerId);

  const bookingDates = useMemo(
    () =>
      Array.from({ length: 14 }, (_, index) => {
        const date = new Date();
        date.setDate(date.getDate() + index);
        return {
          value: formatDateValue(date),
          label: index === 0 ? '今天' : index === 1 ? '明天' : `${date.getMonth() + 1}月${date.getDate()}日`,
          weekday: weekdays[date.getDay()],
        };
      }),
    []
  );

  const bookingTimes = useMemo(
    () =>
      Array.from({ length: 13 }, (_, index) => {
        const hour = index + 8;
        return `${String(hour).padStart(2, '0')}:00`;
      }),
    []
  );

  useEffect(() => {
    setIsBooked(localStorage.getItem(`booked_${id}`) === 'true');
  }, [id]);

  useEffect(() => {
    let mounted = true;

    const fetchService = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        const data = await serviceApi.get(id);
        if (!mounted) return;
        setService(data);

        const currentUser = getStoredUser();
        const serviceSellerId = data.seller?.id || (data as any).sellerId;
        if (currentUser?.id && serviceSellerId) {
          const savedFollowState = getFollowState(serviceSellerId);
          setIsFollowing(savedFollowState);

          if (!savedFollowState) {
            try {
              const following = await userApi.isFollowing(currentUser.id, serviceSellerId);
              if (mounted) {
                setIsFollowing(following);
                setFollowState(serviceSellerId, following);
              }
            } catch {}
          }

          if (getToken()) {
            try {
              const favorited = await favoriteApi.check(currentUser.id, 'service', Number(id));
              if (mounted) setIsLiked(favorited);
            } catch {}
          }
        }

        const cachedLocation = readCachedLocation();
        if (cachedLocation?.latitude != null && cachedLocation?.longitude != null) {
          try {
            const localized = await serviceApi.get(id, cachedLocation.latitude, cachedLocation.longitude);
            if (mounted) setService(localized);
          } catch {}
        }
      } catch (err: any) {
        if (mounted) setError(err.message || '加载失败');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchService();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleBack = () => {
    if (fromProfile) {
      navigate(-1);
      return;
    }
    navigate('/service');
  };

  const handleToggleFavorite = async () => {
    if (!service || !user?.id) {
      showToast('请先登录', 'warning');
      return;
    }

    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    try {
      if (wasLiked) {
        await favoriteApi.remove(user.id, 'service', Number(service.id));
      } else {
        await favoriteApi.add(user.id, 'service', Number(service.id));
      }
      showToast(wasLiked ? '已取消收藏' : '已收藏', 'success');
    } catch {
      setIsLiked(wasLiked);
      showToast('操作失败', 'error');
    }
  };

  const handleBooking = async () => {
    if (!service || !id || !sellerId) return;
    if (!user) {
      navigate('/login');
      return;
    }

    setShowConfirm(false);
    setIsBooking(true);
    try {
      await serviceApi.book({
        serviceId: id,
        buyerId: user.id,
        sellerId,
        bookingDate,
        bookingTime,
        duration,
      });

      setIsBooked(true);
      localStorage.setItem(`booked_${id}`, 'true');
      localStorage.setItem(
        `booking_${id}`,
        JSON.stringify({
          serviceId: id,
          serviceTitle: service.title,
          price: service.price,
          bookingDate,
          bookingTime,
          duration,
        })
      );
      setBookingSuccess(true);
      increaseUnread();
      window.dispatchEvent(new Event('notification-created'));

      try {
        await chatApi.sendMessage(
          sellerId,
          `您好，我想预约您的服务「${service.title}」，预约时间：${bookingDate} ${bookingTime}，时长：${duration}小时。请确认是否可接单。`
        );
      } catch {}
    } catch (err: any) {
      showToast(err.message || '预约失败', 'error');
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
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-muted mb-4 font-bold">{error || '服务不存在'}</p>
          <button type="button" onClick={handleBack} className="px-8 py-3 bg-primary text-white rounded-2xl font-black">
            返回服务列表
          </button>
        </div>
      </div>
    );
  }

  const categoryName = categoryNames[service.category] || service.category || '生活服务';
  const serviceImages = Array.isArray(service.images) && service.images.length > 0 ? service.images : [service.image].filter(Boolean);
  const totalPrice = service.price * (duration / 4) + 20;
  const selectedDateLabel = bookingDates.find((item) => item.value === bookingDate)?.label || bookingDate;

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
                您的预约需求已发往 <span className="text-primary font-black">{service.seller?.name}</span>。
                服务方会通过系统消息与您确认具体时间。
              </p>
              <button
                type="button"
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
        <button type="button" onClick={() => navigate(-1)} className="p-2 bg-surface-soft rounded-xl">
          <ChevronLeft className="w-5 h-5 text-ink" />
        </button>
        <div className="flex items-center gap-2">
          <button type="button" className="p-2 bg-surface-soft rounded-xl">
            <Share2 className="w-5 h-5 text-ink" />
          </button>
          <button type="button" onClick={handleToggleFavorite} className="p-2 bg-surface-soft rounded-xl">
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-primary text-primary' : 'text-ink'}`} />
          </button>
        </div>
      </div>

      <div className="bg-white border-b border-hairline py-6 hidden md:block">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button type="button" onClick={handleBack} className="p-2 hover:bg-surface-soft rounded-xl transition-colors">
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
            <button type="button" className="flex items-center gap-2 px-4 py-2 hover:bg-surface-soft rounded-xl transition-all text-xs font-black">
              <Share2 className="w-4 h-4" /> 分享服务
            </button>
            <button
              type="button"
              onClick={handleToggleFavorite}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                isLiked ? 'bg-primary/5 text-primary' : 'hover:bg-surface-soft'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} /> {isLiked ? '取消收藏' : '收藏服务'}
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
              <h1 className="text-4xl md:text-5xl font-black text-ink leading-tight tracking-tight">{service.title}</h1>
              <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-muted">
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

            <div className="relative z-0 grid grid-cols-1 gap-4 md:grid-cols-12">
              <div className="md:col-span-8 aspect-[9/10] rounded-[48px] overflow-hidden shadow-2xl shadow-ink/5 border border-hairline bg-surface-soft">
                {serviceImages[0] && <img src={serviceImages[0]} className="w-full h-full object-cover" alt={service.title} />}
              </div>
              <div className="grid grid-cols-2 gap-4 md:col-span-4 md:grid-cols-1">
                <div className="aspect-[9/10] rounded-[32px] overflow-hidden border border-hairline bg-surface-soft">
                  {serviceImages[1] || serviceImages[0] ? (
                    <img src={serviceImages[1] || serviceImages[0]} className="w-full h-full object-cover" alt="服务细节 1" />
                  ) : null}
                </div>
                <div className="relative aspect-[9/10] rounded-[32px] overflow-hidden border border-hairline cursor-pointer bg-surface-soft">
                  {serviceImages[2] || serviceImages[0] ? (
                    <img src={serviceImages[2] || serviceImages[0]} className="w-full h-full object-cover" alt="服务细节 2" />
                  ) : null}
                  <div className="absolute inset-x-4 bottom-4 px-4 py-3 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center gap-2 font-black text-xs shadow-xl">
                    <Sparkles className="w-4 h-4" /> 查看全景
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 p-8 bg-white border border-hairline rounded-[40px] shadow-sm flex flex-col md:flex-row items-center gap-8 group">
              <div className="relative shrink-0">
                <img
                  src={service.seller?.avatar || undefined}
                  alt={service.seller?.name || '服务方'}
                  className="w-24 h-24 rounded-[32px] object-cover border-4 border-white shadow-xl group-hover:rotate-6 transition-transform"
                />
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
                      targetId={sellerId}
                      isFollowingInitial={isFollowing}
                      onFollowChange={setIsFollowing}
                      size="sm"
                      variant="outline"
                      className="md:ml-auto"
                    />
                  )}
                </div>
                <p className="text-secondary font-medium leading-relaxed max-w-lg mb-4">
                  致力于为邻居提供五星级的管家式服务，细节决定品质。每一次服务都是诚信的积累。
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
                  type="button"
                  onClick={() =>
                    openChat({
                      id: service.seller?.id || '',
                      name: service.seller?.name || '',
                      avatar: service.seller?.avatar || '',
                      isOnline: true,
                    })
                  }
                  className="px-6 py-3 bg-surface-soft hover:bg-hairline rounded-2xl font-black text-xs transition-all"
                >
                  沟通需求
                </button>
              )}
            </div>

            <div className="space-y-16 px-2">
              <div>
                <h2 className="text-3xl font-black text-ink mb-6">服务内容描述</h2>
                <div className="text-lg text-secondary leading-relaxed font-medium whitespace-pre-line">{service.description}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    icon: <ShieldCheck className="w-5 h-5 text-green-500" />,
                    title: '隐私防护',
                    desc: '身份认证保密，服务过程全程记录',
                  },
                  {
                    icon: <Zap className="w-5 h-5 text-blue-500" />,
                    title: '极速反馈',
                    desc: '一小时内预约受理，爽约包赔',
                  },
                  {
                    icon: <Clock className="w-5 h-5 text-orange-500" />,
                    title: '透明定价',
                    desc: '明码标价，中途无额外加价行为',
                  },
                  {
                    icon: <Info className="w-5 h-5 text-purple-500" />,
                    title: '官方售后',
                    desc: '平台担保交易，满意后再放款',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4 p-6 bg-white border border-hairline rounded-3xl hover:border-primary/20 transition-all shadow-sm">
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
                <div className="flex items-center gap-1.5 text-xs font-black bg-primary/5 text-primary px-3 py-1.5 rounded-xl border border-primary/10">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{service.rating}</span>
                </div>
              </div>

              <div className="bg-surface-soft rounded-3xl p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    选择日期
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {bookingDates.slice(0, 6).map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setBookingDate(item.value)}
                        className={`rounded-2xl border px-3 py-3 text-left transition-all ${
                          bookingDate === item.value
                            ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20'
                            : 'border-white bg-white text-ink hover:border-primary/30'
                        }`}
                      >
                        <span className="block text-xs font-black">{item.label}</span>
                        <span className={`mt-1 block text-[10px] font-bold ${bookingDate === item.value ? 'text-white/80' : 'text-muted'}`}>
                          {item.weekday}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    开始时间
                  </label>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {bookingTimes.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setBookingTime(time)}
                        className={`rounded-2xl border px-3 py-2.5 text-center text-xs font-black transition-all ${
                          bookingTime === time
                            ? 'border-ink bg-ink text-white shadow-lg shadow-ink/15'
                            : 'border-white bg-white text-ink hover:border-ink/20'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">时长/份数</label>
                  <div className="relative">
                    <select
                      value={duration}
                      onChange={(event) => setDuration(Number(event.target.value))}
                      className="w-full px-4 py-3 bg-white border border-white rounded-xl text-xs font-black focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none appearance-none cursor-pointer"
                    >
                      <option value={4}>标准版 · 4 小时</option>
                      <option value={8}>精细版 · 8 小时（推荐）</option>
                      <option value={12}>套餐版 · 12 小时</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowConfirm(true)}
                  disabled={isBooking || isBooked || isOwnService}
                  className="w-full h-16 bg-ink text-white rounded-[24px] font-black shadow-xl shadow-ink/20 flex items-center justify-center gap-3 group transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isBooked ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      已预约
                    </>
                  ) : isBooking ? (
                    <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : isOwnService ? (
                    '自己的服务不可预约'
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
                  <span className="text-muted">预约时间</span>
                  <span className="font-black text-ink">
                    {selectedDateLabel} {bookingTime}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-muted">基础服务费用</span>
                  <span className="font-black text-ink">¥{service.price * (duration / 4)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-muted">物料/交通补贴</span>
                  <span className="font-black text-green-600">免费</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-muted">平台保障费</span>
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
        message={`确定预约「${service.title}」吗？时间：${selectedDateLabel} ${bookingTime}`}
        confirmText="确认预约"
        cancelText="取消"
        onConfirm={handleBooking}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}

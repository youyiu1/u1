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
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { FollowButton } from '../../components/common/FollowButton';
import { useAuth } from '../../context/AuthContext';
import { useAuthCheck } from '../../context/useAuthCheck';
import { useChat } from '../../context/ChatContext';
import { useNotification } from '../../context/NotificationContext';
import { useToast } from '../../context/ToastContext';
import { chatApi, favoriteApi, getToken, reviewApi, serviceApi, userApi } from '../../services/api';
import { Review, ServiceDetail as ServiceDetailType } from '../../types';
import { getStoredUser } from '../../utils/authStorage';
import { formatDateTime } from '../../utils/dateTime';
import { formatCurrency, fallbackText } from '../../utils/display';
import { getErrorMessage } from '../../utils/error';
import { resolveFollowState } from '../../utils/followStorage';
import { resolveFavoriteState } from '../../utils/interactionStorage';
import { readCachedLocation } from '../../utils/location';
import { buildProfilePath, buildProfileRouteState } from '../../utils/profileRoute';

const CATEGORY_NAMES: Record<string, string> = {
  domestic: '家政服务',
  repair: '维修安装',
  sports: '运动陪练',
  pets: '宠物服务',
  beauty: '美容美妆',
  education: '教育培训',
  medical: '医疗健康',
};

const DURATION_OPTIONS = [
  { value: 4, label: '短时服务 / 4 刻钟' },
  { value: 8, label: '半天服务 / 8 刻钟' },
  { value: 12, label: '全天服务 / 12 刻钟' },
];

const SERVICE_FEATURES = [
  {
    icon: <ShieldCheck className="h-5 w-5 text-green-500" />,
    title: '平台保障',
    desc: '服务信息经过审核，预约流程留痕，沟通记录可追溯。',
  },
  {
    icon: <Zap className="h-5 w-5 text-blue-500" />,
    title: '响应更快',
    desc: '支持在线预约与即时沟通，减少来回确认成本。',
  },
  {
    icon: <Clock className="h-5 w-5 text-orange-500" />,
    title: '时间灵活',
    desc: '日期和开始时间由你自己选择，更贴合实际安排。',
  },
  {
    icon: <Info className="h-5 w-5 text-violet-500" />,
    title: '预约说明',
    desc: '提交后会同步通知服务者，确认后可按约定时间进行服务。',
  },
];

function formatDateValue(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function initialBookingTime(): string {
  const now = new Date();
  const next = new Date(now);
  if (now.getMinutes() === 0) {
    next.setMinutes(0, 0, 0);
  } else if (now.getMinutes() <= 30) {
    next.setMinutes(30, 0, 0);
  } else {
    next.setHours(next.getHours() + 1, 0, 0, 0);
  }
  return `${String(next.getHours()).padStart(2, '0')}:${String(next.getMinutes()).padStart(2, '0')}`;
}

function getServiceImages(service: ServiceDetailType): string[] {
  if (Array.isArray(service.images) && service.images.length > 0) {
    return service.images.filter(Boolean);
  }
  return service.image ? [service.image] : [];
}

function getEndTime(startTime: string, duration: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return startTime;
  }
  const endMinutes = hours * 60 + minutes + duration * 15;
  const normalized = ((endMinutes % 1440) + 1440) % 1440;
  const endHour = Math.floor(normalized / 60);
  const endMinute = normalized % 60;
  return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
}

function getServiceFee(price: number, duration: number): number {
  return price * (duration / 4);
}

function ReviewSection({ serviceId, rating }: { serviceId: string; rating: number }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [likedReviews, setLikedReviews] = useState<Set<string>>(new Set());
  const [likeLoading, setLikeLoading] = useState<string | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const { requireAuth } = useAuthCheck();

  useEffect(() => {
    let mounted = true;

    const fetchReviews = async () => {
      try {
        const data = await serviceApi.getReviews(serviceId);
        if (!mounted) {
          return;
        }
        setReviews(data);
        setLikedReviews(new Set(data.filter((review) => review.isLiked).map((review) => review.id)));
      } catch (error: unknown) {
        console.error(getErrorMessage(error, '加载服务评价失败'));
      }
    };

    void fetchReviews();
    return () => {
      mounted = false;
    };
  }, [serviceId]);

  useEffect(() => {
    setShowAllReviews(false);
  }, [serviceId]);

  const handleLike = async (reviewId: string) => {
    if (likeLoading === reviewId) {
      return;
    }

    if (!requireAuth()) {
      return;
    }

    const wasLiked = likedReviews.has(reviewId);
    const previousReviews = reviews;
    const previousLikedReviews = new Set(likedReviews);

    setLikeLoading(reviewId);
    setLikedReviews((current) => {
      const next = new Set(current);
      if (wasLiked) {
        next.delete(reviewId);
      } else {
        next.add(reviewId);
      }
      return next;
    });
    setReviews((current) =>
      current.map((review) =>
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
      setLikedReviews(previousLikedReviews);
      setReviews(previousReviews);
    } finally {
      setLikeLoading(null);
    }
  };

  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 2);

  return (
    <div className="space-y-12">
      <header className="flex items-center justify-between gap-4">
        <h2 className="text-3xl font-black tracking-tight text-ink">用户评价</h2>
        <div className="flex items-center gap-2 font-black text-primary">
          <Star className="h-5 w-5 fill-current" />
          <span className="text-xl">{rating.toFixed(1)}</span>
          <span className="text-sm text-muted">/ 5.0</span>
        </div>
      </header>

      <div className="space-y-8">
        {reviews.length === 0 ? (
          <div className="py-12 text-center text-muted">暂时还没有评价</div>
        ) : (
          visibleReviews.map((review) => (
            <div key={review.id} className="theme-card space-y-6 rounded-[32px] p-8 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="theme-card-soft flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border-2 shadow-sm">
                    {review.userAvatar ? (
                      <img src={review.userAvatar} alt={review.userName} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-6 w-6 text-muted" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-ink">{review.userName}</h4>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3.5 w-3.5 ${star <= review.rating ? 'fill-current text-yellow-400' : 'text-muted/20'}`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
                        {formatDateTime(review.createTime)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => void handleLike(review.id)}
                  disabled={likeLoading === review.id}
                  className={`group flex items-center gap-2 text-xs font-black transition-colors ${
                    likedReviews.has(review.id) ? 'text-primary' : 'text-muted hover:text-primary'
                  }`}
                >
                  <ThumbsUp
                    className={`h-4 w-4 transition-transform group-hover:-translate-y-0.5 ${
                      likedReviews.has(review.id) ? 'fill-current' : ''
                    }`}
                  />
                  <span>{review.likes}</span>
                </button>
              </div>

              <p className="leading-relaxed text-secondary">{review.content}</p>
            </div>
          ))
        )}
      </div>
      {reviews.length > 2 ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setShowAllReviews((current) => !current)}
            className="theme-card rounded-2xl px-6 py-3 text-sm font-black text-ink transition-all hover:border-primary/20 hover:text-primary"
          >
            {showAllReviews ? '收起评价' : '更多评价'}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const { openChat } = useChat();
  const { user } = useAuth();
  const { requireAuth } = useAuthCheck();
  const { increaseUnread } = useNotification();
  const { showToast } = useToast();

  const [service, setService] = useState<ServiceDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingDate, setBookingDate] = useState(() => formatDateValue(new Date()));
  const [bookingTime, setBookingTime] = useState(initialBookingTime);
  const [duration, setDuration] = useState(4);

  const fromProfile = routeLocation.state?.from;
  const sellerId = service?.seller?.id || service?.sellerId || '';
  const isOwnService = Boolean(user?.id && sellerId && user.id === sellerId);

  useEffect(() => {
    let mounted = true;

    const fetchService = async () => {
      if (!id) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await serviceApi.get(id);
        if (!mounted) {
          return;
        }

        setService(data);

        const currentUser = getStoredUser();
        const currentSellerId = data.seller?.id || data.sellerId || '';
        if (currentUser?.id && currentSellerId && currentUser.id !== currentSellerId) {
          const following = await resolveFollowState(currentUser.id, currentSellerId, userApi.isFollowing);
          if (mounted) {
            setIsFollowing(following);
          }
          try {
            const booked = await serviceApi.getBookingStatus(id);
            if (mounted) {
              setIsBooked(booked);
            }
          } catch {
            if (mounted) {
              setIsBooked(false);
            }
          }
        } else if (mounted) {
          setIsBooked(false);
        }

        if (currentUser?.id && getToken()) {
          const favorited = await resolveFavoriteState(
            currentUser.id,
            'service',
            Number(id),
            favoriteApi.check
          );
          if (mounted) {
            setIsLiked(favorited);
          }
        }

        const cachedLocation = readCachedLocation();
        if (cachedLocation?.latitude != null && cachedLocation?.longitude != null) {
          try {
            const localized = await serviceApi.get(id, cachedLocation.latitude, cachedLocation.longitude);
            if (mounted) {
              setService(localized);
            }
          } catch {
            // ignore
          }
        }
      } catch (fetchError: unknown) {
        if (mounted) {
          setError(getErrorMessage(fetchError, '加载服务详情失败'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void fetchService();
    return () => {
      mounted = false;
    };
  }, [id, user?.id]);

  const serviceImages = useMemo(() => (service ? getServiceImages(service) : []), [service]);
  const categoryName = service
    ? CATEGORY_NAMES[service.category]
      || (service.category === 'pet' ? CATEGORY_NAMES.pets : undefined)
      || (service.category === 'other' ? '其他服务' : undefined)
      || service.category
      || '生活服务'
    : '生活服务';
  const selectedDateLabel = bookingDate;
  const endTime = useMemo(() => getEndTime(bookingTime, duration), [bookingTime, duration]);
  const serviceFee = service ? getServiceFee(service.price, duration) : 0;
  const totalPrice = serviceFee + 20;
  const sellerProfilePath = buildProfilePath(service?.seller?.id || service?.sellerId, service?.seller?.name);
  const sellerMeta = [service?.seller?.tag, service?.seller?.region].filter(
    (value): value is string => Boolean(value && value.trim())
  );

  const sellerStats = [
    { label: '服务完成', value: `${service?.seller?.soldCount || 0}+` },
    { label: '粉丝数', value: `${service?.seller?.followersCount || 0}` },
    { label: '平均响应', value: '15min' },
  ];

  const bookingSummary = [
    { label: '预约时间', value: `${selectedDateLabel} ${bookingTime}`, accentClassName: 'text-ink' },
    { label: '结束时间', value: endTime, accentClassName: 'text-ink' },
    { label: '服务费用', value: formatCurrency(serviceFee), accentClassName: 'text-ink' },
    { label: '平台保障', value: '已包含', accentClassName: 'text-green-600' },
    { label: '预计服务费', value: formatCurrency(20), accentClassName: 'text-ink' },
  ];

  const handleBack = () => {
    if (fromProfile) {
      navigate(-1);
      return;
    }
    navigate('/service');
  };

  const handleToggleFavorite = async () => {
    if (!service || !user?.id) {
      requireAuth();
      return;
    }

    const previous = isLiked;
    setIsLiked(!previous);

    try {
      if (previous) {
        await favoriteApi.remove(user.id, 'service', Number(service.id));
        showToast('已取消收藏', 'success');
      } else {
        await favoriteApi.add(user.id, 'service', Number(service.id));
        showToast('收藏成功', 'success');
      }
    } catch {
      setIsLiked(previous);
      showToast('收藏操作失败，请稍后重试', 'error');
    }
  };

  const handleOpenChat = () => {
    if (!service?.seller) {
      return;
    }

    requireAuth(() => {
      openChat({
        id: service.seller.id || '',
        name: service.seller.name || '',
        avatar: service.seller.avatar || '',
        isOnline: true,
      });
    });
  };

  const handleOpenSellerProfile = () => {
    navigate(sellerProfilePath, {
      state: buildProfileRouteState({
        id: service?.seller?.id || service?.sellerId,
        name: service?.seller?.name,
        avatar: service?.seller?.avatar,
        tag: service?.seller?.tag,
        bio: service?.seller?.bio,
        region: service?.seller?.region,
        isVerified: service?.seller?.isVerified,
        followersCount: service?.seller?.followersCount,
      }),
    });
  };

  const handleStartBooking = () => {
    if (isOwnService || isBooked || isBooking) {
      return;
    }
    requireAuth(() => setShowConfirm(true));
  };

  const handleBooking = async () => {
    if (!service || !id || !sellerId || !user) {
      return;
    }

    setShowConfirm(false);
    setIsBooking(true);

    try {
      const booked = await serviceApi.getBookingStatus(id);
      if (booked) {
        setIsBooked(true);
        showToast('你已经预约过这个服务了，请等待处理', 'warning');
        return;
      }

      await serviceApi.book({
        serviceId: id,
        buyerId: user.id,
        sellerId,
        bookingDate,
        bookingTime,
        duration,
      });

      setIsBooked(true);
      setBookingSuccess(true);
      increaseUnread();
      window.dispatchEvent(new Event('notification-created'));

      try {
        await chatApi.sendMessage(
          sellerId,
          `我已预约服务“${service.title}”，预约时间为 ${bookingDate} ${bookingTime}，预计时长 ${duration} 小时，请留意。`
        );
      } catch {
        // ignore
      }
    } catch (bookingError: unknown) {
      showToast(getErrorMessage(bookingError, '预约失败，请稍后重试'), 'error');
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <p className="mb-4 font-bold text-muted">{error || '服务不存在或已下架'}</p>
          <button type="button" onClick={handleBack} className="rounded-2xl bg-primary px-8 py-3 font-black text-white">
            返回服务列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-surface-panel-soft min-h-screen pb-20">
      <AnimatePresence>
        {bookingSuccess ? (
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
              className="theme-card relative w-full max-w-sm rounded-[48px] p-10 text-center shadow-2xl"
            >
              <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-50 text-green-500 shadow-inner">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <h3 className="mb-4 text-3xl font-black text-ink">预约成功</h3>
              <p className="mb-10 leading-relaxed text-secondary">
                你的预约信息已经提交给 <span className="font-black text-primary">{fallbackText(service.seller?.name, '服务者')}</span>，
                对方确认后会尽快与你联系，请留意消息通知。
              </p>
              <button
                type="button"
                onClick={() => setBookingSuccess(false)}
                className="w-full rounded-[24px] bg-ink py-4 font-black text-white shadow-xl shadow-ink/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                我知道了
              </button>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <div className="theme-topbar sticky top-0 z-30 flex items-center justify-between border-b px-6 py-4 backdrop-blur-md md:hidden">
        <button type="button" onClick={handleBack} className="rounded-xl bg-surface-soft p-2">
          <ChevronLeft className="h-5 w-5 text-ink" />
        </button>
        <div className="flex items-center gap-2">
          <button type="button" className="rounded-xl bg-surface-soft p-2">
            <Share2 className="h-5 w-5 text-ink" />
          </button>
          <button type="button" onClick={() => void handleToggleFavorite()} className="rounded-xl bg-surface-soft p-2">
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-primary text-primary' : 'text-ink'}`} />
          </button>
        </div>
      </div>

      <div className="theme-topbar hidden border-b py-6 md:block">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button type="button" onClick={handleBack} className="rounded-xl p-2 transition-colors hover:bg-surface-soft">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted">
              <span>首页</span>
              <ChevronRight className="h-3 w-3" />
              <span>生活服务</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-ink">{categoryName}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all hover:bg-surface-soft">
              <Share2 className="h-4 w-4" /> 分享服务
            </button>
            <button
              type="button"
              onClick={() => void handleToggleFavorite()}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all ${
                isLiked ? 'bg-primary/5 text-primary' : 'hover:bg-surface-soft'
              }`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              {isLiked ? '已收藏' : '收藏服务'}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1120px] px-5 py-8 md:py-12">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-10 lg:col-span-8">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <span className="rounded-lg border border-primary/10 bg-primary/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                  {categoryName}
                </span>
                <div className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-600">
                  <ShieldCheck className="h-4 w-4" /> 认证服务
                </div>
              </div>
              <h1 className="text-3xl font-black leading-tight tracking-tight text-ink md:text-4xl">{service.title}</h1>
              <div className="flex flex-wrap items-center gap-5 text-[13px] font-bold text-muted">
                <div className="theme-card-soft flex items-center gap-1.5 rounded-full px-3 py-1 shadow-sm">
                  <Star className="h-4 w-4 fill-current text-yellow-400" />
                  <span className="text-ink">{service.rating}</span>
                  <span className="opacity-50">({service.reviews} 条评价)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{fallbackText(service.distance, '距离未知')}</span>
                </div>
              </div>
            </div>

            <div className="relative z-0 grid grid-cols-1 gap-3 md:grid-cols-12">
              <div className="aspect-[9/10] overflow-hidden rounded-[40px] border border-hairline bg-surface-soft shadow-2xl shadow-ink/5 md:col-span-8">
                {serviceImages[0] ? <img src={serviceImages[0]} className="h-full w-full object-cover" alt={service.title} /> : null}
              </div>
              <div className="grid grid-cols-2 gap-3 md:col-span-4 md:grid-cols-1">
                <div className="aspect-[9/10] overflow-hidden rounded-[28px] border border-hairline bg-surface-soft">
                  {serviceImages[1] || serviceImages[0] ? (
                    <img src={serviceImages[1] || serviceImages[0]} className="h-full w-full object-cover" alt={`${service.title} 图片 2`} />
                  ) : null}
                </div>
                <div className="relative aspect-[9/10] overflow-hidden rounded-[28px] border border-hairline bg-surface-soft">
                  {serviceImages[2] || serviceImages[0] ? (
                    <img src={serviceImages[2] || serviceImages[0]} className="h-full w-full object-cover" alt={`${service.title} 图片 3`} />
                  ) : null}
                  <div className="theme-card-soft absolute inset-x-3 bottom-3 flex items-center justify-center gap-2 rounded-2xl px-3 py-2.5 text-[11px] font-black shadow-xl backdrop-blur-md">
                    <Sparkles className="h-4 w-4" /> 更多服务图片
                  </div>
                </div>
              </div>
            </div>

            <div className="theme-card group relative z-10 flex flex-col items-center gap-6 rounded-[32px] p-6 shadow-sm md:flex-row">
              <button type="button" onClick={handleOpenSellerProfile} className="relative shrink-0">
                {service.seller?.avatar ? (
                  <img
                    src={service.seller.avatar}
                    alt={service.seller?.name || '服务者头像'}
                    className="h-20 w-20 rounded-[28px] border-4 border-white object-cover shadow-xl transition-transform group-hover:rotate-6"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border-4 border-white bg-surface-soft shadow-xl">
                    <User className="h-8 w-8 text-muted" />
                  </div>
                )}
                {service.seller?.isVerified ? (
                  <div className="absolute -bottom-2 -right-2 rounded-xl border-4 border-white bg-blue-500 p-1.5 text-white shadow-lg">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                ) : null}
              </button>
              <div className="flex-1 text-center md:text-left">
                <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center">
                  <h3 className="text-2xl font-black text-ink">{fallbackText(service.seller?.name, '服务者')}</h3>
                  {service.seller?.isVerified ? (
                    <span className="rounded-lg bg-green-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-green-600">
                      资质已认证
                    </span>
                  ) : null}
                  {sellerMeta.map((item) => (
                    <span
                      key={item}
                      className="rounded-lg bg-surface-soft px-3 py-1 text-[10px] font-black uppercase tracking-widest text-secondary"
                    >
                      {item}
                    </span>
                  ))}
                  {!isOwnService && sellerId ? (
                    <FollowButton
                      targetId={sellerId}
                      isFollowingInitial={isFollowing}
                      onFollowChange={setIsFollowing}
                      size="sm"
                      variant="outline"
                      className="md:ml-auto"
                    />
                  ) : null}
                </div>
                <p className="mb-4 max-w-lg text-sm leading-relaxed text-secondary">
                  {fallbackText(service.seller?.bio, '服务者暂未填写个人简介。')}
                </p>
                <div className="flex items-center justify-center gap-6 md:justify-start">
                  {sellerStats.map((stat) => (
                    <React.Fragment key={stat.label}>
                      <MetricValue label={stat.label} value={stat.value} />
                    </React.Fragment>
                  ))}
                </div>
              </div>
              {!isOwnService && service.seller ? (
                <button
                  type="button"
                  onClick={handleOpenChat}
                  className="rounded-2xl bg-surface-soft px-5 py-2.5 text-xs font-black transition-all hover:bg-hairline"
                >
                  立即沟通
                </button>
              ) : null}
            </div>

            <div className="space-y-12 px-1">
              <div>
                <h2 className="mb-6 text-3xl font-black text-ink">服务详情</h2>
                <div className="whitespace-pre-line text-lg font-medium leading-relaxed text-secondary">{service.description}</div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {SERVICE_FEATURES.map((item) => (
                  <React.Fragment key={item.title}>
                    <FeatureCard icon={item.icon} title={item.title} desc={item.desc} />
                  </React.Fragment>
                ))}
              </div>

              <ReviewSection serviceId={id as string} rating={service.rating} />
            </div>
          </div>

          <aside className="sticky top-28 lg:col-span-4">
            <div className="theme-card space-y-6 rounded-[40px] p-6 shadow-2xl shadow-ink/5 md:p-8">
              <div className="flex items-end justify-between">
                <div>
                  <span className="mb-2 block text-xs font-black uppercase tracking-widest text-muted">预约价格</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black tracking-tighter text-ink">{formatCurrency(service.price)}</span>
                    <span className="text-sm font-bold text-muted">/{service.unit}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 rounded-xl border border-primary/10 bg-primary/5 px-3 py-1.5 text-xs font-black text-primary">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <span>{service.rating}</span>
                </div>
              </div>

              <div className="space-y-6 rounded-3xl bg-surface-soft p-6">
                <div className="space-y-2">
                  <label className="ml-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted">
                    <Calendar className="h-3.5 w-3.5" />
                    选择日期
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    min={formatDateValue(new Date())}
                    onChange={(event) => setBookingDate(event.target.value)}
                    className="w-full rounded-2xl border border-white bg-white px-4 py-3 text-sm font-bold text-ink outline-none transition-all focus:border-primary/30 focus:ring-4 focus:ring-primary/5"
                  />
                </div>

                <div className="space-y-2">
                  <label className="ml-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted">
                    <Clock className="h-3.5 w-3.5" />
                    开始时间
                  </label>
                  <input
                    type="time"
                    value={bookingTime}
                    onChange={(event) => setBookingTime(event.target.value)}
                    className="w-full rounded-2xl border border-white bg-white px-4 py-3 text-sm font-bold text-ink outline-none transition-all focus:border-primary/30 focus:ring-4 focus:ring-primary/5"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-muted">服务时长</label>
                  <div className="relative">
                    <select
                      value={duration}
                      onChange={(event) => setDuration(Number(event.target.value))}
                      className="w-full cursor-pointer appearance-none rounded-xl border border-white bg-white px-4 py-3 text-xs font-black outline-none transition-all focus:border-primary/20 focus:ring-4 focus:ring-primary/5"
                    >
                      {DURATION_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStartBooking}
                  disabled={isBooking || isBooked || isOwnService}
                    className="group flex h-14 w-full items-center justify-center gap-3 rounded-[22px] bg-ink font-black text-white shadow-xl shadow-ink/20 transition-all disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isBooked ? (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      已预约
                    </>
                  ) : isBooking ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-4 border-white/30 border-t-white" />
                  ) : isOwnService ? (
                    '自己的服务不能预约'
                  ) : (
                    <>
                      <Zap className="h-5 w-5 transition-colors group-hover:text-primary" />
                      立即预约
                    </>
                  )}
                </motion.button>

                <p className="py-2 text-center text-[10px] font-black uppercase tracking-widest text-muted">
                  提交预约后会通知服务者，请保持联系方式畅通
                </p>
              </div>

              <div className="mt-4 space-y-4 border-t border-hairline pt-5">
                {bookingSummary.map((row) => (
                  <React.Fragment key={row.label}>
                    <SummaryRow label={row.label} value={row.value} accentClassName={row.accentClassName} />
                  </React.Fragment>
                ))}
                <div className="flex items-center justify-between pt-6">
                  <span className="text-lg font-black text-ink">合计金额</span>
                  <span className="text-2xl font-black text-primary">{formatCurrency(totalPrice)}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-4 rounded-3xl border border-hairline bg-surface-soft p-6">
              <div className="rounded-2xl bg-white p-3 text-primary shadow-sm">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-black text-ink">平台保障交易与预约记录</p>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-muted">沟通记录、预约时间、服务信息都会保留</p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="确认预约"
        message={`确认预约“${service.title}”，时间为 ${selectedDateLabel} ${bookingTime}，结束时间约为 ${endTime}。`}
        confirmText="确认预约"
        cancelText="再想想"
        onConfirm={() => void handleBooking()}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="theme-card flex gap-4 rounded-3xl p-5 shadow-sm transition-all hover:border-primary/20">
      <div className="shrink-0">{icon}</div>
      <div>
        <h4 className="mb-1 font-black text-ink">{title}</h4>
        <p className="text-xs font-medium text-muted">{desc}</p>
      </div>
    </div>
  );
}

function MetricValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-xs font-black uppercase tracking-widest text-muted">{label}</p>
      <p className="text-lg font-black text-ink">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value, accentClassName }: { label: string; value: string; accentClassName: string }) {
  return (
    <div className="flex items-center justify-between text-sm font-medium">
      <span className="text-muted">{label}</span>
      <span className={`font-black ${accentClassName}`}>{value}</span>
    </div>
  );
}

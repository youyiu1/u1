/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRightLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  MessageCircle,
  Share2,
  ShieldCheck,
  Sparkles,
  Verified,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { FollowButton } from '../../components/common/FollowButton';
import { MarketStatusBadge } from '../../components/common/MarketStatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useAuthCheck } from '../../context/useAuthCheck';
import { useChat } from '../../context/ChatContext';
import { useNotification } from '../../context/NotificationContext';
import { useToast } from '../../context/ToastContext';
import { favoriteApi, getToken, marketApi, userApi } from '../../services/api';
import { Item } from '../../types';
import { getStoredUser } from '../../utils/authStorage';
import { fallbackText, formatCurrency } from '../../utils/display';
import { getErrorMessage } from '../../utils/error';
import { resolveFollowState } from '../../utils/followStorage';
import { resolveFavoriteState } from '../../utils/interactionStorage';
import { parseImages } from '../../utils/images';
import { getMarketStatusMeta, isMarketItemPurchasable } from '../../utils/marketStatus';
import { buildProfilePath, buildProfileRouteState } from '../../utils/profileRoute';

const ITEM_BENEFITS = [
  { icon: <CheckCircle2 className="h-5 w-5" />, title: '实物验真', desc: '平台审核后展示，信息更清晰。' },
  { icon: <ArrowRightLeft className="h-5 w-5" />, title: '购买留痕', desc: '购买请求会保留通知记录，沟通更清楚。' },
  { icon: <ShieldCheck className="h-5 w-5" />, title: '同城沟通', desc: '支持先聊天再成交，交易更安心。' },
];

export default function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { openChat } = useChat();
  const { user: currentUser } = useAuth();
  const { requireAuth } = useAuthCheck();
  const { increaseUnread } = useNotification();
  const { showToast } = useToast();

  const fromProfile = location.state?.from;
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showPurchaseConfirm, setShowPurchaseConfirm] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const sellerId = item?.seller?.id || item?.sellerId || '';
  const itemStatus = item?.status ?? 'active';
  const statusMeta = getMarketStatusMeta(itemStatus, item?.rejectReason);
  const isOwnItem = Boolean(currentUser?.id && currentUser.id === sellerId);
  const canPurchase = Boolean(!isOwnItem && isMarketItemPurchasable(itemStatus) && !isPurchasing);

  const sellerName = fallbackText(item?.seller?.name || item?.sellerName, '本地卖家');
  const sellerAvatar = item?.seller?.avatar || item?.sellerAvatar || '';
  const sellerVerified = item?.seller?.verified ?? item?.sellerVerified ?? false;
  const itemCondition = fallbackText(item?.itemCondition || item?.condition, '成色未知');
  const sellerOnSaleCount = item?.seller?.onSaleCount ?? item?.sellerOnSaleCount ?? 0;
  const sellerSoldCount = item?.seller?.soldCount ?? item?.sellerSoldCount ?? 0;
  const sellerFollowersCount = item?.seller?.followersCount ?? item?.sellerFollowersCount ?? 0;

  const images = useMemo(() => {
    if (!item) {
      return [];
    }
    const parsed = parseImages(item.images);
    if (parsed.length > 0) {
      return parsed;
    }
    return item.image ? [item.image] : [];
  }, [item]);

  const activeImage = images[activeImg] || images[0] || '';
  const sellerProfilePath = buildProfilePath(sellerId, sellerName);
  const statusNotice = getStatusNotice(item, isOwnItem);

  useEffect(() => {
    setActiveImg(0);
  }, [item?.id]);

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) {
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await marketApi.get(id);
        setItem(data);

        const storedUser = getStoredUser();
        const dataSellerId = data.seller?.id || data.sellerId || '';
        if (storedUser?.id && dataSellerId && storedUser.id !== dataSellerId) {
          const following = await resolveFollowState(storedUser.id, dataSellerId, userApi.isFollowing);
          setIsFollowing(following);
        } else {
          setIsFollowing(false);
        }

        if (storedUser?.id && getToken()) {
          try {
            const favorited = await resolveFavoriteState(storedUser.id, 'market', Number(id), favoriteApi.check);
            setIsLiked(favorited);
          } catch {
            setIsLiked(false);
          }
        } else {
          setIsLiked(false);
        }
      } catch (fetchError: unknown) {
        setError(getErrorMessage(fetchError, '商品详情加载失败'));
      } finally {
        setLoading(false);
      }
    };

    void fetchItem();
  }, [id]);

  const handleOpenSellerProfile = () => {
    navigate(sellerProfilePath, {
      state: buildProfileRouteState({
        id: sellerId,
        name: sellerName,
        avatar: sellerAvatar,
        isVerified: sellerVerified,
        followersCount: sellerFollowersCount,
      }),
    });
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
      requireAuth();
      return;
    }

    const previous = isLiked;
    try {
      if (previous) {
        await favoriteApi.remove(currentUser.id, 'market', Number(item.id));
      } else {
        await favoriteApi.add(currentUser.id, 'market', Number(item.id));
      }
      setIsLiked(!previous);
      showToast(previous ? '已取消收藏' : '收藏成功', 'success');
    } catch {
      showToast('操作失败，请稍后重试', 'error');
    }
  };

  const handleOpenChat = () => {
    requireAuth(() =>
      openChat({
        id: sellerId,
        name: sellerName,
        avatar: sellerAvatar,
        isOnline: true,
      })
    );
  };

  const handleStartPurchase = () => {
    if (!canPurchase) {
      return;
    }
    requireAuth(() => setShowPurchaseConfirm(true));
  };

  const handlePurchase = async () => {
    if (!item || !id || !sellerId || !currentUser?.id) {
      return;
    }

    setShowPurchaseConfirm(false);
    setIsPurchasing(true);
    try {
      await marketApi.purchase(id);
      setPurchaseSuccess(true);
      increaseUnread();
      window.dispatchEvent(new Event('notification-created'));
    } catch (purchaseError: unknown) {
      showToast(getErrorMessage(purchaseError, '购买请求提交失败，请稍后重试'), 'error');
    } finally {
      setIsPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 font-bold text-muted">{error || '商品不存在或当前不可查看'}</p>
          <button onClick={handleBack} className="rounded-2xl bg-primary px-8 py-3 font-black text-white">
            返回闲置市场
          </button>
        </div>
      </div>
    );
  }

  const locationLabel = fallbackText(item.location, '附近');
  const sellerStats = [
    { label: '粉丝', value: sellerFollowersCount },
    { label: '在售', value: sellerOnSaleCount },
    { label: '成交', value: sellerSoldCount },
  ];

  return (
    <div className="min-h-screen bg-[#fcfdff] pb-20">
      <AnimatePresence>
        {purchaseSuccess ? (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPurchaseSuccess(false)}
              className="absolute inset-0 bg-ink/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-sm rounded-[48px] border border-white bg-white p-10 text-center shadow-2xl"
            >
              <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-50 text-green-500 shadow-inner">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <h3 className="mb-4 text-3xl font-black text-ink">购买请求已提交</h3>
              <p className="mb-10 leading-relaxed text-secondary">
                你对商品
                <span className="font-black text-primary">《{item.title}》</span>
                的购买请求已经发送给
                <span className="font-black text-primary">{sellerName}</span>
                ，请留意通知结果。
              </p>
              <button
                type="button"
                onClick={() => setPurchaseSuccess(false)}
                className="w-full rounded-[24px] bg-ink py-4 font-black text-white shadow-xl shadow-ink/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                我知道了
              </button>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-hairline bg-white/80 px-6 py-4 backdrop-blur-md md:hidden">
        <button onClick={handleBack} className="rounded-xl bg-surface-soft p-2">
          <ChevronLeft className="h-5 w-5 text-ink" />
        </button>
        <div className="flex items-center gap-2">
          <button className="rounded-xl bg-surface-soft p-2">
            <Share2 className="h-5 w-5 text-ink" />
          </button>
          <button onClick={handleToggleFavorite} className="rounded-xl bg-surface-soft p-2">
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-primary text-primary' : 'text-ink'}`} />
          </button>
        </div>
      </div>

      <div className="hidden border-b border-hairline bg-white py-6 md:block">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button onClick={handleBack} className="rounded-xl p-2 transition-colors hover:bg-surface-soft">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted">
              <span>首页</span>
              <ChevronRight className="h-3 w-3" />
              <span>闲置交易</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-ink">{item.title}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all hover:bg-surface-soft">
              <Share2 className="h-4 w-4" />
              分享商品
            </button>
            <button
              onClick={handleToggleFavorite}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all ${
                isLiked ? 'bg-primary/5 text-primary' : 'hover:bg-surface-soft'
              }`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              {isLiked ? '已收藏' : '收藏商品'}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-6 py-8 md:px-12">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
          <div className="space-y-10 lg:col-span-8">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[40px] border border-hairline shadow-2xl shadow-ink/5 md:col-span-12">
                {activeImage ? (
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeImg}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      src={activeImage}
                      className="h-full w-full object-cover"
                      alt={item.title}
                    />
                  </AnimatePresence>
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-surface-soft text-sm font-bold text-muted">暂无图片</div>
                )}
                <div className="absolute left-6 top-6 flex flex-wrap items-center gap-2">
                  <span className="rounded-2xl bg-black/60 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md">
                    {itemCondition}
                  </span>
                  <MarketStatusBadge status={item.status} rejectReason={item.rejectReason} />
                </div>
              </div>
              {images.length > 1 ? (
                <div className="mt-2 flex items-center gap-4 md:col-span-12">
                  {images.slice(0, 4).map((image, index) => (
                    <button
                      key={image + index}
                      onClick={() => setActiveImg(index)}
                      className={`relative h-24 w-24 overflow-hidden rounded-2xl border-2 transition-all ${
                        activeImg === index
                          ? 'scale-105 border-primary shadow-lg shadow-primary/20'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={image} className="h-full w-full object-cover" alt={`${item.title}-${index + 1}`} />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {ITEM_BENEFITS.map((benefit) => (
                <React.Fragment key={benefit.title}>
                  <InfoFeatureCard {...benefit} />
                </React.Fragment>
              ))}
            </div>

            <div className="rounded-[40px] border border-hairline bg-white p-8 md:p-12">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-black text-ink">商品详情</h2>
                <div className="flex items-center gap-1.5 rounded-full bg-primary/5 px-3 py-1.5 text-xs font-black text-primary">
                  <Sparkles className="h-3 w-3" />
                  人气推荐
                </div>
              </div>

              {statusNotice ? (
                <div className={`mb-8 rounded-3xl border px-5 py-4 ${statusNotice.className}`}>
                  <p className="text-sm font-black">{statusNotice.title}</p>
                  <p className="mt-1 text-sm font-medium opacity-90">{statusNotice.description}</p>
                </div>
              ) : null}

              <div className="space-y-4 whitespace-pre-line text-lg font-medium leading-relaxed text-secondary">{item.description}</div>

              <div className="mt-12 grid grid-cols-2 gap-6 border-t border-hairline pt-12 md:grid-cols-3">
                <DetailInfoItem label="成色" value={itemCondition} />
                <DetailInfoItem label="运费" value={item.freeShipping ? '包邮' : '与卖家协商'} />
                <DetailInfoItem label="当面验货" value="支持" />
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[40px] border border-hairline bg-white p-8 md:p-12">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-black text-ink">商品位置</h2>
                <span className="flex items-center gap-1 text-sm font-bold text-muted">
                  <MapPin className="h-4 w-4" />
                  {locationLabel}
                </span>
              </div>
              <div className="h-80 w-full overflow-hidden rounded-3xl border border-hairline opacity-90 grayscale contrast-[0.9]">
                <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_20%_30%,_rgba(255,56,92,0.18),_transparent_35%),radial-gradient(circle_at_80%_20%,_rgba(74,144,226,0.18),_transparent_35%),radial-gradient(circle_at_70%_75%,_rgba(80,195,142,0.2),_transparent_40%),linear-gradient(135deg,_#f7f7f7_0%,_#ececec_100%)]">
                  <div className="text-center">
                    <MapPin className="mx-auto mb-2 h-8 w-8 text-primary" />
                    <p className="text-xs font-black uppercase tracking-widest text-ink">附近位置示意</p>
                    <p className="mt-1 text-[11px] font-bold text-muted">{locationLabel}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="sticky top-28 lg:col-span-4">
            <div className="space-y-10 rounded-[40px] border border-hairline bg-white p-8 shadow-2xl shadow-ink/5">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-black uppercase tracking-widest text-muted">转让价格</span>
                  <div className="flex items-center gap-2">
                    <MarketStatusBadge status={item.status} rejectReason={item.rejectReason} />
                    <span className="flex items-center gap-1 rounded-md border border-green-100 bg-green-50 px-2 py-0.5 text-[10px] font-black text-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      可议价
                    </span>
                  </div>
                </div>
                <div className="flex items-end gap-3">
                  <span className="text-5xl font-black tracking-tighter text-ink">{formatCurrency(item.price)}</span>
                  {item.originalPrice ? (
                    <span className="mb-1.5 text-lg font-bold text-muted opacity-50 line-through">{formatCurrency(item.originalPrice)}</span>
                  ) : null}
                </div>
              </div>

              <div className="space-y-6 rounded-3xl bg-surface-soft p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="group relative cursor-pointer" onClick={handleOpenSellerProfile}>
                      {sellerAvatar ? (
                        <img
                          src={sellerAvatar}
                          className="h-14 w-14 rounded-2xl border-2 border-white object-cover shadow-md transition-transform group-hover:scale-105"
                          alt={sellerName}
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-white bg-white text-sm font-black text-primary shadow-md">
                          {(sellerName || '?')[0]}
                        </div>
                      )}
                      {sellerVerified ? (
                        <div className="absolute -bottom-1 -right-1 rounded-lg border-2 border-white bg-blue-500 p-0.5 text-white">
                          <Verified className="h-3 w-3" />
                        </div>
                      ) : null}
                    </div>
                    <div>
                      <h3 className="group cursor-pointer font-black text-ink transition-colors hover:text-primary" onClick={handleOpenSellerProfile}>
                        {sellerName}
                      </h3>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">本地活跃卖家</span>
                      </div>
                    </div>
                  </div>
                  {!isOwnItem ? (
                    <FollowButton
                      targetId={sellerId}
                      isFollowingInitial={isFollowing}
                      onFollowChange={setIsFollowing}
                      size="sm"
                      variant="ghost"
                    />
                  ) : null}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {sellerStats.map((stat) => (
                    <React.Fragment key={stat.label}>
                      <StatsCard {...stat} />
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {!isOwnItem ? (
                <div className="space-y-4">
                  {statusMeta?.description ? (
                    <div className="rounded-2xl border border-hairline bg-surface-soft px-4 py-3 text-sm font-medium text-secondary">
                      {statusMeta.description}
                    </div>
                  ) : null}
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ scale: canPurchase ? 1.02 : 1 }}
                      whileTap={{ scale: canPurchase ? 0.98 : 1 }}
                      onClick={handleStartPurchase}
                      disabled={!canPurchase}
                      className="group flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-primary font-black text-white shadow-xl shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <div className="rounded-xl bg-white/10 p-2 transition-colors group-hover:bg-white/20">
                        <ArrowRightLeft className="h-5 w-5" />
                      </div>
                      {isPurchasing ? '提交中...' : canPurchase ? '立即购买' : statusMeta?.label || '不可购买'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleOpenChat}
                      className="group flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-ink font-black text-white shadow-xl shadow-ink/20"
                    >
                      <div className="rounded-xl bg-white/10 p-2 transition-colors group-hover:bg-primary">
                        <MessageCircle className="h-5 w-5" />
                      </div>
                      立刻沟通
                    </motion.button>
                  </div>
                </div>
              ) : statusNotice ? (
                <div className={`rounded-2xl border px-4 py-4 ${statusNotice.className}`}>
                  <p className="text-sm font-black">{statusNotice.title}</p>
                  <p className="mt-1 text-sm font-medium opacity-90">{statusNotice.description}</p>
                </div>
              ) : null}

              <div className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-primary/5 p-4">
                <ShieldCheck className="h-6 w-6 shrink-0 text-primary" />
                <p className="text-[10px] font-black uppercase tracking-wider text-primary">
                  同城生活担保 · 本地实名交易记录 · 支持先沟通后成交
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showPurchaseConfirm}
        title="确认购买"
        message={`确认提交商品《${item.title}》的购买请求吗？提交后会立即通知卖家 ${sellerName}，请保持联系方式畅通。`}
        confirmText="确认购买"
        cancelText="再想想"
        onConfirm={() => void handlePurchase()}
        onCancel={() => setShowPurchaseConfirm(false)}
      />
    </div>
  );
}

function getStatusNotice(item: Item | null, isOwnItem: boolean) {
  if (!item?.status) {
    return null;
  }

  if (item.status === 'sold') {
    return {
      title: '该商品已售出',
      description: isOwnItem ? '商品已经完成交易，详情仍会保留给你查看。' : '该商品已经完成交易，目前不能再次发起购买。',
      className: 'border-stone-200 bg-stone-50 text-stone-700',
    };
  }

  if (item.status === 'pending' && isOwnItem) {
    return {
      title: '商品审核中',
      description: '你的商品正在等待审核，审核通过后才会展示给其他用户。',
      className: 'border-amber-200 bg-amber-50 text-amber-700',
    };
  }

  if (item.status === 'rejected' && isOwnItem) {
    return {
      title: '商品未通过审核',
      description: item.rejectReason || '请根据审核原因调整内容后重新发布。',
      className: 'border-rose-200 bg-rose-50 text-rose-700',
    };
  }

  return null;
}

function InfoFeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="group flex flex-col rounded-3xl border border-hairline bg-white p-5 transition-colors hover:border-primary/20">
      <div className="mb-3 w-fit rounded-xl bg-primary/5 p-2.5 text-primary transition-transform group-hover:scale-110">{icon}</div>
      <h4 className="mb-1 text-sm font-black text-ink">{title}</h4>
      <p className="text-[11px] font-bold text-muted">{desc}</p>
    </div>
  );
}

function DetailInfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">{label}</p>
      <p className="font-black text-ink">{value}</p>
    </div>
  );
}

function StatsCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/50 bg-white/80 p-3 text-center">
      <p className="text-sm font-black text-ink">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-wider text-muted">{label}</p>
    </div>
  );
}

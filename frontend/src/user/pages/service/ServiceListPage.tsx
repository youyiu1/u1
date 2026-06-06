/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Brush, CheckCircle2, Dumbbell, MapPin, Plus, Scissors, Search, Sparkles, Star, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BackToTop } from '../../components/common/BackToTop';
import { FavoriteButton } from '../../components/common/FavoriteButton';
import { useAuthCheck } from '../../context/useAuthCheck';
import { usePublish } from '../../context/PublishContext';
import { serviceApi } from '../../services/api';
import { Service } from '../../types';
import { getErrorMessage } from '../../utils/error';
import { getServicePrimaryImage } from '../../utils/images';
import { getCurrentLocation, getGeolocationPermissionState, readCachedLocation } from '../../utils/location';
import { matchesAnyKeyword, normalizeSearchTerm } from '../../utils/search';

type ServiceCategory = {
  id: string;
  name: string;
  icon: React.ReactNode;
};

const CATEGORIES: ServiceCategory[] = [
  { id: 'all', name: '全部分类', icon: <Sparkles className="h-4 w-4" /> },
  { id: 'domestic', name: '家政保洁', icon: <Brush className="h-4 w-4" /> },
  { id: 'repair', name: '家庭维修', icon: <Wrench className="h-4 w-4" /> },
  { id: 'pet', name: '宠物生活', icon: <Scissors className="h-4 w-4" /> },
  { id: 'sports', name: '运动私教', icon: <Dumbbell className="h-4 w-4" /> },
];

function getDistanceLabel(distance?: string) {
  return distance?.trim() ? distance : '距离未知';
}

function getCategoryLabel(categoryId: string) {
  return CATEGORIES.find((category) => category.id === categoryId)?.name || categoryId;
}

export default function ServiceListPage() {
  const navigate = useNavigate();
  const { requireAuth } = useAuthCheck();
  const { openPublish } = usePublish();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [nearbyEnabled, setNearbyEnabled] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationTip, setLocationTip] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const baseData = await serviceApi.list();
        setServices(baseData);

        const cachedLocation = readCachedLocation();
        if (cachedLocation) {
          setNearbyEnabled(true);
          const localizedData = await serviceApi.list(cachedLocation.latitude, cachedLocation.longitude);
          setServices(localizedData);
        }
      } catch (fetchError: unknown) {
        setError(getErrorMessage(fetchError, '加载失败'));
      } finally {
        setLoading(false);
      }
    };

    void fetchServices();
  }, []);

  const enableNearbySort = async () => {
    if (locating) {
      return;
    }

    setLocating(true);
    setLocationTip('');

    try {
      const permission = await getGeolocationPermissionState();
      if (permission === 'denied') {
        setLocationTip('浏览器已禁止定位，请在设置中开启，或继续使用默认排序。');
        return;
      }

      const location = await getCurrentLocation(5000);
      if (!location) {
        setLocationTip('暂时无法获取位置，已保持默认排序。');
        return;
      }

      const localizedData = await serviceApi.list(location.latitude, location.longitude);
      setServices(localizedData);
      setNearbyEnabled(true);
      setLocationTip('已开启附近排序。');
    } catch {
      setLocationTip('定位失败，已保持默认排序。');
    } finally {
      setLocating(false);
    }
  };

  const filteredServices = useMemo(() => {
    const keyword = normalizeSearchTerm(searchQuery);
    return services.filter(
      (service) =>
        (activeCategory === 'all' || service.category === activeCategory) &&
        matchesAnyKeyword(keyword, [service.title])
    );
  }, [activeCategory, searchQuery, services]);

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="bg-primary/5 pb-8 pt-10 sm:pt-12">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-20">
          <div className="flex flex-col items-stretch justify-between gap-4 sm:gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl flex-1">
              <h1 className="mb-4 text-2xl font-bold text-ink sm:mb-6 sm:text-3xl">发现身边的专业服务</h1>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Search className="h-5 w-5 text-muted transition-colors group-focus-within:text-primary" />
                </div>
                <input
                  type="text"
                  placeholder="搜索服务名称、关键词..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                    }
                  }}
                  className="w-full rounded-2xl border border-hairline bg-white py-3.5 pl-12 pr-4 text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-primary/10 sm:py-4"
                />
              </div>
            </div>

            <button
              onClick={() => requireAuth(() => openPublish())}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 font-bold text-white shadow-lg shadow-primary/10 transition-all hover:bg-primary-hover md:w-auto sm:px-8 sm:py-4"
            >
              <Plus className="h-5 w-5" />
              发布服务
            </button>
          </div>

          <div className="no-scrollbar mt-6 flex items-center gap-3 overflow-x-auto pb-2 sm:mt-8 sm:gap-4">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all ${
                  activeCategory === category.id
                    ? 'bg-primary text-white shadow-md'
                    : 'border border-hairline bg-white text-secondary hover:border-primary/20'
                }`}
              >
                {category.icon}
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 sm:py-12 lg:px-20">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:mb-8 md:flex-row md:items-center">
          <div>
            <h2 className="text-lg font-bold text-ink sm:text-xl">精选服务商</h2>
            <p className="mt-1 text-xs text-muted">
              {nearbyEnabled ? '已按你的位置优先展示附近服务' : '默认按同城服务展示，不会自动获取定位'}
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 md:w-auto md:items-end">
            <button
              onClick={enableNearbySort}
              disabled={locating}
              className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black transition-all md:w-auto ${
                nearbyEnabled
                  ? 'border border-primary/10 bg-primary/5 text-primary'
                  : 'border border-hairline bg-white text-secondary hover:border-primary/30 hover:text-primary'
              } disabled:opacity-60`}
            >
              <MapPin className="h-4 w-4" />
              {locating ? '定位中...' : nearbyEnabled ? '附近排序已开启' : '开启附近排序'}
            </button>
            {locationTip ? <span className="text-[10px] font-bold text-muted">{locationTip}</span> : null}
          </div>
        </div>

        {error ? <div className="py-8 text-center text-red-500">{error}</div> : null}

        <div className="grid grid-cols-1 gap-x-4 gap-y-8 xs:grid-cols-2 sm:gap-x-6 sm:gap-y-10 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {loading ? (
            Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <div className="aspect-square animate-pulse rounded-2xl bg-stone-200" />
                <div className="h-4 animate-pulse rounded bg-stone-200" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-stone-200" />
              </div>
            ))
          ) : filteredServices.length === 0 ? (
            <div className="col-span-full py-16 text-center text-muted">暂无服务</div>
          ) : (
            filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                categoryLabel={getCategoryLabel(service.category)}
                distanceLabel={getDistanceLabel(service.distance)}
                onClick={() => navigate(`/service/${service.id}`)}
              />
            ))
          )}
        </div>
      </main>

      <BackToTop />
    </div>
  );
}

function ServiceCard({
  service,
  categoryLabel,
  distanceLabel,
  onClick,
}: {
  key?: React.Key;
  service: Service;
  categoryLabel: string;
  distanceLabel: string;
  onClick: () => void;
}) {
  const primaryImage = getServicePrimaryImage({ image: service.image, images: service.images ?? [] });
  const highlights = Array.isArray(service.highlights) ? service.highlights.filter(Boolean).slice(0, 2) : [];

  return (
    <div className="group cursor-pointer" onClick={onClick}>
      <div className="relative mb-3 aspect-square overflow-hidden rounded-2xl bg-surface-soft">
        {primaryImage ? (
          <img src={primaryImage} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" alt={service.title} />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-stone-400">暂无图片</div>
        )}

        <div className="absolute left-3 top-3 flex items-center gap-1 rounded bg-white/90 px-2 py-1 text-[10px] font-bold text-ink backdrop-blur-md">
          <Star className="h-3 w-3 fill-current text-yellow-400" />
          <span>{service.rating}</span>
        </div>
        <FavoriteButton targetId={service.id} targetType="service" />
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded bg-primary/5 px-2 py-0.5 text-[10px] font-bold text-primary">{categoryLabel}</span>
          <div className="flex items-center gap-1 text-[10px] font-bold text-green-600">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            <span>认证</span>
          </div>
        </div>

        <h3 className="mb-2 line-clamp-2 text-sm font-bold text-ink transition-colors group-hover:text-primary">{service.title}</h3>

        <div className="mb-3 flex flex-wrap gap-1.5">
          {highlights.map((highlight, index) => (
            <span key={index} className="rounded bg-surface-soft px-2 py-0.5 text-[10px] text-secondary">
              {highlight}
            </span>
          ))}
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-primary">￥{service.price}</span>
              <span className="text-[10px] text-muted">/{service.unit}</span>
            </div>
            <p className="mt-0.5 text-[10px] text-muted">{service.reviews} 条评价</p>
          </div>
          <div className="flex items-center gap-1 text-secondary">
            <MapPin className="h-3 w-3 text-muted" />
            <span className="text-[10px] font-medium">{distanceLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

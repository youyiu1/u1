/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Brush, CheckCircle2, Dumbbell, MapPin, Plus, Scissors, Search, Sparkles, Star, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FavoriteButton } from '../../components/common/FavoriteButton';
import { BackToTop } from '../../components/common/BackToTop';
import { useAuthCheck } from '../../context/useAuthCheck';
import { usePublish } from '../../context/PublishContext';
import { serviceApi } from '../../services/api';
import { Service } from '../../types';
import { getCurrentLocation, getGeolocationPermissionState, readCachedLocation } from '../../utils/location';
import { getServicePrimaryImage } from '../../utils/images';
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
      } catch (fetchError: any) {
        setError(fetchError.message || '加载失败');
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
      (service) => (activeCategory === 'all' || service.category === activeCategory) && matchesAnyKeyword(keyword, [service.title])
    );
  }, [activeCategory, searchQuery, services]);

  const displayDistance = (distance?: string) => {
    if (!distance || !distance.trim()) {
      return '距离未知';
    }
    return distance;
  };

  const getCategoryLabel = (categoryId: string) => CATEGORIES.find((category) => category.id === categoryId)?.name || categoryId;

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="bg-primary/5 pb-8 pt-10 sm:pt-12">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-20">
          <div className="flex flex-col items-stretch justify-between gap-4 md:flex-row md:items-end sm:gap-6">
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
              <Plus className="h-5 w-5" /> 发布服务
            </button>
          </div>

          <div className="mt-6 flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar sm:mt-8 sm:gap-4">
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
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center sm:mb-8">
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
            {locationTip && <span className="text-[10px] font-bold text-muted">{locationTip}</span>}
          </div>
        </div>

        {error && <div className="py-8 text-center text-red-500">{error}</div>}

        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-80 animate-pulse rounded-3xl bg-stone-100" />)
          ) : filteredServices.length === 0 ? (
            <div className="col-span-full py-16 text-center text-muted">暂无服务</div>
          ) : (
            filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                categoryLabel={getCategoryLabel(service.category)}
                distanceLabel={displayDistance(service.distance)}
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
  const highlights = Array.isArray(service.highlights) ? service.highlights.filter(Boolean) : [];

  return (
    <div className="group cursor-pointer overflow-hidden rounded-3xl border border-hairline bg-white transition-all hover:shadow-xl" onClick={onClick}>
      <div className="relative h-48 overflow-hidden">
        {primaryImage ? (
          <img src={primaryImage} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" alt={service.title} />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-stone-400">暂无图片</div>
        )}

        <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1 shadow-sm backdrop-blur-md">
          <Star className="h-3 w-3 fill-current text-yellow-400" />
          <span className="text-xs font-bold text-ink">{service.rating}</span>
          <span className="text-[10px] font-medium text-muted">({service.reviews} 评价)</span>
        </div>
        <FavoriteButton targetId={service.id} targetType="service" />
      </div>

      <div className="p-6">
        <div className="mb-3 flex items-center gap-3">
          <span className="rounded bg-primary/5 px-2 py-0.5 text-[10px] font-bold text-primary">{categoryLabel}</span>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            <span className="text-[10px] font-bold text-green-600">平台认证</span>
          </div>
        </div>

        <h3 className="mb-2 text-lg font-bold text-ink transition-colors group-hover:text-primary">{service.title}</h3>

        <div className="mb-6 flex flex-wrap gap-2">
          {highlights.map((highlight, index) => (
            <span key={index} className="rounded bg-surface-soft px-2 py-0.5 text-[10px] text-secondary">
              {highlight}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-hairline pt-4">
          <div className="flex items-baseline gap-1">
            <span className="text-[10px] font-medium text-muted">起步价</span>
            <span className="text-xl font-bold text-primary">¥{service.price}</span>
            <span className="text-[10px] text-muted">/{service.unit}</span>
          </div>
          <div className="flex items-center gap-1.5 text-secondary">
            <MapPin className="h-3 w-3 text-muted" />
            <span className="text-[10px] font-medium">{distanceLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

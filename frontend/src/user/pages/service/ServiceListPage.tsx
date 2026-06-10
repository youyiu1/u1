/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Brush, CheckCircle2, Dumbbell, MapPin, Plus, Scissors, Sparkles, Star, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BackToTop } from '../../components/common/BackToTop';
import { FavoriteButton } from '../../components/common/FavoriteButton';
import { Pagination } from '../../components/common/Pagination';
import { useAuthCheck } from '../../context/useAuthCheck';
import { usePublish } from '../../context/PublishContext';
import { serviceApi } from '../../services/api';
import { Service } from '../../types';
import { getErrorMessage } from '../../utils/error';
import { getServicePrimaryImage } from '../../utils/images';
import { getCurrentLocation, getGeolocationPermissionState, readCachedLocation } from '../../utils/location';

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

const DEFAULT_PAGE_SIZE = 10;

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
  const [nearbyEnabled, setNearbyEnabled] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationTip, setLocationTip] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalItems, setTotalItems] = useState(0);
  const [locationCoords, setLocationCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    const cachedLocation = readCachedLocation();
    if (!cachedLocation) {
      return;
    }
    setNearbyEnabled(true);
    setLocationCoords(cachedLocation);
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await serviceApi.list({
          category: activeCategory,
          lat: locationCoords?.latitude,
          lng: locationCoords?.longitude,
          pageNum: currentPage,
          pageSize,
        });
        setServices(result.data);
        setTotalItems(result.total);
      } catch (fetchError: unknown) {
        setError(getErrorMessage(fetchError, '加载失败'));
      } finally {
        setLoading(false);
      }
    };

    void fetchServices();
  }, [activeCategory, currentPage, locationCoords, pageSize]);

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

      setLocationCoords(location);
      setNearbyEnabled(true);
      setCurrentPage(1);
      setLocationTip('已开启附近排序。');
    } catch {
      setLocationTip('定位失败，已保持默认排序。');
    } finally {
      setLocating(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="min-h-screen pb-20">
      <div className="pb-8 pt-10 sm:pt-12">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-20">
          <div className="px-1 py-3 sm:px-2 sm:py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 px-3 py-1.5 text-[11px] font-semibold tracking-[0.16em] text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  生活服务
                </div>
                <h1 className="mt-4 text-[26px] font-semibold tracking-[-0.03em] text-ink sm:text-[32px]">找同城服务，直接按分类挑</h1>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                <button
                  onClick={enableNearbySort}
                  disabled={locating}
                  className={`flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black transition-all ${
                    nearbyEnabled
                      ? 'border border-primary/15 bg-primary/5 text-primary'
                      : 'border border-hairline bg-white text-secondary hover:border-primary/30 hover:text-primary'
                  } disabled:opacity-60`}
                >
                  <MapPin className="h-4 w-4" />
                  {locating ? '定位中...' : nearbyEnabled ? '已按附近优先展示' : '开启附近优先'}
                </button>

                <button
                  onClick={() => requireAuth(() => openPublish())}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-black text-white shadow-lg shadow-primary/15 transition-all hover:bg-primary-hover"
                >
                  <Plus className="h-4 w-4" />
                  发布服务
                </button>
              </div>
            </div>

            <div className="mt-2.5">
              <p className="max-w-2xl text-[14px] font-normal leading-6 text-secondary sm:text-[15px]">
                附近优先、预约留痕、沟通更直接。
              </p>
              <p className="mt-2 text-[14px] font-semibold text-ink">{nearbyEnabled ? '已按附近优先展示' : '默认同城优先展示'}</p>
              {locationTip ? <p className="mt-1 text-xs font-medium text-primary">{locationTip}</p> : <p className="mt-1 text-xs text-muted">需要时可开启附近优先。</p>}
            </div>

            <div className="no-scrollbar mt-5 flex items-center gap-3 overflow-x-auto pb-3 sm:gap-4">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setActiveCategory(category.id);
                    setCurrentPage(1);
                  }}
                  className={`flex shrink-0 items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition-all ${
                    activeCategory === category.id
                      ? 'bg-primary text-white'
                      : 'border border-hairline bg-[#fcfaf7] text-secondary hover:border-primary/20 hover:bg-white'
                  }`}
                >
                  {category.icon}
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto mt-2 max-w-[1280px] px-4 sm:px-6 lg:px-20">
          <div className="h-px w-full bg-stone-200/80" />
        </div>
      </div>

      <main className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 sm:py-12 lg:px-20">
        <div className="rounded-[28px] border border-stone-200/80 bg-white/90 px-4 py-6 shadow-[0_12px_32px_rgba(15,23,42,0.04)] sm:px-6 sm:py-8">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:mb-8 md:flex-row md:items-end">
            <div>
              <h2 className="text-lg font-bold text-ink sm:text-xl">精选服务商</h2>
              <p className="mt-1 text-xs text-muted">按分类查看本地服务，进入详情后可以继续预约或收藏。</p>
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
            ) : totalItems === 0 ? (
              <div className="col-span-full py-16 text-center text-muted">暂无服务</div>
            ) : (
              services.map((service) => (
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
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
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

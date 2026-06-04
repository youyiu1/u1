/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Bike, MoreHorizontal, Plus, Search, Smartphone, Sofa, Sparkles, Shirt, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FavoriteButton } from '../../components/common/FavoriteButton';
import { BackToTop } from '../../components/common/BackToTop';
import { PublishOverlay } from '../../components/publish/PublishOverlay';
import { useAuthCheck } from '../../context/useAuthCheck';
import { marketApi } from '../../services/api';
import { Item } from '../../types';
import { getPrimaryImage } from '../../utils/images';
import { matchesAnyKeyword, normalizeSearchTerm } from '../../utils/search';

const CATEGORIES = [
  { id: 'all', name: '全部', icon: <Sparkles className="h-4 w-4" /> },
  { id: 'tech', name: '数码', icon: <Smartphone className="h-4 w-4" /> },
  { id: 'home', name: '家居', icon: <Sofa className="h-4 w-4" /> },
  { id: 'fashion', name: '美妆', icon: <Sparkles className="h-4 w-4" /> },
  { id: 'clothing', name: '穿搭', icon: <Shirt className="h-4 w-4" /> },
  { id: 'sports', name: '户外', icon: <Bike className="h-4 w-4" /> },
  { id: 'others', name: '其他', icon: <MoreHorizontal className="h-4 w-4" /> },
];

export default function MarketListPage() {
  const navigate = useNavigate();
  const { requireAuth } = useAuthCheck();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isPublishOpen, setIsPublishOpen] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await marketApi.list();
        setItems(data);
      } catch (fetchError: any) {
        setError(fetchError.message || '加载失败');
      } finally {
        setLoading(false);
      }
    };

    void fetchItems();
  }, []);

  const filteredItems = useMemo(() => {
    const keyword = normalizeSearchTerm(searchQuery);
    return items.filter(
      (item) => (activeCategory === 'all' || item.category === activeCategory) && matchesAnyKeyword(keyword, [item.title])
    );
  }, [activeCategory, items, searchQuery]);

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="bg-surface-soft pb-8 pt-10 sm:pt-12">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-20">
          <div className="flex flex-col items-stretch justify-between gap-4 md:flex-row md:items-end sm:gap-6">
            <div className="max-w-2xl flex-1">
              <h1 className="mb-4 text-2xl font-bold text-ink sm:mb-6 sm:text-3xl">发现身边的好物</h1>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Search className="h-5 w-5 text-muted transition-colors group-focus-within:text-primary" />
                </div>
                <input
                  type="text"
                  placeholder="搜索商品..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full rounded-2xl border border-hairline bg-white py-3.5 pl-12 pr-4 text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-primary/10 sm:py-4"
                />
              </div>
            </div>

            <button
              onClick={() => requireAuth(() => setIsPublishOpen(true))}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 font-bold text-white shadow-lg shadow-primary/10 transition-all hover:bg-primary-hover md:w-auto sm:px-8 sm:py-4"
            >
              <Plus className="h-5 w-5" /> 发布闲置
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
        <div className="mb-6 flex items-center justify-between sm:mb-8">
          <h2 className="text-lg font-bold text-ink sm:text-xl">附近好物</h2>
        </div>

        {error && <div className="py-8 text-center text-red-500">{error}</div>}

        <div className="grid grid-cols-1 gap-x-4 gap-y-8 xs:grid-cols-2 sm:gap-x-6 sm:gap-y-10 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {loading ? (
            Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <div className="aspect-square animate-pulse rounded-2xl bg-stone-200" />
                <div className="h-4 animate-pulse rounded bg-stone-200" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-stone-200" />
              </div>
            ))
          ) : filteredItems.length === 0 ? (
            <div className="col-span-full py-16 text-center text-muted">暂无商品</div>
          ) : (
            filteredItems.map((item) => {
              const primaryImage = getPrimaryImage(item.images, item.image);

              return (
                <div key={item.id} className="group cursor-pointer" onClick={() => navigate(`/item/${item.id}`)}>
                  <div className="relative mb-3 aspect-square overflow-hidden rounded-2xl bg-surface-soft">
                    {primaryImage ? (
                      <img src={primaryImage} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" alt={item.title} />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-stone-400">暂无图片</div>
                    )}

                    <div className="absolute left-3 top-3 rounded bg-red-400/90 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                      {item.itemCondition || item.condition || '全新'}
                    </div>
                    <FavoriteButton targetId={item.id} targetType="market" />
                  </div>

                  <h3 className="mb-1 line-clamp-1 text-sm font-bold text-ink transition-colors group-hover:text-primary">{item.title}</h3>

                  <div className="mb-2 flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-muted" />
                    <span className="text-[10px] text-muted">{item.location || '附近'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-ink">¥{item.price}</span>
                      {item.originalPrice && <span className="ml-1 text-[10px] text-muted line-through">¥{item.originalPrice}</span>}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <img src={item.seller?.avatar || undefined} className="h-4 w-4 rounded-full border border-hairline" alt="" />
                      <span className="text-[9px] font-medium text-secondary">{item.seller?.name}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      <BackToTop />
      <PublishOverlay isOpen={isPublishOpen} onClose={() => setIsPublishOpen(false)} defaultSelectedId="market" />
    </div>
  );
}

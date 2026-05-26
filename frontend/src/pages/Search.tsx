/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, ChevronRight, Star, MapPin, ThumbsUp, MessageCircle } from 'lucide-react';
import { searchApi } from '../services/api';
import { Service, Item, Post } from '../types';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const [query, setQuery] = useState(keyword);
  const [results, setResults] = useState<{ services: Service[]; items: Item[]; posts: Post[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (keyword) {
      fetchResults(keyword);
    }
  }, [keyword]);

  const fetchResults = async (kw: string) => {
    setLoading(true);
    try {
      const data = await searchApi.all(kw);
      setResults(data);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ keyword: query.trim() });
      fetchResults(query.trim());
    }
  };

  const getHighlights = (h: any): string[] => {
    if (Array.isArray(h)) return h;
    if (typeof h === 'string' && h.startsWith('[')) {
      try { return JSON.parse(h); } catch { return []; }
    }
    return [];
  };

  const getImages = (imgs: any): string[] => {
    if (Array.isArray(imgs)) return imgs;
    if (typeof imgs === 'string' && imgs.startsWith('[')) {
      try { return JSON.parse(imgs); } catch { return []; }
    }
    return [];
  };

  const totalResults = results ? results.services.length + results.items.length + results.posts.length : 0;

  return (
    <div className="min-h-screen bg-surface-soft">
      <div className="bg-white border-b border-hairline">
        <div className="max-w-[1280px] mx-auto px-6 py-8">
          <form onSubmit={handleSearch} className="flex items-center gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索服务、闲置、动态..."
                className="w-full pl-12 pr-4 py-4 bg-surface-soft border border-hairline rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary text-sm font-medium"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover transition-all"
            >
              搜索
            </button>
          </form>
        </div>
      </div>

      <main className="max-w-[1280px] mx-auto px-6 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : keyword && results ? (
          <div className="space-y-12">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink">
                {totalResults > 0 ? `找到 ${totalResults} 个结果` : '未找到结果'}
              </h2>
              <span className="text-sm text-muted">关键词：{keyword}</span>
            </div>

            {results.services.length > 0 && (
              <div>
                <h3 className="text-sm font-black text-muted uppercase tracking-widest mb-6">生活服务</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.services.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => navigate(`/service/${service.id}`)}
                      className="bg-white border border-hairline rounded-3xl overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                    >
                      <div className="relative h-40 overflow-hidden">
                        {service.images?.[0] ? (
                          <img src={service.images[0]} className="w-full h-full object-cover" alt={service.title} />
                        ) : (
                          <div className="w-full h-full bg-stone-200" />
                        )}
                        <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-md rounded-lg flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs font-bold">{service.rating}</span>
                        </div>
                      </div>
                      <div className="p-5">
                        <h4 className="font-bold text-ink mb-2">{service.title}</h4>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {getHighlights(service.highlights).slice(0, 3).map((h, i) => (
                            <span key={i} className="text-[10px] text-secondary bg-surface-soft px-2 py-0.5 rounded">
                              {h}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-primary">¥{service.price}</span>
                          <span className="text-xs text-muted flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {service.distance}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.items.length > 0 && (
              <div>
                <h3 className="text-sm font-black text-muted uppercase tracking-widest mb-6">闲置交易</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {results.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => navigate(`/item/${item.id}`)}
                      className="bg-white border border-hairline rounded-3xl overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                    >
                      <div className="relative h-40 overflow-hidden">
                        {getImages(item.images)[0] ? (
                          <img src={getImages(item.images)[0]} className="w-full h-full object-cover" alt={item.title} />
                        ) : (
                          <div className="w-full h-full bg-stone-200" />
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-ink mb-2 line-clamp-2 text-sm">{item.title}</h4>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-primary">¥{item.price}</span>
                          <span className="text-xs text-muted">{item.itemCondition}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.posts.length > 0 && (
              <div>
                <h3 className="text-sm font-black text-muted uppercase tracking-widest mb-6">同城动态</h3>
                <div className="space-y-4">
                  {results.posts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => navigate(`/news/${post.id}`)}
                      className="bg-white border border-hairline rounded-3xl p-6 hover:shadow-lg transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-surface-soft flex items-center justify-center overflow-hidden">
                          {post.author?.avatar ? (
                            <img src={post.author.avatar} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full bg-stone-200" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-ink">{post.author?.name || post.userName}</span>
                            <span className="text-xs text-muted px-2 py-0.5 bg-surface-soft rounded">{post.category}</span>
                          </div>
                          <p className="text-secondary text-sm line-clamp-2 mb-3">{post.content}</p>
                          <div className="flex items-center gap-6 text-xs text-muted">
                            <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {post.likes}</span>
                            <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {post.comments}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : !keyword ? (
          <div className="text-center py-20 text-muted">
            <SearchIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-bold">输入关键词搜索</p>
          </div>
        ) : (
          <div className="text-center py-20 text-muted">
            <SearchIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-bold">未找到相关结果</p>
            <p className="text-sm mt-2">试试其他关键词</p>
          </div>
        )}
      </main>
    </div>
  );
}
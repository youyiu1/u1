import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  ChevronRight,
  Clock3,
  Flame,
  Search,
  Sparkles,
  Tag,
  X,
} from 'lucide-react';
import { searchApi } from '../../services/api';

const HOT_SEARCHES = ['家政服务', '二手相机', '宠物照顾', '邻里动态', '搬家', '维修'];
const SEARCH_HISTORY_KEY = 'header-search-history';
const MAX_HISTORY = 8;

type SuggestionsState = {
  services: Array<{ id: string; title: string }>;
  items: Array<{ id: string; title: string }>;
  posts: Array<{ id: string; content: string }>;
};

type SuggestionItem = {
  id: string;
  title: string;
  path: string;
  type: 'service' | 'item' | 'post';
  label: string;
};

const EMPTY_SUGGESTIONS: SuggestionsState = { services: [], items: [], posts: [] };

function readSearchHistory() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(SEARCH_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function writeSearchHistory(history: string[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
}

export const HeaderSearch: React.FC = () => {
  const navigate = useNavigate();
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState<string[]>(() => readSearchHistory());
  const [suggestions, setSuggestions] = useState<SuggestionsState>(EMPTY_SUGGESTIONS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSearchFocused(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    if (!searchFocused) {
      return;
    }
    setHistory(readSearchHistory());
  }, [searchFocused]);

  useEffect(() => {
    const keyword = searchQuery.trim();
    if (!keyword) {
      setSuggestions(EMPTY_SUGGESTIONS);
      setLoading(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchApi.all(keyword);
        setSuggestions({
          services: data.services ?? [],
          items: data.items ?? [],
          posts: data.posts ?? [],
        });
      } catch {
        setSuggestions(EMPTY_SUGGESTIONS);
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const totalSuggestions = suggestions.services.length + suggestions.items.length + suggestions.posts.length;

  const suggestionItems = useMemo<SuggestionItem[]>(
    () => [
      ...suggestions.services.slice(0, 3).map((item) => ({
        id: item.id,
        title: item.title,
        path: `/service/${item.id}`,
        type: 'service' as const,
        label: '服务',
      })),
      ...suggestions.items.slice(0, 3).map((item) => ({
        id: item.id,
        title: item.title,
        path: `/item/${item.id}`,
        type: 'item' as const,
        label: '闲置',
      })),
      ...suggestions.posts.slice(0, 3).map((item) => ({
        id: item.id,
        title: item.content,
        path: `/news/${item.id}`,
        type: 'post' as const,
        label: '动态',
      })),
    ],
    [suggestions]
  );

  const buildSearchPath = (keyword: string) => `/search?keyword=${encodeURIComponent(keyword)}`;

  const persistKeyword = (keyword: string) => {
    const normalized = keyword.trim();
    if (!normalized) {
      return;
    }
    const nextHistory = [normalized, ...history.filter((item) => item !== normalized)].slice(0, MAX_HISTORY);
    setHistory(nextHistory);
    writeSearchHistory(nextHistory);
  };

  const closeSearch = () => setSearchFocused(false);

  const closeAndNavigate = (path: string, keywordToPersist?: string) => {
    if (keywordToPersist) {
      persistKeyword(keywordToPersist);
    }
    navigate(path);
    setSearchFocused(false);
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const keyword = searchQuery.trim();
    if (!keyword) {
      return;
    }
    closeAndNavigate(buildSearchPath(keyword), keyword);
  };

  const handleHistoryRemove = (keyword: string) => {
    const nextHistory = history.filter((item) => item !== keyword);
    setHistory(nextHistory);
    writeSearchHistory(nextHistory);
  };

  const handleHistoryClear = () => {
    setHistory([]);
    writeSearchHistory([]);
  };

  return (
    <div className="relative hidden md:block">
      <form onSubmit={handleSearch}>
        <div
          className={`relative flex items-center transition-all duration-500 ease-[0.16,1,0.3,1] ${
            searchFocused ? 'w-[320px] lg:w-[420px]' : 'w-44 lg:w-60'
          }`}
        >
          <Search className={`absolute left-4 z-10 h-4 w-4 transition-colors ${searchFocused ? 'text-primary' : 'text-muted'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="搜索服务、商品或动态"
            onFocus={() => setSearchFocused(true)}
            className="theme-input-surface h-11 w-full rounded-[22px] border border-hairline py-2.5 pl-11 pr-12 text-sm font-medium shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
          />

          <AnimatePresence>
            {searchFocused ? (
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setSearchQuery('');
                  closeSearch();
                }}
                className="absolute right-3 z-10 rounded-full p-1 text-muted transition-colors hover:bg-surface-soft hover:text-ink"
              >
                <X className="h-4 w-4" />
              </motion.button>
            ) : null}
          </AnimatePresence>
        </div>
      </form>

      <AnimatePresence>
        {searchFocused ? (
          <>
            <div className="fixed inset-0 z-10" onClick={closeSearch} />

            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              className="theme-card absolute right-0 top-full z-20 mt-4 w-[440px] overflow-hidden rounded-[34px] border border-white/70 p-5 shadow-[0_28px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl lg:w-[520px]"
            >
              <div className="space-y-5">
                <div className="rounded-[28px] border border-hairline/70 bg-[linear-gradient(180deg,rgba(255,248,247,0.92)_0%,rgba(255,255,255,0.98)_100%)] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-primary/6 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                        <Sparkles className="h-3.5 w-3.5" />
                        快速搜索
                      </div>
                      <h3 className="mt-3 text-[20px] font-black tracking-tight text-ink">
                        {searchQuery.trim() ? `搜索 “${searchQuery.trim()}”` : '直接开始搜索'}
                      </h3>
                      <p className="mt-2 text-xs leading-6 text-secondary">
                        {searchQuery.trim()
                          ? '联想结果会优先展示服务、商品和动态，回车可进入完整搜索页。'
                          : '支持直接搜索生活服务、闲置交易和同城动态内容。'}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-muted shadow-sm">
                      ESC
                    </span>
                  </div>
                </div>

                {!searchQuery.trim() ? (
                  <div className="space-y-5">
                    <section className="rounded-[28px] border border-hairline/70 p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock3 className="h-4 w-4 text-muted" />
                          <span className="text-sm font-black text-ink">搜索历史</span>
                        </div>
                        {history.length > 0 ? (
                          <button
                            type="button"
                            onClick={handleHistoryClear}
                            className="text-xs font-bold text-muted transition-colors hover:text-primary"
                          >
                            清空
                          </button>
                        ) : null}
                      </div>

                      {history.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {history.map((item) => (
                            <div
                              key={item}
                              className="group inline-flex items-center gap-1 rounded-full border border-hairline bg-surface-soft px-3 py-2 text-xs font-bold text-ink transition-all hover:border-primary/20 hover:bg-primary/5"
                            >
                              <button type="button" onClick={() => closeAndNavigate(buildSearchPath(item), item)}>
                                {item}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleHistoryRemove(item)}
                                className="rounded-full p-0.5 text-muted transition-colors hover:bg-white hover:text-ink"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-2xl bg-surface-soft px-4 py-6 text-center text-xs font-medium text-muted">
                          还没有搜索历史，试试直接搜一个关键词
                        </div>
                      )}
                    </section>

                    <section className="rounded-[28px] border border-hairline/70 p-4">
                      <div className="mb-4 flex items-center gap-2">
                        <Flame className="h-4 w-4 text-primary" />
                        <span className="text-sm font-black text-ink">热门搜索</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {HOT_SEARCHES.map((item, index) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => closeAndNavigate(buildSearchPath(item), item)}
                            className="flex items-center justify-between rounded-2xl border border-transparent bg-surface-soft px-3 py-3 text-left transition-all hover:border-primary/15 hover:bg-primary/5"
                          >
                            <span className="flex items-center gap-2">
                              <span
                                className={`inline-flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-black ${
                                  index < 3 ? 'bg-primary text-white' : 'bg-white text-muted'
                                }`}
                              >
                                {index + 1}
                              </span>
                              <span className="text-sm font-bold text-ink">{item}</span>
                            </span>
                            <ChevronRight className="h-3.5 w-3.5 text-muted" />
                          </button>
                        ))}
                      </div>
                    </section>
                  </div>
                ) : (
                  <section className="rounded-[28px] border border-hairline/70 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-primary" />
                        <span className="text-sm font-black text-ink">联想结果</span>
                      </div>
                      <span className="text-xs font-bold text-muted">共 {totalSuggestions} 条</span>
                    </div>

                    {loading ? (
                      <div className="py-10 text-center">
                        <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      </div>
                    ) : suggestionItems.length > 0 ? (
                      <div className="space-y-2">
                        {suggestionItems.map((item) => (
                          <button
                            key={`${item.type}-${item.id}`}
                            type="button"
                            onClick={() => closeAndNavigate(item.path, searchQuery.trim())}
                            className="group flex w-full items-center justify-between rounded-2xl border border-transparent px-3 py-3 text-left transition-all hover:border-primary/10 hover:bg-surface-soft"
                          >
                            <div className="min-w-0">
                              <p className="line-clamp-1 text-sm font-bold text-ink transition-colors group-hover:text-primary">{item.title}</p>
                              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">{item.label}</p>
                            </div>
                            <ChevronRight className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
                          </button>
                        ))}

                        <button
                          type="button"
                          onClick={() => closeAndNavigate(buildSearchPath(searchQuery.trim()), searchQuery.trim())}
                          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-3 text-xs font-black uppercase tracking-[0.16em] text-white transition-all hover:opacity-95"
                        >
                          查看全部搜索结果
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-surface-soft px-4 py-8 text-center">
                        <p className="text-sm font-bold text-ink">没有找到相关内容</p>
                        <p className="mt-2 text-xs leading-6 text-muted">换个关键词试试，或者直接回车进入完整搜索页。</p>
                        <button
                          type="button"
                          onClick={() => closeAndNavigate(buildSearchPath(searchQuery.trim()), searchQuery.trim())}
                          className="mt-4 inline-flex items-center gap-1 text-xs font-black text-primary"
                        >
                          进入完整搜索
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </section>
                )}
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

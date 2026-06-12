import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronRight, Search } from 'lucide-react';
import { searchApi } from '../../services/api';

const HOT_SEARCHES = ['家政服务', '二手相机', '宠物照顾', '邻里动态'];
const RECENT_SEARCHES = ['月嫂', '搬家'];

type SuggestionsState = {
  services: Array<{ id: string; title: string }>;
  items: Array<{ id: string; title: string }>;
  posts: Array<{ id: string; content: string }>;
};

type SuggestionGroup = {
  key: string;
  label: string;
  accent: string;
  items: Array<{ id: string; title: string; path: string }>;
};

const EMPTY_SUGGESTIONS: SuggestionsState = { services: [], items: [], posts: [] };

export const HeaderSearch: React.FC = () => {
  const navigate = useNavigate();
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
    const keyword = searchQuery.trim();
    if (!keyword) {
      setSuggestions(EMPTY_SUGGESTIONS);
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

  const suggestionGroups = useMemo(
    (): SuggestionGroup[] => [
      {
        key: 'service',
        label: '服务',
        accent: 'text-primary',
        items: suggestions.services.slice(0, 3).map((item) => ({
          id: item.id,
          title: item.title,
          path: `/service/${item.id}`,
        })),
      },
      {
        key: 'market',
        label: '闲置',
        accent: 'text-green-600',
        items: suggestions.items.slice(0, 3).map((item) => ({
          id: item.id,
          title: item.title,
          path: `/item/${item.id}`,
        })),
      },
      {
        key: 'news',
        label: '动态',
        accent: 'text-blue-500',
        items: suggestions.posts.slice(0, 3).map((item) => ({
          id: item.id,
          title: item.content,
          path: `/news/${item.id}`,
        })),
      },
    ],
    [suggestions]
  );

  const closeAndNavigate = (path: string) => {
    navigate(path);
    setSearchFocused(false);
  };

  const buildSearchPath = (keyword: string) => `/search?keyword=${encodeURIComponent(keyword)}`;

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const keyword = searchQuery.trim();
    if (!keyword) return;
    closeAndNavigate(buildSearchPath(keyword));
  };

  return (
    <div className="relative hidden md:block">
      <form onSubmit={handleSearch}>
        <div className={`relative flex items-center transition-all duration-500 ease-[0.16,1,0.3,1] ${searchFocused ? 'w-64 lg:w-80' : 'w-40 lg:w-52'}`}>
          <Search className={`absolute left-3.5 z-10 h-4 w-4 transition-colors ${searchFocused ? 'text-primary' : 'text-muted'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="搜索生活服务、闲置或动态"
            onFocus={() => setSearchFocused(true)}
            className="w-full rounded-2xl border border-hairline bg-surface-soft py-2.5 pl-10 pr-10 text-xs font-medium shadow-sm transition-all placeholder:text-muted/50 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10"
          />

          <AnimatePresence>
            {searchFocused && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute right-3.5 flex items-center gap-1">
                <span className="rounded border border-hairline bg-white/50 px-1.5 py-0.5 text-[8px] font-black uppercase text-muted">Esc</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>

      <AnimatePresence>
        {searchFocused && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setSearchFocused(false)} />

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="absolute top-full z-20 mt-3 w-80 overflow-hidden rounded-[32px] border border-hairline bg-white p-6 shadow-premium lg:w-[400px]"
            >
              {!searchQuery.trim() ? (
                <div className="space-y-8">
                  <SearchTagSection
                    title="热门搜索"
                    accentClassName="text-primary"
                    items={HOT_SEARCHES}
                    onClick={(keyword) => closeAndNavigate(buildSearchPath(keyword))}
                  />
                  <SearchListSection
                    title="最近搜索"
                    items={RECENT_SEARCHES}
                    onClick={(keyword) => closeAndNavigate(buildSearchPath(keyword))}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {loading ? (
                    <div className="py-8 text-center">
                      <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  ) : totalSuggestions > 0 ? (
                    <>
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">找到 {totalSuggestions} 个结果</span>
                      </div>

                      <div className="max-h-64 space-y-2 overflow-y-auto">
                        {suggestionGroups.map((group) =>
                          group.items.map((item) => (
                            <div
                              key={`${group.key}-${item.id}`}
                              onClick={() => closeAndNavigate(item.path)}
                              className="group cursor-pointer rounded-2xl border border-transparent p-3 transition-all hover:border-hairline hover:bg-surface-soft"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <p className="line-clamp-1 text-xs font-bold text-ink transition-colors group-hover:text-primary">{item.title}</p>
                                <span className={`shrink-0 text-[9px] font-black uppercase tracking-wider ${group.accent}`}>{group.label}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {totalSuggestions > 9 && (
                        <button
                          onClick={() => closeAndNavigate(buildSearchPath(searchQuery.trim()))}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all hover:brightness-110"
                        >
                          查看全部结果
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="rounded-2xl bg-surface-soft py-8 text-center">
                      <p className="text-xs font-bold text-muted">换个关键词试试</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

function SearchTagSection({
  title,
  items,
  onClick,
  accentClassName,
}: {
  title: string;
  items: string[];
  onClick: (keyword: string) => void;
  accentClassName: string;
}) {
  return (
    <div>
      <SectionTitle title={title} titleClassName={accentClassName} />
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item}
            onClick={() => onClick(item)}
            className="rounded-lg bg-surface-soft px-3 py-1.5 text-[10px] font-bold text-secondary transition-all hover:bg-primary hover:text-white"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function SearchListSection({
  title,
  items,
  onClick,
}: {
  title: string;
  items: string[];
  onClick: (keyword: string) => void;
}) {
  return (
    <div>
      <SectionTitle title={title} titleClassName="text-muted" />
      <div className="space-y-1">
        {items.map((item) => (
          <div
            key={item}
            onClick={() => onClick(item)}
            className="group flex cursor-pointer items-center justify-between rounded-xl p-2 transition-all hover:bg-surface-soft"
          >
            <span className="text-xs font-medium text-ink">{item}</span>
            <ChevronRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionTitle({ title, titleClassName }: { title: string; titleClassName: string }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${titleClassName}`}>{title}</span>
      <div className="h-px flex-1 bg-hairline" />
    </div>
  );
}

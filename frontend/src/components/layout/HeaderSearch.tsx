import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { searchApi } from '../../services/api';

const HOT_SEARCHES = ['家政服务', '二手相机', '宠物照顾', '邻里动态'];
const RECENT_SEARCHES = ['月嫂', '搬家'];

export const HeaderSearch: React.FC = () => {
  const navigate = useNavigate();
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{ services: any[]; items: any[]; posts: any[] }>({ services: [], items: [], posts: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchFocused(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      fetchSuggestions(searchQuery.trim());
    } else {
      setSuggestions({ services: [], items: [], posts: [] });
    }
  }, [searchQuery]);

  const fetchSuggestions = async (kw: string) => {
    setLoading(true);
    try {
      const data = await searchApi.all(kw);
      setSuggestions(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const totalSuggestions = suggestions.services.length + suggestions.items.length + suggestions.posts.length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchFocused(false);
    }
  };

  return (
    <div className="relative hidden md:block">
      <form onSubmit={handleSearch}>
        <div className={`relative flex items-center transition-all duration-500 ease-[0.16,1,0.3,1] ${searchFocused ? 'w-64 lg:w-80' : 'w-40 lg:w-52'}`}>
          <Search className={`absolute left-3.5 w-4 h-4 transition-colors z-10 ${searchFocused ? 'text-primary' : 'text-muted'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索任何内容..."
            onFocus={() => setSearchFocused(true)}
            className="w-full pl-10 pr-10 py-2.5 bg-surface-soft border border-hairline rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all shadow-sm"
          />
          <AnimatePresence>
            {searchFocused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute right-3.5 flex items-center gap-1"
              >
                <span className="px-1.5 py-0.5 rounded border border-hairline bg-white/50 text-[8px] font-black text-muted uppercase">Esc</span>
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
              className="absolute top-full mt-3 w-80 lg:w-[400px] bg-white border border-hairline rounded-[32px] shadow-premium z-20 overflow-hidden p-6"
            >
              {!searchQuery ? (
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Hot Searches</span>
                      <div className="flex-1 h-px bg-hairline" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {HOT_SEARCHES.map(hot => (
                        <button
                          key={hot}
                          onClick={() => {
                            setSearchQuery(hot);
                            navigate(`/search?keyword=${encodeURIComponent(hot)}`);
                            setSearchFocused(false);
                          }}
                          className="px-3 py-1.5 bg-surface-soft hover:bg-primary hover:text-white rounded-lg text-[10px] font-bold text-secondary transition-all"
                        >
                          {hot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Recent</span>
                      <div className="flex-1 h-px bg-hairline" />
                    </div>
                    <div className="space-y-1">
                      {RECENT_SEARCHES.map(recent => (
                        <div
                          key={recent}
                          onClick={() => {
                            setSearchQuery(recent);
                            navigate(`/search?keyword=${encodeURIComponent(recent)}`);
                            setSearchFocused(false);
                          }}
                          className="flex items-center justify-between p-2 hover:bg-surface-soft rounded-xl transition-all cursor-pointer group"
                        >
                          <span className="text-xs font-medium text-ink">{recent}</span>
                          <ChevronRight className="w-3 h-3 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {loading ? (
                    <div className="py-8 text-center">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                  ) : totalSuggestions > 0 ? (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                          找到 {totalSuggestions} 个结果
                        </span>
                      </div>

                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {suggestions.services.slice(0, 3).map((s, i) => (
                          <div
                            key={`s-${i}`}
                            onClick={() => {
                              navigate(`/service/${s.id}`);
                              setSearchFocused(false);
                            }}
                            className="p-3 hover:bg-surface-soft rounded-2xl transition-all cursor-pointer border border-transparent hover:border-hairline group"
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-ink group-hover:text-primary transition-colors">{s.title}</p>
                              <span className="text-[9px] font-black text-primary uppercase tracking-wider">服务</span>
                            </div>
                          </div>
                        ))}
                        {suggestions.items.slice(0, 3).map((item, i) => (
                          <div
                            key={`i-${i}`}
                            onClick={() => {
                              navigate(`/item/${item.id}`);
                              setSearchFocused(false);
                            }}
                            className="p-3 hover:bg-surface-soft rounded-2xl transition-all cursor-pointer border border-transparent hover:border-hairline group"
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-ink group-hover:text-primary transition-colors">{item.title}</p>
                              <span className="text-[9px] font-black text-green-600 uppercase tracking-wider">闲置</span>
                            </div>
                          </div>
                        ))}
                        {suggestions.posts.slice(0, 3).map((p, i) => (
                          <div
                            key={`p-${i}`}
                            onClick={() => {
                              navigate(`/news/${p.id}`);
                              setSearchFocused(false);
                            }}
                            className="p-3 hover:bg-surface-soft rounded-2xl transition-all cursor-pointer border border-transparent hover:border-hairline group"
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-ink group-hover:text-primary transition-colors line-clamp-1">{p.content}</p>
                              <span className="text-[9px] font-black text-blue-500 uppercase tracking-wider">动态</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {totalSuggestions > 9 && (
                        <button
                          onClick={() => {
                            navigate(`/search?keyword=${encodeURIComponent(searchQuery)}`);
                            setSearchFocused(false);
                          }}
                          className="w-full py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 transition-all flex items-center justify-center gap-2"
                        >
                          查看所有结果
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="py-8 text-center bg-surface-soft rounded-2xl">
                      <p className="text-xs text-muted font-bold">换个关键词试试？</p>
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
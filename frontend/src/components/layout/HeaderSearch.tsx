import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const HOT_SEARCHES = ['家政服务', '二手相机', '宠物照顾', '邻里动态'];
const RECENT_SEARCHES = ['月嫂', '搬家'];

const SEARCH_POOL = [
  { title: '家政保洁', category: '生活服务' },
  { title: '数码相机', category: '闲置交易' },
  { title: '宠物美容', category: '生活服务' },
  { title: '邻里聚会', category: '同城动态' },
  { title: '求租公寓', category: '互助社区' },
  { title: '旧物义卖', category: '同城动态' },
  { title: '专业搬家', category: '生活服务' },
  { title: '二手电脑', category: '闲置交易' },
  { title: '英语私教', category: '生活服务' },
  { title: '户外骑行', category: '同城动态' },
];

export const HeaderSearch: React.FC = () => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchFocused(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return SEARCH_POOL.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="relative hidden md:block">
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
                          onClick={() => setSearchQuery(hot)}
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
                          onClick={() => setSearchQuery(recent)}
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
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                      {filteredSuggestions.length > 0 ? `Results for "${searchQuery}"` : `No suggestions for "${searchQuery}"`}
                    </span>
                  </div>
                  
                  {filteredSuggestions.length > 0 ? (
                    <div className="space-y-2">
                      {filteredSuggestions.map((res, i) => (
                        <div 
                          key={i} 
                          onClick={() => {
                            setSearchQuery(res.title);
                            setSearchFocused(false);
                          }}
                          className="p-3 hover:bg-surface-soft rounded-2xl transition-all cursor-pointer border border-transparent hover:border-hairline group"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-ink group-hover:text-primary transition-colors">{res.title}</p>
                            <span className="text-[9px] font-black text-muted uppercase tracking-wider">{res.category}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center bg-surface-soft rounded-2xl">
                      <p className="text-xs text-muted font-bold">换个关键词试试？</p>
                    </div>
                  )}
                  
                  {filteredSuggestions.length > 0 && (
                    <button className="w-full py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 transition-all">
                      查看所有结果
                    </button>
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

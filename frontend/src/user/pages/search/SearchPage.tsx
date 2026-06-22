import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, MessageCircle, Search as SearchIcon, Star, ThumbsUp } from 'lucide-react';
import { BackToTop } from '../../components/common/BackToTop';
import { searchApi } from '../../services/api';
import { Item, Post, Service } from '../../types';
import { fallbackText, formatCurrency } from '../../utils/display';
import { getErrorMessage } from '../../utils/error';
import { getItemPrimaryImage, getServicePrimaryImage } from '../../utils/images';

interface SearchResults {
  services: Service[];
  items: Item[];
  posts: Post[];
}

type ResultSectionKey = keyof SearchResults;

type ResultSection = {
  key: ResultSectionKey;
  title: string;
};

const EMPTY_RESULTS: SearchResults = {
  services: [],
  items: [],
  posts: [],
};

const RESULT_SECTIONS: ResultSection[] = [
  { key: 'services', title: '生活服务' },
  { key: 'items', title: '闲置交易' },
  { key: 'posts', title: '同城动态' },
];

function ResultCardImage({ src, alt }: { src?: string; alt: string }) {
  return src ? <img src={src} className="h-full w-full object-cover" alt={alt} /> : <div className="h-full w-full bg-surface-soft" />;
}

function SearchEmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="theme-card rounded-[28px] px-6 py-14 text-center shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/6 text-primary">
        <SearchIcon className="h-6 w-6" />
      </div>
      <h2 className="mt-5 text-[22px] font-black tracking-tight text-ink">{title}</h2>
      {description ? <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-secondary">{description}</p> : null}
    </div>
  );
}

function SearchLoadingState() {
  return (
    <div className="space-y-5">
      <div className="theme-card animate-pulse rounded-[28px] p-5">
        <div className="h-6 w-40 rounded bg-stone-200" />
        <div className="mt-3 h-4 w-72 rounded bg-stone-200" />
      </div>

      <div className="theme-card-soft animate-pulse rounded-[24px] p-4">
        <div className="flex gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-11 w-24 rounded-2xl bg-stone-200" />
          ))}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="theme-card animate-pulse overflow-hidden rounded-[28px]">
            <div className="h-44 bg-stone-200" />
            <div className="space-y-3 p-5">
              <div className="h-5 w-2/3 rounded bg-stone-200" />
              <div className="h-4 w-full rounded bg-stone-200" />
              <div className="h-4 w-1/2 rounded bg-stone-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SearchToolbar({
  totalResults,
  keyword,
}: {
  totalResults: number;
  keyword: string;
}) {
  return (
    <section className="space-y-5">
      <div className="theme-card rounded-[28px] p-5 shadow-[0_14px_34px_rgba(15,23,42,0.04)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-[28px] font-black tracking-[-0.03em] text-ink">搜索</h1>
            <p className="mt-2 text-sm leading-6 text-secondary">
              统一查看生活服务、闲置交易和同城动态，结果页只保留最必要的信息。
            </p>
          </div>

          <div className="text-sm font-bold text-muted">
            {keyword ? (
              <span>
                关键词“<span className="text-ink">{keyword}</span>”共找到 <span className="text-ink">{totalResults}</span> 条结果
              </span>
            ) : (
              <span>输入关键词开始搜索</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionSwitch({
  activeSection,
  sections,
  counts,
  onChange,
}: {
  activeSection: ResultSectionKey | 'all';
  sections: ResultSection[];
  counts: Record<ResultSectionKey, number>;
  onChange: (section: ResultSectionKey | 'all') => void;
}) {
  return (
    <div className="theme-card-soft rounded-[24px] p-3">
      <div className="no-scrollbar flex items-center gap-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => onChange('all')}
          className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black transition-all ${
            activeSection === 'all'
              ? 'bg-ink text-white'
              : 'theme-card text-secondary hover:border-primary/20 hover:text-primary'
          }`}
        >
          全部
          <span className={`rounded-full px-2 py-0.5 text-[10px] ${activeSection === 'all' ? 'bg-white/20' : 'bg-surface-soft text-muted'}`}>
            {counts.services + counts.items + counts.posts}
          </span>
        </button>

        {sections.map((section) => (
          <button
            key={section.key}
            type="button"
            onClick={() => onChange(section.key)}
            className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black transition-all ${
              activeSection === section.key
                ? 'bg-primary text-white'
                : 'theme-card text-secondary hover:border-primary/20 hover:text-primary'
            }`}
          >
            {section.title}
            <span className={`rounded-full px-2 py-0.5 text-[10px] ${activeSection === section.key ? 'bg-white/20' : 'bg-surface-soft text-muted'}`}>
              {counts[section.key]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-hairline pb-3">
      <h2 className="text-[20px] font-black tracking-tight text-ink">{title}</h2>
      <span className="text-sm font-bold text-muted">{count} 条</span>
    </div>
  );
}

function ServiceResultCard({ service, onClick }: { service: Service; onClick: () => void | Promise<void> }) {
  const image = getServicePrimaryImage(service);

  return (
    <article
      onClick={onClick}
      className="group theme-card cursor-pointer overflow-hidden rounded-[28px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(15,23,42,0.06)]"
    >
      <div className="h-44 overflow-hidden">
        <ResultCardImage src={image} alt={service.title} />
      </div>

      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-[17px] font-black leading-7 tracking-tight text-ink">{service.title}</h3>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/6 px-2.5 py-1 text-[10px] font-black text-primary">
            <Star className="h-3 w-3 fill-current" />
            {service.rating}
          </span>
        </div>

        <p className="line-clamp-2 text-sm leading-6 text-secondary">{fallbackText(service.description, '查看服务详情')}</p>

        <div className="flex items-end justify-between gap-4 text-sm">
          <div>
            <p className="text-[20px] font-black tracking-tight text-ink">{formatCurrency(service.price)}</p>
            <p className="text-xs font-bold text-muted">/{fallbackText(service.unit, '次')}</p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-muted">
            <MapPin className="h-3.5 w-3.5" />
            {fallbackText(service.distance || service.area, '同城')}
          </span>
        </div>
      </div>
    </article>
  );
}

function ItemResultCard({ item, onClick }: { item: Item; onClick: () => void | Promise<void> }) {
  return (
    <article
      onClick={onClick}
      className="group theme-card cursor-pointer overflow-hidden rounded-[28px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(15,23,42,0.06)]"
    >
      <div className="h-44 overflow-hidden">
        <ResultCardImage src={getItemPrimaryImage(item)} alt={item.title} />
      </div>

      <div className="space-y-3 p-5">
        <h3 className="line-clamp-2 text-[17px] font-black leading-7 tracking-tight text-ink">{item.title}</h3>
        <p className="text-sm text-secondary">{fallbackText(item.category, '同城好物')}</p>

        <div className="flex items-end justify-between gap-4 text-sm">
          <div>
            <p className="text-[20px] font-black tracking-tight text-ink">{formatCurrency(item.price)}</p>
            <p className="text-xs font-bold text-muted">{fallbackText(item.itemCondition || item.condition, '成色未知')}</p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-muted">
            <MapPin className="h-3.5 w-3.5" />
            {fallbackText(item.location, '同城')}
          </span>
        </div>
      </div>
    </article>
  );
}

function PostResultCard({ post, onClick }: { post: Post; onClick: () => void | Promise<void> }) {
  const authorName = fallbackText(post.author?.name || post.authorName, '匿名用户');
  const authorAvatar = post.author?.avatar || post.authorAvatar;

  return (
    <article
      onClick={onClick}
      className="group theme-card cursor-pointer rounded-[28px] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(15,23,42,0.05)]"
    >
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 overflow-hidden rounded-2xl bg-surface-soft">
          <ResultCardImage src={authorAvatar} alt={authorName} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-black text-ink">{authorName}</h3>
            {post.category ? <span className="rounded-full bg-primary/6 px-2 py-1 text-[10px] font-black text-primary">{post.category}</span> : null}
          </div>
          <p className="mt-1 text-xs font-bold text-muted">{fallbackText(post.location, '同城社区')}</p>
          <p className="mt-4 line-clamp-3 text-sm leading-7 text-secondary">{post.content}</p>

          <div className="mt-4 flex items-center gap-5 text-xs font-bold text-muted">
            <span className="inline-flex items-center gap-1.5">
              <ThumbsUp className="h-3.5 w-3.5" />
              {post.likes}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessageCircle className="h-3.5 w-3.5" />
              {post.commentsCount ?? post.comments?.length ?? 0}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function SearchSection({
  section,
  results,
  navigate,
}: {
  section: ResultSection;
  results: SearchResults;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const count = results[section.key].length;

  return (
    <section className="space-y-5">
      <SectionHeader title={section.title} count={count} />

      {section.key === 'services' ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {results.services.map((service) => (
            <React.Fragment key={service.id}>
              <ServiceResultCard service={service} onClick={() => navigate(`/service/${service.id}`)} />
            </React.Fragment>
          ))}
        </div>
      ) : null}

      {section.key === 'items' ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {results.items.map((item) => (
            <React.Fragment key={item.id}>
              <ItemResultCard item={item} onClick={() => navigate(`/item/${item.id}`)} />
            </React.Fragment>
          ))}
        </div>
      ) : null}

      {section.key === 'posts' ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {results.posts.map((post) => (
            <React.Fragment key={post.id}>
              <PostResultCard post={post} onClick={() => navigate(`/news/${post.id}`)} />
            </React.Fragment>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const keyword = searchParams.get('keyword') || '';
  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<ResultSectionKey | 'all'>('all');

  useEffect(() => {
    if (!keyword) {
      setResults(EMPTY_RESULTS);
      setActiveSection('all');
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const data = await searchApi.all(keyword);
        setResults({
          services: data.services || [],
          items: data.items || [],
          posts: data.posts || [],
        });
      } catch (error: unknown) {
        console.error(getErrorMessage(error, '搜索失败'));
        setResults(EMPTY_RESULTS);
      } finally {
        setLoading(false);
      }
    };

    void fetchResults();
  }, [keyword]);

  const counts = useMemo(
    () => ({
      services: results.services.length,
      items: results.items.length,
      posts: results.posts.length,
    }),
    [results]
  );

  const totalResults = useMemo(() => counts.services + counts.items + counts.posts, [counts]);
  const availableSections = useMemo(() => RESULT_SECTIONS.filter((section) => counts[section.key] > 0), [counts]);

  useEffect(() => {
    if (activeSection === 'all') {
      return;
    }
    if (counts[activeSection] === 0) {
      setActiveSection(availableSections[0]?.key ?? 'all');
    }
  }, [activeSection, availableSections, counts]);

  const visibleSections = useMemo(() => {
    if (activeSection === 'all') {
      return availableSections;
    }
    return RESULT_SECTIONS.filter((section) => section.key === activeSection && counts[section.key] > 0);
  }, [activeSection, availableSections, counts]);

  return (
    <div className="min-h-screen pb-20">
      <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-10 lg:px-20">
        <div className="space-y-6">
          <SearchToolbar totalResults={totalResults} keyword={keyword} />

          {loading ? (
            <SearchLoadingState />
          ) : !keyword ? (
            <SearchEmptyState title="输入关键词开始搜索" description="你可以直接搜索服务、商品名称，或者同城动态里的相关内容。" />
          ) : totalResults === 0 ? (
            <SearchEmptyState title="没有找到相关结果" description="换一个更短或更直接的关键词试试。" />
          ) : (
            <div className="space-y-6">
              <SectionSwitch activeSection={activeSection} sections={availableSections} counts={counts} onChange={setActiveSection} />

              <div className="space-y-8">
                {visibleSections.map((section) => (
                  <React.Fragment key={section.key}>
                    <SearchSection section={section} results={results} navigate={navigate} />
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <BackToTop />
    </div>
  );
}

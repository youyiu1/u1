import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, MessageCircle, Search as SearchIcon, Star, ThumbsUp } from 'lucide-react';
import { searchApi } from '../../services/api';
import { Item, Post, Service } from '../../types';
import { getItemPrimaryImage, getServicePrimaryImage } from '../../utils/images';

interface SearchResults {
  services: Service[];
  items: Item[];
  posts: Post[];
}

type ResultSection = {
  key: keyof SearchResults;
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
  { key: 'posts', title: '社区动态' },
];

function ResultCardImage({ src, alt }: { src?: string; alt: string }) {
  return src ? <img src={src} className="h-full w-full object-cover" alt={alt} /> : <div className="h-full w-full bg-stone-200" />;
}

function ServiceResultCard({ service, onClick }: { service: Service; onClick: () => void | Promise<void> }) {
  const image = getServicePrimaryImage(service);

  return (
    <article onClick={onClick} className="cursor-pointer overflow-hidden rounded-3xl border border-hairline bg-white transition-all hover:shadow-xl">
      <div className="relative h-40 overflow-hidden">
        <ResultCardImage src={image} alt={service.title} />
        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1 backdrop-blur-md">
          <Star className="h-3 w-3 fill-current text-yellow-400" />
          <span className="text-xs font-bold">{service.rating}</span>
        </div>
      </div>
      <div className="p-5">
        <h4 className="mb-2 font-bold text-ink">{service.title}</h4>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">￥{service.price}</span>
          <span className="flex items-center gap-1 text-xs text-muted">
            <MapPin className="h-3 w-3" />
            {service.distance}
          </span>
        </div>
      </div>
    </article>
  );
}

function ItemResultCard({ item, onClick }: { item: Item; onClick: () => void | Promise<void> }) {
  return (
    <article onClick={onClick} className="cursor-pointer overflow-hidden rounded-3xl border border-hairline bg-white transition-all hover:shadow-xl">
      <div className="relative h-40 overflow-hidden">
        <ResultCardImage src={getItemPrimaryImage(item)} alt={item.title} />
      </div>
      <div className="p-4">
        <h4 className="mb-2 line-clamp-2 text-sm font-bold text-ink">{item.title}</h4>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">￥{item.price}</span>
          <span className="text-xs text-muted">{item.itemCondition}</span>
        </div>
      </div>
    </article>
  );
}

function PostResultCard({ post, onClick }: { post: Post; onClick: () => void | Promise<void> }) {
  const authorName = post.author?.name || post.authorName || '匿名用户';
  const authorAvatar = post.author?.avatar;

  return (
    <article onClick={onClick} className="cursor-pointer rounded-3xl border border-hairline bg-white p-6 transition-all hover:shadow-lg">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-surface-soft">
          <ResultCardImage src={authorAvatar} alt={authorName || '用户头像'} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="font-bold text-ink">{authorName}</span>
            <span className="rounded bg-surface-soft px-2 py-0.5 text-xs text-muted">{post.category}</span>
          </div>
          <p className="mb-3 line-clamp-2 text-sm text-secondary">{post.content}</p>
          <div className="flex items-center gap-6 text-xs text-muted">
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-3 w-3" />
              {post.likes}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {post.commentsCount ?? post.comments}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function EmptySearchState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="py-20 text-center text-muted">
      <SearchIcon className="mx-auto mb-4 h-12 w-12 opacity-30" />
      <p className="text-lg font-bold">{title}</p>
      {description ? <p className="mt-2 text-sm">{description}</p> : null}
    </div>
  );
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const keyword = searchParams.get('keyword') || '';
  const [query, setQuery] = useState(keyword);
  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setQuery(keyword);
  }, [keyword]);

  useEffect(() => {
    if (!keyword) {
      setResults(EMPTY_RESULTS);
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
      } catch (error) {
        console.error('Search failed:', error);
        setResults(EMPTY_RESULTS);
      } finally {
        setLoading(false);
      }
    };

    void fetchResults();
  }, [keyword]);

  const totalResults = useMemo(
    () => results.services.length + results.items.length + results.posts.length,
    [results]
  );

  const sections = useMemo(
    () => RESULT_SECTIONS.filter((section) => results[section.key].length > 0),
    [results]
  );

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const nextKeyword = query.trim();

    if (!nextKeyword) {
      setSearchParams({});
      setResults(EMPTY_RESULTS);
      return;
    }

    setSearchParams({ keyword: nextKeyword });
  };

  return (
    <div className="min-h-screen bg-surface-soft">
      <div className="border-b border-hairline bg-white">
        <div className="mx-auto max-w-[1280px] px-6 py-8">
          <form onSubmit={handleSearch} className="mx-auto flex max-w-2xl items-center gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索服务、闲置商品或社区动态"
                className="w-full rounded-2xl border border-hairline bg-surface-soft py-4 pl-12 pr-4 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <button type="submit" className="rounded-2xl bg-primary px-8 py-4 font-bold text-white transition-all hover:bg-primary-hover">
              搜索
            </button>
          </form>
        </div>
      </div>

      <main className="mx-auto max-w-[1280px] px-6 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : !keyword ? (
          <EmptySearchState title="输入关键词开始搜索" />
        ) : totalResults === 0 ? (
          <EmptySearchState title="没有找到相关内容" description="换个关键词再试试" />
        ) : (
          <div className="space-y-12">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink">共找到 {totalResults} 条相关内容</h2>
              <span className="text-sm text-muted">关键词：{keyword}</span>
            </div>

            {sections.map((section) => (
              <section key={section.key}>
                <h3 className="mb-6 text-sm font-black uppercase tracking-widest text-muted">{section.title}</h3>

                {section.key === 'services' ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {results.services.map((service) => (
                      <React.Fragment key={service.id}>
                        <ServiceResultCard service={service} onClick={() => navigate(`/service/${service.id}`)} />
                      </React.Fragment>
                    ))}
                  </div>
                ) : null}

                {section.key === 'items' ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {results.items.map((item) => (
                      <React.Fragment key={item.id}>
                        <ItemResultCard item={item} onClick={() => navigate(`/item/${item.id}`)} />
                      </React.Fragment>
                    ))}
                  </div>
                ) : null}

                {section.key === 'posts' ? (
                  <div className="space-y-4">
                    {results.posts.map((post) => (
                      <React.Fragment key={post.id}>
                        <PostResultCard post={post} onClick={() => navigate(`/news/${post.id}`)} />
                      </React.Fragment>
                    ))}
                  </div>
                ) : null}
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

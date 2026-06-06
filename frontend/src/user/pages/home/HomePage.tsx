import React, { useEffect, useState } from 'react';
import { homeApi } from '../../services/api';
import { GlobalCard } from '../../components/common/Card';
import { HeroSection } from '../../components/home/HeroSection';
import { SectionHeader } from '../../components/common/SectionHeader';
import { HomePostCard } from '../../components/home/HomePostCard';
import { BackToTop } from '../../components/common/BackToTop';
import { Item, Post, Service } from '../../types';
import { getErrorMessage } from '../../utils/error';

const SECTIONS = [
  { title: '精选服务', tag: 'Service Selection', link: '/service', linkText: '查看更多服务', dataKey: 'hotServices' as const, previewCount: 5 },
  { title: '闲置好物', tag: 'Market Trends', link: '/market', linkText: '查看更多闲置', dataKey: 'hotMarket' as const, previewCount: 5 },
  { title: '同城动态', tag: 'Community Pulse', link: '/news', linkText: '查看更多动态', dataKey: 'hotNews' as const, previewCount: 3 },
];

interface HomeData {
  hotServices: Service[];
  hotMarket: Item[];
  hotNews: Post[];
}

const defaultData: HomeData = {
  hotServices: [],
  hotMarket: [],
  hotNews: [],
};

function SectionWrapper({
  section,
  data,
  loading,
  columns,
  skeletonHeight,
  itemClassName,
  renderItem,
}: {
  section: (typeof SECTIONS)[number];
  data: Array<Service | Item | Post>;
  loading: boolean;
  columns: string;
  skeletonHeight: string;
  itemClassName?: string;
  renderItem: (item: Service | Item | Post, idx: number) => React.ReactNode;
}) {
  const previewCount = section.previewCount;

  return (
    <section className="content-visibility-auto">
      <SectionHeader
        title={section.title}
        tag={section.tag}
        link={section.link}
        linkText={section.linkText}
        isButton={section.dataKey === 'hotNews'}
      />
      <div className={`grid ${columns} gap-12`}>
        {loading
          ? Array(previewCount)
              .fill(0)
              .map((_, index) => <div key={index} className={`${skeletonHeight} animate-pulse rounded-2xl bg-stone-200`} />)
          : data.slice(0, previewCount).map((item, idx) => (
              <div key={item.id} className={`content-visibility-auto ${itemClassName || ''}`}>
                {renderItem(item, idx)}
              </div>
            ))}
      </div>
    </section>
  );
}

function sortServicesByReview(services: Service[]) {
  return [...services].sort((a, b) => {
    const reviewDiff = (b.reviews || 0) - (a.reviews || 0);
    if (reviewDiff !== 0) {
      return reviewDiff;
    }

    return (b.rating || 0) - (a.rating || 0);
  });
}

function sortItemsBySellerValue(items: Item[]) {
  return [...items].sort((a, b) => {
    const soldDiff = (b.sellerSoldCount || 0) - (a.sellerSoldCount || 0);
    if (soldDiff !== 0) {
      return soldDiff;
    }

    return (b.sellerFollowersCount || 0) - (a.sellerFollowersCount || 0);
  });
}

function sortPostsByEngagement(posts: Post[]) {
  return [...posts].sort((a, b) => {
    const commentDiff = (b.commentsCount || 0) - (a.commentsCount || 0);
    if (commentDiff !== 0) {
      return commentDiff;
    }

    return (b.likes || 0) - (a.likes || 0);
  });
}

export default function HomePage() {
  const [data, setData] = useState<HomeData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await homeApi.index();
        setData({
          hotServices: response.hotServices || [],
          hotMarket: response.hotMarket || [],
          hotNews: response.hotNews || [],
        });
      } catch (fetchError: unknown) {
        setError(getErrorMessage(fetchError, '首页数据加载失败'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const sortedServices = sortServicesByReview(data.hotServices);
  const sortedMarket = sortItemsBySellerValue(data.hotMarket);
  const sortedNews = sortPostsByEngagement(data.hotNews);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-stone-50/30">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,56,92,0.14),transparent_32%),radial-gradient(circle_at_10%_40%,rgba(95,94,94,0.08),transparent_30%),linear-gradient(to_bottom,rgba(255,56,92,0.08),rgba(255,255,255,0))]" />

      <HeroSection />

      <main id="discovery-results" className="mx-auto max-w-[1440px] scroll-mt-32 px-4 pb-12 pt-12 md:px-12 md:pb-16 md:pt-16">
        <div className="space-y-20 md:space-y-32">
          <SectionWrapper
            section={SECTIONS[0]}
            data={sortedServices}
            loading={loading}
            columns="grid-cols-1 justify-start sm:grid-cols-2 lg:[grid-template-columns:repeat(5,minmax(0,220px))]"
            skeletonHeight="h-44"
            itemClassName="w-full"
            renderItem={(item) => <GlobalCard type="service" data={item as Service} size="homeCompact" />}
          />
          <SectionWrapper
            section={SECTIONS[1]}
            data={sortedMarket}
            loading={loading}
            columns="grid-cols-1 justify-start sm:grid-cols-2 lg:[grid-template-columns:repeat(5,minmax(0,220px))]"
            skeletonHeight="h-44"
            itemClassName="w-full"
            renderItem={(item) => <GlobalCard type="item" data={item as Item} size="homeCompact" />}
          />
          <SectionWrapper
            section={SECTIONS[2]}
            data={sortedNews}
            loading={loading}
            columns="grid-cols-1 justify-start lg:[grid-template-columns:repeat(3,minmax(0,1fr))]"
            skeletonHeight="h-36"
            itemClassName="w-full"
            renderItem={(item, idx) => <HomePostCard post={item as Post} idx={idx} compact />}
          />
        </div>
      </main>

      <BackToTop />
    </div>
  );
}

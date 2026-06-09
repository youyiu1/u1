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
  {
    title: '精选服务',
    tag: 'Service Selection',
    description: '把高评价和高响应的本地服务收在一处，浏览会更集中。',
    link: '/service',
    linkText: '查看更多服务',
    dataKey: 'hotServices' as const,
    previewCount: 5,
  },
  {
    title: '闲置好物',
    tag: 'Market Trends',
    description: '优先展示更受欢迎、转化更高的闲置物品。',
    link: '/market',
    linkText: '查看更多闲置',
    dataKey: 'hotMarket' as const,
    previewCount: 5,
  },
  {
    title: '同城动态',
    tag: 'Community Pulse',
    description: '来自附近用户的真实分享和生活记录。',
    link: '/news',
    linkText: '查看更多动态',
    dataKey: 'hotNews' as const,
    previewCount: 3,
  },
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
    <section className="rounded-[24px] border border-stone-200 bg-white px-3.5 py-3.5 shadow-[0_6px_18px_rgba(15,23,42,0.04)] md:px-4 md:py-4">
      <SectionHeader
        title={section.title}
        tag={section.tag}
        description={section.description}
        link={section.link}
        linkText={section.linkText}
        isButton={section.dataKey === 'hotNews'}
        highlightAction
      />
      <div className={`grid ${columns} justify-start items-stretch gap-3 md:gap-4`}>
        {loading
          ? Array(previewCount)
              .fill(0)
              .map((_, index) => <div key={index} className={`${skeletonHeight} ${itemClassName || ''} animate-pulse rounded-[18px] bg-stone-100`} />)
          : data.slice(0, previewCount).map((item, idx) => (
              <div key={item.id} className={`min-w-0 content-visibility-auto ${itemClassName || ''}`}>
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
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <HeroSection />

      <main id="discovery-results" className="mx-auto max-w-[1300px] scroll-mt-32 px-4 pb-10 pt-5 md:px-7 md:pb-14 md:pt-6">
        <div className="grid gap-5 lg:gap-6">
          <SectionWrapper
            section={SECTIONS[0]}
            data={sortedServices}
            loading={loading}
            columns="grid-cols-1 sm:grid-cols-2 lg:[grid-template-columns:repeat(5,minmax(0,188px))]"
            skeletonHeight="h-52"
            itemClassName="w-full max-w-[188px]"
            renderItem={(item) => <GlobalCard type="service" data={item as Service} size="homeCompact" />}
          />

          <SectionWrapper
            section={SECTIONS[1]}
            data={sortedMarket}
            loading={loading}
            columns="grid-cols-1 sm:grid-cols-2 lg:[grid-template-columns:repeat(5,minmax(0,188px))]"
            skeletonHeight="h-52"
            itemClassName="w-full max-w-[188px]"
            renderItem={(item) => <GlobalCard type="item" data={item as Item} size="homeCompact" />}
          />

          <SectionWrapper
            section={SECTIONS[2]}
            data={sortedNews}
            loading={loading}
            columns="grid-cols-1 lg:[grid-template-columns:repeat(3,minmax(0,248px))]"
            skeletonHeight="h-60"
            itemClassName="w-full max-w-[248px]"
            renderItem={(item, idx) => <HomePostCard post={item as Post} idx={idx} compact />}
          />
        </div>
      </main>

      <BackToTop />
    </div>
  );
}

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
  { title: '精选服务', tag: 'Service Selection', link: '/service', linkText: '查看更多服务', dataKey: 'hotServices' as const },
  { title: '闲置好物', tag: 'Market Trends', link: '/market', linkText: '查看更多闲置', dataKey: 'hotMarket' as const },
  { title: '同城动态', tag: 'Community Pulse', link: '/news', linkText: '查看更多动态', dataKey: 'hotNews' as const },
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
  renderItem,
}: {
  section: (typeof SECTIONS)[number];
  data: Array<Service | Item | Post>;
  loading: boolean;
  columns: string;
  skeletonHeight: string;
  renderItem: (item: Service | Item | Post, idx: number) => React.ReactNode;
}) {
  const previewCount = section.dataKey === 'hotNews' ? 2 : 4;

  return (
    <section className="content-visibility-auto">
      <SectionHeader
        title={section.title}
        tag={section.tag}
        link={section.link}
        linkText={section.linkText}
        isButton={section.dataKey === 'hotNews'}
      />
      <div className={`grid ${columns} gap-8 md:gap-12`}>
        {loading
          ? Array(previewCount)
              .fill(0)
              .map((_, index) => <div key={index} className={`${skeletonHeight} animate-pulse rounded-2xl bg-stone-200`} />)
          : data.slice(0, previewCount).map((item, idx) => (
              <div key={item.id} className="content-visibility-auto">
                {renderItem(item, idx)}
              </div>
            ))}
      </div>
    </section>
  );
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
            data={data.hotServices}
            loading={loading}
            columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            skeletonHeight="h-64"
            renderItem={(item) => <GlobalCard type="service" data={item as Service} />}
          />
          <SectionWrapper
            section={SECTIONS[1]}
            data={data.hotMarket}
            loading={loading}
            columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            skeletonHeight="h-64"
            renderItem={(item) => <GlobalCard type="item" data={item as Item} />}
          />
          <SectionWrapper
            section={SECTIONS[2]}
            data={data.hotNews}
            loading={loading}
            columns="grid-cols-1 lg:grid-cols-2"
            skeletonHeight="h-48"
            renderItem={(item, idx) => <HomePostCard post={item as Post} idx={idx} />}
          />
        </div>
      </main>

      <BackToTop />
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { homeApi } from '../services/api';
import { GlobalCard } from '../components/common/Card';
import { HeroSection } from '../components/home/HeroSection';
import { SectionHeader } from '../components/common/SectionHeader';
import { HomePostCard } from '../components/home/HomePostCard';
import { BackToTop } from '../components/common/BackToTop';
import { Service, Item, Post } from '../types';

const SECTIONS = [
  { title: '服务', tag: 'Service Selection', link: '/service', linkText: '查看全部服务', dataKey: 'hotServices' as const },
  { title: '交易', tag: 'Market Trends', link: '/market', linkText: '查看全部好物', dataKey: 'hotMarket' as const },
  { title: '动态', tag: 'Community Pulse', link: '/news', linkText: '查看全部动态', dataKey: 'hotNews' as const },
];

const SectionWrapper: React.FC<{
  section: (typeof SECTIONS)[number];
  data: any[];
  loading: boolean;
  columns: string;
  skeletonHeight: string;
  renderItem: (item: any, idx: number) => React.ReactNode;
}> = ({ section, data, loading, columns, skeletonHeight, renderItem }) => (
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
        ? Array(section.dataKey === 'hotNews' ? 2 : 4).fill(0).map((_, i) => (
            <div key={i} className={`${skeletonHeight} bg-stone-200 animate-pulse rounded-2xl`} />
          ))
        : data.slice(0, section.dataKey === 'hotNews' ? 2 : 4).map((item, idx) => (
            <div key={item.id} className="content-visibility-auto">
              {renderItem(item, idx)}
            </div>
          ))}
    </div>
  </section>
);

export default function Home() {
  const [data, setData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await homeApi.index();
        setData({
          hotServices: res.hotServices || [],
          hotMarket: res.hotMarket || [],
          hotNews: res.hotNews || [],
        });
      } catch (err: any) {
        setError(err.message || '鍔犺浇澶辫触');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-stone-50/30 relative overflow-hidden min-h-screen">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,56,92,0.14),transparent_32%),radial-gradient(circle_at_10%_40%,rgba(95,94,94,0.08),transparent_30%),linear-gradient(to_bottom,rgba(255,56,92,0.08),rgba(255,255,255,0))] pointer-events-none" />

      <HeroSection />

      <main id="discovery-results" className="max-w-[1440px] mx-auto px-4 md:px-12 py-12 md:py-16 pb-12 md:pb-16 scroll-mt-32">
        <div className="space-y-20 md:space-y-32">
          <SectionWrapper
            section={SECTIONS[0]}
            data={data.hotServices || []}
            loading={loading}
            columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            skeletonHeight="h-64"
            renderItem={(item) => <GlobalCard type="service" data={item as Service} />}
          />
          <SectionWrapper
            section={SECTIONS[1]}
            data={data.hotMarket || []}
            loading={loading}
            columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            skeletonHeight="h-64"
            renderItem={(item) => <GlobalCard type="item" data={item as Item} />}
          />
          <SectionWrapper
            section={SECTIONS[2]}
            data={data.hotNews || []}
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


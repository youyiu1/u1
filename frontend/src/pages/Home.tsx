/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { homeApi } from '../services/api';
import { GlobalCard } from '../components/common/Card';
import { HeroSection } from '../components/home/HeroSection';
import { SectionHeader } from '../components/common/SectionHeader';
import { HomePostCard } from '../components/home/HomePostCard';
import { BackToTop } from '../components/common/BackToTop';
import { Service, Item, Post } from '../types';

const BLOBS = [
  { top: '20%', right: '20%', size: 900, color: 'bg-primary/10', blur: 'blur-[180px]', anim: { x: [0, -80, 0], y: [0, 50, 0], scale: [1, 1.15, 1] }, dur: 14 },
  { top: '33%', left: '0', size: 700, color: 'bg-secondary/10', blur: 'blur-[150px]', anim: { x: [0, 80, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }, dur: 12 },
  { bottom: '0', left: '33%', size: 800, color: 'bg-pink-300/10', blur: 'blur-[150px]', anim: { x: [0, 60, 0, -60, 0] }, dur: 18 },
  { bottom: '0', right: '0', size: 600, color: 'bg-orange-200/10', blur: 'blur-[120px]', anim: { scale: [1, 1.2, 1] }, dur: 10 },
  { top: '50%', left: '25%', size: 500, color: 'bg-purple-200/8', blur: 'blur-[140px]', anim: { y: [0, -60, 0] }, dur: 16 },
];

const AnimatedBlob: React.FC<{ blob: (typeof BLOBS)[number] }> = ({ blob }) => {
  const posStyle = {
    ...(blob.top && { top: blob.top }),
    ...(blob.bottom && { bottom: blob.bottom }),
    ...(blob.left && { left: blob.left }),
    ...(blob.right && { right: blob.right }),
    width: blob.size,
    height: blob.size,
  };

  return (
    <motion.div
      className={`absolute ${blob.color} ${blob.blur} rounded-full pointer-events-none`}
      style={posStyle}
      animate={blob.anim}
      transition={{ duration: blob.dur, repeat: Infinity, ease: "easeInOut" }}
    />
  );
};

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
  <motion.section
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
  >
    <SectionHeader
      title={section.title}
      tag={section.tag}
      link={section.link}
      linkText={section.linkText}
      isButton={section.title === '动态'}
    />
    <div className={`grid ${columns} gap-8 md:gap-12`}>
      {loading
        ? Array(section.title === '动态' ? 2 : 4).fill(0).map((_, i) => (
            <div key={i} className={`${skeletonHeight} bg-stone-200 animate-pulse rounded-2xl`} />
          ))
        : data.slice(0, section.title === '动态' ? 2 : 4).map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {renderItem(item, idx)}
            </motion.div>
          ))}
    </div>
  </motion.section>
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
        setError(err.message || '加载失败');
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
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-purple-50/10 to-secondary/15 pointer-events-none" />
      {BLOBS.map((blob, i) => <AnimatedBlob key={i} blob={blob} />)}

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
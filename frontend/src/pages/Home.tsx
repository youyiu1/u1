/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { SERVICES, ITEMS, POSTS } from '../constants';
import { GlobalCard } from '../components/common/Card';
import { HeroSection } from '../components/home/HeroSection';
import { SectionHeader } from '../components/common/SectionHeader';
import { HomePostCard } from '../components/home/HomePostCard';

const BLOBS = [
  { top: '20%', right: '20%', size: 900, color: 'bg-primary/10', blur: 'blur-[180px]', anim: { x: [0, -80, 0], y: [0, 50, 0], scale: [1, 1.15, 1] }, dur: 14 },
  { top: '33%', left: '0', size: 700, color: 'bg-secondary/10', blur: 'blur-[150px]', anim: { x: [0, 80, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }, dur: 12 },
  { bottom: '0', left: '33%', size: 800, color: 'bg-pink-300/10', blur: 'blur-[150px]', anim: { x: [0, 60, 0, -60, 0] }, dur: 18 },
  { bottom: '0', right: '0', size: 600, color: 'bg-orange-200/10', blur: 'blur-[120px]', anim: { scale: [1, 1.2, 1] }, dur: 10 },
  { top: '50%', left: '25%', size: 500, color: 'bg-purple-200/8', blur: 'blur-[140px]', anim: { y: [0, -60, 0] }, dur: 16 },
];

const AnimatedBlob: React.FC<{ blob: typeof BLOBS[number] }> = ({ blob }) => {
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

export default function Home() {
  return (
    <div className="bg-stone-50/30 relative overflow-hidden min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-purple-50/10 to-secondary/15 pointer-events-none" />
      {BLOBS.map((blob, i) => <AnimatedBlob key={i} blob={blob} />)}

      <HeroSection />

      <main id="discovery-results" className="max-w-[1440px] mx-auto px-4 md:px-12 py-12 md:py-16 pb-12 md:pb-16 scroll-mt-32">
        <div className="space-y-20 md:space-y-32">
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <SectionHeader
              title="服务"
              tag="Service Selection"
              link="/service"
              linkText="查看全部服务"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
              {SERVICES.slice(0, 4).map((service, idx) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <GlobalCard type="service" data={service} />
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <SectionHeader
              title="交易"
              tag="Market Trends"
              link="/market"
              linkText="查看全部好物"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
              {ITEMS.slice(0, 4).map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <GlobalCard type="item" data={item} />
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <SectionHeader
              title="动态"
              tag="Community Pulse"
              link="/news"
              linkText="查看全部动态"
              isButton
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {POSTS.slice(0, 2).map((post, idx) => (
                <HomePostCard key={post.id} post={post} idx={idx} />
              ))}
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
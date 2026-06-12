import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { HeroSection } from '../../components/home/HeroSection';
import { BackToTop } from '../../components/common/BackToTop';
import { useTheme } from '../../context/ThemeContext';

const FEATURE_POINTS = [
  {
    title: '真实邻里',
    description: '围绕附近生活场景组织内容，不把首页做成堆叠式信息流。',
  },
  {
    title: '即时响应',
    description: '从服务咨询到动态互动，都尽量让用户更快进入真正的操作页面。',
  },
  {
    title: '本地连接',
    description: '把服务、交易和社区记录串起来，让浏览和进入都更自然顺手。',
  },
];

const ENTRANCES = [
  {
    title: '精选服务',
    eyebrow: 'Service',
    description: '快速找到家政、维修、跑腿等本地高频服务，直接进入列表页查看真实内容。',
    link: '/service',
    actionText: '进入服务',
  },
  {
    title: '闲置交易',
    eyebrow: 'Market',
    description: '浏览二手好物与本地在售商品，直接进入交易页查看更完整的商品信息。',
    link: '/market',
    actionText: '进入交易',
  },
  {
    title: '同城动态',
    eyebrow: 'Community',
    description: '查看附近用户的生活分享、社区记录与互动内容，保持首页本身的轻量感。',
    link: '/news',
    actionText: '进入动态',
  },
];

const EntryCard: React.FC<
  (typeof ENTRANCES)[number] & {
    mode: 'day' | 'night';
  }
> = ({ title, eyebrow, description, link, actionText, mode }) => {
  const isNight = mode === 'night';

  return (
    <Link
      to={link}
      className={`group flex min-h-[198px] flex-col justify-between rounded-[26px] border px-5 py-5 transition-all duration-300 hover:-translate-y-0.5 md:min-h-[210px] md:px-6 md:py-6 ${
        isNight
          ? 'border-slate-800 bg-slate-900/92 shadow-[0_14px_30px_rgba(2,6,23,0.34)] hover:shadow-[0_18px_38px_rgba(2,6,23,0.42)]'
          : 'border-stone-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.045)] hover:shadow-[0_14px_34px_rgba(15,23,42,0.08)]'
      }`}
    >
      <div className="space-y-3">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${
            isNight ? 'bg-slate-800 text-slate-300' : 'bg-stone-100 text-stone-500'
          }`}
        >
          {eyebrow}
        </span>
        <div className="space-y-2">
          <h2 className={`text-[22px] font-black tracking-tight ${isNight ? 'text-white' : 'text-ink'}`}>
            {title}
          </h2>
          <p className={`max-w-[270px] text-[13px] leading-6 ${isNight ? 'text-slate-400' : 'text-muted'}`}>
            {description}
          </p>
        </div>
      </div>

      <div className={`inline-flex items-center gap-2 text-[12px] font-black transition-colors ${
        isNight ? 'text-slate-100 group-hover:text-primary-light' : 'text-ink group-hover:text-primary'
      }`}>
        <span>{actionText}</span>
        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </Link>
  );
};

export default function HomePage() {
  const { mode } = useTheme();
  const isNight = mode === 'night';

  return (
    <div
      className={
        isNight
          ? 'relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#08111f_0%,#0f172a_46%,#111827_100%)] text-white'
          : 'relative min-h-screen overflow-hidden bg-white'
      }
    >
      <HeroSection mode={mode} />

      <section className="mx-auto max-w-[1100px] px-4 py-8 md:px-7 md:py-10">
        <div className="grid gap-3 md:grid-cols-3 md:gap-4">
          {FEATURE_POINTS.map((point) => (
            <div
              key={point.title}
              className={`rounded-[22px] border px-4 py-4 text-center ${
                isNight
                  ? 'border-slate-800 bg-slate-900/72 shadow-[0_10px_24px_rgba(2,6,23,0.22)]'
                  : 'border-stone-200 bg-stone-50/75 shadow-[0_8px_22px_rgba(15,23,42,0.03)]'
              }`}
            >
              <div className="mb-2 text-[16px] font-black tracking-tight text-primary">
                {point.title}
              </div>
              <p className={`text-[12px] leading-5 ${isNight ? 'text-slate-400' : 'text-muted'}`}>
                {point.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <main
        id="discovery-results"
        className="mx-auto max-w-[1300px] scroll-mt-32 px-4 pb-12 pt-2 md:px-7 md:pb-16 md:pt-3"
      >
        <section className="mx-auto max-w-[1020px]">
          <div className="mb-5 flex flex-col items-center text-center md:mb-6">
            <span className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-primary/80">
              Quick Access
            </span>
            <h2 className={`text-[24px] font-black tracking-tight md:text-[28px] ${isNight ? 'text-white' : 'text-ink'}`}>
              选择你现在最想进入的内容
            </h2>
            <p className={`mt-2 max-w-[560px] text-[13px] leading-6 md:text-[14px] ${isNight ? 'text-slate-400' : 'text-muted'}`}>
              首页保持简洁，内容浏览统一进入对应页面，这样会比在首页堆信息流更轻、更干净。
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3 md:gap-5">
            {ENTRANCES.map((entry) => (
              <EntryCard key={entry.link} {...entry} mode={mode} />
            ))}
          </div>
        </section>
      </main>

      <BackToTop />
    </div>
  );
}

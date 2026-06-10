import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Activity, Eye, MessageCircleMore, Sparkles, Users } from 'lucide-react';

type HomeThemeMode = 'day' | 'night';

const WORDS = ['生活灵感', '邻里温情', '社区动态', '身边故事', '同城烟火'];
const TYPE_SPEED = 220;
const DELETE_SPEED = 120;
const PAUSE_DURATION = 3200;

const FLOATING_CARDS = [
  {
    title: '用户数量',
    value: '12,402',
    note: '持续活跃',
    icon: Users,
    className: 'left-[0px] top-[6px]',
    widthClassName: 'w-[138px]',
    yOffset: [-6, 6, -6],
    duration: 6.3,
  },
  {
    title: '浏览量',
    value: '89.6k',
    note: '本周累计',
    icon: Eye,
    className: 'left-[34px] top-[172px]',
    widthClassName: 'w-[132px]',
    yOffset: [-5, 5, -5],
    duration: 5.8,
  },
  {
    title: '即时互动',
    value: '2.4k',
    note: '消息与评论',
    icon: MessageCircleMore,
    className: 'left-[170px] top-[10px]',
    widthClassName: 'w-[150px]',
    yOffset: [-7, 7, -7],
    duration: 6.8,
  },
  {
    title: '活跃发布',
    value: '648',
    note: '今日新增',
    icon: Activity,
    className: 'left-[202px] top-[188px]',
    widthClassName: 'w-[128px]',
    yOffset: [-5, 4, -5],
    duration: 5.9,
  },
  {
    title: '服务响应',
    value: '98.2%',
    note: '保持在线',
    icon: Sparkles,
    className: 'left-[214px] top-[96px]',
    widthClassName: 'w-[136px]',
    yOffset: [-6, 5, -6],
    duration: 6.1,
  },
];

function FloatingStats({
  mode,
}: {
  mode: HomeThemeMode;
}) {
  const isNight = mode === 'night';

  return (
    <div className="pointer-events-none relative hidden h-[360px] w-[360px] lg:block">
      <div
        className={`absolute inset-[11%] rounded-[38px] blur-2xl ${
          isNight
            ? 'bg-[radial-gradient(circle_at_50%_42%,rgba(56,189,248,0.18),rgba(15,23,42,0.12)_50%,rgba(255,255,255,0)_100%)]'
            : 'bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.96),rgba(245,245,244,0.78)_48%,rgba(255,255,255,0)_100%)]'
        }`}
      />

      {FLOATING_CARDS.map((card, index) => {
        const Icon = card.icon;

        return (
          <motion.div
            key={card.title}
            animate={{ y: card.yOffset, rotate: [-1, 1, -1] }}
            transition={{
              duration: card.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.15,
            }}
            className={`absolute ${card.className} ${card.widthClassName} rounded-[22px] border px-4 py-3 backdrop-blur-xl ${
              isNight
                ? 'border-slate-700/80 bg-slate-900/78 shadow-[0_18px_40px_rgba(2,6,23,0.28)]'
                : 'border-white/70 bg-white/88 shadow-[0_18px_40px_rgba(15,23,42,0.08)]'
            }`}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className={`text-[10px] font-black tracking-[0.08em] ${isNight ? 'text-slate-300' : 'text-stone-500'}`}>
                {card.title}
              </span>
              <div className={`rounded-full p-1.5 ${isNight ? 'bg-slate-800 text-primary-light' : 'bg-stone-100 text-primary'}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className={`text-[24px] font-black leading-none tracking-tight ${isNight ? 'text-white' : 'text-ink'}`}>
              {card.value}
            </div>
            <div className={`mt-1 text-[10px] font-medium ${isNight ? 'text-slate-400' : 'text-muted'}`}>
              {card.note}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export const HeroSection: React.FC<{
  mode: HomeThemeMode;
}> = ({ mode }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const frameRef = useRef<ReturnType<typeof setTimeout>>();
  const isNight = mode === 'night';

  const clearTimers = useCallback(() => {
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = undefined;
    }
    if (frameRef.current) {
      clearTimeout(frameRef.current);
      frameRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    const currentWord = WORDS[currentIndex];

    const tick = () => {
      if (!isDeleting) {
        if (displayText.length < currentWord.length) {
          frameRef.current = setTimeout(() => {
            setDisplayText(currentWord.slice(0, displayText.length + 1));
          }, 0);
        } else {
          pauseTimeoutRef.current = setTimeout(() => setIsDeleting(true), PAUSE_DURATION);
        }
        return;
      }

      if (displayText.length > 0) {
        frameRef.current = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 0);
      } else {
        setIsDeleting(false);
        setCurrentIndex((prev) => (prev + 1) % WORDS.length);
      }
    };

    const timeout = setTimeout(tick, isDeleting ? DELETE_SPEED : TYPE_SPEED);
    return () => {
      clearTimeout(timeout);
      clearTimers();
    };
  }, [clearTimers, currentIndex, displayText, isDeleting]);

  return (
    <section className="relative z-10 mx-auto max-w-[1300px] overflow-hidden px-4 pb-8 pt-14 sm:pt-18 md:px-7 md:pb-10 md:pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-8"
      >
        <div className="max-w-[820px]">
          <div className="mb-4 flex items-center gap-3 sm:mb-5 sm:gap-4">
            <div className="h-[1px] w-7 bg-primary sm:w-10" />
            <span className="text-[8px] font-black uppercase tracking-[0.22em] text-primary sm:text-[9px] sm:tracking-[0.3em]">
              Discover Nearby Inspiration
            </span>
          </div>

          <h1 className={`mb-5 text-[2.5rem] font-black leading-[0.94] tracking-tighter sm:mb-6 sm:text-[3.5rem] md:text-[4.5rem] md:leading-[0.9] lg:text-[4.8rem] ${
            isNight ? 'text-white' : 'text-ink'
          }`}>
            发现身边的
            <br />
            <span className="pr-2 italic text-primary sm:pr-3">
              {displayText}
              <span className="inline-block animate-pulse">|</span>
            </span>
          </h1>

          <p className={`mb-6 max-w-xl text-[12px] leading-6 sm:text-[13px] md:text-[14px] ${
            isNight ? 'text-slate-400' : 'text-muted'
          }`}>
            在同城里找服务、逛闲置、看动态，也把自己的生活分享给附近的人。
          </p>

          <div className="flex max-w-lg flex-col flex-wrap gap-3 sm:flex-row sm:gap-4">
            <button
              onClick={() => {
                document.getElementById('discovery-results')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group relative w-full overflow-hidden rounded-[20px] bg-ink px-7 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-sm transition-all duration-300 hover:bg-primary active:scale-95 sm:w-auto sm:px-8 sm:py-4"
            >
              <span className="relative z-10">立即探索</span>
            </button>
            <button
              className={`group relative w-full overflow-hidden rounded-[20px] border px-7 py-3 text-center text-[10px] font-black uppercase tracking-[0.18em] transition-all duration-300 active:scale-95 sm:w-auto sm:px-8 sm:py-4 ${
                isNight
                  ? 'border-slate-700 bg-slate-900/75 text-white hover:border-slate-500'
                  : 'border-stone-200 bg-white text-ink hover:border-ink'
              }`}
            >
              <span className="relative z-10">随便逛逛</span>
            </button>
          </div>
        </div>

        <FloatingStats mode={mode} />
      </motion.div>
    </section>
  );
};

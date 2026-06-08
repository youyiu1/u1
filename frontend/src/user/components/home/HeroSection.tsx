import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

const WORDS = ['生活灵感', '邻里温情', '社区动态', '身边故事', '同城烟火'];
const TYPE_SPEED = 220;
const DELETE_SPEED = 120;
const PAUSE_DURATION = 3200;

export const HeroSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const frameRef = useRef<ReturnType<typeof setTimeout>>();

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
    <section className="relative z-10 mx-auto max-w-[1440px] overflow-hidden px-4 pb-10 pt-18 sm:pt-22 md:px-12 md:pb-12 md:pt-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-[980px]"
      >
        <div className="mb-5 flex items-center gap-3 sm:mb-7 sm:gap-4">
          <div className="h-[1px] w-8 bg-primary sm:w-12" />
          <span className="text-[9px] font-black uppercase tracking-[0.24em] text-primary sm:text-[10px] sm:tracking-[0.36em]">
            Discover Nearby Inspiration
          </span>
        </div>

        <h1 className="mb-6 text-4xl font-black leading-[0.92] tracking-tighter text-ink sm:mb-8 sm:text-6xl md:text-8xl md:leading-[0.88] lg:text-[5.6rem]">
          发现身边的
          <br />
          <span className="pr-2 italic text-primary sm:pr-4">
            {displayText}
            <span className="inline-block animate-pulse">|</span>
          </span>
        </h1>

        <p className="mb-8 max-w-2xl text-sm leading-7 text-muted sm:text-[15px]">
          在同城里找服务、逛闲置、看动态，也把自己的生活分享给附近的人。
        </p>

        <div className="flex max-w-xl flex-col flex-wrap gap-4 sm:flex-row sm:gap-5">
          <button
            onClick={() => {
              document.getElementById('discovery-results')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group relative w-full overflow-hidden rounded-[24px] bg-ink px-8 py-4 text-[11px] font-black uppercase tracking-widest text-white shadow-sm transition-all duration-300 hover:bg-primary active:scale-95 sm:w-auto sm:px-10 sm:py-5"
          >
            <span className="relative z-10">立即探索</span>
          </button>
          <button className="group relative w-full overflow-hidden rounded-[24px] border border-stone-200 bg-white px-8 py-4 text-center text-[11px] font-black uppercase tracking-widest text-ink transition-all duration-300 hover:border-ink active:scale-95 sm:w-auto sm:px-10 sm:py-5">
            <span className="relative z-10">随便逛逛</span>
          </button>
        </div>
      </motion.div>
    </section>
  );
};

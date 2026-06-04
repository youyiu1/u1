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
    <section className="relative z-10 mx-auto max-w-[1440px] overflow-hidden px-4 pb-14 pt-20 sm:pt-24 md:px-12 md:pb-16 md:pt-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mb-6 flex items-center gap-3 sm:mb-8 sm:gap-4">
          <div className="h-[1px] w-8 bg-primary sm:w-12" />
          <span className="text-[9px] font-black uppercase tracking-[0.24em] text-primary sm:text-[10px] sm:tracking-[0.4em]">
            Discover Nearby Inspiration
          </span>
        </div>

        <h1 className="mb-10 text-4xl font-black leading-[0.9] tracking-tighter text-ink sm:mb-12 sm:text-6xl md:mb-16 md:text-8xl md:leading-[0.85] lg:text-9xl">
          发现身边的
          <br />
          <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text pr-2 italic text-transparent sm:pr-4">
            {displayText}
            <span className="inline-block animate-pulse">|</span>
          </span>
        </h1>

        <div className="flex max-w-xl flex-col flex-wrap gap-4 sm:flex-row sm:gap-6">
          <button
            onClick={() => {
              document.getElementById('discovery-results')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group relative w-full overflow-hidden rounded-[24px] bg-ink px-8 py-4 text-[11px] font-black uppercase tracking-widest text-white shadow-premium transition-all duration-500 hover:bg-primary active:scale-95 sm:w-auto sm:rounded-[28px] sm:px-12 sm:py-6"
          >
            <span className="relative z-10">立即探索</span>
            <div className="absolute inset-0 translate-y-full bg-white/10 transition-transform duration-500 group-hover:translate-y-0" />
          </button>
          <button className="group relative w-full overflow-hidden rounded-[24px] border border-hairline bg-white px-8 py-4 text-center text-[11px] font-black uppercase tracking-widest text-ink shadow-sm transition-all duration-500 hover:border-ink active:scale-95 sm:w-auto sm:rounded-[28px] sm:px-12 sm:py-6">
            <span className="relative z-10">随便逛逛</span>
            <div className="absolute inset-0 translate-y-full bg-ink/5 transition-transform duration-500 group-hover:translate-y-0" />
          </button>
        </div>
      </motion.div>
    </section>
  );
};

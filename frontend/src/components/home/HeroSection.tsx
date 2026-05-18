import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'motion/react';

const WORDS = ['生活灵感.', '邻里温情.', '社区动态.', '身边故事.', '同城生活.'];

const TYPE_SPEED = 150;
const DELETE_SPEED = 80;
const PAUSE_DURATION = 2500;

export const HeroSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const clearTimers = useCallback(() => {
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    const currentWord = WORDS[currentIndex];

    const tick = () => {
      if (!isDeleting) {
        if (displayText.length < currentWord.length) {
          setDisplayText(currentWord.slice(0, displayText.length + 1));
        } else {
          pauseTimeoutRef.current = setTimeout(() => setIsDeleting(true), PAUSE_DURATION);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentIndex((prev) => (prev + 1) % WORDS.length);
        }
      }
    };

    const timeout = setTimeout(tick, isDeleting ? DELETE_SPEED : TYPE_SPEED);
    return () => {
      clearTimeout(timeout);
      clearTimers();
    };
  }, [displayText, isDeleting, currentIndex, clearTimers]);

  return (
    <section className="relative z-10 max-w-[1440px] mx-auto px-4 md:px-12 pt-32 pb-16 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-[1px] bg-primary" />
          <span className="text-[10px] font-black tracking-[0.4em] text-primary uppercase">Discover Nearby Inspiration</span>
        </div>

        <h1 className="text-6xl md:text-9xl font-black text-ink tracking-tighter leading-[0.85] mb-16">
          发现身边的<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light italic pr-4">
            {displayText}<span className="animate-pulse">|</span>
          </span>
        </h1>

        <div className="flex flex-wrap gap-6">
          <button
            onClick={() => {
              document.getElementById('discovery-results')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group relative px-12 py-6 bg-ink text-white rounded-[28px] font-black text-[11px] uppercase tracking-widest hover:bg-primary transition-all duration-500 active:scale-95 shadow-premium overflow-hidden"
          >
            <span className="relative z-10">立即探索</span>
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </button>
          <button className="group relative px-12 py-6 bg-white border border-hairline text-ink rounded-[28px] font-black text-[11px] uppercase tracking-widest hover:border-ink transition-all duration-500 active:scale-95 shadow-sm overflow-hidden text-center">
            <span className="relative z-10">随便逛逛</span>
            <div className="absolute inset-0 bg-ink/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </button>
        </div>
      </motion.div>
    </section>
  );
};
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

const WORDS = ['生活灵感', '邻里温情', '社区动态', '身边故事', '同城烟火'];
const TYPE_SPEED = 220;
const DELETE_SPEED = 120;
const PAUSE_DURATION = 3200;
const QUANTUM_NODES = [
  { top: '18%', left: '56%', size: 11, delay: 0.1, duration: 4.5 },
  { top: '29%', left: '26%', size: 9, delay: 0.6, duration: 5.1 },
  { top: '41%', left: '77%', size: 8, delay: 1, duration: 4.3 },
  { top: '62%', left: '30%', size: 9, delay: 0.3, duration: 5.4 },
  { top: '73%', left: '59%', size: 10, delay: 0.8, duration: 4.8 },
];
const QUANTUM_SPARKS = [
  { top: '14%', left: '74%', delay: 0.2, duration: 3.8 },
  { top: '24%', left: '12%', delay: 1.1, duration: 4.4 },
  { top: '55%', left: '86%', delay: 0.9, duration: 4.9 },
  { top: '81%', left: '19%', delay: 0.4, duration: 4.1 },
];
const LATITUDE_RINGS = [
  'top-[26%] h-[30px] opacity-45',
  'top-[38%] h-[50px] opacity-55',
  'top-1/2 h-[68px] opacity-60',
  'top-[62%] h-[50px] opacity-55',
  'top-[74%] h-[30px] opacity-45',
];
const LONGITUDE_RINGS = [
  { rotate: 0, scaleX: 0.98, opacity: 0.55 },
  { rotate: 55, scaleX: 0.8, opacity: 0.45 },
  { rotate: -55, scaleX: 0.8, opacity: 0.45 },
];

function QuantumGlobe() {
  return (
    <div className="pointer-events-none relative hidden h-[300px] w-[300px] lg:flex lg:items-start lg:justify-end">
      <motion.div
        animate={{ y: [-4, 5, -4], rotate: [-1, 1, -1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="relative mt-1 h-[260px] w-[260px] [perspective:1200px]"
      >
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_34%_30%,rgba(255,255,255,0.98),rgba(240,244,248,0.95)_20%,rgba(214,223,232,0.88)_48%,rgba(164,176,191,0.8)_72%,rgba(116,128,144,0.26)_100%)] shadow-[0_24px_56px_rgba(15,23,42,0.16)]" />
        <div className="absolute inset-[6%] rounded-full border border-white/45" />
        <div className="absolute inset-[1%] rounded-full border border-stone-400/30" />
        <div className="absolute left-[18%] top-[14%] h-[26%] w-[26%] rounded-full bg-white/55 blur-xl" />
        <div className="absolute bottom-[11%] right-[14%] h-[20%] w-[20%] rounded-full bg-slate-900/8 blur-2xl" />

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-[-8px] rounded-full border border-dashed border-stone-400/55"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-[12px] rounded-full border border-stone-300/70"
        />

        <div className="absolute inset-[20px] overflow-hidden rounded-full">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0"
          >
            {LATITUDE_RINGS.map((ringClassName) => (
              <div
                key={ringClassName}
                className={`absolute left-1/2 w-[82%] -translate-x-1/2 -translate-y-1/2 rounded-[999px] border border-stone-400/45 ${ringClassName}`}
              />
            ))}
          </motion.div>

          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {LONGITUDE_RINGS.map((ring) => (
              <div
                key={`${ring.rotate}-${ring.scaleX}`}
                className="absolute left-1/2 top-1/2 h-[90%] w-[34%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-stone-500/40"
                style={{
                  opacity: ring.opacity,
                  transform: `translate(-50%, -50%) rotate(${ring.rotate}deg) scaleX(${ring.scaleX})`,
                }}
              />
            ))}
          </motion.div>

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-[12%] rounded-full"
          >
            <div className="absolute left-[16%] top-[23%] h-8 w-13 rounded-[48%_52%_58%_42%/55%_42%_58%_45%] bg-stone-500/18 blur-[1px]" />
            <div className="absolute left-[58%] top-[22%] h-7 w-10 rounded-[44%_56%_48%_52%/58%_40%_60%_42%] bg-stone-500/16 blur-[1px]" />
            <div className="absolute left-[58%] top-[48%] h-11 w-11 rounded-[53%_47%_42%_58%/51%_46%_54%_49%] bg-stone-500/18 blur-[1px]" />
            <div className="absolute left-[24%] top-[57%] h-13 w-11 rounded-[47%_53%_55%_45%/42%_56%_44%_58%] bg-stone-500/16 blur-[1px]" />
          </motion.div>
        </div>

        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_28%,rgba(255,255,255,0.35),rgba(255,255,255,0)_36%),radial-gradient(circle_at_66%_72%,rgba(15,23,42,0.12),rgba(15,23,42,0)_42%)]" />
        <div className="absolute inset-[5%] rounded-full bg-[linear-gradient(135deg,rgba(255,255,255,0.28),rgba(255,255,255,0)_42%,rgba(15,23,42,0.08)_78%,rgba(15,23,42,0.16))] mix-blend-soft-light" />

        {QUANTUM_NODES.map((node) => (
          <motion.span
            key={`${node.top}-${node.left}`}
            animate={{
              scale: [1, 1.22, 0.95, 1],
              opacity: [0.7, 1, 0.74, 0.7],
              boxShadow: [
                '0 0 0 rgba(15,23,42,0.14)',
                '0 0 18px rgba(15,23,42,0.24)',
                '0 0 10px rgba(15,23,42,0.16)',
                '0 0 0 rgba(15,23,42,0.14)',
              ],
            }}
            transition={{
              duration: node.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: node.delay,
            }}
            className="absolute z-10 rounded-full bg-stone-950/85 ring-4 ring-white/75"
            style={{
              top: node.top,
              left: node.left,
              width: `${node.size}px`,
              height: `${node.size}px`,
            }}
          />
        ))}

        {QUANTUM_SPARKS.map((spark) => (
          <motion.span
            key={`${spark.top}-${spark.left}`}
            animate={{
              opacity: [0.24, 0.9, 0.28],
              scale: [0.75, 1.2, 0.88],
            }}
            transition={{
              duration: spark.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: spark.delay,
            }}
            className="absolute z-10 h-1.5 w-1.5 rounded-full bg-primary/80"
            style={{ top: spark.top, left: spark.left }}
          />
        ))}

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
          className="absolute left-1/2 top-1/2 h-[210px] w-[210px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30"
          style={{ transform: 'translate(-50%, -50%) rotateX(72deg)' }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="absolute left-1/2 top-1/2 h-[210px] w-[210px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-stone-300/35"
          style={{ transform: 'translate(-50%, -50%) rotateY(72deg)' }}
        />
      </motion.div>
    </div>
  );
}

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
    <section className="relative z-10 mx-auto max-w-[1300px] overflow-hidden px-4 pb-8 pt-14 sm:pt-18 md:px-7 md:pb-10 md:pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-8"
      >
        <div className="max-w-[820px]">
          <div className="mb-4 flex items-center gap-3 sm:mb-5 sm:gap-4">
            <div className="h-[1px] w-7 bg-primary sm:w-10" />
            <span className="text-[8px] font-black uppercase tracking-[0.22em] text-primary sm:text-[9px] sm:tracking-[0.3em]">
              Discover Nearby Inspiration
            </span>
          </div>

          <h1 className="mb-5 text-[2.5rem] font-black leading-[0.94] tracking-tighter text-ink sm:mb-6 sm:text-[3.5rem] md:text-[4.5rem] md:leading-[0.9] lg:text-[4.8rem]">
            发现身边的
            <br />
            <span className="pr-2 italic text-primary sm:pr-3">
              {displayText}
              <span className="inline-block animate-pulse">|</span>
            </span>
          </h1>

          <p className="mb-6 max-w-xl text-[12px] leading-6 text-muted sm:text-[13px] md:text-[14px]">
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
            <button className="group relative w-full overflow-hidden rounded-[20px] border border-stone-200 bg-white px-7 py-3 text-center text-[10px] font-black uppercase tracking-[0.18em] text-ink transition-all duration-300 hover:border-ink active:scale-95 sm:w-auto sm:px-8 sm:py-4">
              <span className="relative z-10">随便逛逛</span>
            </button>
          </div>
        </div>

        <QuantumGlobe />
      </motion.div>
    </section>
  );
};

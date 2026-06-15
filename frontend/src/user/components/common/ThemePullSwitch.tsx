import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const DESKTOP_BASE_LINE_HEIGHT = 20;
const DESKTOP_MAX_PULL_DISTANCE = 48;
const MOBILE_PULL_THRESHOLD = 30;
const MOBILE_MAX_PULL_DISTANCE = 54;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

export function ThemePullSwitch() {
  const { isNight, toggleMode } = useTheme();
  const isMobile = useIsMobile();
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const resetGesture = () => {
    setIsDragging(false);
    setDragOffset(0);
  };

  const triggerToggle = () => {
    toggleMode();
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleDesktopPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    const startY = event.clientY;
    let hasTriggered = false;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const nextOffset = Math.max(
        0,
        Math.min(DESKTOP_MAX_PULL_DISTANCE, moveEvent.clientY - startY)
      );
      setDragOffset(nextOffset);

      if (nextOffset >= MOBILE_PULL_THRESHOLD && !hasTriggered) {
        hasTriggered = true;
        triggerToggle();
      }
    };

    const handlePointerEnd = () => {
      resetGesture();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerEnd);
      window.removeEventListener('pointercancel', handlePointerEnd);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerEnd);
    window.addEventListener('pointercancel', handlePointerEnd);
  };

  const handleMobilePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    const startX = event.clientX;
    let hasTriggered = false;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const nextOffset = Math.max(0, Math.min(MOBILE_MAX_PULL_DISTANCE, moveEvent.clientX - startX));
      setDragOffset(nextOffset);

      if (nextOffset >= MOBILE_PULL_THRESHOLD && !hasTriggered) {
        hasTriggered = true;
        triggerToggle();
      }
    };

    const handlePointerEnd = () => {
      resetGesture();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerEnd);
      window.removeEventListener('pointercancel', handlePointerEnd);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerEnd);
    window.addEventListener('pointercancel', handlePointerEnd);
  };

  if (isMobile) {
    return (
      <div className="fixed right-0 top-24 z-[90] flex translate-x-[32%] justify-center">
        <motion.button
          type="button"
          aria-label={isNight ? '切换到白天模式' : '切换到黑夜模式'}
          onPointerDown={handleMobilePointerDown}
          initial={false}
          animate={{ x: isDragging ? 0 : 10 }}
          whileHover={{ x: 4 }}
          transition={{ type: 'spring', stiffness: 320, damping: 24 }}
          className="relative flex h-14 w-[88px] cursor-grab select-none items-center justify-end active:cursor-grabbing"
        >
          <span
            style={{ width: `${22 + dragOffset}px` }}
            className={`absolute right-10 top-1/2 h-px -translate-y-1/2 transition-[width,background-color] duration-150 ${
              isNight ? 'bg-slate-500' : 'bg-stone-300'
            }`}
          />
          <motion.span
            animate={{
              x: dragOffset,
              rotate: isDragging ? [0, -3, 2, 0] : 0,
              scale: isDragging ? 1.04 : 1,
            }}
            transition={{
              x: { type: 'spring', stiffness: 360, damping: 24 },
              rotate: { duration: 0.22, ease: 'easeInOut' },
              scale: { type: 'spring', stiffness: 360, damping: 24 },
            }}
            className="relative mr-0 flex items-center"
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 ${
                isNight
                  ? 'border-slate-700 bg-slate-900 text-sky-300'
                  : 'border-stone-200 bg-white text-amber-500'
              }`}
            >
              {isNight ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
            </span>
            <span
              className={`ml-[-1px] h-[2px] w-4 transition-colors duration-300 ${
                isNight ? 'bg-slate-500' : 'bg-stone-300'
              }`}
            />
          </motion.span>
        </motion.button>
      </div>
    );
  }

  return (
    <div className="group fixed right-0 top-24 z-[90] flex translate-x-[46%] justify-center sm:left-1/2 sm:right-auto sm:top-0 sm:-translate-x-1/2">
      <motion.button
        type="button"
        aria-label={isNight ? '切换到白天模式' : '切换到黑夜模式'}
        onPointerDown={handleDesktopPointerDown}
        initial={false}
        animate={{ y: isDragging ? 0 : -18 }}
        whileHover={{ y: -6 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        className="relative flex w-14 cursor-grab select-none flex-col items-center active:cursor-grabbing"
      >
        <span
          style={{ height: `${DESKTOP_BASE_LINE_HEIGHT + dragOffset}px` }}
          className={`w-px transition-[height,background-color] duration-150 ${
            isNight ? 'bg-slate-500' : 'bg-stone-300'
          }`}
        />

        <motion.span
          animate={{
            y: dragOffset,
            rotate: isDragging ? [0, -3, 2, 0] : 0,
            scale: isDragging ? 1.04 : 1,
          }}
          transition={{
            y: { type: 'spring', stiffness: 360, damping: 24 },
            rotate: { duration: 0.22, ease: 'easeInOut' },
            scale: { type: 'spring', stiffness: 360, damping: 24 },
          }}
          className="relative -mt-px flex flex-col items-center"
        >
          <span
            className={`h-4 w-[2px] transition-colors duration-300 md:h-5 ${
              isNight ? 'bg-slate-500' : 'bg-stone-300'
            }`}
          />
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 md:h-11 md:w-11 ${
              isNight
                ? 'border-slate-700 bg-slate-900 text-sky-300'
                : 'border-stone-200 bg-white text-amber-500'
            }`}
          >
            {isNight ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
          </span>
        </motion.span>
      </motion.button>
    </div>
  );
}

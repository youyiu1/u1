import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const BASE_LINE_HEIGHT = 20;
const MAX_PULL_DISTANCE = 48;
const TOGGLE_THRESHOLD = 28;

export function ThemePullSwitch() {
  const { isNight, toggleMode } = useTheme();
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const pointerIdRef = useRef<number | null>(null);
  const startYRef = useRef(0);
  const hasTriggeredRef = useRef(false);

  const resetGesture = () => {
    setIsDragging(false);
    setDragOffset(0);
    pointerIdRef.current = null;
    hasTriggeredRef.current = false;
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    pointerIdRef.current = event.pointerId;
    startYRef.current = event.clientY;
    hasTriggeredRef.current = false;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDragging || pointerIdRef.current !== event.pointerId) {
      return;
    }

    const nextOffset = Math.max(0, Math.min(MAX_PULL_DISTANCE, event.clientY - startYRef.current));
    setDragOffset(nextOffset);

    if (nextOffset >= TOGGLE_THRESHOLD && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      toggleMode();
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (pointerIdRef.current === event.pointerId) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    resetGesture();
  };

  const handlePointerCancel = () => {
    resetGesture();
  };

  return (
    <div className="group fixed left-1/2 top-0 z-[90] flex -translate-x-1/2 justify-center">
      <motion.button
        type="button"
        aria-label={isNight ? '切换到白天模式' : '切换到黑夜模式'}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={handlePointerCancel}
        initial={false}
        animate={{ y: isDragging ? 0 : -18 }}
        whileHover={{ y: -6 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        className="relative flex w-14 cursor-grab select-none flex-col items-center active:cursor-grabbing"
      >
        <span
          style={{ height: `${BASE_LINE_HEIGHT + dragOffset}px` }}
          className={`w-px transition-[height,background-color] duration-150 ${isNight ? 'bg-slate-500' : 'bg-stone-300'}`}
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

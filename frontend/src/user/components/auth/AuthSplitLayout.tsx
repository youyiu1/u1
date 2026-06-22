import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';
import { AnimatedCharacters } from './AnimatedCharacters';

export type AuthAnimationState = {
  isTyping?: boolean;
  showPassword?: boolean;
  passwordLength?: number;
  hasError?: boolean;
};

export type AuthHeroBadge = {
  label: string;
  to?: string;
};

type AuthSplitLayoutProps = {
  sideAction: React.ReactNode;
  children: React.ReactNode;
  animationState?: AuthAnimationState;
  heroBadge?: AuthHeroBadge;
};

export function AuthSplitLayout({
  sideAction,
  children,
  animationState,
  heroBadge,
}: AuthSplitLayoutProps) {
  const { isNight } = useTheme();
  const heroSurfaceClass = isNight
    ? 'bg-[radial-gradient(circle_at_top_right,rgba(148,163,184,0.16),transparent_28%),linear-gradient(135deg,#0f172a_0%,#111827_48%,#1e293b_100%)]'
    : 'bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.62),transparent_26%),linear-gradient(135deg,#d7d3dc_0%,#d2cdd8_46%,#cbc6d1_100%)]';
  const badge = heroBadge ?? { label: '首页', to: '/' };

  return (
    <div className="min-h-[calc(100vh-80px)]">
      <div className="grid min-h-[calc(100vh-80px)] w-full overflow-hidden theme-surface-panel lg:grid-cols-[minmax(0,1fr)_480px]">
        <motion.section
          initial={{ opacity: 0, x: 18, scale: 1.01 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className={`relative hidden overflow-hidden ${heroSurfaceClass} lg:flex lg:flex-col lg:justify-between`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.22),transparent_52%)]" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,rgba(203,198,209,0),rgba(203,198,209,0.34))]" />

          <div className="relative z-10 px-10 pt-8 xl:px-12 xl:pt-9">
            {badge.to ? (
              <Link to={badge.to} className="inline-flex items-center gap-2 text-sm font-bold text-white/85">
                <span className="h-2.5 w-2.5 rounded-full bg-white/65" />
                <span>{badge.label}</span>
              </Link>
            ) : (
              <div className="inline-flex items-center gap-2 text-sm font-bold text-white/85">
                <span className="h-2.5 w-2.5 rounded-full bg-white/65" />
                <span>{badge.label}</span>
              </div>
            )}
          </div>

          <div className="relative z-10 flex flex-1 items-center justify-center px-10 xl:px-12">
            <AnimatedCharacters
              isTyping={animationState?.isTyping}
              showPassword={animationState?.showPassword}
              passwordLength={animationState?.passwordLength}
              hasError={animationState?.hasError}
            />
          </div>

          <div className="relative z-10 flex items-center gap-8 px-10 pb-7 text-[11px] text-[#7f7a84] xl:px-12 xl:pb-8">
            <Link to="/privacy" className="transition-colors hover:text-[#4b4751]">
              隐私政策
            </Link>
            <Link to="/terms" className="transition-colors hover:text-[#4b4751]">
              服务条款
            </Link>
            <span className="transition-colors hover:text-[#4b4751]">社区互动</span>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="theme-surface-panel flex min-h-full flex-col px-5 py-6 sm:px-7 sm:py-7 lg:px-9 lg:py-8"
        >
          <div className="mb-6 flex justify-end">{sideAction}</div>
          <div className="mx-auto flex w-full max-w-[388px] flex-1 items-center">
            <div className="w-full py-2 sm:py-3">{children}</div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Menu, MessageSquare, Plus, Store, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useChat } from '../../context/ChatContext';
import { useAuthCheck } from '../../context/useAuthCheck';
import { usePublish } from '../../context/PublishContext';
import { createSectionPathRegex, matchPathByRegex } from '../../utils/pathMatch';
import { HeaderNotifications } from './HeaderNotifications';
import { HeaderSearch } from './HeaderSearch';
import { HeaderUserMenu } from './HeaderUserMenu';

const PUBLISH_PRELOAD_DELAY = 1200;
const PUBLISH_IDLE_TIMEOUT = 2500;
const PUBLISH_UNMOUNT_DELAY = 260;
const NAV_ITEMS = [
  { name: '首页', path: '/' },
  { name: '生活服务', path: '/service' },
  { name: '闲置交易', path: '/market' },
  { name: '同城动态', path: '/news' },
] as const;

const loadPublishOverlay = () => import('../publish/PublishOverlay').then((mod) => ({ default: mod.PublishOverlay }));
const PublishOverlay = lazy(loadPublishOverlay);
const windowWithIdleCallback = window as Window & {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export default function Header() {
  const location = useLocation();
  const { openChat, unreadCount } = useChat();
  const { isPublishOpen, openPublish, closePublish } = usePublish();
  const { requireAuth } = useAuthCheck();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [shouldRenderPublish, setShouldRenderPublish] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen((current) => !current);

  const handlePublish = () => {
    loadPublishOverlay();
    requireAuth(() => openPublish());
  };

  const handleOpenChat = () => {
    openChat();
    closeMobileMenu();
  };

  useEffect(() => {
    const preload = () => loadPublishOverlay();
    let idleId: number | undefined;
    let timeoutId: number | undefined;

    if (windowWithIdleCallback.requestIdleCallback) {
      idleId = windowWithIdleCallback.requestIdleCallback(preload, { timeout: PUBLISH_IDLE_TIMEOUT });
    } else {
      timeoutId = window.setTimeout(preload, PUBLISH_PRELOAD_DELAY);
    }

    return () => {
      if (idleId !== undefined && windowWithIdleCallback.cancelIdleCallback) {
        windowWithIdleCallback.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  useEffect(() => {
    if (isPublishOpen) {
      setShouldRenderPublish(true);
      return;
    }
    const timer = window.setTimeout(() => setShouldRenderPublish(false), PUBLISH_UNMOUNT_DELAY);
    return () => window.clearTimeout(timer);
  }, [isPublishOpen]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 w-full border-b border-white/35 bg-white/55 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-2xl supports-[backdrop-filter]:bg-white/45">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/35 via-white/10 to-white/25" />
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 md:h-20 md:gap-8 md:px-12">
          <div className="flex min-w-0 shrink items-center gap-4 md:gap-8">
            <Link to="/" className="flex min-w-0 shrink items-center gap-2 font-bold text-primary">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 md:h-10 md:w-10 md:rounded-2xl">
                <Store className="h-5 w-5 text-primary md:h-6 md:w-6" />
              </div>
              <span className="hidden truncate text-lg font-extrabold tracking-tight text-ink xs:block">同城生活</span>
            </Link>

            <nav className="hidden min-w-0 items-center gap-1 transition-all duration-300 lg:flex">
              {NAV_ITEMS.map((item) => (
                <DesktopNavLink key={item.path} item={item} active={matchPathByRegex(location.pathname, createSectionPathRegex(item.path))} />
              ))}
            </nav>
          </div>

          <div className="flex h-full min-w-0 flex-1 items-center justify-end gap-2 md:gap-4">
            <HeaderSearch />

            <button
              onClick={handlePublish}
              onMouseEnter={loadPublishOverlay}
              onFocus={loadPublishOverlay}
              className="shrink-0 rounded-xl bg-primary px-4 py-2 text-[11px] font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover active:scale-95 md:rounded-2xl md:px-5 md:py-2.5 md:text-xs"
            >
              <span className="flex items-center gap-1.5">
                <Plus className="h-4 w-4" />
                <span className="hidden lg:inline">发布</span>
              </span>
            </button>

            <div className="hidden h-6 w-px bg-hairline sm:block" />

            <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
              <button onClick={handleOpenChat} className="relative hidden rounded-2xl p-2.5 text-secondary transition-all hover:bg-surface-soft hover:text-primary sm:flex">
                <MessageSquare className="h-5 w-5" />
                {unreadCount > 0 ? (
                  <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-accent-green text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                ) : null}
              </button>

              <div className="hidden sm:block">
                <HeaderNotifications />
              </div>

              <HeaderUserMenu />

              <button
                onClick={toggleMobileMenu}
                className="rounded-2xl p-2.5 text-secondary transition-all hover:bg-surface-soft active:scale-90 lg:hidden"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isMobileMenuOpen ? 'close' : 'open'}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                  </motion.div>
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen ? (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeMobileMenu}
                className="fixed inset-0 top-[64px] z-40 bg-ink/20 backdrop-blur-sm md:top-[80px] lg:hidden"
              />

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute left-0 right-0 top-full z-50 border-t border-hairline bg-white shadow-2xl lg:hidden"
              >
                <nav className="space-y-1 p-4 md:p-6">
                  {NAV_ITEMS.map((item, index) => (
                    <motion.div key={item.path} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                      <MobileNavLink item={item} active={matchPathByRegex(location.pathname, createSectionPathRegex(item.path))} onClick={closeMobileMenu} />
                    </motion.div>
                  ))}

                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-hairline/50 pt-4">
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      onClick={handleOpenChat}
                      className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-surface-soft p-4 transition-colors hover:bg-hairline active:scale-95"
                    >
                      <MessageSquare className="h-5 w-5 text-secondary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-secondary">消息</span>
                    </motion.button>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.25 }}
                      className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-surface-soft p-4 transition-colors hover:bg-hairline"
                    >
                      <HeaderNotifications />
                      <span className="text-[10px] font-black uppercase tracking-widest text-secondary">通知中心</span>
                    </motion.div>
                  </div>
                </nav>
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>
      </header>

      <div className="h-16 md:h-20" aria-hidden="true" />

      {shouldRenderPublish ? (
        <Suspense fallback={null}>
          <PublishOverlay isOpen={isPublishOpen} onClose={closePublish} />
        </Suspense>
      ) : null}
    </>
  );
}

function DesktopNavLink({ item, active }: { key?: React.Key; item: { name: string; path: string }; active: boolean }) {
  return (
    <Link
      to={item.path}
      className={`group relative flex h-10 items-center rounded-xl px-4 text-sm font-bold transition-all ${active ? 'text-primary' : 'text-secondary hover:text-ink'}`}
    >
      <span className="relative z-10 inline-block transition-colors duration-300 group-hover:scale-105 active:scale-95">{item.name}</span>
      <div className="pointer-events-none absolute inset-0 scale-90 rounded-lg bg-surface-soft opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100" />
      {active ? (
        <motion.div
          layoutId="activeTab"
          transition={{ type: 'spring', stiffness: 400, damping: 30, mass: 1 }}
          className="absolute bottom-0 left-3 right-3 z-20 h-0.5 rounded-full bg-primary shadow-[0_2px_8px_rgba(255,54,92,0.4)]"
        />
      ) : null}
    </Link>
  );
}

function MobileNavLink({
  item,
  active,
  onClick,
}: {
  item: { name: string; path: string };
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={`flex items-center justify-between rounded-2xl px-6 py-4 transition-all ${active ? 'bg-primary/5 text-primary' : 'text-secondary active:bg-surface-soft'}`}
    >
      <span className="text-sm font-black uppercase tracking-widest">{item.name}</span>
      <ChevronRight className={`h-4 w-4 transition-transform ${active ? 'translate-x-1' : ''}`} />
    </Link>
  );
}

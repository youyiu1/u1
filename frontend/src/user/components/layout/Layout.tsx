/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AnimatePresence, motion } from 'motion/react';
import { Outlet, useLocation } from 'react-router-dom';
import { ChatOverlay } from '../chat/ChatOverlay';
import { AiAssistantWidget } from '../common/AiAssistantWidget';
import { ThemePullSwitch } from '../common/ThemePullSwitch';
import { useTheme } from '../../context/ThemeContext';
import Footer from './Footer';
import Header from './Header';

const PUBLISH_PATH = '/publish';
const AUTH_PATHS = new Set(['/login', '/register']);

export default function Layout() {
  const location = useLocation();
  const { isNight } = useTheme();

  const showHeader = location.pathname !== PUBLISH_PATH;
  const showFooter = !AUTH_PATHS.has(location.pathname);
  const isAuthRoute = AUTH_PATHS.has(location.pathname);

  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-hidden transition-colors duration-500">
      <div
        className={`flex min-h-0 flex-1 flex-col transition-colors duration-500 ${
          isNight ? 'theme-night-shell bg-slate-950 text-white' : 'theme-day-shell bg-stone-50/30 text-ink'
        }`}
      >
        <ThemePullSwitch />
        {showHeader ? <Header /> : null}
        <main className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={isAuthRoute ? 'auth-shell' : location.pathname}
              initial={isAuthRoute ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={isAuthRoute ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={isAuthRoute ? { opacity: 0 } : { opacity: 0, y: -10 }}
              transition={isAuthRoute ? { duration: 0.18, ease: [0.22, 1, 0.36, 1] } : { duration: 0.3 }}
              className="min-w-0"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        <AiAssistantWidget />
        <ChatOverlay />
        {showFooter ? <Footer /> : null}
      </div>
    </div>
  );
}

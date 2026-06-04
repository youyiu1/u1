/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AnimatePresence, motion } from 'motion/react';
import { Outlet, useLocation } from 'react-router-dom';
import { ChatOverlay } from '../chat/ChatOverlay';
import Footer from './Footer';
import Header from './Header';

const PUBLISH_PATH = '/publish';

export default function Layout() {
  const location = useLocation();

  const showHeader = location.pathname !== PUBLISH_PATH;

  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-hidden bg-stone-50/30">
      {showHeader ? <Header /> : null}
      <main className="min-w-0 flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="min-w-0"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <ChatOverlay />
    </div>
  );
}

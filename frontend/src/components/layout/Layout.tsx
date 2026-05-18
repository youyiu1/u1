/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { ChatOverlay } from '../chat/ChatOverlay';
import { motion, AnimatePresence } from 'motion/react';

export default function Layout() {
  const location = useLocation();

  const isPublishPage = location.pathname === '/publish';

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/30">
      {!isPublishPage && <Header />}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
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

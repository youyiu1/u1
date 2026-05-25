/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion } from 'motion/react';

interface BackToTopProps {
  threshold?: number;
}

export const BackToTop: React.FC<BackToTopProps> = ({ threshold = 300 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > threshold);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.8 }}
      transition={{ duration: 0.2 }}
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-50 p-4 bg-primary text-white rounded-full shadow-xl shadow-primary/30 hover:bg-primary-hover hover:scale-110 transition-all ${visible ? 'pointer-events-auto' : 'pointer-events-none'}`}
    >
      <ArrowUp className="w-5 h-5" />
    </motion.button>
  );
};
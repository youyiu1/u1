/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, content: string) => Promise<void>;
  title?: string;
}

export const ReviewDialog: React.FC<ReviewDialogProps> = ({ isOpen, onClose, onSubmit, title = '发表评价' }) => {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      await onSubmit(rating, content);
      setRating(5);
      setContent('');
      onClose();
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-ink">{title}</h3>
                <button onClick={onClose} className="p-2 text-muted hover:text-ink transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-ink mb-3">服务评分</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            star <= rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-muted/30'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm font-bold text-muted">{rating}.0</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-ink mb-3">评价内容</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="分享您的服务体验，帮助其他邻居更好地选择..."
                    className="w-full h-32 p-4 bg-surface-soft border border-hairline rounded-2xl text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading || !content.trim()}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '提交中...' : '提交评价'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
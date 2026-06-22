/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Star, X } from 'lucide-react';
import { getErrorMessage } from '../../utils/error';

interface ReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, content: string) => Promise<void>;
  title?: string;
}

export const ReviewDialog: React.FC<ReviewDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title = '发表评价',
}) => {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setRating(5);
    setContent('');
    setLoading(false);
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      await onSubmit(rating, content.trim());
      onClose();
    } catch (error: unknown) {
      console.error(getErrorMessage(error, '提交评价失败'));
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
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="theme-card w-full max-w-md rounded-[32px] p-8 shadow-2xl" onClick={(event) => event.stopPropagation()}>
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-black text-ink">{title}</h3>
                <button onClick={onClose} className="p-2 text-muted transition-colors hover:text-ink" aria-label="关闭评价弹窗">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="mb-3 block text-sm font-bold text-ink">服务评分</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => setRating(star)} className="p-1 transition-transform hover:scale-110">
                        <Star className={`h-8 w-8 transition-colors ${star <= rating ? 'fill-current text-yellow-400' : 'text-muted/30'}`} />
                      </button>
                    ))}
                    <span className="ml-2 text-sm font-bold text-muted">{rating}.0</span>
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-bold text-ink">评价内容</label>
                  <textarea
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    placeholder="分享这次服务体验，帮助其他邻居更好地选择。"
                    className="h-32 w-full resize-none rounded-2xl border border-hairline bg-surface-soft p-4 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading || !content.trim()}
                  className="w-full rounded-2xl bg-primary py-4 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
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

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  position?: 'center' | 'button';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
  position = 'center',
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: position === 'button' ? -10 : 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: position === 'button' ? -10 : 20 }}
            className={`pointer-events-auto absolute z-[201] w-full max-w-sm rounded-[32px] bg-white p-8 shadow-2xl ${
              position === 'button'
                ? 'right-0 top-full mt-2 -translate-x-16'
                : 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
            }`}
          >
            <button
              onClick={onCancel}
              className="absolute right-6 top-6 rounded-full p-2 transition-colors hover:bg-stone-100"
            >
              <X className="h-5 w-5 text-muted" />
            </button>

            <h3 className="mb-3 text-xl font-black text-ink">{title}</h3>
            <p className="mb-8 text-sm leading-relaxed text-secondary">{message}</p>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 rounded-2xl border border-hairline py-3.5 text-sm font-bold transition-colors hover:bg-surface-soft"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 rounded-2xl bg-ink py-3.5 text-sm font-bold text-white transition-colors hover:bg-ink/90"
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

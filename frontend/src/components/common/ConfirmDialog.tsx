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
        <div className="fixed inset-0 z-[200]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: position === 'button' ? -10 : 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: position === 'button' ? -10 : 20 }}
            className={`absolute bg-white rounded-[32px] shadow-2xl p-8 w-full max-w-sm z-[201] ${
              position === 'button'
                ? 'right-0 top-full mt-2 -translate-x-8'
                : 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
            }`}
          >
            <button
              onClick={onCancel}
              className="absolute top-6 right-6 p-2 hover:bg-stone-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-muted" />
            </button>

            <h3 className="text-xl font-black text-ink mb-3">{title}</h3>
            <p className="text-sm text-secondary mb-8 leading-relaxed">{message}</p>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-3.5 border border-hairline rounded-2xl font-bold text-sm hover:bg-surface-soft transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-3.5 bg-ink text-white rounded-2xl font-bold text-sm hover:bg-ink/90 transition-colors"
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
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import type { ToastState } from '../../hooks/toastTypes';

interface AdminToastProps {
  toast: ToastState | null;
}

export default function AdminToast({ toast }: AdminToastProps) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -24, scale: 0.95 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800"
        >
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-sky-500" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-500" />}
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{toast.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
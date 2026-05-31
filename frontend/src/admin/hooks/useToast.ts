import { useCallback, useEffect, useRef, useState } from 'react';
import type { ToastState, ToastType } from './toastTypes';

export function useToast(timeoutMs = 3000) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<number | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ message, type });
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      setToast(null);
      timerRef.current = null;
    }, timeoutMs);
  }, [timeoutMs]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { toast, showToast, setToast };
}
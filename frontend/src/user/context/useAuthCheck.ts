import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { getToken } from '../services/api';

interface UseAuthCheckReturn {
  requireAuth: (action?: () => void) => boolean;
}

export const useAuthCheck = (): UseAuthCheckReturn => {
  const { isAuthenticated, logout, authReady } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const requireAuth = useCallback(
    (action?: () => void) => {
      if (isAuthenticated && getToken()) {
        action?.();
        return true;
      }
      if (!authReady && getToken()) {
        showToast('正在恢复登录状态，请稍后再试', 'warning');
        return false;
      }

      void logout();
      showToast('请先登录后继续操作', 'warning');
      navigate('/login', {
        state: {
          from: `${location.pathname}${location.search}`,
        },
      });
      return false;
    },
    [authReady, isAuthenticated, logout, showToast, navigate, location.pathname, location.search]
  );

  return { requireAuth };
};

import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { getToken } from '../services/api';

interface UseAuthCheckReturn {
  requireAuth: (action?: () => void) => boolean;
}

export const useAuthCheck = (): UseAuthCheckReturn => {
  const { isAuthenticated, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const requireAuth = useCallback(
    (action?: () => void) => {
      if (isAuthenticated && getToken()) {
        action?.();
        return true;
      }

      logout();
      showToast('请先登录后继续操作', 'warning');
      navigate('/login', {
        state: {
          from: `${location.pathname}${location.search}`,
        },
      });
      return false;
    },
    [isAuthenticated, logout, showToast, navigate, location.pathname, location.search]
  );

  return { requireAuth };
};

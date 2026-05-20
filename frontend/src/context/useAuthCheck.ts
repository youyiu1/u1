import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { getToken } from '../services/api';

interface UseAuthCheckReturn {
  requireAuth: (action: () => void) => void;
}

export const useAuthCheck = (): UseAuthCheckReturn => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const requireAuth = useCallback((action: () => void) => {
    if (isAuthenticated && getToken()) {
      action();
    } else {
      showToast('请先登录', 'warning');
      navigate('/login');
    }
  }, [isAuthenticated, showToast, navigate]);

  return { requireAuth };
};
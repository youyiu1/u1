import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { User } from '../types';
import { userApi, setToken, removeToken, getToken, isAuthFailureMessage } from '../services/api';
import { AUTH_STATE_EVENT, getStoredUser, removeStoredUser, setStoredUser } from '../utils/authStorage';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, captchaId: string, captchaCode: string) => Promise<void>;
  register: (name: string, email: string, password: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  isAuthenticated: boolean;
  authReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let active = true;

    const clearAuthState = () => {
      if (!active) {
        return;
      }
      setUser(null);
      setAuthReady(true);
      removeToken();
      removeStoredUser();
    };

    const syncAuthState = (preserveAuthReady = false) => {
      const token = getToken();
      const savedUser = getStoredUser();
      if (token && savedUser) {
        setUser(savedUser);
        if (!preserveAuthReady) {
          setAuthReady(false);
        }
        return;
      }
      if (token) {
        setUser(null);
        if (!preserveAuthReady) {
          setAuthReady(false);
        }
        return;
      }
      clearAuthState();
    };

    const validateCurrentUser = async () => {
      const token = getToken();
      if (!token) {
        clearAuthState();
        return;
      }

      try {
        const currentUser = await userApi.getCurrentUser();
        if (!active || getToken() !== token) {
          return;
        }
        setUser(currentUser);
        setStoredUser(currentUser);
        setAuthReady(true);
      } catch (error) {
        if (!active || getToken() !== token) {
          return;
        }
        if (error instanceof Error && isAuthFailureMessage(error.message)) {
          clearAuthState();
          return;
        }
        setAuthReady(true);
      }
    };

    syncAuthState();
    void validateCurrentUser();

    const handleAuthStateChange = () => {
      syncAuthState();
      if (getToken()) {
        void validateCurrentUser();
      }
    };

    const handleStorageChange = () => {
      syncAuthState();
    };

    const handleWindowFocus = () => {
      syncAuthState(true);
      if (getToken()) {
        void validateCurrentUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener(AUTH_STATE_EVENT, handleAuthStateChange);

    return () => {
      active = false;
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener(AUTH_STATE_EVENT, handleAuthStateChange);
    };
  }, []);

  const login = async (email: string, password: string, captchaId: string, captchaCode: string) => {
    const res = await userApi.login(email, password, captchaId, captchaCode);
    setToken(res.token);
    setUser(res.user);
    setStoredUser(res.user);
    setAuthReady(true);
  };

  const register = async (name: string, email: string, password: string, code: string) => {
    const res = await userApi.register(name, email, password, code);
    setToken(res.token);
    setUser(res.user);
    setStoredUser(res.user);
    setAuthReady(true);
  };

  const logout = async () => {
    try {
      if (getToken()) {
        await userApi.logout();
      }
    } finally {
      setUser(null);
      setAuthReady(true);
      removeToken();
      removeStoredUser();
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    setStoredUser(updatedUser);
  };

  const value = useMemo(
    () => ({ user, login, register, logout, updateUser, isAuthenticated: authReady && !!user && !!getToken(), authReady }),
    [authReady, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

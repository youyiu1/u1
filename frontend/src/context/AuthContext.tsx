/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { User } from '../types';
import { userApi, setToken, removeToken, getToken } from '../services/api';
import { getStoredUser, removeStoredUser, setStoredUser } from '../utils/authStorage';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, code: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const syncAuthState = () => {
      const token = getToken();
      const savedUser = getStoredUser();
      if (token && savedUser) {
        setUser(savedUser);
        return;
      }
      setUser(null);
      removeToken();
      removeStoredUser();
    };

    syncAuthState();
    window.addEventListener('storage', syncAuthState);
    window.addEventListener('focus', syncAuthState);

    return () => {
      window.removeEventListener('storage', syncAuthState);
      window.removeEventListener('focus', syncAuthState);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await userApi.login(email, password);
    setToken(res.token);
    setUser(res.user);
    setStoredUser(res.user);
  };

  const register = async (name: string, email: string, password: string, code: string) => {
    const res = await userApi.register(name, email, password, code);
    setToken(res.token);
    setUser(res.user);
    setStoredUser(res.user);
  };

  const logout = () => {
    setUser(null);
    removeToken();
    removeStoredUser();
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    setStoredUser(updatedUser);
  };

  const value = useMemo(
    () => ({ user, login, register, logout, updateUser, isAuthenticated: !!user && !!getToken() }),
    [user]
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

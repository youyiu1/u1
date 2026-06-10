import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ThemeMode = 'day' | 'night';

type ThemeContextValue = {
  mode: ThemeMode;
  isNight: boolean;
  toggleMode: () => void;
};

const STORAGE_KEY = 'neighborhood-theme-mode';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'day';
  }

  const storedMode = window.localStorage.getItem(STORAGE_KEY);
  if (storedMode === 'day' || storedMode === 'night') {
    return storedMode;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day';
}

export const ThemeProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(getInitialMode);

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
    document.documentElement.classList.toggle('theme-night', mode === 'night');
    document.documentElement.classList.toggle('theme-day', mode === 'day');
    document.body.classList.toggle('theme-night', mode === 'night');
    document.body.classList.toggle('theme-day', mode === 'day');
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      isNight: mode === 'night',
      toggleMode: () => setMode((current) => (current === 'day' ? 'night' : 'day')),
    }),
    [mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

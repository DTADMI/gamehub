'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef,useState } from 'react';

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'glyph-weaver-theme';

interface ThemeContextValue {
  theme: Theme
  setTheme: (t: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveStoredTheme(): Theme {
  if (typeof window === 'undefined') {return 'dark';}
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') {return stored;}
  } catch {
    // localStorage unavailable
  }
  if (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: light)').matches
  ) {
    return 'light';
  }
  return 'dark';
}

/**
 * ThemeProvider scoped to a container div — does NOT touch documentElement.
 * When GW is embedded in GameHub, it must not interfere with GH's own theme.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    const initial = resolveStoredTheme();
    setThemeState(initial);
    if (containerRef.current) {
      containerRef.current.setAttribute('data-theme', initial);
    }
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.setAttribute('data-theme', theme);
    }
    try {
      localStorage.setItem(STORAGE_KEY, theme);
      // Sync to GH's theme storage for cross-game consistency
      localStorage.setItem('gamehub-theme', theme);
    } catch {
      // localStorage unavailable
    }
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return React.createElement(
    ThemeContext.Provider,
    { value: { theme, setTheme, toggleTheme } },
    React.createElement('div', {
      ref: containerRef,
      'data-theme': theme,
      style: { minHeight: '100%' },
    }, children),
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
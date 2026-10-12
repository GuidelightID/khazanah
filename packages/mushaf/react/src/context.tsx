'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  createMushafRuntime,
  type MushafAdapter,
  type MushafEvent,
  type MushafPlugin,
  type MushafRuntime,
} from '@mushaf/core';

export interface QuranProviderProps {
  adapter: MushafAdapter;
  plugins?: MushafPlugin[];
  theme?: 'light' | 'dark' | 'auto';
  /** Chrome direction; page surface remains rtl */
  dir?: 'rtl' | 'ltr';
  onEvent?: (e: MushafEvent) => void;
  children: ReactNode;
}

export interface QuranContextValue {
  runtime: MushafRuntime;
  adapter: MushafAdapter;
  theme: 'light' | 'dark' | 'auto';
  setTheme: (t: 'light' | 'dark' | 'auto') => void;
  dir: 'rtl' | 'ltr';
  plugins: MushafPlugin[];
}

const QuranContext = createContext<QuranContextValue | null>(null);

export function QuranProvider({
  adapter,
  plugins = [],
  theme: themeProp = 'auto',
  dir = 'ltr',
  onEvent,
  children,
}: QuranProviderProps) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>(themeProp);

  useEffect(() => {
    setTheme(themeProp);
  }, [themeProp]);

  const runtime = useMemo(
    () =>
      createMushafRuntime({
        adapter,
        plugins,
        theme,
        onEvent,
        host: typeof window === 'undefined' ? 'server' : 'client',
      }),
    // Recreate when adapter identity or plugin list reference changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [adapter, plugins, onEvent],
  );

  useEffect(() => {
    return () => runtime.destroy();
  }, [runtime]);

  const value = useMemo<QuranContextValue>(
    () => ({
      runtime,
      adapter,
      theme,
      setTheme,
      dir,
      plugins,
    }),
    [runtime, adapter, theme, dir, plugins],
  );

  return <QuranContext.Provider value={value}>{children}</QuranContext.Provider>;
}

export function useQuranContext(): QuranContextValue {
  const ctx = useContext(QuranContext);
  if (!ctx) {
    throw new Error('Mushaf hooks require <QuranProvider adapter={...}>');
  }
  return ctx;
}

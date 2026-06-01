import { createContext, useContext, useCallback, useEffect, type ReactNode } from 'react';

interface ThemeContextValue {
  theme: 'light';
  resolved: 'light';
  setTheme: (t: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
  }, []);

  const setTheme = useCallback(() => {}, []);

  return (
    <ThemeContext.Provider value={{ theme: 'light', resolved: 'light', setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

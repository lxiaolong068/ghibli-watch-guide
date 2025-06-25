'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'theme',
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // 从localStorage加载主题设置
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        setTheme(stored as Theme);
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
    }
  }, [storageKey]);

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        const systemTheme = mediaQuery.matches ? 'dark' : 'light';
        setResolvedTheme(systemTheme);
        applyTheme(systemTheme);
      }
    };

    // 初始设置
    handleChange();
    
    // 监听变化
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // 应用主题到DOM
  const applyTheme = (appliedTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    
    if (appliedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // 更新CSS变量
    if (appliedTheme === 'dark') {
      root.style.setProperty('--background', '#0f172a'); // slate-900
      root.style.setProperty('--foreground', '#f1f5f9'); // slate-100
    } else {
      root.style.setProperty('--background', '#ffffff'); // white
      root.style.setProperty('--foreground', '#0f172a'); // slate-900
    }
  };

  // 更新主题
  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    
    try {
      localStorage.setItem(storageKey, newTheme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }

    // 计算实际应用的主题
    let appliedTheme: 'light' | 'dark';
    
    if (newTheme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      appliedTheme = mediaQuery.matches ? 'dark' : 'light';
    } else {
      appliedTheme = newTheme;
    }
    
    setResolvedTheme(appliedTheme);
    applyTheme(appliedTheme);

    // 通知其他组件主题变化
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme: newTheme, resolvedTheme: appliedTheme }
    }));
  };

  const value: ThemeContextType = {
    theme,
    setTheme: updateTheme,
    resolvedTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// 主题切换Hook，用于在组件中监听主题变化
export function useThemeEffect(callback: (theme: 'light' | 'dark') => void) {
  const { resolvedTheme } = useTheme();
  
  useEffect(() => {
    callback(resolvedTheme);
  }, [resolvedTheme, callback]);
}

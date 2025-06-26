'use client';

import { useTheme } from './ThemeProvider';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useState, useRef, useEffect } from 'react';

interface DarkModeToggleProps {
  variant?: 'button' | 'dropdown';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function DarkModeToggle({
  variant = 'button',
  size = 'md',
  showLabel = false,
  className = ''
}: DarkModeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation support
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8 p-1.5',
    md: 'w-10 h-10 p-2',
    lg: 'w-12 h-12 p-2.5'
  };

  const iconSizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7'
  };

  // Get current theme icon
  const getCurrentIcon = () => {
    if (theme === 'system') {
      return <ComputerDesktopIcon className={iconSizeClasses[size]} />;
    }
    return resolvedTheme === 'dark' 
      ? <MoonIcon className={iconSizeClasses[size]} />
      : <SunIcon className={iconSizeClasses[size]} />;
  };

  // Get theme label
  const getThemeLabel = (themeType: string) => {
    const labels = {
      light: 'Light Mode',
      dark: 'Dark Mode',
      system: 'Follow System'
    };
    return labels[themeType as keyof typeof labels] || themeType;
  };

  // Simple button mode
  if (variant === 'button') {
    const handleClick = () => {
      const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
      setTheme(nextTheme);
    };

    return (
      <button
        onClick={handleClick}
        className={`
          ${sizeClasses[size]}
          inline-flex items-center justify-center
          rounded-lg border border-gray-300 dark:border-gray-600
          bg-white dark:bg-gray-800
          text-gray-700 dark:text-gray-200
          hover:bg-gray-50 dark:hover:bg-gray-700
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
          transition-colors duration-200
          ${className}
        `}
        title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
        aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {getCurrentIcon()}
        {showLabel && (
          <span className="ml-2 text-sm font-medium">
            {getThemeLabel(resolvedTheme)}
          </span>
        )}
      </button>
    );
  }

  // Dropdown menu mode
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`
          ${sizeClasses[size]}
          inline-flex items-center justify-center
          rounded-lg border border-gray-300 dark:border-gray-600
          bg-white dark:bg-gray-800
          text-gray-700 dark:text-gray-200
          hover:bg-gray-50 dark:hover:bg-gray-700
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
          transition-colors duration-200
        `}
        title="Select Theme"
        aria-label="Select Theme"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {getCurrentIcon()}
        {showLabel && (
          <span className="ml-2 text-sm font-medium">
            {getThemeLabel(theme)}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-1" role="menu">
            {[
              { key: 'light', label: 'Light Mode', icon: SunIcon },
              { key: 'dark', label: 'Dark Mode', icon: MoonIcon },
              { key: 'system', label: 'Follow System', icon: ComputerDesktopIcon }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => {
                  setTheme(key as any);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center px-4 py-2 text-sm
                  text-gray-700 dark:text-gray-200
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700
                  transition-colors duration-150
                  ${theme === key ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : ''}
                `}
                role="menuitem"
              >
                <Icon className="w-5 h-5 mr-3" />
                <span>{label}</span>
                {theme === key && (
                  <span className="ml-auto text-primary-600 dark:text-primary-400">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GlobalSearchBar } from './search/GlobalSearchBar';
import { RegionSelector } from './RegionSelector';

interface MobileNavigationProps {
  className?: string;
}

export function MobileNavigation({ className = '' }: MobileNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Navigation links configuration
  const navigationLinks = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/movies', label: 'Movies', icon: '🎬' },
    { href: '/guides', label: 'Guides', icon: '📖' },
    { href: '/characters', label: 'Characters', icon: '👥' },
    { href: '/reviews', label: 'Reviews', icon: '⭐' },
  ];

  // Close menu
  const closeMenu = () => setIsMenuOpen(false);

  // Handle link click
  const handleLinkClick = () => {
    closeMenu();
  };

  // Prevent background scrolling
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Check if link is active
  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className={`lg:hidden ${className}`}>
      {/* Hamburger menu button */}
      <button
        onClick={() => setIsMenuOpen(true)}
        className="p-2 rounded-md text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
        aria-label="Open navigation menu"
        aria-expanded={isMenuOpen}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50">
          {/* Background overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={closeMenu}
            aria-hidden="true"
          />
          
          {/* Menu panel */}
          <div className="fixed inset-y-0 right-0 max-w-sm w-full bg-white dark:bg-slate-800 shadow-xl transform transition-transform">
            <div className="flex flex-col h-full">
              {/* Menu header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Navigation</h2>
                <button
                  onClick={closeMenu}
                  className="p-2 rounded-md text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                  aria-label="Close navigation menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Search and region selector */}
              <div className="p-4 border-b border-gray-200 dark:border-slate-700 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Search Content</label>
                  <GlobalSearchBar placeholder="Search movies, characters, reviews..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Region</label>
                  <RegionSelector />
                </div>
              </div>

              {/* Navigation links */}
              <nav className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {navigationLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={handleLinkClick}
                      className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                        isActiveLink(link.href)
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700'
                          : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-slate-100'
                      }`}
                    >
                      <span className="mr-3 text-lg">{link.icon}</span>
                      {link.label}
                      {isActiveLink(link.href) && (
                        <svg className="ml-auto w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </Link>
                  ))}
                </div>
              </nav>

              {/* Menu footer */}
              <div className="p-4 border-t border-gray-200 dark:border-slate-700">
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-slate-400">Studio Ghibli Watch Guide</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Find where to watch your favorite films</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 移动端导航栏组件
interface MobileNavBarProps {
  children?: React.ReactNode;
}

export function MobileNavBar({ children }: MobileNavBarProps) {
  return (
    <div className="lg:hidden">
      <div className="flex items-center justify-between p-4">
        {children}
        <MobileNavigation />
      </div>
    </div>
  );
}

// 桌面端导航栏组件
interface DesktopNavBarProps {
  children?: React.ReactNode;
}

export function DesktopNavBar({ children }: DesktopNavBarProps) {
  const navigationLinks = [
    { href: '/', label: 'Home' },
    { href: '/movies', label: 'Movies' },
    { href: '/guides', label: 'Guides' },
    { href: '/characters', label: 'Characters' },
    { href: '/reviews', label: 'Reviews' },
  ];

  return (
    <div className="hidden lg:block">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-3 lg:space-y-0">
        {children}
        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <GlobalSearchBar
            placeholder="Search movies, characters, reviews..."
            className="w-full sm:w-80"
          />
          <RegionSelector />
          <div className="flex space-x-4">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

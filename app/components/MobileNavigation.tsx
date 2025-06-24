'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MovieSearch } from './MovieSearch';
import { RegionSelector } from './RegionSelector';

interface MobileNavigationProps {
  className?: string;
}

export function MobileNavigation({ className = '' }: MobileNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // 导航链接配置
  const navigationLinks = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/movies', label: 'Movies', icon: '🎬' },
    { href: '/guides', label: 'Guides', icon: '📖' },
    { href: '/characters', label: 'Characters', icon: '👥' },
    { href: '/reviews', label: 'Reviews', icon: '⭐' },
  ];

  // 关闭菜单
  const closeMenu = () => setIsMenuOpen(false);

  // 处理链接点击
  const handleLinkClick = () => {
    closeMenu();
  };

  // 防止背景滚动
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

  // 检查链接是否激活
  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className={`lg:hidden ${className}`}>
      {/* 汉堡菜单按钮 */}
      <button
        onClick={() => setIsMenuOpen(true)}
        className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
        aria-label="Open navigation menu"
        aria-expanded={isMenuOpen}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* 移动端菜单覆盖层 */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50">
          {/* 背景遮罩 */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={closeMenu}
            aria-hidden="true"
          />
          
          {/* 菜单面板 */}
          <div className="fixed inset-y-0 right-0 max-w-sm w-full bg-white shadow-xl transform transition-transform">
            <div className="flex flex-col h-full">
              {/* 菜单头部 */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
                <button
                  onClick={closeMenu}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                  aria-label="Close navigation menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 搜索和地区选择器 */}
              <div className="p-4 border-b border-gray-200 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Movies</label>
                  <MovieSearch />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                  <RegionSelector />
                </div>
              </div>

              {/* 导航链接 */}
              <nav className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {navigationLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={handleLinkClick}
                      className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                        isActiveLink(link.href)
                          ? 'bg-primary-50 text-primary-700 border border-primary-200'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
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

              {/* 菜单底部 */}
              <div className="p-4 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Studio Ghibli Watch Guide</p>
                  <p className="text-xs text-gray-400 mt-1">Find where to watch your favorite films</p>
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
          <MovieSearch />
          <RegionSelector />
          <div className="flex space-x-4">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-primary-600 transition-colors"
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

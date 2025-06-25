'use client';

import { useEffect, useState } from 'react';
import { useNetworkStatus, useDeviceInfo, useUserActivity } from '@/app/hooks/useUserExperience';
import { WifiIcon, SignalSlashIcon, DevicePhoneMobileIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';

interface UserExperienceEnhancerProps {
  children: React.ReactNode;
}

export function UserExperienceEnhancer({ children }: UserExperienceEnhancerProps) {
  const { isOnline, isSlowConnection } = useNetworkStatus();
  const { isMobile, isTablet, isDesktop } = useDeviceInfo();
  const { isActive } = useUserActivity();
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [showSlowConnectionWarning, setShowSlowConnectionWarning] = useState(false);

  // 处理离线状态
  useEffect(() => {
    if (!isOnline) {
      setShowOfflineMessage(true);
    } else {
      setShowOfflineMessage(false);
    }
  }, [isOnline]);

  // 处理慢速连接
  useEffect(() => {
    if (isSlowConnection && isOnline) {
      setShowSlowConnectionWarning(true);
      const timer = setTimeout(() => {
        setShowSlowConnectionWarning(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isSlowConnection, isOnline]);

  // 根据设备类型调整样式
  useEffect(() => {
    const root = document.documentElement;
    
    if (isMobile) {
      root.classList.add('mobile-device');
      root.classList.remove('tablet-device', 'desktop-device');
    } else if (isTablet) {
      root.classList.add('tablet-device');
      root.classList.remove('mobile-device', 'desktop-device');
    } else if (isDesktop) {
      root.classList.add('desktop-device');
      root.classList.remove('mobile-device', 'tablet-device');
    }
  }, [isMobile, isTablet, isDesktop]);

  // 用户活动状态管理
  useEffect(() => {
    const root = document.documentElement;
    
    if (isActive) {
      root.classList.remove('user-inactive');
    } else {
      root.classList.add('user-inactive');
    }
  }, [isActive]);

  return (
    <>
      {children}
      
      {/* 离线提示 */}
      {showOfflineMessage && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-3 text-center">
          <div className="flex items-center justify-center space-x-2">
            <SignalSlashIcon className="w-5 h-5" />
            <span>您当前处于离线状态，某些功能可能不可用</span>
          </div>
        </div>
      )}

      {/* 慢速连接警告 */}
      {showSlowConnectionWarning && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-600 text-white p-3 text-center">
          <div className="flex items-center justify-center space-x-2">
            <WifiIcon className="w-5 h-5" />
            <span>检测到网络连接较慢，页面加载可能需要更长时间</span>
          </div>
        </div>
      )}

      {/* 设备类型指示器（仅开发环境） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-20 left-4 z-40 bg-black/80 text-white px-3 py-2 rounded-lg text-xs">
          <div className="flex items-center space-x-2">
            {isMobile && <DevicePhoneMobileIcon className="w-4 h-4" />}
            {isDesktop && <ComputerDesktopIcon className="w-4 h-4" />}
            <span>
              {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}
              {!isActive && ' (Inactive)'}
            </span>
          </div>
        </div>
      )}
    </>
  );
}

// 智能加载组件
export function SmartLoader({ 
  isLoading, 
  error, 
  children, 
  fallback,
  errorFallback 
}: {
  isLoading: boolean;
  error?: Error | null;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}) {
  const { isSlowConnection } = useNetworkStatus();
  const [showSlowLoadingMessage, setShowSlowLoadingMessage] = useState(false);

  useEffect(() => {
    if (isLoading && isSlowConnection) {
      const timer = setTimeout(() => {
        setShowSlowLoadingMessage(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      setShowSlowLoadingMessage(false);
    }
  }, [isLoading, isSlowConnection]);

  if (error) {
    return errorFallback || (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">加载失败，请稍后重试</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        {fallback || (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400">
              {showSlowLoadingMessage ? '网络较慢，请耐心等待...' : '加载中...'}
            </p>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}

// 自适应图片组件
export function AdaptiveImage({
  src,
  alt,
  className = '',
  priority = false,
  ...props
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  [key: string]: any;
}) {
  const { isSlowConnection } = useNetworkStatus();
  const { isMobile } = useDeviceInfo();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // 根据网络状况和设备类型调整图片质量
  const getOptimizedSrc = (originalSrc: string) => {
    if (isSlowConnection || isMobile) {
      // 对于慢速连接或移动设备，使用较低质量的图片
      return originalSrc.replace(/\.(jpg|jpeg|png)$/i, '_low.$1');
    }
    return originalSrc;
  };

  return (
    <div className={`relative ${className}`}>
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
      )}
      
      {imageError ? (
        <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800 rounded">
          <span className="text-gray-500 dark:text-gray-400 text-sm">图片加载失败</span>
        </div>
      ) : (
        <img
          src={getOptimizedSrc(src)}
          alt={alt}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          className={`transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          loading={priority ? 'eager' : 'lazy'}
          {...props}
        />
      )}
    </div>
  );
}

// 响应式容器组件
export function ResponsiveContainer({
  children,
  className = '',
  mobileClassName = '',
  tabletClassName = '',
  desktopClassName = ''
}: {
  children: React.ReactNode;
  className?: string;
  mobileClassName?: string;
  tabletClassName?: string;
  desktopClassName?: string;
}) {
  const { isMobile, isTablet, isDesktop } = useDeviceInfo();

  const getDeviceClassName = () => {
    if (isMobile && mobileClassName) return mobileClassName;
    if (isTablet && tabletClassName) return tabletClassName;
    if (isDesktop && desktopClassName) return desktopClassName;
    return '';
  };

  return (
    <div className={`${className} ${getDeviceClassName()}`}>
      {children}
    </div>
  );
}

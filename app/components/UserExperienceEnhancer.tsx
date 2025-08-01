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

  // Handle offline state
  useEffect(() => {
    if (!isOnline) {
      setShowOfflineMessage(true);
    } else {
      setShowOfflineMessage(false);
    }
  }, [isOnline]);

  // Handle slow connection
  useEffect(() => {
    if (isSlowConnection && isOnline) {
      setShowSlowConnectionWarning(true);
      const timer = setTimeout(() => {
        setShowSlowConnectionWarning(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isSlowConnection, isOnline]);

  // Adjust styles based on device type
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

  // User activity state management
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
      
      {/* Offline notification */}
      {showOfflineMessage && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-3 text-center">
          <div className="flex items-center justify-center space-x-2">
            <SignalSlashIcon className="w-5 h-5" />
            <span>You are currently offline. Some features may not be available.</span>
          </div>
        </div>
      )}

      {/* Slow connection warning */}
      {showSlowConnectionWarning && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-600 text-white p-3 text-center">
          <div className="flex items-center justify-center space-x-2">
            <WifiIcon className="w-5 h-5" />
            <span>Slow network connection detected. Page loading may take longer.</span>
          </div>
        </div>
      )}

      {/* Device type indicator (development only) */}
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

// Smart loading component
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
        <p className="text-red-600 dark:text-red-400">Loading failed, please try again later</p>
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
              {showSlowLoadingMessage ? 'Network is slow, please wait...' : 'Loading...'}
            </p>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}

// Adaptive image component
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

  // Adjust image quality based on network conditions and device type
  const getOptimizedSrc = (originalSrc: string) => {
    if (isSlowConnection || isMobile) {
      // For slow connections or mobile devices, use lower quality images
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
          <span className="text-gray-500 dark:text-gray-400 text-sm">Image failed to load</span>
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

// Responsive container component
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

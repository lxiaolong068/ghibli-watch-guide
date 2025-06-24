'use client';

import { useEffect, useState, useCallback } from 'react';
import { useIsMobile } from './MobileOptimized';

// 移动端图片懒加载Hook
export function useLazyLoading() {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [ref, setRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref]);

  return { ref: setRef, isIntersecting };
}

// 移动端优化的图片组件
interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
}

export function LazyImage({ 
  src, 
  alt, 
  width, 
  height, 
  className = '',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PC9zdmc+'
}: LazyImageProps) {
  const { ref, isIntersecting } = useLazyLoading();
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {!isIntersecting ? (
        <img
          src={placeholder}
          alt=""
          className="w-full h-full object-cover blur-sm"
          aria-hidden="true"
        />
      ) : (
        <>
          {!isLoaded && !hasError && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          
          {hasError ? (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          ) : (
            <img
              src={src}
              alt={alt}
              width={width}
              height={height}
              className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={handleLoad}
              onError={handleError}
              loading="lazy"
            />
          )}
        </>
      )}
    </div>
  );
}

// 移动端预加载Hook
export function usePreload(urls: string[]) {
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      // 只在快速网络连接时预加载
      if (connection.effectiveType === '4g' || connection.effectiveType === '3g') {
        urls.forEach(url => {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = url;
          document.head.appendChild(link);
        });
      }
    }
  }, [urls]);
}

// 移动端网络状态检测Hook
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    
    const updateConnectionType = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        setConnectionType(connection.effectiveType || 'unknown');
      }
    };

    updateOnlineStatus();
    updateConnectionType();

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', updateConnectionType);
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      if ('connection' in navigator) {
        (navigator as any).connection.removeEventListener('change', updateConnectionType);
      }
    };
  }, []);

  return { isOnline, connectionType };
}

// 移动端触摸优化Hook
export function useTouchOptimization() {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) {
      // 禁用双击缩放
      let lastTouchEnd = 0;
      const preventZoom = (e: TouchEvent) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
          e.preventDefault();
        }
        lastTouchEnd = now;
      };

      document.addEventListener('touchend', preventZoom, { passive: false });
      
      // 优化滚动性能
      document.body.style.touchAction = 'pan-y';
      
      return () => {
        document.removeEventListener('touchend', preventZoom);
        document.body.style.touchAction = 'auto';
      };
    }
  }, [isMobile]);
}

// 移动端性能监控组件
interface MobilePerformanceMonitorProps {
  onMetrics?: (metrics: any) => void;
}

export function MobilePerformanceMonitor({ onMetrics }: MobilePerformanceMonitorProps) {
  const isMobile = useIsMobile();
  const { isOnline, connectionType } = useNetworkStatus();

  useEffect(() => {
    if (!isMobile) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const metrics = {
        timestamp: Date.now(),
        isOnline,
        connectionType,
        entries: entries.map(entry => ({
          name: entry.name,
          type: entry.entryType,
          startTime: entry.startTime,
          duration: entry.duration
        }))
      };
      
      onMetrics?.(metrics);
    });

    observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });

    return () => observer.disconnect();
  }, [isMobile, isOnline, connectionType, onMetrics]);

  return null;
}

// 移动端缓存管理
export class MobileCacheManager {
  private static instance: MobileCacheManager;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }>;

  private constructor() {
    this.cache = new Map();
  }

  static getInstance(): MobileCacheManager {
    if (!MobileCacheManager.instance) {
      MobileCacheManager.instance = new MobileCacheManager();
    }
    return MobileCacheManager.instance;
  }

  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// 移动端数据获取Hook
export function useMobileData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: { ttl?: number; enabled?: boolean } = {}
) {
  const { ttl = 5 * 60 * 1000, enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const cache = MobileCacheManager.getInstance();

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    // 检查缓存
    const cachedData = cache.get(key);
    if (cachedData) {
      setData(cachedData);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);
      cache.set(key, result, ttl);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, ttl, enabled, cache]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

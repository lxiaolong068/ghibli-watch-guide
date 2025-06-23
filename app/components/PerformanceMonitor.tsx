'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

interface PerformanceMonitorProps {
  onMetricsUpdate?: (metrics: Partial<PerformanceMetrics>) => void;
  enableConsoleLogging?: boolean;
}

export function PerformanceMonitor({ 
  onMetricsUpdate, 
  enableConsoleLogging = false 
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<Partial<PerformanceMetrics>>({});

  useEffect(() => {
    // 检查浏览器支持
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    const updateMetric = (name: keyof PerformanceMetrics, value: number) => {
      setMetrics(prev => {
        const newMetrics = { ...prev, [name]: value };
        onMetricsUpdate?.(newMetrics);
        
        if (enableConsoleLogging) {
          console.log(`Performance Metric - ${name}:`, value);
        }
        
        return newMetrics;
      });
    };

    // 监控 FCP (First Contentful Paint)
    const fcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          updateMetric('fcp', entry.startTime);
        }
      }
    });
    fcpObserver.observe({ entryTypes: ['paint'] });

    // 监控 LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      updateMetric('lcp', lastEntry.startTime);
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // 监控 FID (First Input Delay)
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fidEntry = entry as PerformanceEntry & { processingStart: number };
        updateMetric('fid', fidEntry.processingStart - fidEntry.startTime);
      }
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // 监控 CLS (Cumulative Layout Shift)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const clsEntry = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
        if (!clsEntry.hadRecentInput) {
          clsValue += clsEntry.value;
          updateMetric('cls', clsValue);
        }
      }
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });

    // 监控 TTFB (Time to First Byte)
    const navigationObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const navEntry = entry as PerformanceEntry & { responseStart: number; requestStart: number };
        updateMetric('ttfb', navEntry.responseStart - navEntry.requestStart);
      }
    });
    navigationObserver.observe({ entryTypes: ['navigation'] });

    // 清理函数
    return () => {
      fcpObserver.disconnect();
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
      navigationObserver.disconnect();
    };
  }, [onMetricsUpdate, enableConsoleLogging]);

  // 在开发环境中显示性能指标
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="fixed bottom-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-xs font-mono z-50">
        <div className="mb-2 font-bold">Performance Metrics</div>
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="mr-2">{key.toUpperCase()}:</span>
            <span>{typeof value === 'number' ? value.toFixed(2) : 'N/A'}ms</span>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

// 性能优化Hook
export function usePerformanceOptimization() {
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);

  useEffect(() => {
    // 检测网络连接速度
    if ('connection' in navigator) {
      const connection = (navigator as { connection: { effectiveType: string } }).connection;
      const slowConnections = ['slow-2g', '2g', '3g'];
      setIsSlowConnection(slowConnections.includes(connection.effectiveType));
    }

    // 检测设备性能
    if ('hardwareConcurrency' in navigator) {
      setIsLowEndDevice(navigator.hardwareConcurrency <= 2);
    }
  }, []);

  return {
    isSlowConnection,
    isLowEndDevice,
    shouldReduceAnimations: isSlowConnection || isLowEndDevice,
    shouldLazyLoad: isSlowConnection,
    shouldPreload: !isSlowConnection && !isLowEndDevice,
  };
}

// 懒加载Hook
export function useLazyLoad<T extends HTMLElement>(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [ref, setRef] = useState<T | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref, options]);

  return [setRef, isIntersecting] as const;
}

// 图片懒加载组件
import Image from 'next/image';

interface LazyImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PC9zdmc+',
  onLoad
}: LazyImageProps) {
  const [imageRef, isIntersecting] = useLazyLoad<HTMLDivElement>();
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
  };

  return (
    <div ref={imageRef} className={`relative overflow-hidden ${className}`}>
      {isIntersecting && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          placeholder="blur"
          blurDataURL={placeholder}
        />
      )}

      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <div className="text-gray-400 text-sm">Failed to load</div>
        </div>
      )}
    </div>
  );
}

// 代码分割组件
interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  delay?: number;
}

export function LazyComponent({ 
  children, 
  fallback = <div>Loading...</div>,
  delay = 0 
}: LazyComponentProps) {
  const [shouldRender, setShouldRender] = useState(delay === 0);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setShouldRender(true), delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);

  if (!shouldRender) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

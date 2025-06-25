'use client';

import { useEffect, useState, useCallback } from 'react';
import { useNetworkStatus, useDeviceInfo } from '@/app/hooks/useUserExperience';

interface PerformanceOptimizerProps {
  children: React.ReactNode;
  enableLazyLoading?: boolean;
  enableImageOptimization?: boolean;
  enableResourceHints?: boolean;
}

export function PerformanceOptimizer({
  children,
  enableLazyLoading = true,
  enableImageOptimization = true,
  enableResourceHints = true
}: PerformanceOptimizerProps) {
  const { isSlowConnection } = useNetworkStatus();
  const { isMobile } = useDeviceInfo();
  const [performanceMode, setPerformanceMode] = useState<'normal' | 'optimized' | 'aggressive'>('normal');

  // 根据网络状况和设备类型调整性能模式
  useEffect(() => {
    if (isSlowConnection || isMobile) {
      setPerformanceMode('optimized');
    } else {
      setPerformanceMode('normal');
    }
  }, [isSlowConnection, isMobile]);

  // 预加载关键资源
  useEffect(() => {
    if (enableResourceHints && performanceMode !== 'aggressive') {
      const preloadCriticalResources = () => {
        // 预加载关键CSS
        const criticalCSS = document.createElement('link');
        criticalCSS.rel = 'preload';
        criticalCSS.as = 'style';
        criticalCSS.href = '/styles/critical.css';
        document.head.appendChild(criticalCSS);

        // 预连接到重要域名
        const preconnectDomains = [
          'https://image.tmdb.org',
          'https://fonts.googleapis.com',
          'https://fonts.gstatic.com'
        ];

        preconnectDomains.forEach(domain => {
          const link = document.createElement('link');
          link.rel = 'preconnect';
          link.href = domain;
          if (domain.includes('fonts.gstatic.com')) {
            link.crossOrigin = 'anonymous';
          }
          document.head.appendChild(link);
        });
      };

      preloadCriticalResources();
    }
  }, [enableResourceHints, performanceMode]);

  // 懒加载图片优化
  useEffect(() => {
    if (enableImageOptimization && 'IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });

      // 观察所有带有data-src属性的图片
      const lazyImages = document.querySelectorAll('img[data-src]');
      lazyImages.forEach(img => imageObserver.observe(img));

      return () => imageObserver.disconnect();
    }
  }, [enableImageOptimization]);

  // 性能监控和优化
  useEffect(() => {
    const optimizePerformance = () => {
      // 移除未使用的CSS
      if (performanceMode === 'aggressive') {
        const unusedStyles = document.querySelectorAll('style:empty, link[rel="stylesheet"]:not([href*="critical"])');
        unusedStyles.forEach(style => {
          if (style.parentNode) {
            style.parentNode.removeChild(style);
          }
        });
      }

      // 延迟加载非关键JavaScript
      if (performanceMode !== 'normal') {
        const nonCriticalScripts = document.querySelectorAll('script[data-defer]');
        nonCriticalScripts.forEach(script => {
          setTimeout(() => {
            const newScript = document.createElement('script');
            newScript.src = script.getAttribute('data-src') || '';
            newScript.async = true;
            document.head.appendChild(newScript);
          }, 2000);
        });
      }
    };

    // 在页面加载完成后执行优化
    if (document.readyState === 'complete') {
      optimizePerformance();
    } else {
      window.addEventListener('load', optimizePerformance);
      return () => window.removeEventListener('load', optimizePerformance);
    }
  }, [performanceMode]);

  return (
    <div className={`performance-optimized ${performanceMode}`}>
      {children}
    </div>
  );
}

// 智能图片组件
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  quality = 75,
  className = '',
  ...props
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  className?: string;
  [key: string]: any;
}) {
  const { isSlowConnection } = useNetworkStatus();
  const { isMobile } = useDeviceInfo();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // 根据网络状况调整图片质量
  const getOptimizedSrc = useCallback((originalSrc: string) => {
    const baseQuality = isSlowConnection ? Math.min(quality - 20, 50) : quality;
    const deviceQuality = isMobile ? Math.min(baseQuality - 10, 60) : baseQuality;
    
    // 如果是TMDB图片，添加质量参数
    if (originalSrc.includes('image.tmdb.org')) {
      return originalSrc.replace(/w\d+/, `w${isMobile ? '300' : '500'}`);
    }
    
    return originalSrc;
  }, [isSlowConnection, isMobile, quality]);

  // 生成响应式图片源
  const generateSrcSet = useCallback((originalSrc: string) => {
    if (!originalSrc.includes('image.tmdb.org')) return undefined;
    
    const sizes = isMobile ? [300, 500] : [500, 780, 1280];
    return sizes.map(size => 
      `${originalSrc.replace(/w\d+/, `w${size}`)} ${size}w`
    ).join(', ');
  }, [isMobile]);

  const optimizedSrc = getOptimizedSrc(src);
  const srcSet = generateSrcSet(src);

  return (
    <div className={`relative ${className}`}>
      {/* 加载占位符 */}
      {!imageLoaded && !imageError && (
        <div 
          className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"
          style={{ width, height }}
        />
      )}
      
      {/* 错误占位符 */}
      {imageError && (
        <div 
          className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded"
          style={{ width, height }}
        >
          <span className="text-gray-500 dark:text-gray-400 text-sm">图片加载失败</span>
        </div>
      )}
      
      {/* 实际图片 */}
      {!imageError && (
        <img
          src={priority ? optimizedSrc : undefined}
          data-src={!priority ? optimizedSrc : undefined}
          srcSet={srcSet}
          sizes={isMobile ? '100vw' : '(max-width: 768px) 100vw, 50vw'}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          className={`transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          {...props}
        />
      )}
    </div>
  );
}

// 代码分割组件
export function LazyComponent({
  loader,
  fallback = <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-32" />,
  errorFallback = <div className="text-red-500">组件加载失败</div>
}: {
  loader: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loader()
      .then(module => {
        setComponent(() => module.default);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [loader]);

  if (error) return <>{errorFallback}</>;
  if (loading || !Component) return <>{fallback}</>;
  
  return <Component />;
}

// 性能监控Hook
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState({
    fcp: 0, // First Contentful Paint
    lcp: 0, // Largest Contentful Paint
    fid: 0, // First Input Delay
    cls: 0, // Cumulative Layout Shift
    ttfb: 0, // Time to First Byte
  });

  useEffect(() => {
    // 监控Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        switch (entry.entryType) {
          case 'paint':
            if (entry.name === 'first-contentful-paint') {
              setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
            }
            break;
          case 'largest-contentful-paint':
            setMetrics(prev => ({ ...prev, lcp: entry.startTime }));
            break;
          case 'first-input':
            setMetrics(prev => ({ ...prev, fid: (entry as any).processingStart - entry.startTime }));
            break;
          case 'layout-shift':
            if (!(entry as any).hadRecentInput) {
              setMetrics(prev => ({ ...prev, cls: prev.cls + (entry as any).value }));
            }
            break;
        }
      });
    });

    // 观察性能指标
    observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });

    // 计算TTFB
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      setMetrics(prev => ({ 
        ...prev, 
        ttfb: navigationEntry.responseStart - navigationEntry.requestStart 
      }));
    }

    return () => observer.disconnect();
  }, []);

  return metrics;
}

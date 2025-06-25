'use client';

import { useEffect, useState } from 'react';
import { useNetworkStatus } from '@/app/hooks/useUserExperience';

interface PageSpeedOptimizerProps {
  children: React.ReactNode;
  enableCriticalCSS?: boolean;
  enableResourceHints?: boolean;
  enableServiceWorker?: boolean;
}

export function PageSpeedOptimizer({
  children,
  enableCriticalCSS = true,
  enableResourceHints = true,
  enableServiceWorker = true
}: PageSpeedOptimizerProps) {
  const { isSlowConnection } = useNetworkStatus();
  const [optimizationLevel, setOptimizationLevel] = useState<'basic' | 'advanced' | 'aggressive'>('basic');

  useEffect(() => {
    // 根据网络状况调整优化级别
    if (isSlowConnection) {
      setOptimizationLevel('aggressive');
    } else {
      setOptimizationLevel('advanced');
    }
  }, [isSlowConnection]);

  useEffect(() => {
    // 关键CSS内联
    if (enableCriticalCSS) {
      const inlineCriticalCSS = () => {
        const criticalCSS = `
          /* 关键路径CSS */
          body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
          .loading { display: flex; align-items: center; justify-content: center; min-height: 200px; }
          .spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #059669; border-radius: 50%; animation: spin 1s linear infinite; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
        `;
        
        const style = document.createElement('style');
        style.textContent = criticalCSS;
        document.head.insertBefore(style, document.head.firstChild);
      };

      inlineCriticalCSS();
    }

    // 资源提示优化
    if (enableResourceHints) {
      const addResourceHints = () => {
        // DNS预解析
        const dnsPrefetchDomains = [
          'https://fonts.googleapis.com',
          'https://fonts.gstatic.com',
          'https://image.tmdb.org',
          'https://www.google-analytics.com',
          'https://pagead2.googlesyndication.com'
        ];

        dnsPrefetchDomains.forEach(domain => {
          const link = document.createElement('link');
          link.rel = 'dns-prefetch';
          link.href = domain;
          document.head.appendChild(link);
        });

        // 预连接关键资源
        const preconnectDomains = [
          { href: 'https://fonts.googleapis.com', crossOrigin: false },
          { href: 'https://fonts.gstatic.com', crossOrigin: true },
          { href: 'https://image.tmdb.org', crossOrigin: false }
        ];

        preconnectDomains.forEach(({ href, crossOrigin }) => {
          const link = document.createElement('link');
          link.rel = 'preconnect';
          link.href = href;
          if (crossOrigin) {
            link.crossOrigin = 'anonymous';
          }
          document.head.appendChild(link);
        });

        // 预加载关键资源
        if (optimizationLevel !== 'aggressive') {
          const preloadResources = [
            { href: '/images/logo.svg', as: 'image' },
            { href: '/fonts/noto-sans-sc.woff2', as: 'font', type: 'font/woff2', crossOrigin: true }
          ];

          preloadResources.forEach(({ href, as, type, crossOrigin }) => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = href;
            link.as = as;
            if (type) link.type = type;
            if (crossOrigin) link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
          });
        }
      };

      addResourceHints();
    }

    // Service Worker注册
    if (enableServiceWorker && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered:', registration);
        })
        .catch(error => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }, [enableCriticalCSS, enableResourceHints, enableServiceWorker, optimizationLevel]);

  // 延迟加载非关键资源
  useEffect(() => {
    const loadNonCriticalResources = () => {
      // 延迟加载Google Analytics
      setTimeout(() => {
        if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
          const script = document.createElement('script');
          script.async = true;
          script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`;
          document.head.appendChild(script);
        }
      }, optimizationLevel === 'aggressive' ? 5000 : 2000);

      // 延迟加载AdSense
      setTimeout(() => {
        const adsenseScript = document.createElement('script');
        adsenseScript.async = true;
        adsenseScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6958408841088360';
        adsenseScript.crossOrigin = 'anonymous';
        document.head.appendChild(adsenseScript);
      }, optimizationLevel === 'aggressive' ? 8000 : 3000);
    };

    // 在页面交互后加载非关键资源
    const handleFirstInteraction = () => {
      loadNonCriticalResources();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('scroll', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction, { passive: true });
    document.addEventListener('scroll', handleFirstInteraction, { passive: true });
    document.addEventListener('keydown', handleFirstInteraction, { passive: true });

    // 备用：3秒后自动加载
    const fallbackTimer = setTimeout(loadNonCriticalResources, 3000);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('scroll', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      clearTimeout(fallbackTimer);
    };
  }, [optimizationLevel]);

  return (
    <div className={`page-speed-optimized optimization-${optimizationLevel}`}>
      {children}
    </div>
  );
}

// 关键CSS提取器
export function CriticalCSSExtractor() {
  useEffect(() => {
    const extractCriticalCSS = () => {
      // 获取首屏可见元素
      const viewportHeight = window.innerHeight;
      const criticalElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.top < viewportHeight && rect.bottom > 0;
      });

      // 提取关键CSS规则
      const criticalRules = new Set<string>();
      
      Array.from(document.styleSheets).forEach(sheet => {
        try {
          Array.from(sheet.cssRules || []).forEach(rule => {
            if (rule.type === CSSRule.STYLE_RULE) {
              const styleRule = rule as CSSStyleRule;
              criticalElements.forEach(el => {
                if (el.matches(styleRule.selectorText)) {
                  criticalRules.add(rule.cssText);
                }
              });
            }
          });
        } catch (e) {
          // 跨域样式表无法访问
        }
      });

      // 在开发环境中输出关键CSS
      if (process.env.NODE_ENV === 'development') {
        console.log('Critical CSS:', Array.from(criticalRules).join('\n'));
      }
    };

    // 页面加载完成后提取关键CSS
    if (document.readyState === 'complete') {
      extractCriticalCSS();
    } else {
      window.addEventListener('load', extractCriticalCSS);
      return () => window.removeEventListener('load', extractCriticalCSS);
    }
  }, []);

  return null;
}

// 资源优先级管理器
export function ResourcePriorityManager() {
  useEffect(() => {
    const manageResourcePriority = () => {
      // 设置图片加载优先级
      const images = document.querySelectorAll('img');
      images.forEach((img, index) => {
        if (index < 3) {
          // 前3张图片高优先级
          img.loading = 'eager';
          img.setAttribute('fetchpriority', 'high');
        } else {
          // 其他图片懒加载
          img.loading = 'lazy';
          img.setAttribute('fetchpriority', 'low');
        }
      });

      // 设置脚本优先级
      const scripts = document.querySelectorAll('script[src]');
      scripts.forEach(script => {
        const src = script.getAttribute('src') || '';
        if (src.includes('analytics') || src.includes('adsense')) {
          script.setAttribute('fetchpriority', 'low');
        }
      });
    };

    // 在DOM内容加载完成后管理资源优先级
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', manageResourcePriority);
    } else {
      manageResourcePriority();
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', manageResourcePriority);
    };
  }, []);

  return null;
}

// 预加载管理器
export function PreloadManager({ 
  criticalResources = [],
  prefetchResources = []
}: {
  criticalResources?: string[];
  prefetchResources?: string[];
}) {
  useEffect(() => {
    // 预加载关键资源
    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      
      // 根据文件类型设置as属性
      if (resource.endsWith('.css')) {
        link.as = 'style';
      } else if (resource.endsWith('.js')) {
        link.as = 'script';
      } else if (resource.match(/\.(woff|woff2|ttf|otf)$/)) {
        link.as = 'font';
        link.crossOrigin = 'anonymous';
      } else if (resource.match(/\.(jpg|jpeg|png|webp|svg)$/)) {
        link.as = 'image';
      }
      
      document.head.appendChild(link);
    });

    // 预取非关键资源
    const prefetchTimer = setTimeout(() => {
      prefetchResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = resource;
        document.head.appendChild(link);
      });
    }, 2000);

    return () => clearTimeout(prefetchTimer);
  }, [criticalResources, prefetchResources]);

  return null;
}

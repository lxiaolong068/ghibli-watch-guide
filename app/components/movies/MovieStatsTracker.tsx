'use client';

import { useEffect } from 'react';

interface MovieStatsTrackerProps {
  movieId: string;
}

export function MovieStatsTracker({ movieId }: MovieStatsTrackerProps) {
  useEffect(() => {
    // 记录页面浏览
    const recordPageView = async () => {
      try {
        await fetch('/api/stats/page-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            movieId,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            referrer: document.referrer,
          }),
        });
      } catch (error) {
        console.error('Failed to record page view:', error);
      }
    };

    // 延迟记录，避免影响页面加载性能
    const timer = setTimeout(recordPageView, 1000);

    // 记录页面停留时间
    const startTime = Date.now();
    
    const recordDwellTime = () => {
      const dwellTime = Date.now() - startTime;
      
      // 只记录停留时间超过5秒的访问
      if (dwellTime > 5000) {
        fetch('/api/stats/dwell-time', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            movieId,
            dwellTime,
            timestamp: new Date().toISOString(),
          }),
        }).catch(error => {
          console.error('Failed to record dwell time:', error);
        });
      }
    };

    // 监听页面卸载事件
    const handleBeforeUnload = () => {
      recordDwellTime();
    };

    // 监听页面可见性变化
    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordDwellTime();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      recordDwellTime();
    };
  }, [movieId]);

  // 这个组件不渲染任何可见内容
  return null;
}

// 分享追踪组件
export function ShareTracker({ movieId, platform }: { movieId: string; platform: string }) {
  const handleShare = async () => {
    try {
      await fetch('/api/stats/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieId,
          platform,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to record share:', error);
    }
  };

  return { handleShare };
}

// 收藏追踪组件
export function FavoriteTracker({ movieId }: { movieId: string }) {
  const handleFavorite = async (action: 'add' | 'remove') => {
    try {
      await fetch('/api/stats/favorite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieId,
          action,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to record favorite:', error);
    }
  };

  return { handleFavorite };
}

// 搜索追踪组件
export function SearchTracker() {
  const recordSearch = async (query: string, results: number) => {
    try {
      await fetch('/api/stats/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          results,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to record search:', error);
    }
  };

  return { recordSearch };
}

// 用户行为分析组件
export function UserBehaviorAnalyzer({ movieId }: { movieId: string }) {
  useEffect(() => {
    let scrollDepth = 0;
    let maxScrollDepth = 0;
    let clickCount = 0;
    
    const trackScrollDepth = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      scrollDepth = Math.round(((scrollTop + windowHeight) / documentHeight) * 100);
      maxScrollDepth = Math.max(maxScrollDepth, scrollDepth);
    };

    const trackClicks = () => {
      clickCount++;
    };

    const sendBehaviorData = async () => {
      if (maxScrollDepth > 10 || clickCount > 0) { // 只发送有意义的数据
        try {
          await fetch('/api/stats/behavior', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              movieId,
              maxScrollDepth,
              clickCount,
              timestamp: new Date().toISOString(),
            }),
          });
        } catch (error) {
          console.error('Failed to record behavior:', error);
        }
      }
    };

    // 节流函数
    let scrollTimer: NodeJS.Timeout;
    const throttledScrollTrack = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(trackScrollDepth, 100);
    };

    window.addEventListener('scroll', throttledScrollTrack, { passive: true });
    document.addEventListener('click', trackClicks, { passive: true });

    // 定期发送数据
    const behaviorInterval = setInterval(sendBehaviorData, 30000); // 每30秒发送一次

    return () => {
      clearTimeout(scrollTimer);
      clearInterval(behaviorInterval);
      window.removeEventListener('scroll', throttledScrollTrack);
      document.removeEventListener('click', trackClicks);
      sendBehaviorData(); // 组件卸载时发送最后的数据
    };
  }, [movieId]);

  return null;
}

// 性能监控组件
export function PerformanceMonitor({ movieId }: { movieId: string }) {
  useEffect(() => {
    // 监控页面加载性能
    if (typeof window !== 'undefined' && 'performance' in window) {
      const sendPerformanceData = () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          const performanceData = {
            movieId,
            loadTime: navigation.loadEventEnd - navigation.loadEventStart,
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            firstPaint: 0,
            firstContentfulPaint: 0,
            timestamp: new Date().toISOString(),
          };

          // 获取 First Paint 和 First Contentful Paint
          const paintEntries = performance.getEntriesByType('paint');
          paintEntries.forEach((entry) => {
            if (entry.name === 'first-paint') {
              performanceData.firstPaint = entry.startTime;
            } else if (entry.name === 'first-contentful-paint') {
              performanceData.firstContentfulPaint = entry.startTime;
            }
          });

          fetch('/api/stats/performance', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(performanceData),
          }).catch(error => {
            console.error('Failed to record performance:', error);
          });
        }
      };

      // 等待页面完全加载后再收集性能数据
      if (document.readyState === 'complete') {
        setTimeout(sendPerformanceData, 1000);
      } else {
        window.addEventListener('load', () => {
          setTimeout(sendPerformanceData, 1000);
        });
      }
    }
  }, [movieId]);

  return null;
}

// 错误追踪组件
export function ErrorTracker({ movieId }: { movieId: string }) {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      fetch('/api/stats/error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieId,
          error: {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error?.stack,
          },
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
      }).catch(err => {
        console.error('Failed to record error:', err);
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      fetch('/api/stats/error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieId,
          error: {
            message: 'Unhandled Promise Rejection',
            reason: event.reason?.toString(),
          },
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
      }).catch(err => {
        console.error('Failed to record error:', err);
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [movieId]);

  return null;
}

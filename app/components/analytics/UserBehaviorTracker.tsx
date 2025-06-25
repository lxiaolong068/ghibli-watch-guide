'use client';

import { useEffect, useRef } from 'react';

interface UserBehaviorTrackerProps {
  movieId?: string;
  characterId?: string;
  pageType: 'home' | 'movie' | 'movie-reviews' | 'reviews' | 'search' | 'about' | 'admin' | 'character' | 'characters';
  userId?: string; // 为未来用户系统预留
}

export function UserBehaviorTracker({ movieId, characterId, pageType, userId }: UserBehaviorTrackerProps) {
  const startTime = useRef<number>(Date.now());
  const hasTrackedView = useRef<boolean>(false);

  useEffect(() => {
    // 记录页面访问
    if (!hasTrackedView.current) {
      trackPageView();
      hasTrackedView.current = true;
    }

    // 记录页面停留时间
    const handleBeforeUnload = () => {
      const timeSpent = Date.now() - startTime.current;
      trackTimeSpent(timeSpent);
    };

    // 记录滚动行为
    const handleScroll = () => {
      const scrollPercentage = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollPercentage > 0 && scrollPercentage % 25 === 0) {
        trackScrollDepth(scrollPercentage);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [movieId, characterId, pageType, userId]);

  const trackPageView = async () => {
    try {
      // 更新电影统计（如果是电影页面）
      if (movieId && pageType === 'movie') {
        await updateMovieStats(movieId, 'view');
      }

      // 发送到 Google Analytics（如果配置了）
      // @ts-expect-error - Google Analytics global function
      if (typeof gtag !== 'undefined') {
        // @ts-expect-error - Google Analytics global function
        gtag('event', 'page_view', {
          page_title: document.title,
          page_location: window.location.href,
          page_type: pageType,
          movie_id: movieId,
          character_id: characterId
        });
      }

      // 记录到本地存储（用于离线分析）
      const viewData = {
        timestamp: Date.now(),
        pageType,
        movieId,
        characterId,
        userId,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        url: window.location.href
      };

      const existingViews = JSON.parse(localStorage.getItem('user_views') || '[]');
      existingViews.push(viewData);
      
      // 只保留最近100条记录
      if (existingViews.length > 100) {
        existingViews.splice(0, existingViews.length - 100);
      }
      
      localStorage.setItem('user_views', JSON.stringify(existingViews));
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  };

  const trackTimeSpent = async (timeSpent: number) => {
    try {
      // @ts-expect-error - Google Analytics global function
      if (typeof gtag !== 'undefined') {
        // @ts-expect-error - Google Analytics global function
        gtag('event', 'timing_complete', {
          name: 'page_read_time',
          value: timeSpent,
          event_category: 'engagement',
          custom_parameter_1: pageType,
          custom_parameter_2: movieId || characterId
        });
      }
    } catch (error) {
      console.error('Error tracking time spent:', error);
    }
  };

  const trackScrollDepth = async (percentage: number) => {
    try {
      // @ts-expect-error - Google Analytics global function
      if (typeof gtag !== 'undefined') {
        // @ts-expect-error - Google Analytics global function
        gtag('event', 'scroll', {
          event_category: 'engagement',
          event_label: `${percentage}%`,
          value: percentage,
          page_type: pageType,
          movie_id: movieId,
          character_id: characterId
        });
      }
    } catch (error) {
      console.error('Error tracking scroll depth:', error);
    }
  };

  return null; // 这是一个无UI的跟踪组件
}

// 更新电影统计的辅助函数
async function updateMovieStats(movieId: string, action: 'view' | 'favorite' | 'share') {
  try {
    const response = await fetch('/api/movies/stats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        movieId,
        action
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update movie stats');
    }
  } catch (error) {
    console.error('Error updating movie stats:', error);
  }
}

// 用户交互跟踪组件
export function InteractionTracker({ children }: { children: React.ReactNode }) {
  const handleClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const elementType = target.tagName.toLowerCase();
    const elementClass = target.className;
    const elementText = target.textContent?.slice(0, 50) || '';

    // 跟踪点击事件
    // @ts-expect-error - Google Analytics global function
    if (typeof gtag !== 'undefined') {
      // @ts-expect-error - Google Analytics global function
      gtag('event', 'click', {
        event_category: 'interaction',
        event_label: `${elementType}.${elementClass}`,
        value: 1,
        custom_parameter_1: elementText
      });
    }
  };

  return (
    <div onClick={handleClick}>
      {children}
    </div>
  );
}

// 搜索行为跟踪
export function trackSearchBehavior(query: string, resultsCount: number) {
  try {
    // @ts-expect-error - Google Analytics global function
    if (typeof gtag !== 'undefined') {
      // @ts-expect-error - Google Analytics global function
      gtag('event', 'search', {
        search_term: query,
        event_category: 'search',
        custom_parameter_1: resultsCount.toString()
      });
    }

    // 记录到本地存储
    const searchData = {
      timestamp: Date.now(),
      query,
      resultsCount,
      url: window.location.href
    };

    const existingSearches = JSON.parse(localStorage.getItem('user_searches') || '[]');
    existingSearches.push(searchData);
    
    if (existingSearches.length > 50) {
      existingSearches.splice(0, existingSearches.length - 50);
    }
    
    localStorage.setItem('user_searches', JSON.stringify(existingSearches));
  } catch (error) {
    console.error('Error tracking search behavior:', error);
  }
}

// 错误跟踪
export function trackError(error: Error, context?: string) {
  try {
    // @ts-expect-error - Google Analytics global function
    if (typeof gtag !== 'undefined') {
      // @ts-expect-error - Google Analytics global function
      gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        custom_parameter_1: context || 'unknown',
        custom_parameter_2: error.stack?.slice(0, 100) || ''
      });
    }

    console.error('Tracked error:', error, 'Context:', context);
  } catch (trackingError) {
    console.error('Error tracking error:', trackingError);
  }
}

// 性能跟踪
export function trackPerformance(metricName: string, value: number, unit: string = 'ms') {
  try {
    // @ts-expect-error - Google Analytics global function
    if (typeof gtag !== 'undefined') {
      // @ts-expect-error - Google Analytics global function
      gtag('event', 'timing_complete', {
        name: metricName,
        value: Math.round(value),
        event_category: 'performance',
        custom_parameter_1: unit
      });
    }
  } catch (error) {
    console.error('Error tracking performance:', error);
  }
}

// 获取用户行为分析数据
export function getUserBehaviorAnalytics() {
  try {
    const views = JSON.parse(localStorage.getItem('user_views') || '[]');
    const searches = JSON.parse(localStorage.getItem('user_searches') || '[]');
    
    return {
      totalViews: views.length,
      totalSearches: searches.length,
      mostViewedPageType: getMostFrequent(views.map((v: any) => v.pageType)),
      mostSearchedTerms: getMostFrequent(searches.map((s: any) => s.query)),
      averageSessionTime: calculateAverageSessionTime(views),
      lastActivity: Math.max(
        ...views.map((v: any) => v.timestamp),
        ...searches.map((s: any) => s.timestamp)
      )
    };
  } catch (error) {
    console.error('Error getting user behavior analytics:', error);
    return null;
  }
}

// 辅助函数
function getMostFrequent(arr: string[]): string | null {
  if (arr.length === 0) return null;
  
  const frequency: { [key: string]: number } = {};
  arr.forEach(item => {
    frequency[item] = (frequency[item] || 0) + 1;
  });
  
  return Object.keys(frequency).reduce((a, b) => 
    frequency[a] > frequency[b] ? a : b
  );
}

function calculateAverageSessionTime(views: any[]): number {
  if (views.length < 2) return 0;
  
  const sessions: number[] = [];
  let sessionStart = views[0].timestamp;
  
  for (let i = 1; i < views.length; i++) {
    const timeDiff = views[i].timestamp - views[i - 1].timestamp;
    
    // 如果间隔超过30分钟，认为是新会话
    if (timeDiff > 30 * 60 * 1000) {
      sessions.push(views[i - 1].timestamp - sessionStart);
      sessionStart = views[i].timestamp;
    }
  }
  
  // 添加最后一个会话
  sessions.push(views[views.length - 1].timestamp - sessionStart);
  
  return sessions.reduce((sum, time) => sum + time, 0) / sessions.length;
}

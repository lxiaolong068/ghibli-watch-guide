'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/app/components/analytics/GoogleAnalytics';

// Web Vitals type definitions
interface WebVitalMetric {
  name: 'CLS' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: 'navigate' | 'reload' | 'back-forward' | 'prerender' | 'back-forward-cache' | 'restore';
}

// Performance threshold configuration
const PERFORMANCE_THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 }
};

/**
 * Get performance rating
 */
function getPerformanceRating(name: WebVitalMetric['name'], value: number): WebVitalMetric['rating'] {
  const thresholds = PERFORMANCE_THRESHOLDS[name];
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Web Vitals tracker component
 * Monitor and report Core Web Vitals metrics
 */
export function WebVitalsTracker() {
  useEffect(() => {
    // Dynamically import web-vitals library
    import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
      // Cumulative Layout Shift (CLS)
      onCLS((metric) => {
        const rating = getPerformanceRating('CLS', metric.value);
        reportWebVital({
          ...metric,
          name: 'CLS',
          rating
        });
      });

      // First Contentful Paint (FCP)
      onFCP((metric) => {
        const rating = getPerformanceRating('FCP', metric.value);
        reportWebVital({
          ...metric,
          name: 'FCP',
          rating
        });
      });

      // Largest Contentful Paint (LCP)
      onLCP((metric) => {
        const rating = getPerformanceRating('LCP', metric.value);
        reportWebVital({
          ...metric,
          name: 'LCP',
          rating
        });
      });

      // Time to First Byte (TTFB)
      onTTFB((metric) => {
        const rating = getPerformanceRating('TTFB', metric.value);
        reportWebVital({
          ...metric,
          name: 'TTFB',
          rating
        });
      });

      // Interaction to Next Paint (INP)
      onINP((metric) => {
        const rating = getPerformanceRating('INP', metric.value);
        reportWebVital({
          ...metric,
          name: 'INP',
          rating
        });
      });
    }).catch((error) => {
      console.error('Failed to load web-vitals:', error);
    });
  }, []);

  return null; // This is a UI-less monitoring component
}

/**
 * Report Web Vital metrics
 */
function reportWebVital(metric: WebVitalMetric) {
  // Send to Google Analytics
  trackEvent({
    action: 'web_vital',
    category: 'performance',
    label: metric.name,
    value: Math.round(metric.value),
    custom_parameters: {
      metric_name: metric.name,
      metric_value: metric.value,
      metric_rating: metric.rating,
      metric_delta: metric.delta,
      metric_id: metric.id,
      navigation_type: metric.navigationType
    }
  });

  // Send to internal analytics API
  sendToAnalyticsAPI(metric);

  // Log to console in development environment
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta
    });
  }
}

/**
 * Send metrics to internal analytics API
 */
async function sendToAnalyticsAPI(metric: WebVitalMetric) {
  try {
    await fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      }),
    });
  } catch (error) {
    console.error('Failed to send web vital to analytics API:', error);
  }
}

/**
 * Custom performance monitoring Hook
 */
export function usePerformanceMonitoring() {
  useEffect(() => {
    // Monitor resource loading performance
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          
          // Calculate key timing metrics
          const metrics = {
            dns: navEntry.domainLookupEnd - navEntry.domainLookupStart,
            tcp: navEntry.connectEnd - navEntry.connectStart,
            request: navEntry.responseStart - navEntry.requestStart,
            response: navEntry.responseEnd - navEntry.responseStart,
            dom: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
            load: navEntry.loadEventEnd - navEntry.loadEventStart
          };

          // Send navigation timing metrics
          trackEvent({
            action: 'navigation_timing',
            category: 'performance',
            custom_parameters: metrics
          });
        }

        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          
          // Monitor slow resources
          if (resourceEntry.duration > 1000) {
            trackEvent({
              action: 'slow_resource',
              category: 'performance',
              label: resourceEntry.name,
              value: Math.round(resourceEntry.duration),
              custom_parameters: {
                resource_name: resourceEntry.name,
                resource_type: resourceEntry.initiatorType,
                resource_size: resourceEntry.transferSize,
                resource_duration: resourceEntry.duration
              }
            });
          }
        }
      }
    });

    // Observe navigation and resource timing
    observer.observe({ entryTypes: ['navigation', 'resource'] });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Monitor memory usage
  useEffect(() => {
    const checkMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        
        // If memory usage exceeds threshold, send warning
        const memoryUsageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        if (memoryUsageRatio > 0.8) {
          trackEvent({
            action: 'high_memory_usage',
            category: 'performance',
            value: Math.round(memoryUsageRatio * 100),
            custom_parameters: {
              used_heap: memory.usedJSHeapSize,
              total_heap: memory.totalJSHeapSize,
              heap_limit: memory.jsHeapSizeLimit,
              usage_ratio: memoryUsageRatio
            }
          });
        }
      }
    };

    // Check memory usage every 30 seconds
    const interval = setInterval(checkMemoryUsage, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);
}

/**
 * Page performance score calculation
 */
export function calculatePerformanceScore(metrics: Record<string, number>): number {
  const weights = {
    LCP: 0.25,
    INP: 0.25,
    CLS: 0.25,
    FCP: 0.15,
    TTFB: 0.1
  };

  let totalScore = 0;
  let totalWeight = 0;

  Object.entries(weights).forEach(([metric, weight]) => {
    if (metrics[metric] !== undefined) {
      const value = metrics[metric];
      const thresholds = PERFORMANCE_THRESHOLDS[metric as keyof typeof PERFORMANCE_THRESHOLDS];
      
      let score = 100;
      if (value > thresholds.poor) {
        score = 0;
      } else if (value > thresholds.good) {
        score = 50;
      }

      totalScore += score * weight;
      totalWeight += weight;
    }
  });

  return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
}

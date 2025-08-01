'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface GoogleAnalyticsProps {
  measurementId: string;
}

// Google Analytics 4 event types
export interface GAEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, unknown>;
}

// Declare global gtag function
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'consent',
      targetId: string | Date | 'default',
      config?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}

/**
 * Google Analytics 4 component
 * Provides page view tracking and custom event tracking
 */
export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Page view tracking
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
      
      window.gtag('config', measurementId, {
        page_path: url,
        custom_map: {
          custom_parameter_1: 'page_type',
          custom_parameter_2: 'content_id'
        }
      });

      // Send page view event
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: url,
        send_to: measurementId
      });
    }
  }, [pathname, searchParams, measurementId]);

  return (
    <>
      {/* Google Analytics 4 scripts */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              page_path: window.location.pathname,
              send_page_view: false,
              custom_map: {
                'custom_parameter_1': 'page_type',
                'custom_parameter_2': 'content_id'
              }
            });
          `,
        }}
      />
    </>
  );
}

/**
 * Send custom events to Google Analytics
 */
export function trackEvent(event: GAEvent): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event.custom_parameters
    });
  }
}

/**
 * Track search events
 */
export function trackSearch(searchTerm: string, resultCount: number): void {
  trackEvent({
    action: 'search',
    category: 'engagement',
    label: searchTerm,
    value: resultCount,
    custom_parameters: {
      search_term: searchTerm,
      result_count: resultCount
    }
  });
}

/**
 * Track content interaction events
 */
export function trackContentInteraction(
  contentType: 'movie' | 'character' | 'review' | 'guide',
  contentId: string,
  action: 'view' | 'click' | 'share' | 'favorite'
): void {
  trackEvent({
    action: `content_${action}`,
    category: 'content',
    label: `${contentType}:${contentId}`,
    custom_parameters: {
      content_type: contentType,
      content_id: contentId,
      interaction_type: action
    }
  });
}

/**
 * Track recommendation click events
 */
export function trackRecommendationClick(
  recommendationId: string,
  position: number,
  algorithm: string
): void {
  trackEvent({
    action: 'recommendation_click',
    category: 'recommendations',
    label: recommendationId,
    value: position,
    custom_parameters: {
      recommendation_id: recommendationId,
      position: position,
      algorithm: algorithm
    }
  });
}

/**
 * Track user engagement events
 */
export function trackEngagement(
  engagementType: 'scroll_depth' | 'time_on_page' | 'bounce',
  value: number
): void {
  trackEvent({
    action: engagementType,
    category: 'engagement',
    value: value,
    custom_parameters: {
      engagement_type: engagementType,
      engagement_value: value
    }
  });
}

/**
 * Track conversion events
 */
export function trackConversion(
  conversionType: 'newsletter_signup' | 'social_share' | 'external_link_click',
  value?: number
): void {
  trackEvent({
    action: 'conversion',
    category: 'conversions',
    label: conversionType,
    value: value,
    custom_parameters: {
      conversion_type: conversionType
    }
  });
}

/**
 * Set user properties
 */
export function setUserProperties(properties: Record<string, unknown>): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      user_properties: properties
    });
  }
}

/**
 * Track exception events
 */
export function trackException(description: string, fatal: boolean = false): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'exception', {
      description: description,
      fatal: fatal
    });
  }
}

'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import Head from 'next/head';

interface SEOOptimizerProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  structuredData?: object;
  breadcrumbData?: object;
  movieData?: any;
}

export function SEOOptimizer({
  title,
  description,
  keywords = [],
  canonicalUrl,
  ogImage,
  structuredData,
  breadcrumbData,
  movieData
}: SEOOptimizerProps) {
  // Dynamically generate keywords
  const generateKeywords = () => {
    const baseKeywords = [
      'ghibli', 'studio ghibli', 'miyazaki', 'watch guide', 'streaming',
      'netflix', 'disney+', 'animation movie', 'japanese animation'
    ];

    if (movieData) {
      baseKeywords.push(
        movieData.titleEn,
        movieData.titleJa,
        // Note: titleZh removed from SEO keywords for international optimization
        `${movieData.titleEn} streaming`,
        `${movieData.titleEn} watch online`,
        `${movieData.year} animation`
      );
    }

    return [...baseKeywords, ...keywords].filter(Boolean).join(', ');
  };

  // Generate structured data
  const generateStructuredData = () => {
    if (structuredData) return structuredData;
    
    if (movieData) {
      return {
        "@context": "https://schema.org",
        "@type": "Movie",
        "name": movieData.titleEn,
        "alternateName": [movieData.titleJa].filter(Boolean),
        "description": movieData.synopsis,
        "datePublished": `${movieData.year}-01-01`,
        "director": {
          "@type": "Person",
          "name": movieData.director || "Hayao Miyazaki"
        },
        "productionCompany": {
          "@type": "Organization",
          "name": "Studio Ghibli",
          "url": "https://www.ghibli.jp/"
        },
        "genre": ["Animation", "Family", "Fantasy"],
        "image": movieData.posterUrl,
        "aggregateRating": movieData.voteAverage ? {
          "@type": "AggregateRating",
          "ratingValue": movieData.voteAverage,
          "ratingCount": 1000,
          "bestRating": 10,
          "worstRating": 1
        } : undefined,
        "offers": {
          "@type": "AggregateOffer",
          "availability": "https://schema.org/OnlineOnly",
          "priceCurrency": "USD",
          "lowPrice": "0",
          "highPrice": "19.99"
        }
      };
    }
    
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Studio Ghibli Watch Guide",
      "url": "https://www.whereghibli.cc",
      "description": "Find the best ways to watch Studio Ghibli movies",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://www.whereghibli.cc/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };
  };

  return (
    <>
      {/* Basic SEO tags */}
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={generateKeywords()} />
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

        {/* Open Graph tags */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content={movieData ? "video.movie" : "website"} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
        <meta property="og:site_name" content="Studio Ghibli Watch Guide" />

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}

        {/* Additional SEO tags */}
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="googlebot" content="index, follow" />
        <meta name="author" content="Studio Ghibli Watch Guide" />
        <meta name="language" content="en-US" />

        {/* Mobile optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="format-detection" content="telephone=no" />
      </Head>

      {/* Structured data */}
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateStructuredData())
        }}
      />

      {/* Breadcrumb structured data */}
      {breadcrumbData && (
        <Script
          id="breadcrumb-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbData)
          }}
        />
      )}

      {/* Google AdSense */}
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6958408841088360"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />

      {/* Google Analytics (if needed) */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'GA_MEASUREMENT_ID');
        `}
      </Script>
    </>
  );
}

// AdSense ad component
export function AdSenseAd({
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  style = { display: 'block' }
}: {
  adSlot: string;
  adFormat?: string;
  fullWidthResponsive?: boolean;
  style?: React.CSSProperties;
}) {
  useEffect(() => {
    try {
      // @ts-expect-error - AdSense global variable
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className="adsense-container my-4">
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-6958408841088360"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive}
      />
    </div>
  );
}

// Responsive AdSense ad component
export function ResponsiveAdSenseAd({
  adSlot,
  adFormat = "auto"
}: {
  adSlot: string;
  adFormat?: string;
}) {
  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-xs text-gray-500 text-center mb-2">Advertisement</p>
        <AdSenseAd
          adSlot={adSlot}
          adFormat={adFormat}
          style={{ display: 'block', minHeight: '250px' }}
        />
      </div>
    </div>
  );
}

// In-article AdSense ad component
export function InArticleAdSenseAd({ adSlot }: { adSlot: string }) {
  return (
    <div className="my-6">
      <AdSenseAd
        adSlot={adSlot}
        adFormat="fluid"
        style={{ display: 'block', textAlign: 'center' }}
      />
    </div>
  );
}

// Sidebar AdSense ad component
export function SidebarAdSenseAd({ adSlot }: { adSlot: string }) {
  return (
    <div className="sticky top-4">
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <p className="text-xs text-gray-500 text-center mb-2">Advertisement</p>
        <AdSenseAd
          adSlot={adSlot}
          adFormat="auto"
          style={{ display: 'block', width: '300px', height: '250px' }}
        />
      </div>
    </div>
  );
}

// SEO performance monitoring component
export function SEOPerformanceMonitor() {
  useEffect(() => {
    // Monitor page loading performance
    if (typeof window !== 'undefined' && 'performance' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navigationEntry = entry as PerformanceNavigationTiming;

            // Send performance data to analytics service
            // @ts-expect-error - Google Analytics global function
            if (typeof gtag !== 'undefined') {
              // @ts-expect-error - Google Analytics global function
              gtag('event', 'page_load_time', {
                event_category: 'Performance',
                event_label: 'Page Load',
                value: Math.round(navigationEntry.loadEventEnd - navigationEntry.loadEventStart)
              });
            }
          }
        }
      });

      observer.observe({ entryTypes: ['navigation'] });

      return () => observer.disconnect();
    }
  }, []);

  return null;
}

// Content quality analyzer
export class ContentQualityAnalyzer {
  static analyzeContent(content: string): {
    readabilityScore: number;
    keywordDensity: { [key: string]: number };
    suggestions: string[];
  } {
    const words = content.toLowerCase().split(/\s+/);
    const totalWords = words.length;

    // Calculate keyword density
    const keywordCounts: { [key: string]: number } = {};
    const importantKeywords = ['ghibli', 'studio ghibli', 'miyazaki', 'watch', 'movie', 'animation'];

    words.forEach(word => {
      if (importantKeywords.includes(word)) {
        keywordCounts[word] = (keywordCounts[word] || 0) + 1;
      }
    });

    const keywordDensity: { [key: string]: number } = {};
    Object.keys(keywordCounts).forEach(keyword => {
      keywordDensity[keyword] = (keywordCounts[keyword] / totalWords) * 100;
    });

    // Generate suggestions
    const suggestions: string[] = [];

    if (totalWords < 300) {
      suggestions.push('Content is relatively short, recommend increasing to at least 300 words to improve SEO effectiveness');
    }

    if (Object.keys(keywordDensity).length === 0) {
      suggestions.push('Recommend including relevant keywords in the content');
    }

    Object.keys(keywordDensity).forEach(keyword => {
      const density = keywordDensity[keyword];
      if (density > 3) {
        suggestions.push(`Keyword "${keyword}" density is too high (${density.toFixed(1)}%), recommend keeping it within 2-3%`);
      }
    });

    // Simple readability score
    const avgWordsPerSentence = totalWords / (content.split(/[.!?]+/).length - 1);
    const readabilityScore = Math.max(0, Math.min(100, 100 - (avgWordsPerSentence - 15) * 2));

    return {
      readabilityScore,
      keywordDensity,
      suggestions
    };
  }
}

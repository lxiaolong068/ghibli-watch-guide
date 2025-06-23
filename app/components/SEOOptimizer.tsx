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
  // 动态生成关键词
  const generateKeywords = () => {
    const baseKeywords = [
      '吉卜力', 'Studio Ghibli', '宫崎骏', '观影指南', '在线观看',
      '流媒体', 'Netflix', 'Disney+', '动画电影', '日本动画'
    ];
    
    if (movieData) {
      baseKeywords.push(
        movieData.titleEn,
        movieData.titleJa,
        movieData.titleZh,
        `${movieData.titleEn} 在线观看`,
        `${movieData.titleEn} 流媒体`,
        `${movieData.year}年动画`
      );
    }
    
    return [...baseKeywords, ...keywords].filter(Boolean).join(', ');
  };

  // 生成结构化数据
  const generateStructuredData = () => {
    if (structuredData) return structuredData;
    
    if (movieData) {
      return {
        "@context": "https://schema.org",
        "@type": "Movie",
        "name": movieData.titleEn,
        "alternateName": [movieData.titleJa, movieData.titleZh].filter(Boolean),
        "description": movieData.synopsis,
        "datePublished": `${movieData.year}-01-01`,
        "director": {
          "@type": "Person",
          "name": movieData.director || "宫崎骏"
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
      "name": "吉卜力观影指南",
      "url": "https://www.whereghibli.cc",
      "description": "找到观看吉卜力工作室电影的最佳方式",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://www.whereghibli.cc/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };
  };

  return (
    <>
      {/* 基础SEO标签 */}
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={generateKeywords()} />
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        
        {/* Open Graph标签 */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content={movieData ? "video.movie" : "website"} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
        <meta property="og:site_name" content="吉卜力观影指南" />
        
        {/* Twitter Card标签 */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}
        
        {/* 额外的SEO标签 */}
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="googlebot" content="index, follow" />
        <meta name="author" content="吉卜力观影指南" />
        <meta name="language" content="zh-CN" />
        
        {/* 移动端优化 */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="format-detection" content="telephone=no" />
      </Head>

      {/* 结构化数据 */}
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateStructuredData())
        }}
      />

      {/* 面包屑结构化数据 */}
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

      {/* Google Analytics (如果需要) */}
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

// AdSense广告组件
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
      // @ts-ignore
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

// 响应式AdSense广告组件
export function ResponsiveAdSenseAd({ adSlot }: { adSlot: string }) {
  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-xs text-gray-500 text-center mb-2">广告</p>
        <AdSenseAd
          adSlot={adSlot}
          adFormat="auto"
          style={{ display: 'block', minHeight: '250px' }}
        />
      </div>
    </div>
  );
}

// 文章内AdSense广告组件
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

// 侧边栏AdSense广告组件
export function SidebarAdSenseAd({ adSlot }: { adSlot: string }) {
  return (
    <div className="sticky top-4">
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <p className="text-xs text-gray-500 text-center mb-2">广告</p>
        <AdSenseAd
          adSlot={adSlot}
          adFormat="auto"
          style={{ display: 'block', width: '300px', height: '250px' }}
        />
      </div>
    </div>
  );
}

// SEO性能监控组件
export function SEOPerformanceMonitor() {
  useEffect(() => {
    // 监控页面加载性能
    if (typeof window !== 'undefined' && 'performance' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navigationEntry = entry as PerformanceNavigationTiming;
            
            // 发送性能数据到分析服务
            if (typeof gtag !== 'undefined') {
              // @ts-ignore
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

// 内容质量分析器
export class ContentQualityAnalyzer {
  static analyzeContent(content: string): {
    readabilityScore: number;
    keywordDensity: { [key: string]: number };
    suggestions: string[];
  } {
    const words = content.toLowerCase().split(/\s+/);
    const totalWords = words.length;
    
    // 计算关键词密度
    const keywordCounts: { [key: string]: number } = {};
    const importantKeywords = ['吉卜力', 'ghibli', '宫崎骏', '观看', '电影', '动画'];
    
    words.forEach(word => {
      if (importantKeywords.includes(word)) {
        keywordCounts[word] = (keywordCounts[word] || 0) + 1;
      }
    });
    
    const keywordDensity: { [key: string]: number } = {};
    Object.keys(keywordCounts).forEach(keyword => {
      keywordDensity[keyword] = (keywordCounts[keyword] / totalWords) * 100;
    });
    
    // 生成建议
    const suggestions: string[] = [];
    
    if (totalWords < 300) {
      suggestions.push('内容长度较短，建议增加到至少300字以提高SEO效果');
    }
    
    if (Object.keys(keywordDensity).length === 0) {
      suggestions.push('建议在内容中包含相关关键词');
    }
    
    Object.keys(keywordDensity).forEach(keyword => {
      const density = keywordDensity[keyword];
      if (density > 3) {
        suggestions.push(`关键词"${keyword}"密度过高(${density.toFixed(1)}%)，建议控制在2-3%以内`);
      }
    });
    
    // 简单的可读性评分
    const avgWordsPerSentence = totalWords / (content.split(/[.!?]+/).length - 1);
    const readabilityScore = Math.max(0, Math.min(100, 100 - (avgWordsPerSentence - 15) * 2));
    
    return {
      readabilityScore,
      keywordDensity,
      suggestions
    };
  }
}

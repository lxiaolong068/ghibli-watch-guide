import Head from 'next/head';
import { Metadata } from 'next';

interface AdvancedSEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'video' | 'book';
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  structuredData?: object;
  noIndex?: boolean;
  noFollow?: boolean;
  alternateLanguages?: { [key: string]: string };
  breadcrumbs?: Array<{ name: string; url: string }>;
}

export function AdvancedSEO({
  title = "Where to Watch Studio Ghibli Movies",
  description = "Find where to stream Studio Ghibli films worldwide. Updated guide for Netflix, Max, and other platforms.",
  keywords = ["Studio Ghibli", "streaming", "movies", "anime", "Spirited Away", "Totoro"],
  canonicalUrl,
  ogImage = "/images/og-default.jpg",
  ogType = "website",
  twitterCard = "summary_large_image",
  structuredData,
  noIndex = false,
  noFollow = false,
  alternateLanguages,
  breadcrumbs
}: AdvancedSEOProps) {
  
  // Generate structured data
  const generateStructuredData = () => {
    const baseStructuredData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Where to Watch Studio Ghibli Movies",
      "description": description,
      "url": canonicalUrl || "https://www.whereghibli.cc",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://www.whereghibli.cc/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Where to Watch Studio Ghibli Movies",
        "url": "https://www.whereghibli.cc"
      }
    };

    // If breadcrumbs exist, add breadcrumb structured data
    if (breadcrumbs && breadcrumbs.length > 0) {
      const breadcrumbStructuredData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": crumb.name,
          "item": crumb.url
        }))
      };
      
      return [baseStructuredData, breadcrumbStructuredData, ...(structuredData ? [structuredData] : [])];
    }

    return [baseStructuredData, ...(structuredData ? [structuredData] : [])];
  };

  const robotsContent = `${noIndex ? 'noindex' : 'index'},${noFollow ? 'nofollow' : 'follow'}`;
  const fullTitle = title.includes('Studio Ghibli') ? title : `${title} | Where to Watch Studio Ghibli Movies`;

  return (
    <Head>
      {/* Basic SEO tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="robots" content={robotsContent} />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={title} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:site_name" content="Where to Watch Studio Ghibli Movies" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={title} />
      
      {/* Multi-language support */}
      {alternateLanguages && Object.entries(alternateLanguages).map(([lang, url]) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={url} />
      ))}
      
      {/* Mobile optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <meta name="theme-color" content="#059669" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Ghibli Guide" />
      
      {/* Performance optimization */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://image.tmdb.org" />
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
      
      {/* Structured data */}
      {generateStructuredData().map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
    </Head>
  );
}

// Helper function to generate page metadata
export function generatePageMetadata({
  title,
  description,
  path = '',
  ogImage,
  keywords = []
}: {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
  keywords?: string[];
}): Metadata {
  const baseUrl = 'https://www.whereghibli.cc';
  const fullTitle = title.includes('Studio Ghibli') ? title : `${title} | Where to Watch Studio Ghibli Movies`;
  const canonicalUrl = `${baseUrl}${path}`;
  
  return {
    title: fullTitle,
    description,
    keywords: [...keywords, 'Studio Ghibli', 'streaming', 'movies', 'anime'].join(', '),
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: 'Where to Watch Studio Ghibli Movies',
      images: [
        {
          url: ogImage || '/images/og-default.jpg',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage || '/images/og-default.jpg'],
    },
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// Movie page specific structured data generator
export function generateMovieStructuredData(movie: {
  id: string;
  title: string;
  originalTitle: string;
  description: string;
  releaseDate: string;
  director: string;
  duration?: number;
  posterUrl?: string;
  rating?: number;
  genre?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Movie",
    "name": movie.title,
    "alternateName": movie.originalTitle,
    "description": movie.description,
    "datePublished": movie.releaseDate,
    "director": {
      "@type": "Person",
      "name": movie.director
    },
    "duration": movie.duration ? `PT${movie.duration}M` : undefined,
    "image": movie.posterUrl,
    "aggregateRating": movie.rating ? {
      "@type": "AggregateRating",
      "ratingValue": movie.rating,
      "ratingCount": 1,
      "bestRating": 10,
      "worstRating": 1
    } : undefined,
    "genre": movie.genre,
    "productionCompany": {
      "@type": "Organization",
      "name": "Studio Ghibli"
    },
    "url": `https://www.whereghibli.cc/movies/${movie.id}`
  };
}

// Article/review page structured data generator
export function generateArticleStructuredData(article: {
  title: string;
  description: string;
  publishDate: string;
  modifiedDate?: string;
  author: string;
  url: string;
  imageUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "datePublished": article.publishDate,
    "dateModified": article.modifiedDate || article.publishDate,
    "author": {
      "@type": "Person",
      "name": article.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Where to Watch Studio Ghibli Movies",
      "url": "https://www.whereghibli.cc"
    },
    "url": article.url,
    "image": article.imageUrl,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": article.url
    }
  };
}

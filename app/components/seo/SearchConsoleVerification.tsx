import Head from 'next/head';

interface SearchConsoleVerificationProps {
  verificationCode?: string;
}

/**
 * Google Search Console verification component
 * Used to verify website ownership and integrate Search Console functionality
 */
export function SearchConsoleVerification({ 
  verificationCode 
}: SearchConsoleVerificationProps) {
  if (!verificationCode) {
    return null;
  }

  return (
    <Head>
      <meta 
        name="google-site-verification" 
        content={verificationCode} 
      />
    </Head>
  );
}

/**
 * Structured data component - Movie information
 */
interface MovieStructuredDataProps {
  movie: {
    id: string;
    titleEn: string;
    titleJa: string;
    titleZh?: string;
    year: number;
    director?: string;
    duration?: number;
    synopsis?: string;
    posterUrl?: string;
    voteAverage?: number;
  };
}

export function MovieStructuredData({ movie }: MovieStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Movie",
    "name": movie.titleEn,
    "alternateName": [movie.titleJa].filter(Boolean),
    "datePublished": movie.year.toString(),
    "director": movie.director ? {
      "@type": "Person",
      "name": movie.director
    } : undefined,
    "duration": movie.duration ? `PT${movie.duration}M` : undefined,
    "description": movie.synopsis,
    "image": movie.posterUrl,
    "aggregateRating": movie.voteAverage ? {
      "@type": "AggregateRating",
      "ratingValue": movie.voteAverage,
      "ratingCount": 1,
      "bestRating": 10,
      "worstRating": 0
    } : undefined,
    "genre": ["Animation", "Family", "Fantasy"],
    "productionCompany": {
      "@type": "Organization",
      "name": "Studio Ghibli"
    },
    "url": `https://www.whereghibli.cc/movies/${movie.id}`,
    "sameAs": [
      `https://www.themoviedb.org/movie/${movie.id}`,
    ]
  };

  // Remove undefined values
  const cleanedData = JSON.parse(JSON.stringify(structuredData));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(cleanedData, null, 2)
      }}
    />
  );
}

/**
 * Structured data component - Website information
 */
export function WebsiteStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Studio Ghibli Watch Guide",
    "alternateName": "Where to Watch Studio Ghibli Movies",
    "url": "https://www.whereghibli.cc",
    "description": "Comprehensive guide to Studio Ghibli movies, including film information, streaming platforms, character introductions, and professional reviews",
    "publisher": {
      "@type": "Organization",
      "name": "Studio Ghibli Watch Guide",
      "url": "https://www.whereghibli.cc"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.whereghibli.cc/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "sameAs": [
      "https://github.com/lxiaolong068/ghibli-watch-guide"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  );
}

/**
 * Structured data component - Breadcrumb navigation
 */
interface BreadcrumbStructuredDataProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  );
}

/**
 * Structured data component - Article/Review
 */
interface ArticleStructuredDataProps {
  article: {
    title: string;
    description: string;
    author: string;
    datePublished: string;
    dateModified?: string;
    url: string;
    imageUrl?: string;
  };
}

export function ArticleStructuredData({ article }: ArticleStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "author": {
      "@type": "Person",
      "name": article.author
    },
    "datePublished": article.datePublished,
    "dateModified": article.dateModified || article.datePublished,
    "url": article.url,
    "image": article.imageUrl,
    "publisher": {
      "@type": "Organization",
      "name": "Studio Ghibli Watch Guide",
      "url": "https://www.whereghibli.cc"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": article.url
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  );
}

/**
 * Structured data component - FAQ
 */
interface FAQStructuredDataProps {
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export function FAQStructuredData({ faqs }: FAQStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  );
}

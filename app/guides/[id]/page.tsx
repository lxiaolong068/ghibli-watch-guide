import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { GuideDetail } from '@/app/components/guides/GuideDetail';
import { WatchGuide } from '@/app/types';

interface GuidePageProps {
  params: { id: string };
}

// Get watch guide data
async function getGuide(id: string): Promise<WatchGuide | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/guides/${id}`, {
      cache: 'no-store', // Ensure latest data
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch watch guide');
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch watch guide:', error);
    return null;
  }
}

// Generate page metadata
export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const guide = await getGuide(params.id);

  if (!guide) {
    return {
      title: 'Watch Guide Not Found | Studio Ghibli Watch Guide',
      description: 'The watch guide you are looking for does not exist or has been removed.',
    };
  }

  const guideTypeLabels = {
    'CHRONOLOGICAL': 'Timeline Guide',
    'BEGINNER': 'Beginner\'s Guide',
    'THEMATIC': 'Thematic Guide',
    'FAMILY': 'Family Viewing',
    'ADVANCED': 'Advanced Guide',
    'SEASONAL': 'Seasonal Recommendations'
  };

  return {
    title: `${guide.title} | Studio Ghibli Watch Guide`,
    description: guide.description,
    keywords: `studio ghibli, watch guide, miyazaki, movie recommendations, ${guideTypeLabels[guide.guideType as keyof typeof guideTypeLabels]}`,
    openGraph: {
      title: guide.title,
      description: guide.description,
      type: 'article',
      publishedTime: guide.createdAt.toString(),
      modifiedTime: guide.updatedAt.toString(),
    },
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const guide = await getGuide(params.id);

  if (!guide) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Home
            </Link>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href="/guides" className="text-gray-500 hover:text-gray-700">
              Watch Guides
            </Link>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium">{guide.title}</span>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <GuideDetail guide={guide} />
      </div>

      {/* Back button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="text-center">
          <Link
            href="/guides"
            className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Watch Guides
          </Link>
        </div>
      </div>

      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": guide.title,
            "description": guide.description,
            "author": {
              "@type": "Organization",
              "name": "Studio Ghibli Watch Guide"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Studio Ghibli Watch Guide"
            },
            "datePublished": guide.createdAt,
            "dateModified": guide.updatedAt,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/guides/${guide.id}`
            },
            "about": {
              "@type": "Thing",
              "name": "Studio Ghibli Movies",
              "description": "Studio Ghibli movie watch guides"
            }
          })
        }}
      />
    </div>
  );
}

import { Suspense } from 'react';
import { Metadata } from 'next';
import { SearchResults } from '@/app/components/search/SearchResults';
import { SearchFilters } from '@/app/components/search/SearchFilters';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';
import { SearchHistorySection } from '@/app/components/search/SearchHistorySection';

interface SearchPageProps {
  searchParams: {
    q?: string;
    type?: string;
    year?: string;
    director?: string;
    tags?: string;
    language?: string;
    page?: string;
  };
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const query = searchParams.q || '';
  
  return {
    title: query ? `Search Results: ${query} - Ghibli Watch Guide` : 'Search - Ghibli Watch Guide',
    description: query
      ? `Search results for "${query}", including movies, characters, reviews and watch guides.`
      : 'Search Studio Ghibli movies, characters, reviews and watch guides.',
    openGraph: {
      title: query ? `Search Results: ${query}` : 'Search',
      description: query
        ? `Search results for "${query}", including movies, characters, reviews and watch guides.`
        : 'Search Studio Ghibli movies, characters, reviews and watch guides.',
    },
  };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  const hasQuery = query.length >= 2;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {query ? `Search Results: "${query}"` : 'Search'}
          </h1>
          {query && (
            <p className="text-gray-600">
              Search movies, characters, reviews and watch guides
            </p>
          )}
        </div>

        {hasQuery ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filter Sidebar */}
            <div className="lg:col-span-1">
              <Suspense fallback={<div className="bg-white rounded-lg shadow p-6"><LoadingSpinner size="sm" /></div>}>
                <SearchFilters searchParams={searchParams} />
              </Suspense>
            </div>

            {/* Search Results Main Area */}
            <div className="lg:col-span-3">
              <Suspense fallback={<SearchResultsSkeleton />}>
                <SearchResults searchParams={searchParams} />
              </Suspense>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Search Prompt */}
            <div className="text-center py-8">
              <div className="max-w-md mx-auto">
                <div className="mb-6">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Start Searching
                </h2>
                <p className="text-gray-600 mb-6">
                  Enter keywords to search movies, characters, reviews and watch guides
                </p>

                {/* Search Suggestions */}
                <div className="text-left">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Recommended Searches</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Spirited Away',
                      'My Neighbor Totoro',
                      'Grave of the Fireflies',
                      'Howl\'s Moving Castle',
                      'Castle in the Sky',
                      'Kiki\'s Delivery Service',
                      'Hayao Miyazaki',
                      'Environmental themes',
                      'Family viewing'
                    ].map((suggestion) => (
                      <a
                        key={suggestion}
                        href={`/search?q=${encodeURIComponent(suggestion)}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                      >
                        {suggestion}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Search History and Popular Searches */}
            <div className="max-w-4xl mx-auto">
              <SearchHistorySection showStats={true} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Search Results Skeleton Screen
function SearchResultsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Results Statistics Skeleton */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="flex space-x-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 bg-gray-200 rounded w-16"></div>
          ))}
        </div>
      </div>

      {/* Search Results Skeleton */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white rounded-lg shadow p-6">
          <div className="flex space-x-4">
            <div className="w-16 h-20 bg-gray-200 rounded"></div>
            <div className="flex-1">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

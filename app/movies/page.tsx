import type { Metadata } from 'next';
import { getAllMovies } from '@/app/actions/movies';
import FilteredMovieList from '@/app/components/movies/FilteredMovieList';
// import type { Region } from '@prisma/client'; // No longer needed here

// Remove force-dynamic setting to allow page caching
// export const dynamic = 'force-dynamic';

interface MoviesPageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

// Dynamic metadata generation based on page number
export async function generateMetadata({ searchParams }: MoviesPageProps): Promise<Metadata> {
  // Get current page from search params, default to 1
  const page = searchParams?.['page'] ?? '1';
  const parsedPage = parseInt(Array.isArray(page) ? page[0] : page, 10);

  // Ensure we have a valid page number, default to 1 if invalid
  const currentPage = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

  // Generate dynamic title based on page number
  const baseTitle = 'Studio Ghibli Movie List';
  const siteName = 'Where to Watch Studio Ghibli Movies';

  let title: string;
  let description: string;
  let ogTitle: string;

  if (currentPage <= 1) {
    // First page - use original title
    title = `${baseTitle} | ${siteName}`;
    description = 'Complete list of all Studio Ghibli movies. Find where to watch each film, including Spirited Away, My Neighbor Totoro, Howl\'s Moving Castle, and more.';
    ogTitle = 'Complete Studio Ghibli Movie List';
  } else {
    // Subsequent pages - include page number
    title = `${baseTitle} - Page ${currentPage} | ${siteName}`;
    description = `Browse Studio Ghibli movies - Page ${currentPage}. Find where to watch each film, including streaming availability on Netflix, Max, and other platforms.`;
    ogTitle = `Complete Studio Ghibli Movie List - Page ${currentPage}`;
  }

  return {
    title,
    description,
    openGraph: {
      title: ogTitle,
      description: 'Browse all Studio Ghibli films and find out where to stream them.',
      type: 'website',
    },
  };
}

const PAGE_SIZE = 12; // Define page size constant

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  // Get current page from search params, default to 1
  const page = searchParams?.['page'] ?? '1';
  const currentPage = parseInt(Array.isArray(page) ? page[0] : page, 10);

  // Fetch paginated movies and total count
  const { movies, totalMovies } = await getAllMovies(currentPage, PAGE_SIZE);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Studio Ghibli Movie List
        </h1>
        <p className="text-lg text-gray-600">
          Explore all animated films by Studio Ghibli and find where to watch them.
        </p>
      </div>
      
      {/* 使用新的筛选电影列表组件 */}
      <FilteredMovieList
        initialMovies={movies}
        initialTotal={totalMovies}
        initialPage={currentPage}
        pageSize={PAGE_SIZE}
      />
      
    </main>
  );
} 
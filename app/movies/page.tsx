import type { Metadata } from 'next';
import { getAllMovies } from '@/app/actions/movies';
import FilteredMovieList from '@/app/components/movies/FilteredMovieList';
// import type { Region } from '@prisma/client'; // No longer needed here

// Remove force-dynamic setting to allow page caching
// export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Studio Ghibli Movie List | Where to Watch Studio Ghibli Movies',
  description: 'Complete list of all Studio Ghibli movies. Find where to watch each film, including Spirited Away, My Neighbor Totoro, Howl\'s Moving Castle, and more.',
  openGraph: {
    title: 'Complete Studio Ghibli Movie List',
    description: 'Browse all Studio Ghibli films and find out where to stream them.',
    type: 'website',
  },
};

interface MoviesPageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
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
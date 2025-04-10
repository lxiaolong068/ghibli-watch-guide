import type { Metadata } from 'next';
import { getAllMovies } from '@/app/actions/movies';
import { MovieListContainer } from '@/app/components/MovieListContainer'; // Import MovieListContainer
import { prisma } from '@/lib/prisma'; // Import prisma
import { unstable_cache } from 'next/cache'; // 导入缓存函数

export const metadata: Metadata = {
  title: 'Studio Ghibli Movie List | Where to Watch Studio Ghibli Movies',
  description: 'Complete list of all Studio Ghibli movies. Find where to watch each film, including Spirited Away, My Neighbor Totoro, Howl\'s Moving Castle, and more.',
  openGraph: {
    title: 'Complete Studio Ghibli Movie List',
    description: 'Browse all Studio Ghibli films and find out where to stream them.',
    type: 'website',
  },
};

// 使用缓存包装 getRegions 函数
const getCachedRegions = unstable_cache(
  async () => {
    return prisma.region.findMany({
      orderBy: {
        code: 'asc',
      },
    });
  },
  ['regions-cache'],
  { revalidate: 3600 } // 缓存1小时
);

// 使用缓存包装 getAllMovies 函数
const getCachedMovies = unstable_cache(
  async () => getAllMovies(),
  ['movies-cache'],
  { revalidate: 3600 } // 缓存1小时
);

export default async function MoviesPage() {
  // 使用缓存的函数获取数据
  const [movies, regions] = await Promise.all([
    getCachedMovies(),
    getCachedRegions()
  ]);

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
      
      {/* Render the list of movies using MovieListContainer */}
      <MovieListContainer initialMovies={movies} initialRegions={regions} />
      
    </main>
  );
} 
import { prisma } from '@/lib/prisma';
import { MovieListContainer } from '@/app/components/MovieListContainer';
import { unstable_cache } from 'next/cache';

// 使用缓存包装 getMovies 函数
const getCachedMovies = unstable_cache(
  async () => {
    const movies = await prisma.movie.findMany({
      orderBy: {
        year: 'desc',
      },
      include: {
        availabilities: {
          include: {
            platform: true,
            region: true,
          },
        },
      },
    });
    return movies;
  },
  ['movies-home-cache'],
  { revalidate: 3600 } // 缓存1小时
);

// 使用缓存包装 getRegions 函数
const getCachedRegions = unstable_cache(
  async () => {
    const regions = await prisma.region.findMany({
      orderBy: {
        code: 'asc',
      },
    });
    return regions;
  },
  ['regions-cache'],
  { revalidate: 3600 } // 缓存1小时
);

export default async function Home() {
  const [movies, regions] = await Promise.all([getCachedMovies(), getCachedRegions()]);

  return <MovieListContainer initialMovies={movies} initialRegions={regions} />;
} 
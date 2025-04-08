import { prisma } from '@/lib/prisma';
import { MovieListContainer } from '@/app/components/MovieListContainer';

async function getMovies() {
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
}

async function getRegions() {
  const regions = await prisma.region.findMany({
    orderBy: {
      code: 'asc',
    },
  });
  return regions;
}

export default async function Home() {
  const [movies, regions] = await Promise.all([getMovies(), getRegions()]);

  return <MovieListContainer initialMovies={movies} initialRegions={regions} />;
} 
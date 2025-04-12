'use server';

import { cache } from 'react';
import { prisma } from '@/lib/prisma';  

// Remove import from @/app/types as Prisma Client provides types
// import type { Movie, Region, Platform, Availability } from '@/app/types'; 

// const prisma = new PrismaClient();  

export const getMovieById = cache(async (id: string) => {
  try {
    const movie = await prisma.movie.findUnique({
      where: { id },
    });

    return movie;
  } catch (error) {
    console.error('Error fetching movie:', error);
    return null;
  }
});

// Modify getAllMovies to support pagination and add caching
export const getAllMovies = cache(async (page: number = 1, pageSize: number = 12) => {
  const skip = (page - 1) * pageSize;

  try {
    // Use Promise.all to fetch movies and count concurrently
    const [movies, totalMovies] = await prisma.$transaction([
      prisma.movie.findMany({
        select: {
          id: true,
          tmdbId: true,
          titleEn: true,
          titleJa: true,
          year: true,
          director: true,
          duration: true,
          synopsis: true,
          posterUrl: true,
          backdropUrl: true,
          voteAverage: true,
        },
        orderBy: {
          year: 'desc', // Keep the consistent order
        },
        skip: skip,
        take: pageSize,
      }),
      prisma.movie.count(), // Get the total count of movies
    ]);

    return {
      movies, // The movies for the current page
      totalMovies, // Total number of movies
    };
  } catch (error) {
    console.error('Error fetching paginated movies:', error);
    return {
      movies: [],
      totalMovies: 0,
    };
  }
});

// Function to get the latest N movies with caching
export const getLatestMovies = cache(async (count: number) => {
  try {
    const movies = await prisma.movie.findMany({
      select: {
        id: true,
        tmdbId: true,
        titleEn: true,
        titleJa: true,
        year: true,
        director: true,
        duration: true,
        synopsis: true,
        posterUrl: true,
        backdropUrl: true,
        voteAverage: true,
      },
      orderBy: {
        year: 'desc',
      },
      take: count,
    });
    return movies;
  } catch (error) {
    console.error(`Error fetching latest ${count} movies:`, error);
    return [];
  }
}); 
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
export const getAllMovies = cache(async (page: number = 1, pageSize: number = 12, includeTags: boolean = true) => {
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
          titleZh: true,
          year: true,
          director: true,
          duration: true,
          synopsis: true,
          posterUrl: true,
          backdropUrl: true,
          voteAverage: true,
          createdAt: true,
          updatedAt: true,
          ...(includeTags && {
            movieTags: {
              include: {
                tag: true
              },
              orderBy: {
                tag: {
                  category: 'asc'
                }
              }
            }
          })
        },
        orderBy: {
          year: 'desc', // Keep the consistent order
        },
        skip: skip,
        take: pageSize,
      }),
      prisma.movie.count(), // Get the total count of movies
    ]);

    // 如果包含标签，格式化电影数据
    const formattedMovies = includeTags ? movies.map(movie => {
      // 使用类型断言来处理动态包含的关联数据
      const movieWithTags = movie as any;

      return {
        ...movie,
        tags: movieWithTags.movieTags?.map((movieTag: any) => movieTag.tag) || [],
        tagsByCategory: movieWithTags.movieTags?.reduce((acc: any, movieTag: any) => {
          const category = movieTag.tag.category || 'other';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(movieTag.tag);
          return acc;
        }, {} as Record<string, unknown[]>) || {}
      };
    }) : movies;

    return {
      movies: formattedMovies, // The movies for the current page
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
        titleZh: true,
        year: true,
        director: true,
        duration: true,
        synopsis: true,
        posterUrl: true,
        backdropUrl: true,
        voteAverage: true,
        createdAt: true,
        updatedAt: true,
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
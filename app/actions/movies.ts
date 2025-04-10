'use server';

// import { PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';  // 导入现有 prisma 实例
// Remove import from @/app/types as Prisma Client provides types
// import type { Movie, Region, Platform, Availability } from '@/app/types'; 

// const prisma = new PrismaClient();  // 删除这行，避免创建新实例

export async function getMovieById(id: string) {
  try {
    const movie = await prisma.movie.findUnique({
      where: { id },
      include: {
        availabilities: {
          include: {
            region: true,
            platform: true,
          },
        },
      },
    });

    return movie;
  } catch (error) {
    console.error('Error fetching movie:', error);
    return null;
  }
}

export async function getAllMovies() {
  try {
    const movies = await prisma.movie.findMany({
      include: {
        availabilities: {
          include: {
            region: true,
            platform: true,
          },
        },
      },
    });

    return movies;
  } catch (error) {
    console.error('Error fetching movies:', error);
    return [];
  }
} 
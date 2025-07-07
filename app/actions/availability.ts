'use server';

import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import { Prisma, Availability } from '../../prisma/generated/client'; // Import Prisma types

// Cached function to get watch availability information for a specific movie in a specific region
export const getMovieAvailability = cache(async (movieId: string, regionCode?: string) => {
  try {
    // Check if Availability table exists
    try {
      await prisma.$queryRaw`SELECT 1 FROM "Availability" LIMIT 1`;
    } catch (_e) {
      // Table doesn't exist, return empty array
      console.log('Availability table has not been created yet, returning empty data');
      return { availabilities: [], lastUpdated: null };
    }
    
    // Build base query conditions
    const where: Prisma.AvailabilityWhereInput = {
      movieId: movieId
    };
    
    // If region is specified, add region filter
    if (regionCode) {
      where.region = {
        code: regionCode
      };
    }
    
    // Query availability data
    const availabilities = await prisma.availability.findMany({
      where,
      include: {
        platform: true,
        region: true
      },
      orderBy: [
        { region: { name: 'asc' } },
        { platform: { name: 'asc' } }
      ]
    });
    
    // Get last updated time
    const lastUpdated = availabilities.length > 0 
      ? availabilities.reduce((latest: Date, current: Availability) => 
          current.lastChecked > latest ? current.lastChecked : latest, 
          availabilities[0].lastChecked)
      : null;
    
    return {
      availabilities,
      lastUpdated
    };
  } catch (error) {
    console.error('Failed to get movie availability information:', error);
    return { availabilities: [], lastUpdated: null };
  }
});

// Get all supported regions
export const getAllRegions = cache(async () => {
  try {
    // Check if Region table exists
    try {
      await prisma.$queryRaw`SELECT 1 FROM "Region" LIMIT 1`;
    } catch (_e) {
      // Table doesn't exist, return empty array
      console.log('Region table has not been created yet, returning empty data');
      return [];
    }
    
    const regions = await prisma.region.findMany({
      orderBy: { name: 'asc' }
    });
    
    return regions;
  } catch (error) {
    console.error('Failed to get region list:', error);
    return [];
  }
});

// Get all supported platforms
export const getAllPlatforms = cache(async () => {
  try {
    // Check if Platform table exists
    try {
      await prisma.$queryRaw`SELECT 1 FROM "Platform" LIMIT 1`;
    } catch (_e) {
      // Table doesn't exist, return empty array
      console.log('Platform table has not been created yet, returning empty data');
      return [];
    }
    
    const platforms = await prisma.platform.findMany({
      orderBy: { name: 'asc' }
    });
    
    return platforms;
  } catch (error) {
    console.error('Failed to get platform list:', error);
    return [];
  }
}); 
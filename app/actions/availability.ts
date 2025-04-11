'use server';

import { cache } from 'react';
import { prisma } from '@/lib/prisma';

// Temporary type definitions for availability to resolve TypeScript errors
// Once Prisma code generation is complete, we can import these types directly from @prisma/client
interface Platform {
  id: string;
  name: string;
  website: string;
  type: string;
  logo: string | null;
}

interface Region {
  id: string;
  code: string;
  name: string;
}

interface Availability {
  id: string;
  url: string | null;
  price: number | null;
  currency: string | null;
  type: string;
  lastChecked: Date;
  isAvailable: boolean;
  notes: string | null;
  platformId: string;
  regionId: string;
  movieId: string;
  platform: Platform;
  region: Region;
}

// Cached function to get watch availability information for a specific movie in a specific region
export const getMovieAvailability = cache(async (movieId: string, regionCode?: string) => {
  try {
    // Check if Availability table exists
    try {
      await prisma.$queryRaw`SELECT 1 FROM "Availability" LIMIT 1`;
    } catch (e) {
      // Table doesn't exist, return empty array
      console.log('Availability table has not been created yet, returning empty data');
      return { availabilities: [], lastUpdated: null };
    }
    
    // Build base query conditions
    const where: any = {
      movieId: movieId
    };
    
    // If region is specified, add region filter
    if (regionCode) {
      where.region = {
        code: regionCode
      };
    }
    
    // Query availability data
    // Using any type to bypass TypeScript checks since Prisma client will generate these models at runtime
    const availabilities = await (prisma as any).availability.findMany({
      where,
      include: {
        platform: true,
        region: true
      },
      orderBy: [
        { region: { name: 'asc' } },
        { platform: { name: 'asc' } }
      ]
    }) as Availability[];
    
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
    } catch (e) {
      // Table doesn't exist, return empty array
      console.log('Region table has not been created yet, returning empty data');
      return [];
    }
    
    // Using any type to bypass TypeScript checks
    const regions = await (prisma as any).region.findMany({
      orderBy: { name: 'asc' }
    }) as Region[];
    
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
    } catch (e) {
      // Table doesn't exist, return empty array
      console.log('Platform table has not been created yet, returning empty data');
      return [];
    }
    
    // Using any type to bypass TypeScript checks
    const platforms = await (prisma as any).platform.findMany({
      orderBy: { name: 'asc' }
    }) as Platform[];
    
    return platforms;
  } catch (error) {
    console.error('Failed to get platform list:', error);
    return [];
  }
}); 
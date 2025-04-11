import { PrismaClient } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file in the root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const STUDIO_GHIBLI_ID = 10342; // Studio Ghibli's company ID on TMDB

if (!TMDB_API_KEY) {
  throw new Error('Missing TMDB_API_KEY environment variable');
}

interface TmdbErrorResponse {
  success?: boolean;
  status_code?: number;
  status_message?: string;
}

// Adapted fetchTmdbApi for script usage
async function fetchTmdbApi<T>(endpoint: string, params: Record<string, string | number | boolean> = {}): Promise<T> {
  const url = new URL(`${TMDB_API_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY!);
  // Default params for script
  url.searchParams.append('language', 'en-US');

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      let errorData: TmdbErrorResponse | null = null;
      try {
        errorData = await response.json() as TmdbErrorResponse;
      } catch (parseError) {
        throw new Error(`TMDB API request failed with status ${response.status}: ${response.statusText}`);
      }
      throw new Error(`TMDB API Error (${errorData?.status_code || response.status}): ${errorData?.status_message || response.statusText}`);
    }

    return await response.json() as T;
  } catch (error) {
    console.error("Error fetching TMDB API:", error);
    throw error;
  }
}

interface TmdbMovieResult {
  id: number;
  title: string;
  original_title: string;
  overview: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string; // YYYY-MM-DD format
  // We might need to fetch full details later if needed
}

interface DiscoverMovieResponse {
  page: number;
  results: TmdbMovieResult[];
  total_pages: number;
  total_results: number;
}

// Fetches full details for a specific movie, including credits
interface CrewMember {
  job: string;
  name: string;
}

interface Credits {
  crew: CrewMember[];
}

interface MovieDetails {
  id: number;
  title: string;
  original_title: string;
  overview: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number | null;
  genres: { id: number; name: string }[];
  production_companies: { id: number; logo_path: string | null; name: string; origin_country: string }[];
  vote_average: number; // Add vote average
  credits: Credits; // Add credits structure
}

async function getFullMovieDetails(movieId: number): Promise<MovieDetails | null> {
  try {
    console.log(`Fetching full details and credits for movie ID: ${movieId}`);
    // Use append_to_response to fetch credits along with details
    const details = await fetchTmdbApi<MovieDetails>(`/movie/${movieId}`, { append_to_response: 'credits' });
    return details;
  } catch (error) {
    console.error(`Failed to fetch full details for movie ID ${movieId}:`, error);
    return null; // Return null if fetching fails for a single movie
  }
}

async function seedMovies() {
  console.log('Starting movie seeding process...');

  let allMovies: TmdbMovieResult[] = [];
  let currentPage = 1;
  let totalPages = 1;

  // Fetch all Ghibli movies using discover endpoint with company ID
  console.log(`Fetching movies from Studio Ghibli (ID: ${STUDIO_GHIBLI_ID})...`);
  try {
    do {
      const response = await fetchTmdbApi<DiscoverMovieResponse>('/discover/movie', {
        with_companies: STUDIO_GHIBLI_ID,
        page: currentPage,
        sort_by: 'release_date.asc' // Sort by release date
      });

      allMovies = allMovies.concat(response.results);
      totalPages = response.total_pages;
      console.log(`Fetched page ${currentPage} of ${totalPages}. Total movies found so far: ${allMovies.length}`);
      currentPage++;

      // Add a small delay to avoid hitting rate limits
      if (currentPage <= totalPages) {
         await new Promise(resolve => setTimeout(resolve, 250)); // 250ms delay
      }

    } while (currentPage <= totalPages);

    console.log(`Finished fetching. Found ${allMovies.length} movies.`);

  } catch (error) {
    console.error('Failed to fetch movies from TMDB:', error);
    return; // Stop seeding if initial fetch fails
  }

  // Process each movie and upsert into the database
  console.log('Upserting movies into the database...');
  let upsertedCount = 0;
  let failedCount = 0;

  for (const movie of allMovies) {
      // Fetch full details including credits
      const details = await getFullMovieDetails(movie.id);

      if (!details) {
          console.warn(`Skipping movie ID ${movie.id} (${movie.title}) due to missing details.`);
          failedCount++;
          // Add delay even if failed to fetch details
          await new Promise(resolve => setTimeout(resolve, 100));
          continue;
      }

      const year = details.release_date ? parseInt(details.release_date.substring(0, 4), 10) : 0;
      
      // Find the director from the credits crew
      const director = details.credits?.crew?.find(member => member.job === 'Director')?.name ?? null;
      if (!director) {
          console.warn(`Director not found for movie ID ${details.id} (${details.title})`);
      }

      // Construct full URLs
      const posterUrl = details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null;
      const backdropUrl = details.backdrop_path ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}` : null;

      try {
          // Build update data conditionally, omitting nulls
          const updateData: Prisma.MovieUpdateInput = {
            titleEn: details.title,
            titleJa: details.original_title,
            year: year,
            ...(director !== null && { director: director }),
            ...(details.runtime !== null && { duration: details.runtime }),
            ...(details.overview !== null && { synopsis: details.overview }),
            ...(posterUrl !== null && { posterUrl: posterUrl }),
            ...(backdropUrl !== null && { backdropUrl: backdropUrl }),
            ...(details.vote_average !== null && { voteAverage: details.vote_average }),
          };

          // Create data includes nulls explicitly, but use undefined for optional fields if null
          const createData: Prisma.MovieCreateInput = {
            tmdbId: details.id,
            titleEn: details.title,
            titleJa: details.original_title,
            year: year,
            director: director ?? undefined,
            duration: details.runtime ?? undefined,
            synopsis: details.overview ?? undefined,
            posterUrl: posterUrl ?? undefined,
            backdropUrl: backdropUrl ?? undefined,
            voteAverage: details.vote_average ?? undefined,
          };

          await prisma.movie.upsert({
              where: { tmdbId: details.id },
              update: updateData,
              create: createData,
          });
          console.log(`Upserted: ${details.title} (ID: ${details.id}), Director: ${director || 'N/A'}, Rating: ${createData.voteAverage ?? 'N/A'}`);
          upsertedCount++;
      } catch (dbError) {
          console.error(`Failed to upsert movie ID ${details.id} (${details.title}):`, dbError);
          failedCount++;
      }
      // Add delay between each movie upsert
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
  }

  console.log(`Seeding finished. ${upsertedCount} movies upserted, ${failedCount} failed.`);
}

seedMovies()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
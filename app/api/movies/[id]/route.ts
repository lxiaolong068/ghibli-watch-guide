import { NextRequest, NextResponse } from 'next/server';
import { getMovieDetails, getMovieWatchProviders } from '@/lib/tmdb';
import { prisma } from '@/lib/prisma'; // Import the shared prisma instance
import { Prisma } from '@prisma/client';

// 将此路由标记为动态路由，防止在构建时静态生成
export const dynamic = 'force-dynamic';

// Define the arguments for the findUnique query using Prisma.validator
// This helps derive the correct payload type including selected fields.
const movieArgs = Prisma.validator<Prisma.MovieFindUniqueArgs>()({
  where: { id: '' }, // Add dummy where for validator type check
  select: { 
    tmdbId: true, 
    titleEn: true, 
  },
});

// Generate the exact payload type based on the arguments (specifically the select part)
type MovieWithTmdbId = Prisma.MovieGetPayload<typeof movieArgs>;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const movieCuid = params.id;
  let movieFromDb: MovieWithTmdbId | null = null;

  if (!movieCuid) {
    return NextResponse.json({ error: 'Movie ID (CUID) is required' }, { status: 400 });
  }

  try {
    // 1. Fetch movie from DB using CUID to get the tmdbId
    movieFromDb = await prisma.movie.findUnique({
      where: { id: movieCuid },
      select: movieArgs.select,
    });

    if (!movieFromDb) {
      console.log(`API route: Movie with CUID ${movieCuid} not found in database.`);
      return NextResponse.json({ error: 'Movie not found in database' }, { status: 404 });
    }

    if (typeof movieFromDb.tmdbId !== 'number') {
      console.error(`API route: Invalid tmdbId type for movie CUID ${movieCuid} (${movieFromDb.titleEn}). Expected number.`);
      return NextResponse.json({ error: 'Movie found but has invalid TMDB ID type' }, { status: 500 });
    }

    const tmdbId = movieFromDb.tmdbId;

    console.log(`API route received request for CUID ${movieCuid}, found TMDB ID: ${tmdbId} (${movieFromDb.titleEn})`);

    // 2. Fetch data from TMDB using the tmdbId
    const [movieDetails, watchProvidersResponse] = await Promise.all([
      getMovieDetails(tmdbId),
      getMovieWatchProviders(tmdbId)
    ]);

    console.log(`API route successfully fetched details and providers for TMDB ID: ${tmdbId}`);

    // 组合数据
    const combinedData = {
      ...movieDetails,
      watchProviders: watchProvidersResponse.results
    };

    return NextResponse.json(combinedData);
  } catch (error: unknown) {
    console.error(`API route error processing request for CUID ${movieCuid}:`, error);
    let statusCode = 500;
    let errorMessage = 'Internal Server Error';

    if (error instanceof Error) {
        errorMessage = error.message;
        const match = error.message.match(/TMDB API Error \((\d+)\)/);
        if (match && match[1]) {
            const tmdbStatusCode = parseInt(match[1], 10);
            if (tmdbStatusCode === 404) {
                statusCode = 404;
                const fetchedTmdbId = movieFromDb?.tmdbId ?? 'unknown';
                errorMessage = `Movie (TMDB ID: ${fetchedTmdbId}) not found on TMDB`;
            } else if (tmdbStatusCode === 401) {
                statusCode = 401;
                errorMessage = 'Invalid TMDB API Key or access denied';
            } else {
                statusCode = 502;
                errorMessage = `TMDB API error: ${error.message}`;
            }
        } else if (error.message.includes('fetch failed')) {
            statusCode = 503;
            errorMessage = 'Failed to connect to TMDB API';
        } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.error('Prisma Error Code:', error.code);
            errorMessage = `Database Error: ${error.message}`;
        }
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  } finally {
    // Don't disconnect the shared instance here, handle it globally or let Prisma manage
    // await prisma.$disconnect(); 
  }
} 
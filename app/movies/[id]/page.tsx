import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Script from 'next/script';
import { cache } from 'react'; // Import React's cache function
import type { MovieDetails, WatchProviderResults, MovieWatchProvidersResponse } from '@/lib/tmdb'; // Import types from tmdb
import { PrismaClient, Prisma } from '@prisma/client'; // Import Prisma
import { getMovieDetails, getMovieWatchProviders } from '@/lib/tmdb'; // Import TMDB fetch functions
import { getAllRegions } from '@/app/actions/availability'; // Import region retrieval function
import { AvailabilitySection } from '@/app/components/movies/AvailabilitySection'; // Import availability information component
import { RegionSelector } from '@/app/components/movies/RegionSelector'; // Import region selector component

// Singleton pattern for Prisma client
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Define Prisma types for reuse
const movieArgs = Prisma.validator<Prisma.MovieFindUniqueArgs>()({
  where: { id: '' }, // Required where field (actual value will be replaced at runtime)
  select: { 
    tmdbId: true, 
    titleEn: true, 
  },
});
type MovieWithTmdbId = Prisma.MovieGetPayload<typeof movieArgs>;

// Combined type for the page data
interface MoviePageData {
  details: MovieDetails;
  providers: WatchProviderResults;
}

// Set as dynamic route, not statically generated at build time
export const dynamic = 'force-dynamic';

interface MoviePageProps {
  params: {
    id: string; // Database CUID
  };
  searchParams: {
    region?: string; // Region code query parameter
  };
}

// Helper function to fetch all necessary data directly
// Use React.cache to wrap data fetching function, ensuring it's only executed once per request
const getMoviePageData = cache(async (movieCuid: string): Promise<MoviePageData | null> => {
  console.log(`[CACHED] Fetching movie data for CUID: ${movieCuid}`);
  
  let movieFromDb: MovieWithTmdbId | null = null;
  try {
    // 1. Fetch movie from DB using CUID to get the tmdbId
    movieFromDb = await prisma.movie.findUnique({
      where: { id: movieCuid },
      select: movieArgs.select, 
    });

    if (!movieFromDb) {
      console.log(`MoviePage: Movie with CUID ${movieCuid} not found in database.`);
      return null; // Indicate not found
    }

    if (typeof movieFromDb.tmdbId !== 'number') {
      console.error(`MoviePage: Missing or invalid tmdbId for movie CUID ${movieCuid} (${movieFromDb.titleEn}).`);
      return null; 
    }

    const tmdbId = movieFromDb.tmdbId; 

    console.log(`MoviePage: Fetching TMDB data for CUID ${movieCuid}, TMDB ID: ${tmdbId}`);

    // 2. Fetch data from TMDB using the tmdbId (will use cache from lib/tmdb)
    // Use Promise.all instead of allSettled for better performance - we'll handle errors in catch block
    const [movieDetails, watchProvidersResponse] = await Promise.all([
      getMovieDetails(tmdbId),
      getMovieWatchProviders(tmdbId)
    ]);

    // Prepare the result with successful API calls
    const pageData: MoviePageData = {
      details: movieDetails,
      providers: watchProvidersResponse.results || {},
    };

    return pageData;

  } catch (error) {
    console.error(`Error in getMoviePageData for CUID ${movieCuid}:`, error);
    return null; // Return null on error
  }
});

// Dynamic page metadata generation
export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const { id } = params; // Database CUID
  const pageData = await getMoviePageData(id);

  if (!pageData || !pageData.details) { // Check if essential data is available
    return {
      title: 'Movie Not Found | Where to Watch Studio Ghibli Movies',
    };
  }

  const movie = pageData.details; // Use the details part

  return {
    title: `${movie.title} | Where to Watch Studio Ghibli Movies`, 
    description: `Find where to watch ${movie.title} online. Updated streaming availability on Netflix, Max, and other platforms for ${movie.title}.`,
    openGraph: {
      title: `${movie.title} - Where to Watch`,
      description: `Find where to watch ${movie.title} online. Streaming info for Netflix, Max, etc.`,
      images: movie.poster_path ? [`https://image.tmdb.org/t/p/w500${movie.poster_path}`] : [],
    },
  };
}

// Skeleton component - Used to display loading state
const MovieSkeleton = () => (
  <div className="max-w-5xl mx-auto animate-pulse">
    <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
      <div className="md:flex">
        <div className="md:w-1/3 lg:w-1/4">
          <div className="bg-gray-300 h-64 md:h-96"></div>
        </div>
        <div className="md:w-2/3 lg:w-3/4 p-6 md:p-8">
          <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="flex gap-2 mb-6">
            <div className="h-6 bg-gray-300 rounded-full w-16"></div>
            <div className="h-6 bg-gray-300 rounded-full w-16"></div>
          </div>
          <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-5/6 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
      <div className="h-6 bg-gray-300 rounded w-1/3 mb-6"></div>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <div className="h-5 bg-gray-300 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-gray-300 rounded-md mr-3"></div>
              <div className="h-4 bg-gray-300 rounded w-24"></div>
            </div>
            <div className="flex items-center">
              <div className="h-10 w-10 bg-gray-300 rounded-md mr-3"></div>
              <div className="h-4 bg-gray-300 rounded w-32"></div>
            </div>
          </div>
        </div>
        <div>
          <div className="h-5 bg-gray-300 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-gray-300 rounded-md mr-3"></div>
              <div className="h-4 bg-gray-300 rounded w-28"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Helper component to render a list of providers for a specific type (flatrate, buy, rent)
const ProviderList = ({ title, providers, countryLink }: { title: string; providers: any[] | undefined; countryLink?: string }) => {
  if (!providers || providers.length === 0) {
    return null;
  }

  // Construct TMDB image URL: https://developer.themoviedb.org/docs/image-basics
  const getImageUrl = (path: string | null) => path ? `https://image.tmdb.org/t/p/w92${path}` : '/placeholder-logo.png'; // Adjust placeholder

  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
      <ul className="space-y-2">
        {providers.map(provider => (
          <li key={provider.provider_id} className="flex items-center space-x-3">
            <Image
              src={getImageUrl(provider.logo_path)}
              alt={`${provider.provider_name} logo`}
              width={40} // Adjust size as needed
              height={40}
              className="rounded-md object-contain"
            />
            <span className="text-gray-700">{provider.provider_name}</span>
            {countryLink && ( // Optionally add a link to the platform in that country
              <a
                href={countryLink}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                Visit →
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default async function MoviePage({ params, searchParams }: MoviePageProps) {
  const { id } = params;
  const regionCode = searchParams.region; // Get region code
  
  // Get movie data and region list
  const [pageData, regions] = await Promise.all([
    getMoviePageData(id),
    getAllRegions()
  ]);

  // If no data is returned, show not found page
  if (!pageData || !pageData.details) {
    notFound();
  }

  const { details: movie, providers: watchProviders } = pageData;
  
  // Format and compute derivative values
  const runtimeStr = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : 'N/A';
  const year = movie.release_date?.substring(0, 4) || 'N/A';
  const imdbLink = movie.imdb_id ? `https://www.imdb.com/title/${movie.imdb_id}` : null;

  // Construct image URLs only if paths exist
  const posterUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null;
  const backdropUrl = movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null;

  // Select default region
  const countryCodes = Object.keys(watchProviders);
  const defaultRegion = countryCodes.length > 0 ? countryCodes[0] : 'US'; // TMDB uses US region by default
  
  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Movie Detail Card */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="relative">
          {backdropUrl && (
            <div className="absolute inset-0">
              <Image
                src={backdropUrl}
                alt={`${movie.title} backdrop`}
                layout="fill"
                objectFit="cover"
                className="opacity-20"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white"></div>
            </div>
          )}

          <div className="md:flex relative z-10">
            <div className="md:w-1/3 lg:w-1/4 p-4">
              {posterUrl ? (
                <Image
                  src={posterUrl}
                  alt={`${movie.title} poster`}
                  width={300}
                  height={450}
                  className="w-full h-auto rounded-md shadow-lg"
                  priority
                />
              ) : (
                <div className="aspect-[2/3] bg-gray-200 rounded-md flex items-center justify-center">
                  <span className="text-gray-400">No poster available</span>
                </div>
              )}
            </div>

            <div className="md:w-2/3 lg:w-3/4 p-6 md:p-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {movie.title}
                {movie.original_title && movie.original_title !== movie.title && (
                  <span className="ml-2 text-lg md:text-xl font-normal text-gray-500">
                    ({movie.original_title})
                  </span>
                )}
              </h1>

              <div className="text-gray-500 mb-4">
                {year} • {runtimeStr}
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genres?.map(genre => (
                  <span
                    key={genre.id}
                    className="inline-flex items-center rounded-full bg-blue-100 px-3 py-0.5 text-sm font-medium text-blue-800"
                  >
                    {genre.name}
                  </span>
                ))}
                
                {movie.vote_average && (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800">
                    ★ {movie.vote_average.toFixed(1)}/10
                  </span>
                )}
              </div>

              <div className="text-gray-700 mb-6">
                {movie.overview || 'No overview available.'}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-900">Director:</span>{' '}
                  {movie.credits?.crew?.find(person => person.job === 'Director')?.name || 'N/A'}
                </div>
                <div>
                  <span className="font-medium text-gray-900">Release Date:</span>{' '}
                  {movie.release_date || 'N/A'}
                </div>
                {imdbLink && (
                  <div>
                    <a
                      href={imdbLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View on IMDb →
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Region Selector */}
      <div className="mb-4">
        <RegionSelector 
          regions={regions} 
          defaultRegionCode={defaultRegion}
        />
      </div>

      {/* Movie Availability Information */}
      <AvailabilitySection 
        movieId={id}
        selectedRegionCode={regionCode}
      />

      {/* Watch Information from TMDB */}
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Watch Information from TMDB</h2>

        {Object.keys(watchProviders).length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {Object.entries(watchProviders).map(([countryCode, countryData]) => {
              // Skip if no useful data
              if (!countryData || (!countryData.flatrate && !countryData.buy && !countryData.rent)) {
                return null;
              }

              // Standardize country display
              const countryName = new Intl.DisplayNames(['en'], { type: 'region' }).of(countryCode) || countryCode;
              
              return (
                <div key={countryCode} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-lg mb-4">{countryName}</h3>
                  
                  {countryData.link && (
                    <div className="mb-2">
                      <a
                        href={countryData.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View full information on TMDB →
                      </a>
                    </div>
                  )}
                  
                  <ProviderList title="Subscription Streaming" providers={countryData.flatrate} countryLink={countryData.link} />
                  <ProviderList title="Buy" providers={countryData.buy} countryLink={countryData.link} />
                  <ProviderList title="Rent" providers={countryData.rent} countryLink={countryData.link} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            No watching information available on TMDB.
          </div>
        )}
      </div>

      {/* Special Note for Grave of the Fireflies */}
      {(movie.title === 'Grave of the Fireflies' || movie.original_title === '火垂るの墓') && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                <strong>Special Note:</strong> "Grave of the Fireflies" is distributed by Toho Co., Ltd., not Studio Ghibli. This may result in different streaming availability compared to other Ghibli films in some regions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Data Source Attribution */}
      <div className="mt-8 text-sm text-gray-500 text-center">
        <p>Movie information provided by TMDB (The Movie Database)</p>
        <div className="mt-2">
          <a 
            href={`https://www.themoviedb.org/movie/${movie.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <img
              src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
              alt="TMDB Logo"
              width={120}
              height={17}
              style={{ height: '17px', width: 'auto' }}
            />
          </a>
        </div>
      </div>
      
      {/* TMDB Attribution Script */}
      <Script id="tmdb-attribution" strategy="afterInteractive">
        {`document.querySelectorAll("img").forEach(img => img.onload = () => { window.dispatchEvent(new Event('resize')); });`}
      </Script>
    </div>
  );
} 
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Script from 'next/script';
import { cache } from 'react'; // 导入React的cache函数
import type { MovieDetails, WatchProviderResults, MovieWatchProvidersResponse } from '@/lib/tmdb'; // Import types from tmdb
import { PrismaClient, Prisma } from '@prisma/client'; // Import Prisma
import { getMovieDetails, getMovieWatchProviders } from '@/lib/tmdb'; // Import TMDB fetch functions

// 单例模式处理Prisma客户端
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Define Prisma types for reuse
const movieArgs = Prisma.validator<Prisma.MovieFindUniqueArgs>()({
  where: { id: '' }, // 添加必需的where字段（实际值在运行时会被替换）
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

// 设置为动态路由，不在构建时静态生成
export const dynamic = 'force-dynamic';

interface MoviePageProps {
  params: {
    id: string; // Database CUID
  };
}

// Helper function to fetch all necessary data directly
// 使用React.cache包装数据获取函数，确保同一请求只执行一次
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

// 动态生成页面的元数据
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

// 骨架屏组件 - 用于显示加载状态
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
                className="ml-auto text-sm text-indigo-600 hover:text-indigo-800"
                aria-label={`Watch on ${provider.provider_name}`} // Better accessibility
              >
                Visit Site
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = params; // Database CUID
  
  // 使用缓存的数据获取函数
  const pageData = await getMoviePageData(id);

  if (!pageData || !pageData.details) { // Check if essential data is available
    notFound();
  }

  const movie = pageData.details; // Use fetched details
  const watchProviders = pageData.providers; // Use fetched providers

  // 构建结构化数据 - Use data from fetched details
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: movie.title,
    alternateName: movie.original_title,
    director: movie.production_companies?.length > 0 ? { 
        '@type': 'Organization',
        name: movie.production_companies[0].name 
    } : undefined, 
    description: movie.overview,
    image: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined,
    datePublished: movie.release_date,
    duration: movie.runtime ? `PT${movie.runtime}M` : undefined,
  };

  // Decide which country's providers to show.
  const countryCodeToShow = 'US';
  // Access providers using the fetched watchProviders data
  const providersForCountry = watchProviders?.[countryCodeToShow]; 
  const countryLink = providersForCountry?.link;

  return (
    <>
      <Script id="movie-structured-data" type="application/ld+json">
        {JSON.stringify(Object.fromEntries(Object.entries(structuredData).filter(([, v]) => v !== undefined)))}
      </Script>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* 电影详情面板 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="md:flex">
              {/* 电影海报 - Use backdrop_path or poster_path from details */}
              {(movie.backdrop_path || movie.poster_path) && (
                <div className="md:w-1/3 lg:w-1/4">
                  <div className="relative h-64 md:h-full aspect-w-2 aspect-h-3"> 
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path || movie.backdrop_path}`} 
                      alt={`${movie.title} poster`}
                      fill 
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
              )}

              {/* 电影信息 - Use data from details */}
              <div className="md:w-2/3 lg:w-3/4 p-6 md:p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2" id="movie-title">
                  {movie.title}
                </h1>
                <p className="text-sm text-gray-500 mb-4">
                  <time dateTime={movie.release_date}>{new Date(movie.release_date).getFullYear()}</time>
                   {movie.runtime && ` · ${movie.runtime} min`} 
                </p>

                {/* Display Genres */}
                {movie.genres && movie.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {movie.genres.map(genre => (
                       <span key={genre.id} className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                         {genre.name}
                       </span>
                    ))}
                  </div>
                )}

                <div className="prose max-w-none mb-6">
                  <h2 className="text-xl font-semibold mb-2">Overview</h2>
                  <p className="text-gray-600">{movie.overview || 'No overview available.'}</p>
                </div>

                {/* Additional Details */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
                   <div>
                     <h3 className="font-medium text-gray-500">Original Title</h3>
                     <p className="mt-1 text-gray-900">{movie.original_title}</p>
                   </div>
                   {/* Production Companies */}
                   {movie.production_companies && movie.production_companies.length > 0 && (
                     <div>
                       <h3 className="font-medium text-gray-500">Production</h3>
                       <p className="mt-1 text-gray-900">{movie.production_companies.map(c => c.name).join(', ')}</p>
                     </div>
                   )}
                 </div>
              </div>
            </div>
          </div>

          {/* 观看选项面板 - Use providersForCountry derived from watchProviders */}
          {providersForCountry && (Object.keys(providersForCountry).length > 1 || providersForCountry.link) && (
            <section className="bg-white rounded-lg shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6" id="watch-options">
                  Where to Watch in {countryCodeToShow} 
                  {countryLink && (
                     <a href={countryLink} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:text-indigo-800 ml-2 font-normal">
                         (See on JustWatch) 
                     </a>
                  )}
              </h2>

              <div className="grid gap-6 md:grid-cols-2">
                <ProviderList title="Streaming (Subscription)" providers={providersForCountry.flatrate} countryLink={countryLink} />
                <ProviderList title="Rent" providers={providersForCountry.rent} countryLink={countryLink}/>
                <ProviderList title="Buy" providers={providersForCountry.buy} countryLink={countryLink}/>
                <ProviderList title="Streaming (Free with Ads)" providers={providersForCountry.ads} countryLink={countryLink}/>
              </div>
               <p className="text-xs text-gray-500 mt-4">Provider information courtesy of The Movie Database (TMDB).</p>
            </section>
          )}
           {/* Case where no providers are found for the selected country */}
           {!providersForCountry && watchProviders && Object.keys(watchProviders).length > 0 && (
               <section className="bg-white rounded-lg shadow-lg p-6 md:p-8 text-center">
                   <h2 className="text-xl font-semibold text-gray-700 mb-4">Watch Options Not Found</h2>
                   <p className="text-gray-500">We couldn't find watch options for {movie.title} in {countryCodeToShow}. Availability may vary by region.</p>
               </section>
           )}

        </div>
      </main>
    </>
  );
} 
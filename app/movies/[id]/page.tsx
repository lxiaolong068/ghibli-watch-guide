import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Script from 'next/script';
import { cache } from 'react'; // Import React's cache function
import type { MovieDetails, WatchProviderResults, WatchProviderItem } from '@/lib/tmdb'; // Import types from tmdb
import { PrismaClient, Prisma } from '../../../prisma/generated/client'; // Import Prisma
import { getMovieDetails, getMovieWatchProviders } from '@/lib/tmdb'; // Import TMDB fetch functions
import { getAllRegions } from '@/app/actions/availability'; // Import region retrieval function
import { RegionSelector } from '@/app/components/movies/RegionSelector'; // Import region selector component
import { SEOOptimizer, ResponsiveAdSenseAd, InArticleAdSenseAd } from '@/app/components/SEOOptimizer';
import { MovieReviewSection } from '@/app/components/movies/MovieReviewSection';
import { CharacterSection } from '@/app/components/movies/CharacterSection';
import { RelatedMoviesSection } from '@/app/components/movies/RelatedMoviesSection';
import { MovieStatsTracker } from '@/app/components/movies/MovieStatsTracker';
import { UserBehaviorTracker } from '@/app/components/analytics/UserBehaviorTracker';
import { MovieDetailRecommendations } from '@/app/components/recommendations/HomeRecommendations';

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
type _MovieWithTmdbId = Prisma.MovieGetPayload<typeof movieArgs>;

// Combined type for the page data
interface MoviePageData {
  details: MovieDetails;
  providers: WatchProviderResults;
}

// Use longer revalidation time as movie details don't change frequently
export const revalidate = 43200; // 12 hours revalidation

interface MoviePageProps {
  params: {
    id: string; // Database CUID
  };
  searchParams: {
    region?: string; // Region code query parameter
  };
}

/**
 * Cached function to get movie page data
 * Uses React.cache to ensure data is fetched only once per request
 */
const getMoviePageData = cache(async (movieCuid: string): Promise<MoviePageData | null> => {
  // Only output detailed logs in development environment
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[MoviePage] Getting movie data, CUID: ${movieCuid}`);
  }
  
  try {
    // 1. Get movie's TMDB ID from database
    const movieFromDb = await prisma.movie.findUnique({
      where: { id: movieCuid },
      select: movieArgs.select, 
    });

    // If movie doesn't exist in database, return null
    if (!movieFromDb) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[MoviePage] Movie with CUID ${movieCuid} not found in database`);  
      }
      return null;
    }

    // Validate TMDB ID is valid
    if (typeof movieFromDb.tmdbId !== 'number') {
      console.error(`[MoviePage] Movie CUID ${movieCuid} (${movieFromDb.titleEn}) has missing or invalid tmdbId`);  
      return null; 
    }

    const tmdbId = movieFromDb.tmdbId;
    
    // 2. Get movie details and watch providers in parallel with different cache strategies
    // Movie details cache longer, watch provider info caches shorter
    const [movieDetails, watchProvidersResponse] = await Promise.all([
      getMovieDetails(tmdbId, { cache: 86400 }), // Movie details cache for one day
      getMovieWatchProviders(tmdbId, { cache: 3600 }) // Provider info cache for one hour
    ]);

    // Build page data object
    return {
      details: movieDetails,
      providers: watchProvidersResponse.results || {},
    };

  } catch (error) {
    // Log error, but don't output full error object in production
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[MoviePage] Error fetching data for CUID ${movieCuid}: ${errorMessage}`);
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

// Helper component to render a list of providers for a specific type (flatrate, buy, rent)
const ProviderList = ({ title, providers, countryLink }: { title: string; providers: WatchProviderItem[] | undefined; countryLink?: string }) => {
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

  // Select default region - Improved logic to prioritize major markets
  const countryCodes = Object.keys(watchProviders);
  // Prioritized regions - adjust as needed
  const priorityRegions = ['US', 'GB', 'CA', 'AU', 'JP', 'KR', 'FR', 'DE', 'IT', 'ES'];
  
  // Find the first available priority region
  let defaultRegion = 'US'; // Fallback
  for (const region of priorityRegions) {
    if (countryCodes.includes(region) && watchProviders[region] && 
        (watchProviders[region].flatrate || watchProviders[region].buy || watchProviders[region].rent)) {
      defaultRegion = region;
      break;
    }
  }
  
  // If no priority region has data, use first available region with data
  if (!watchProviders[defaultRegion] && countryCodes.length > 0) {
    for (const region of countryCodes) {
      if (watchProviders[region] && 
          (watchProviders[region].flatrate || watchProviders[region].buy || watchProviders[region].rent)) {
        defaultRegion = region;
        break;
      }
    }
  }
  
  return (
    <>
      {/* SEO optimization component */}
      <SEOOptimizer
        title={`${movie.title} | Where to Watch Studio Ghibli Movies`}
        description={`Watch ${movie.title} online. Find streaming options for this ${movie.release_date?.substring(0, 4) || 'N/A'} Studio Ghibli film on Netflix, Disney+, and more platforms.`}
        keywords={[movie.title, movie.original_title, 'watch online', 'streaming', 'studio ghibli']}
        canonicalUrl={`https://www.whereghibli.cc/movies/${id}`}
        ogImage={posterUrl || undefined}
        movieData={movie}
      />

      {/* User behavior tracking */}
      <UserBehaviorTracker pageType="movie" movieId={id} />

      {/* Page view statistics */}
      <MovieStatsTracker movieId={id} />

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
                  {movie.credits?.crew?.find((person: { job?: string; name?: string }) => person.job === 'Director')?.name || 'N/A'}
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

      {/* Watch Information from TMDB - FILTERED by selected region */}
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Where to Watch</h2>

        {(() => {
          // Handle "Global" option (regionCode is empty string)
          if (regionCode === '') {
            // Show watch options for all regions
            return (
              <div className="grid gap-6 md:grid-cols-2">
                {Object.entries(watchProviders).map(([countryCode, countryData]) => {
                  // 跳过没有有用数据的地区
                  if (!countryData || (!countryData.flatrate && !countryData.buy && !countryData.rent)) {
                    return null;
                  }

                  // 标准化国家显示
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
            );
          } else {
            // 单个地区的筛选逻辑保持不变
            const currentRegionCode = regionCode || defaultRegion;
            const providersForSelectedRegion = watchProviders[currentRegionCode];
            const countryName = new Intl.DisplayNames(['en'], { type: 'region' }).of(currentRegionCode) || currentRegionCode;

            if (providersForSelectedRegion && (providersForSelectedRegion.flatrate || providersForSelectedRegion.buy || providersForSelectedRegion.rent)) {
              return (
                <div>
                  {/* Optionally display the region name if needed */}
                  {/* <h3 className="font-medium text-lg mb-4">{countryName}</h3> */}
                  
                  {providersForSelectedRegion.link && (
                    <div className="mb-4"> {/* Increased spacing */}
                      <a
                        href={providersForSelectedRegion.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View full information on TMDB for {countryName} →
                      </a>
                    </div>
                  )}
                  
                  {/* Wrap ProviderLists in a container for better structure if needed, e.g., grid */}
                  <div className="space-y-4"> 
                    <ProviderList title="Subscription Streaming" providers={providersForSelectedRegion.flatrate} countryLink={providersForSelectedRegion.link} />
                    <ProviderList title="Buy" providers={providersForSelectedRegion.buy} countryLink={providersForSelectedRegion.link} />
                    <ProviderList title="Rent" providers={providersForSelectedRegion.rent} countryLink={providersForSelectedRegion.link} />
                  </div>
                </div>
              );
            } else {
              // 显示当前地区没有数据的提示
              return (
                <div className="text-center py-6 text-gray-500">
                  No viewing information found for {countryName} on TMDB.
                </div>
              );
            }
          }
        })()}
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
                <strong>Special Note:</strong> &quot;Grave of the Fireflies&quot; is distributed by Toho Co., Ltd., not Studio Ghibli. This may result in different streaming availability compared to other Ghibli films in some regions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 第一个广告位 - 观看信息后 */}
      <ResponsiveAdSenseAd adSlot="1234567890" />

      {/* 电影评论和分析部分 */}
      <MovieReviewSection movieId={id} />

      {/* 文章内广告 */}
      <InArticleAdSenseAd adSlot="2345678901" />

      {/* 角色介绍部分 */}
      <CharacterSection movieId={id} />

      {/* 智能推荐系统 */}
      <MovieDetailRecommendations movieId={id} />

      {/* 相关电影推荐 */}
      <RelatedMoviesSection currentMovieId={id} />

      {/* 第二个广告位 - 页面底部 */}
      <ResponsiveAdSenseAd adSlot="3456789012" />

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
            <Image
              src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
              alt="TMDB Logo"
              width={120}
              height={17}
            />
          </a>
        </div>
      </div>
      
      {/* 优化的TMDB Attribution Script - 使用现代Web API和性能最佳实践 */}
      <Script id="tmdb-attribution" strategy="afterInteractive">
        {`
        // 使用requestIdleCallback在浏览器空闲时执行非关键任务
        const runWhenIdle = (callback) => {
          if ('requestIdleCallback' in window) {
            window.requestIdleCallback(callback, { timeout: 2000 });
          } else {
            // 回退到setTimeout
            setTimeout(callback, 200);
          }
        };
        
        // 使用Intersection Observer API实现更高效的图片懒加载
        if ('IntersectionObserver' in window) {
          const imageObserverOptions = {
            rootMargin: '200px 0px', // 提前200px开始加载，提供更好的用户体验
            threshold: 0.01 // 当图片可见入1%时开始加载
          };
          
          const imgObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                  // 加载图片
                  const newSrc = img.dataset.src;
                  // 先移除属性以防止重复触发
                  img.removeAttribute('data-src');
                  // 在设置src前添加错误处理
                  img.onerror = () => {
                    img.src = '/img/placeholder.png'; // 回退到占位图像
                    img.classList.add('img-load-error');
                  };
                  img.src = newSrc;
                }
                observer.unobserve(img);
              }
            });
          }, imageObserverOptions);

          // 在浏览器空闲时初始化观察者
          runWhenIdle(() => {
            document.querySelectorAll('img[data-src]').forEach(img => {
              imgObserver.observe(img);
            });
          });
        }

        // 优化图片加载完成后的事件处理
        runWhenIdle(() => {
          const handleImageLoad = (img) => {
            if (img.complete) {
              // 使用passive事件监听器提高性能
              window.dispatchEvent(new Event('resize', { bubbles: true, cancelable: false }));
              img.classList.add('img-loaded');
            } else {
              img.addEventListener('load', () => {
                window.dispatchEvent(new Event('resize', { bubbles: true, cancelable: false }));
                img.classList.add('img-loaded');
              }, { passive: true, once: true });
            }
          };
          
          // 使用更高效的选择器
          document.querySelectorAll('img').forEach(handleImageLoad);
        });
        `}
      </Script>
      </div>
    </>
  );
}
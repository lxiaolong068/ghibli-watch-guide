import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getMovieById } from '@/app/actions/movies';
import type { Prisma } from '@prisma/client'; // Import Prisma namespace
import { unstable_cache } from 'next/cache'; // 导入缓存函数
import Script from 'next/script';

// 设置为动态路由，不在构建时静态生成
export const dynamic = 'force-dynamic';

interface MoviePageProps {
  params: {
    id: string;
  };
}

// Infer Availability type including relations
type AvailabilityWithRelations = Prisma.AvailabilityGetPayload<{
  include: { region: true; platform: true };
}>;

// 使用缓存包装电影详情获取
const getCachedMovieById = (id: string) => unstable_cache(
  async () => getMovieById(id),
  [`movie-${id}-cache`],
  { revalidate: 3600 } // 缓存1小时
)();

// 动态生成页面的元数据
export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const { id } = await Promise.resolve(params);
  const movie = await getCachedMovieById(id);
  
  if (!movie) {
    return {
      title: 'Movie Not Found | Where to Watch Studio Ghibli Movies',
    };
  }

  return {
    title: `${movie.titleEn} | Where to Watch Studio Ghibli Movies`,
    description: `Find where to watch ${movie.titleEn} online. Updated streaming availability on Netflix, Max, and other platforms for ${movie.titleEn}.`,
    openGraph: {
      title: `${movie.titleEn} - Where to Watch`,
      description: `Find where to watch ${movie.titleEn} online. Streaming info for Netflix, Max, etc.`,
      images: movie.posterUrl ? [movie.posterUrl] : [],
    },
  };
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await Promise.resolve(params);
  const movie = await getCachedMovieById(id);

  if (!movie) {
    notFound();
  }

  // 构建结构化数据
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: movie.titleEn,
    alternateName: movie.titleJa,
    director: {
      '@type': 'Person',
      name: movie.director
    },
    description: movie.synopsis,
    image: movie.posterUrl,
    datePublished: `${movie.year}`,
    duration: `PT${movie.duration}M`,
  };

  return (
    <>
      <Script id="movie-structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* 电影详情面板 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="md:flex">
              {/* 电影海报 */}
              {movie.posterUrl && (
                <div className="md:w-1/3 lg:w-1/4">
                  <div className="relative h-96 md:h-full">
                    <Image
                      src={movie.posterUrl}
                      alt={`${movie.titleEn} poster`}
                      width={400}
                      height={600}
                      className="object-cover h-full w-full" 
                      priority
                    />
                  </div>
                </div>
              )}
              
              {/* 电影信息 */}
              <div className="md:w-2/3 lg:w-3/4 p-6 md:p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2" id="movie-title">
                  {movie.titleEn}
                </h1>
                <p className="text-sm text-gray-500 mb-4">
                  <time dateTime={`${movie.year}`}>{movie.year}</time>
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    {movie.director}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    {movie.duration} min
                  </span>
                </div>
                
                <div className="prose max-w-none mb-6">
                  <p className="text-gray-600">{movie.synopsis}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <h2 className="text-sm font-medium text-gray-500">Director</h2>
                    <p className="mt-1 text-gray-900">{movie.director}</p>
                  </div>
                  <div>
                    <h2 className="text-sm font-medium text-gray-500">Duration</h2>
                    <p className="mt-1 text-gray-900">{movie.duration} minutes</p>
                  </div>
                  <div>
                    <h2 className="text-sm font-medium text-gray-500">Japanese Title</h2>
                    <p className="mt-1 text-gray-900">{movie.titleJa}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 观看选项面板 */}
          {movie.availabilities && movie.availabilities.length > 0 && (
            <section className="bg-white rounded-lg shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6" id="watch-options">Where to Watch {movie.titleEn}</h2>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {movie.availabilities.map((availability: AvailabilityWithRelations) => {
                  const platformUrl = availability.url || availability.platform?.website;
                  
                  return (
                    <div
                      key={availability.id}
                      className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col h-full">
                        <div className="mb-4">
                          <h3 className="font-medium text-lg text-gray-900">
                            {availability.region?.name}
                          </h3>
                          <p className="text-gray-600">
                            {availability.platform?.name}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-auto pt-4">
                          {availability.type === 'FREE' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Free
                            </span>
                          )}
                          {availability.type === 'SUBSCRIPTION' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Subscription
                            </span>
                          )}
                          
                          {platformUrl && (
                            <a
                              href={platformUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              aria-describedby="movie-title"
                            >
                              Watch Now
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
} 
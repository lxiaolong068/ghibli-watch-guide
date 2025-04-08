import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMovieById } from '@/app/actions/movies';
import type { Availability } from '@/app/types';

interface MoviePageProps {
  params: {
    id: string;
  };
}

// 动态生成页面的元数据
export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const { id } = await Promise.resolve(params);
  const movie = await getMovieById(id);
  
  if (!movie) {
    return {
      title: '电影未找到 | 吉卜力工作室观影指南',
    };
  }

  return {
    title: `${movie.titleZh || movie.titleEn} | 吉卜力工作室观影指南`,
    description: movie.synopsis,
    openGraph: {
      title: movie.titleZh || movie.titleEn,
      description: movie.synopsis,
      images: movie.posterUrl ? [movie.posterUrl] : [],
    },
  };
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await Promise.resolve(params);
  const movie = await getMovieById(id);

  if (!movie) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {movie.posterUrl && (
              <div className="md:flex-shrink-0">
                <img
                  src={movie.posterUrl}
                  alt={movie.titleZh || movie.titleEn}
                  className="h-48 w-full object-cover md:h-full md:w-48"
                />
              </div>
            )}
            <div className="p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {movie.titleZh || movie.titleEn}
              </h1>
              <p className="text-sm text-gray-500 mb-4">
                {movie.titleEn} ({movie.year})
              </p>
              <p className="text-gray-600 mb-6">{movie.synopsis}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h2 className="text-sm font-medium text-gray-500">导演</h2>
                  <p className="mt-1 text-gray-900">{movie.director}</p>
                </div>
                <div>
                  <h2 className="text-sm font-medium text-gray-500">时长</h2>
                  <p className="mt-1 text-gray-900">{movie.duration} 分钟</p>
                </div>
                <div>
                  <h2 className="text-sm font-medium text-gray-500">日文标题</h2>
                  <p className="mt-1 text-gray-900">{movie.titleJa}</p>
                </div>
              </div>

              {movie.availabilities && movie.availabilities.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">观看渠道</h2>
                  <div className="space-y-4">
                    {movie.availabilities.map((availability: Availability) => (
                      <div
                        key={availability.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {availability.region?.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {availability.platform?.name}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {availability.isFree && (
                              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                免费
                              </span>
                            )}
                            {availability.isSubscription && (
                              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                订阅
                              </span>
                            )}
                          </div>
                        </div>
                        {availability.url && (
                          <a
                            href={availability.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
                          >
                            访问链接
                            <span className="ml-1">→</span>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 
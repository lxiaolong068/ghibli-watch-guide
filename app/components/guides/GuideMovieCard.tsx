import Link from 'next/link';
import Image from 'next/image';
import { WatchGuideMovie } from '@/app/types';

interface GuideMovieCardProps {
  guideMovie: WatchGuideMovie;
  showOrder?: boolean;
  compact?: boolean;
}

export function GuideMovieCard({ guideMovie, showOrder = true, compact = false }: GuideMovieCardProps) {
  const { movie, order, notes } = guideMovie;

  if (compact) {
    return (
      <Link href={`/movies/${movie.id}`} className="group block">
        <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
          {/* 顺序号 */}
          {showOrder && (
            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
              {order}
            </div>
          )}
          
          {/* 电影海报 */}
          <div className="flex-shrink-0 w-12 h-16 rounded overflow-hidden">
            {movie.posterUrl ? (
              <Image
                src={movie.posterUrl}
                alt={`${movie.titleZh || movie.titleEn} 海报`}
                width={48}
                height={64}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7a1 1 0 01-1-1V5a1 1 0 011-1h4z" />
                </svg>
              </div>
            )}
          </div>
          
          {/* 电影信息 */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
              {movie.titleZh || movie.titleEn}
            </h3>
            <p className="text-sm text-gray-500">{movie.year}年</p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* 电影海报 */}
      <div className="aspect-[2/3] relative overflow-hidden">
        {movie.posterUrl ? (
          <Image
            src={movie.posterUrl}
            alt={`${movie.titleZh || movie.titleEn} 海报`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7a1 1 0 01-1-1V5a1 1 0 011-1h4z" />
            </svg>
          </div>
        )}
        
        {/* 顺序标签 */}
        {showOrder && (
          <div className="absolute top-2 left-2">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-lg">
              {order}
            </div>
          </div>
        )}
        
        {/* 评分标签 */}
        {movie.voteAverage && (
          <div className="absolute top-2 right-2">
            <div className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium">
              ⭐ {movie.voteAverage.toFixed(1)}
            </div>
          </div>
        )}
      </div>

      {/* 电影信息 */}
      <div className="p-4">
        <Link href={`/movies/${movie.id}`} className="block hover:text-blue-600 transition-colors">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
            {movie.titleZh || movie.titleEn}
          </h3>
          {movie.titleZh && movie.titleEn && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-1">{movie.titleEn}</p>
          )}
        </Link>
        
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <span>{movie.year}年</span>
          {movie.duration && (
            <>
              <span className="mx-2">•</span>
              <span>{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span>
            </>
          )}
        </div>
        
        {movie.synopsis && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-3">
            {movie.synopsis}
          </p>
        )}
        
        {notes && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <span className="font-medium">推荐理由:</span> {notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

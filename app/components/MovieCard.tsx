'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MoviePoster } from './OptimizedImage';
import { LoadingSpinner } from './LoadingSpinner';
import { TagGroup } from '@/app/components/ui/TagBadge';
import type { Movie, Tag } from '@/app/types';

// 扩展Movie类型以包含标签信息
interface MovieWithTags extends Movie {
  tags?: Tag[];
  tagsByCategory?: Record<string, Tag[]>;
}

interface MovieCardProps {
  movie: MovieWithTags;
  priority?: boolean;
  showYear?: boolean;
  showDirector?: boolean;
  showTags?: boolean;
  maxTags?: number;
  onTagClick?: (tag: Tag) => void;
  className?: string;
}

export function MovieCard({
  movie,
  priority = false,
  showYear = true,
  showDirector = true,
  showTags = true,
  maxTags = 3,
  onTagClick,
  className = ''
}: MovieCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
  };

  return (
    <div className={`group relative bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <LoadingSpinner size="md" text="Loading..." />
        </div>
      )}
      
      <Link 
        href={`/movies/${movie.id}`}
        onClick={handleClick}
        className="block"
        aria-label={`View details for ${movie.titleEn}`}
      >
        <div className="aspect-[2/3] relative overflow-hidden">
          <MoviePoster
            src={movie.posterUrl}
            title={movie.titleEn}
            size="md"
            priority={priority}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* 悬停时显示的覆盖层 */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-end">
            <div className="w-full p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <p className="text-sm font-medium">View Details</p>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {movie.titleEn}
          </h3>
          
          {movie.titleJa && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-1">
              {movie.titleJa}
            </p>
          )}
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            {showYear && (
              <span className="font-medium">{movie.year}</span>
            )}
            
            {showDirector && movie.director && (
              <span className="truncate ml-2">{movie.director}</span>
            )}
          </div>
          
          {movie.duration && (
            <div className="mt-2 text-xs text-gray-400">
              {movie.duration} minutes
            </div>
          )}

          {/* 标签显示 */}
          {showTags && movie.tags && movie.tags.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <TagGroup
                tags={movie.tags.slice(0, maxTags)}
                size="sm"
                variant="default"
                clickable={!!onTagClick}
                onTagClick={onTagClick}
                className="justify-start"
              />
              {movie.tags.length > maxTags && (
                <span className="inline-block mt-1 text-xs text-gray-500">
                  +{movie.tags.length - maxTags} 更多
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}

// 电影卡片骨架加载组件
export function MovieCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden animate-pulse ${className}`}>
      <div className="aspect-[2/3] bg-gray-300"></div>
      <div className="p-4">
        <div className="h-5 bg-gray-300 rounded mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="flex justify-between">
          <div className="h-3 bg-gray-300 rounded w-12"></div>
          <div className="h-3 bg-gray-300 rounded w-20"></div>
        </div>
        <div className="h-3 bg-gray-300 rounded w-16 mt-2"></div>
      </div>
    </div>
  );
}

// 电影网格组件
export function MovieGrid({
  movies,
  isLoading = false,
  showTags = true,
  onTagClick,
  className = ''
}: {
  movies: MovieWithTags[];
  isLoading?: boolean;
  showTags?: boolean;
  onTagClick?: (tag: Tag) => void;
  className?: string;
}) {
  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ${className}`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <MovieCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No movies found</div>
        <p className="text-gray-400">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ${className}`}>
      {movies.map((movie, index) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          priority={index < 4} // 前4个电影优先加载
          showTags={showTags}
          onTagClick={onTagClick}
        />
      ))}
    </div>
  );
}

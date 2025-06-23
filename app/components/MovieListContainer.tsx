'use client';

import { useState } from 'react';
import type { Movie } from '@/app/types';
import { MovieGrid } from './MovieCard';
import { PaginationControls } from './PaginationControls';

interface MovieListContainerProps {
  initialMovies: Movie[];
  totalMovies: number;
  currentPage: number;
  pageSize: number;
}

export function MovieListContainer({
  initialMovies,
  totalMovies,
  currentPage,
  pageSize,
}: MovieListContainerProps) {
  const [isLoading, _setIsLoading] = useState(false);

  return (
    <div className="space-y-8">
      {/* 电影统计信息 */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing {initialMovies.length} of {totalMovies} movies
        </p>
        <div className="text-sm text-gray-500">
          Page {currentPage} of {Math.ceil(totalMovies / pageSize)}
        </div>
      </div>

      {/* 电影网格 */}
      <MovieGrid movies={initialMovies} isLoading={isLoading} />

      {/* 分页控件 */}
      <PaginationControls
        totalItems={totalMovies}
        currentPage={currentPage}
        pageSize={pageSize}
      />
    </div>
  );
}
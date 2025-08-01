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
      {/* Movie statistics */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing {initialMovies.length} of {totalMovies} movies
        </p>
        <div className="text-sm text-gray-500">
          Page {currentPage} of {Math.ceil(totalMovies / pageSize)}
        </div>
      </div>

      {/* Movie grid */}
      <MovieGrid movies={initialMovies} isLoading={isLoading} />

      {/* Pagination controls */}
      <PaginationControls
        totalItems={totalMovies}
        currentPage={currentPage}
        pageSize={pageSize}
      />
    </div>
  );
}
'use client';

import type { Movie } from '@prisma/client';
import { MovieList } from './MovieList';
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

  return (
    <div className="space-y-6">
      <MovieList movies={initialMovies} />
      
      <PaginationControls
        totalItems={totalMovies}
        currentPage={currentPage}
        pageSize={pageSize}
      />
    </div>
  );
}
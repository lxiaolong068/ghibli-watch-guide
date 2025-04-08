'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Movie } from '@/app/types';

interface MovieListProps {
  movies: Movie[];
}

export function MovieList({ movies }: MovieListProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-medium text-gray-900">电影列表</h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {movies.map((movie) => (
            <Link
              key={movie.id}
              href={`/movies/${movie.id}`}
              className={`relative flex flex-col overflow-hidden rounded-lg border transition-all duration-200 ease-in-out ${
                hoveredId === movie.id
                  ? 'border-primary-500 shadow-lg transform -translate-y-1'
                  : 'border-gray-200 hover:border-primary-300'
              }`}
              onMouseEnter={() => setHoveredId(movie.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {movie.posterUrl && (
                <div className="aspect-h-3 aspect-w-2 relative overflow-hidden">
                  <img
                    src={movie.posterUrl}
                    alt={movie.titleZh || movie.titleEn}
                    className="h-full w-full object-cover object-center transition-transform duration-200 ease-in-out hover:scale-105"
                  />
                  {hoveredId === movie.id && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <span className="text-white text-sm font-medium px-4 py-2 rounded-full bg-primary-500">
                        查看详情
                      </span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex flex-1 flex-col p-4">
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600">
                  {movie.titleZh || movie.titleEn}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {movie.titleEn} ({movie.year})
                </p>
                <p className="mt-2 text-sm text-gray-500 line-clamp-3">
                  {movie.synopsis}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    {movie.director}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    {movie.duration} 分钟
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
} 
import React from 'react';

export default function MoviesLoading() {
  return (
    <main className="container mx-auto px-4 py-8 animate-pulse">
      <div className="mb-8 text-center">
        <div className="h-10 bg-gray-200 rounded max-w-md mx-auto mb-4"></div>
        <div className="h-6 bg-gray-200 rounded max-w-xl mx-auto"></div>
      </div>
      
      {/* Movie list skeleton */}
      <section className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="h-7 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Generate 12 skeleton movie cards */}
            {[...Array(12)].map((_, index) => (
              <div
                key={index}
                className="relative flex flex-col overflow-hidden rounded-lg border border-gray-200"
              >
                <div className="aspect-h-3 aspect-w-2 bg-gray-200"></div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="h-7 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-5 bg-gray-200 rounded w-16"></div>
                    <div className="h-5 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Pagination skeleton */}
      <div className="mt-6 flex justify-center">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 bg-gray-200 rounded"></div>
          <div className="h-10 w-10 bg-gray-200 rounded"></div>
          <div className="h-10 w-10 bg-gray-200 rounded"></div>
          <div className="h-10 w-10 bg-gray-200 rounded"></div>
          <div className="h-10 w-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    </main>
  );
} 
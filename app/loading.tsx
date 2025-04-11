import React from 'react';

export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Welcome section skeleton */}
      <section className="text-center space-y-4">
        <div className="h-10 bg-gray-200 rounded max-w-lg mx-auto"></div>
        <div className="h-20 bg-gray-200 rounded max-w-2xl mx-auto"></div>
      </section>

      {/* Quick links skeleton */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div 
            key={i}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center"
          >
            <div className="h-7 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-5 bg-gray-200 rounded w-full mx-auto"></div>
          </div>
        ))}
      </section>

      {/* Movies skeleton */}
      <section>
        <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-6"></div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(9)].map((_, i) => (
            <div 
              key={i}
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
      </section>

      {/* Featured Content skeleton */}
      <section className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg p-8">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="h-8 bg-gray-300 rounded w-3/4 mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="h-6 bg-gray-300 rounded w-1/2 mx-auto mb-3"></div>
                <div className="h-12 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
} 
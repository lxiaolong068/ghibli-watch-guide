'use client';

import { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface MovieSearchResult {
  id: string;
  titleEn: string;
  titleJa: string;
  year: number;
  posterUrl?: string;
}

interface MovieSearchProps {
  placeholder?: string;
}

export function MovieSearch({ placeholder = "Search movies..." }: MovieSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MovieSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchMovies = async () => {
      if (query.length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/movies/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data.movies || []);
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchMovies, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleMovieSelect = (movie: MovieSearchResult) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/movies/${movie.id}`);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          aria-label="Search movies"
          aria-haspopup="listbox"
        />
      </div>

      {isOpen && (
        <div 
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          role="listbox"
          aria-label="Search results"
        >
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          ) : results.length > 0 ? (
            results.map((movie) => (
              <button
                key={movie.id}
                onClick={() => handleMovieSelect(movie)}
                className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 text-left first:rounded-t-lg last:rounded-b-lg"
                role="option"
                aria-selected={false}
                aria-label={`${movie.titleEn} (${movie.year})`}
              >
                {movie.posterUrl && (
                  <Image
                    src={movie.posterUrl}
                    alt={`${movie.titleEn} poster`}
                    width={48}
                    height={64}
                    className="w-12 h-16 object-cover rounded"
                  />
                )}
                <div>
                  <h4 className="font-medium text-gray-900">{movie.titleEn}</h4>
                  <p className="text-sm text-gray-600">{movie.year}</p>
                </div>
              </button>
            ))
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-gray-500">No movies found</div>
          ) : null}
        </div>
      )}
    </div>
  );
}

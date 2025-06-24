'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface CharacterSearchProps {
  initialSearch?: string;
  initialIsMainCharacter?: string;
  initialMovieId?: string;
}

interface Movie {
  id: string;
  titleEn: string;
  titleJa?: string;
  titleZh?: string;
  year: number;
}

export function CharacterSearch({ 
  initialSearch = '', 
  initialIsMainCharacter,
  initialMovieId 
}: CharacterSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(initialSearch);
  const [isMainCharacter, setIsMainCharacter] = useState(initialIsMainCharacter || '');
  const [movieId, setMovieId] = useState(initialMovieId || '');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 获取电影列表用于筛选
  useEffect(() => {
    async function fetchMovies() {
      try {
        const response = await fetch('/api/movies?limit=100');
        if (response.ok) {
          const data = await response.json();
          setMovies(data.movies || []);
        }
      } catch (error) {
        console.error('获取电影列表失败:', error);
      }
    }
    fetchMovies();
  }, []);

  // 处理搜索
  const handleSearch = () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    
    if (search.trim()) {
      params.set('search', search.trim());
    }
    if (isMainCharacter) {
      params.set('isMainCharacter', isMainCharacter);
    }
    if (movieId) {
      params.set('movieId', movieId);
    }
    
    const queryString = params.toString();
    const url = queryString ? `/characters?${queryString}` : '/characters';
    
    router.push(url);
    setTimeout(() => setIsLoading(false), 500);
  };

  // 清除筛选
  const handleClear = () => {
    setSearch('');
    setIsMainCharacter('');
    setMovieId('');
    router.push('/characters');
  };

  // 回车搜索
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const hasActiveFilters = search || isMainCharacter || movieId;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* 搜索栏 */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="搜索角色名称、描述..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={handleKeyPress}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`
            px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors
            ${showFilters || hasActiveFilters
              ? 'border-blue-500 bg-blue-50 text-blue-700' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }
          `}
        >
          <FunnelIcon className="h-5 w-5" />
          筛选
          {hasActiveFilters && (
            <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {[search, isMainCharacter, movieId].filter(Boolean).length}
            </span>
          )}
        </button>
        
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? '搜索中...' : '搜索'}
        </button>
      </div>

      {/* 筛选选项 */}
      {showFilters && (
        <div className="border-t border-gray-200 pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 角色类型筛选 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                角色类型
              </label>
              <select
                value={isMainCharacter}
                onChange={(e) => setIsMainCharacter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">全部角色</option>
                <option value="true">主要角色</option>
                <option value="false">次要角色</option>
              </select>
            </div>

            {/* 电影筛选 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                出演电影
              </label>
              <select
                value={movieId}
                onChange={(e) => setMovieId(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">全部电影</option>
                {movies.map((movie) => (
                  <option key={movie.id} value={movie.id}>
                    {movie.titleEn} ({movie.year})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <button
              onClick={handleClear}
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              清除所有筛选
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
              >
                收起
              </button>
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                应用筛选
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 当前筛选状态 */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {search && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              搜索: {search}
              <button
                onClick={() => {
                  setSearch('');
                  handleSearch();
                }}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          
          {isMainCharacter && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
              {isMainCharacter === 'true' ? '主要角色' : '次要角色'}
              <button
                onClick={() => {
                  setIsMainCharacter('');
                  handleSearch();
                }}
                className="ml-2 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          )}
          
          {movieId && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
              电影: {movies.find(m => m.id === movieId)?.titleEn || '未知'}
              <button
                onClick={() => {
                  setMovieId('');
                  handleSearch();
                }}
                className="ml-2 text-purple-600 hover:text-purple-800"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

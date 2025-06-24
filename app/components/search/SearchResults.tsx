'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { OptimizedImage } from '@/app/components/OptimizedImage';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';
import { PaginationControls } from '@/app/components/PaginationControls';
import { SearchResult } from '@/app/types';

/*
interface SearchResult {
  id: string;
  type: 'movie' | 'character' | 'review' | 'guide' | 'media';
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  url: string;
  relevanceScore: number;
  metadata?: Record<string, any>;
}
*/

interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  filters: any;
  suggestions: string[];
  facets: any;
}

interface SearchResultsProps {
  searchParams: {
    q?: string;
    type?: string;
    year?: string;
    director?: string;
    tags?: string;
    language?: string;
    page?: string;
  };
}

const typeLabels = {
  movie: '电影',
  character: '角色',
  review: '评论',
  guide: '观影指南',
  media: '媒体内容'
};

const typeColors = {
  movie: 'bg-blue-100 text-blue-800',
  character: 'bg-green-100 text-green-800',
  review: 'bg-purple-100 text-purple-800',
  guide: 'bg-orange-100 text-orange-800',
  media: 'bg-pink-100 text-pink-800'
};

export function SearchResults({ searchParams }: SearchResultsProps) {
  const [searchData, setSearchData] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const query = searchParams.q || '';
  const currentPage = parseInt(searchParams.page || '1');

  useEffect(() => {
    if (!query || query.length < 2) {
      setSearchData(null);
      setIsLoading(false);
      return;
    }

    const fetchSearchResults = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        Object.entries(searchParams).forEach(([key, value]) => {
          if (value) params.set(key, value);
        });

        const response = await fetch(`/api/search?${params.toString()}`);
        if (!response.ok) {
          throw new Error('搜索失败');
        }

        const data = await response.json();
        setSearchData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '搜索出错');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, searchParams]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="搜索中..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          重试
        </button>
      </div>
    );
  }

  if (!searchData || searchData.results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.44-.816-6.12-2.18C5.09 12.82 5 12.92 5 13c0 .828.448 1.5 1 1.5s1-.672 1-1.5c0-.828-.448-1.5-1-1.5s-1 .672-1 1.5z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          没有找到相关结果
        </h3>
        <p className="text-gray-600 mb-6">
          尝试使用不同的关键词或调整筛选条件
        </p>
        
        {searchData?.suggestions && searchData.suggestions.length > 0 && (
          <div>
            <p className="text-sm text-gray-600 mb-3">您是否要搜索：</p>
            <div className="flex flex-wrap justify-center gap-2">
              {searchData.suggestions.map((suggestion) => (
                <Link
                  key={suggestion}
                  href={`/search?q=${encodeURIComponent(suggestion)}`}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                >
                  {suggestion}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const totalPages = Math.ceil(searchData.total / 20);

  return (
    <div className="space-y-6">
      {/* 搜索结果统计 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            找到 {searchData.total} 个结果
          </h2>
          <div className="text-sm text-gray-600">
            第 {currentPage} 页，共 {totalPages} 页
          </div>
        </div>

        {/* 结果类型统计 */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(
            searchData.results.reduce((acc, result) => {
              acc[result.type] = (acc[result.type] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          ).map(([type, count]) => (
            <Link
              key={type}
              href={`/search?${new URLSearchParams({ ...searchParams, type }).toString()}`}
              className={`px-3 py-1 rounded-full text-sm ${
                searchParams.type === type
                  ? typeColors[type as keyof typeof typeColors]
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } transition-colors`}
            >
              {typeLabels[type as keyof typeof typeLabels]} ({count})
            </Link>
          ))}
        </div>
      </div>

      {/* 搜索结果列表 */}
      <div className="space-y-4">
        {searchData.results.map((result) => (
          <SearchResultCard key={`${result.type}-${result.id}`} result={result} />
        ))}
      </div>

      {/* 分页控件 */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <PaginationControls
            currentPage={currentPage}
            totalItems={searchData.total}
            pageSize={20}
          />
        </div>
      )}
    </div>
  );
}

// 搜索结果卡片组件
function SearchResultCard({ result }: { result: SearchResult }) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <Link href={result.url} className="block p-6">
        <div className="flex space-x-4">
          {/* 图片 */}
          {result.imageUrl && (
            <div className="flex-shrink-0">
              <OptimizedImage
                src={result.imageUrl}
                alt={result.title}
                width={64}
                height={80}
                className="w-16 h-20 object-cover rounded"
              />
            </div>
          )}

          {/* 内容 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                  {result.title}
                </h3>
                {result.subtitle && (
                  <p className="text-sm text-gray-600 mt-1">{result.subtitle}</p>
                )}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                typeColors[result.type]
              }`}>
                {typeLabels[result.type]}
              </span>
            </div>

            {result.description && (
              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                {result.description}
              </p>
            )}

            {/* 元数据 */}
            {result.metadata && (
              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                {result.type === 'movie' && result.metadata.year && (
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    {result.metadata.year}年
                  </span>
                )}
                {result.type === 'movie' && result.metadata.director && (
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    导演: {result.metadata.director}
                  </span>
                )}
                {result.type === 'review' && result.metadata.rating && (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    评分: {result.metadata.rating}/10
                  </span>
                )}
                {result.type === 'character' && result.metadata.isMainCharacter && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                    主要角色
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MovieGrid } from '@/app/components/MovieCard';
import TagFilter from '@/app/components/filters/TagFilter';
import { PaginationControls } from '@/app/components/PaginationControls';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';
import type { Tag } from '@/app/types';

interface Movie {
  id: string;
  tmdbId: number;
  titleEn: string;
  titleJa: string;
  titleZh?: string | null;
  year: number;
  director?: string | null;
  duration?: number | null;
  synopsis?: string | null;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  voteAverage?: number | null;
  createdAt: Date;
  updatedAt: Date;
  tags?: Tag[];
  tagsByCategory?: Record<string, Tag[]>;
}

interface FilteredMovieListProps {
  initialMovies?: Movie[];
  initialTotal?: number;
  initialPage?: number;
  pageSize?: number;
}

export default function FilteredMovieList({
  initialMovies = [],
  initialTotal = 0,
  initialPage = 1,
  pageSize = 12
}: FilteredMovieListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 状态管理
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [total, setTotal] = useState(initialTotal);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 筛选状态
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [matchAll, setMatchAll] = useState(false);
  const [sortBy, setSortBy] = useState('year');
  const [sortOrder, setSortOrder] = useState('desc');

  // 从URL参数初始化筛选状态
  useEffect(() => {
    const tagIds = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const categories = searchParams.get('categories')?.split(',').filter(Boolean) || [];
    const matchAllParam = searchParams.get('matchAll') === 'true';
    const sortByParam = searchParams.get('sortBy') || 'year';
    const sortOrderParam = searchParams.get('sortOrder') || 'desc';
    const pageParam = parseInt(searchParams.get('page') || '1');

    setSelectedTags(tagIds);
    setSelectedCategories(categories);
    setMatchAll(matchAllParam);
    setSortBy(sortByParam);
    setSortOrder(sortOrderParam);
    setCurrentPage(pageParam);
  }, [searchParams]);

  // 更新URL参数
  const updateURL = useCallback((params: Record<string, string | number | boolean>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    
    Object.entries(params).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, String(value));
      }
    });

    router.push(`?${newSearchParams.toString()}`, { scroll: false });
  }, [router, searchParams]);

  // 获取筛选后的电影
  const fetchFilteredMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      
      if (selectedTags.length > 0) {
        params.set('tagIds', selectedTags.join(','));
      }
      if (selectedCategories.length > 0) {
        params.set('categories', selectedCategories.join(','));
      }
      if (matchAll) {
        params.set('matchAll', 'true');
      }
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);
      params.set('page', currentPage.toString());
      params.set('pageSize', pageSize.toString());

      const response = await fetch(`/api/movies/filter?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }

      const data = await response.json();
      
      setMovies(data.movies || []);
      setTotal(data.pagination?.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Failed to fetch filtered movies:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedTags, selectedCategories, matchAll, sortBy, sortOrder, currentPage, pageSize]);

  // 当筛选条件改变时获取数据
  useEffect(() => {
    if (selectedTags.length > 0 || selectedCategories.length > 0) {
      fetchFilteredMovies();
    } else {
      // 如果没有筛选条件，显示初始数据或获取所有电影
      setMovies(initialMovies);
      setTotal(initialTotal);
    }
  }, [selectedTags, selectedCategories, matchAll, sortBy, sortOrder, currentPage, fetchFilteredMovies, initialMovies, initialTotal]);

  // 处理标签选择
  const handleTagsChange = (tagIds: string[]) => {
    setSelectedTags(tagIds);
    setCurrentPage(1); // 重置到第一页
    updateURL({ 
      tags: tagIds.join(','),
      page: 1
    });
  };

  // 处理分类选择
  const handleCategoriesChange = (categories: string[]) => {
    setSelectedCategories(categories);
    setCurrentPage(1);
    updateURL({ 
      categories: categories.join(','),
      page: 1
    });
  };

  // 处理匹配模式改变
  const handleMatchAllChange = (newMatchAll: boolean) => {
    setMatchAll(newMatchAll);
    setCurrentPage(1);
    updateURL({ 
      matchAll: newMatchAll,
      page: 1
    });
  };

  // 处理排序改变
  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
    updateURL({ 
      sortBy: newSortBy,
      sortOrder: newSortOrder,
      page: 1
    });
  };

  // 处理页面改变 - 由于PaginationControls使用Link，这里不需要处理函数

  // 处理标签点击（从电影卡片）
  const handleTagClick = (tag: Tag) => {
    const newSelectedTags = selectedTags.includes(tag.id)
      ? selectedTags.filter(id => id !== tag.id)
      : [...selectedTags, tag.id];
    
    handleTagsChange(newSelectedTags);
  };

  const totalPages = Math.ceil(total / pageSize);
  const hasFilters = selectedTags.length > 0 || selectedCategories.length > 0;

  return (
    <div className="space-y-6">
      {/* 筛选器 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          筛选电影
        </h2>
        <TagFilter
          selectedTags={selectedTags}
          onTagsChange={handleTagsChange}
          selectedCategories={selectedCategories}
          onCategoriesChange={handleCategoriesChange}
          matchAll={matchAll}
          onMatchAllChange={handleMatchAllChange}
        />
      </div>

      {/* 排序和统计信息 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <p className="text-gray-600 dark:text-gray-400">
            {loading ? '搜索中...' : `找到 ${total} 部电影`}
          </p>
          {hasFilters && (
            <span className="text-sm text-blue-600 dark:text-blue-400">
              (已筛选)
            </span>
          )}
        </div>

        {/* 排序选择 */}
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-700 dark:text-gray-300">排序:</label>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-');
              handleSortChange(newSortBy, newSortOrder);
            }}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-3 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="year-desc">年份 (新到旧)</option>
            <option value="year-asc">年份 (旧到新)</option>
            <option value="title-asc">标题 (A-Z)</option>
            <option value="title-desc">标题 (Z-A)</option>
            <option value="rating-desc">评分 (高到低)</option>
            <option value="rating-asc">评分 (低到高)</option>
          </select>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* 加载状态 */}
      {loading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" text="加载电影中..." />
        </div>
      )}

      {/* 电影网格 */}
      {!loading && (
        <MovieGrid 
          movies={movies} 
          showTags={true}
          onTagClick={handleTagClick}
        />
      )}

      {/* 分页控件 */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center">
          <PaginationControls
            totalItems={total}
            currentPage={currentPage}
            pageSize={pageSize}
          />
        </div>
      )}

      {/* 无结果提示 */}
      {!loading && movies.length === 0 && hasFilters && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            未找到匹配的电影
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            尝试调整筛选条件或清除所有筛选器
          </p>
          <button
            onClick={() => {
              setSelectedTags([]);
              setSelectedCategories([]);
              updateURL({ tags: '', categories: '', page: 1 });
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            清除筛选器
          </button>
        </div>
      )}
    </div>
  );
}

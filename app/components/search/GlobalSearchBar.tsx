'use client';

import { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { OptimizedImage } from '@/app/components/OptimizedImage';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';

interface QuickSearchResult {
  id: string;
  type: 'movie' | 'character' | 'review' | 'guide';
  title: string;
  subtitle?: string;
  imageUrl?: string;
  url: string;
}

interface GlobalSearchBarProps {
  placeholder?: string;
  className?: string;
  showQuickResults?: boolean;
  maxQuickResults?: number;
}

export function GlobalSearchBar({ 
  placeholder = "搜索电影、角色、评论...", 
  className = "",
  showQuickResults = true,
  maxQuickResults = 5
}: GlobalSearchBarProps) {
  const [query, setQuery] = useState('');
  const [quickResults, setQuickResults] = useState<QuickSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 处理点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 快速搜索
  useEffect(() => {
    if (!showQuickResults || query.length < 2) {
      setQuickResults([]);
      setIsOpen(false);
      return;
    }

    const searchQuick = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search/quick?q=${encodeURIComponent(query)}&limit=${maxQuickResults}`);
        if (response.ok) {
          const data = await response.json();
          const results = data.results.map((result: any) => ({
            id: result.id,
            type: result.type,
            title: result.title,
            subtitle: result.subtitle,
            imageUrl: result.imageUrl,
            url: result.url,
          }));
          setQuickResults(results);
          setIsOpen(results.length > 0);
        }
      } catch (error) {
        console.error('Quick search error:', error);
        setQuickResults([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchQuick, 200); // 减少延迟以提高响应性
    return () => clearTimeout(debounceTimer);
  }, [query, showQuickResults, maxQuickResults]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      setIsFocused(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleResultClick = () => {
    setIsOpen(false);
    setIsFocused(false);
  };

  const handleClear = () => {
    setQuery('');
    setQuickResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (query.length >= 2 && quickResults.length > 0) {
      setIsOpen(true);
    }
  };

  const typeLabels = {
    movie: '电影',
    character: '角色',
    review: '评论',
    guide: '指南'
  };

  const typeColors = {
    movie: 'bg-blue-100 text-blue-800',
    character: 'bg-green-100 text-green-800',
    review: 'bg-purple-100 text-purple-800',
    guide: 'bg-orange-100 text-orange-800'
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            placeholder={placeholder}
            className={`
              w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-all duration-200
              ${isFocused ? 'shadow-lg' : 'shadow-sm'}
            `}
            aria-label="全局搜索"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          />
          
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="清除搜索"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {/* 快速搜索结果下拉框 */}
      {isOpen && showQuickResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <LoadingSpinner size="sm" text="搜索中..." />
            </div>
          ) : quickResults.length > 0 ? (
            <>
              {quickResults.map((result) => (
                <Link
                  key={`${result.type}-${result.id}`}
                  href={result.url}
                  onClick={handleResultClick}
                  className="block p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 first:rounded-t-lg last:rounded-b-lg"
                >
                  <div className="flex items-center space-x-3">
                    {result.imageUrl && (
                      <OptimizedImage
                        src={result.imageUrl}
                        alt={result.title}
                        width={40}
                        height={50}
                        className="w-10 h-12 object-cover rounded flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {result.title}
                          </h4>
                          {result.subtitle && (
                            <p className="text-sm text-gray-600 truncate mt-1">
                              {result.subtitle}
                            </p>
                          )}
                        </div>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                          typeColors[result.type]
                        }`}>
                          {typeLabels[result.type]}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              
              {/* 查看所有结果 */}
              <div className="border-t border-gray-200 p-3">
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={handleResultClick}
                  className="block w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-2 hover:bg-blue-50 rounded"
                >
                  查看所有搜索结果 ({quickResults.length}+)
                </Link>
              </div>
            </>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center">
              <div className="text-gray-500 mb-3">未找到相关结果</div>
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={handleResultClick}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                搜索所有内容
              </Link>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

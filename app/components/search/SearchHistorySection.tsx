'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ClockIcon, XMarkIcon, FireIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { SearchHistoryManager, SearchHistoryItem, PopularSearchItem } from '@/app/utils/searchHistory';

interface SearchHistorySectionProps {
  className?: string;
  showStats?: boolean;
}

export function SearchHistorySection({ className = '', showStats = false }: SearchHistorySectionProps) {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [popularSearches, setPopularSearches] = useState<PopularSearchItem[]>([]);
  const [showHistory, setShowHistory] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // 加载搜索历史和热门搜索
    const loadSearchData = () => {
      const history = SearchHistoryManager.getHistory(10);
      const popular = SearchHistoryManager.getPopularSearches(8, 2);
      const searchStats = SearchHistoryManager.getSearchStats();

      setSearchHistory(history);
      setPopularSearches(popular);
      setStats(searchStats);
    };

    loadSearchData();

    // 监听存储变化
    const handleStorageChange = () => {
      loadSearchData();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleClearHistory = () => {
    SearchHistoryManager.clearHistory();
    setSearchHistory([]);
  };

  const handleRemoveHistoryItem = (query: string) => {
    SearchHistoryManager.removeFromHistory(query);
    setSearchHistory(prev => prev.filter(item => item.query !== query));
  };

  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return new Date(timestamp).toLocaleDateString('zh-CN');
  };

  if (searchHistory.length === 0 && popularSearches.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* 标签切换 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6 pt-4">
          <button
            onClick={() => setShowHistory(true)}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              showHistory
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ClockIcon className="w-4 h-4 inline mr-1" />
            搜索历史 ({searchHistory.length})
          </button>
          <button
            onClick={() => setShowHistory(false)}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              !showHistory
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FireIcon className="w-4 h-4 inline mr-1" />
            热门搜索 ({popularSearches.length})
          </button>
          {showStats && stats && (
            <div className="ml-auto flex items-center text-xs text-gray-500">
              <ChartBarIcon className="w-4 h-4 mr-1" />
              总搜索: {stats.totalSearches} | 独特查询: {stats.uniqueQueries}
            </div>
          )}
        </nav>
      </div>

      {/* 内容区域 */}
      <div className="p-6">
        {showHistory ? (
          // 搜索历史
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">最近搜索</h3>
              {searchHistory.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                >
                  清除全部
                </button>
              )}
            </div>

            {searchHistory.length > 0 ? (
              <div className="space-y-2">
                {searchHistory.map((item, index) => (
                  <div
                    key={`${item.query}-${item.timestamp}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <Link
                      href={`/search?q=${encodeURIComponent(item.query)}`}
                      className="flex-1 flex items-center space-x-3"
                    >
                      <ClockIcon className="w-4 h-4 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.query}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>{formatTimeAgo(item.timestamp)}</span>
                          {item.resultCount !== undefined && (
                            <>
                              <span>•</span>
                              <span>{item.resultCount} 个结果</span>
                            </>
                          )}
                          {item.category && item.category !== 'all' && (
                            <>
                              <span>•</span>
                              <span className="capitalize">{item.category}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                    <button
                      onClick={() => handleRemoveHistoryItem(item.query)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                      title="移除此搜索记录"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ClockIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>暂无搜索历史</p>
                <p className="text-sm mt-1">开始搜索来建立您的搜索历史</p>
              </div>
            )}
          </div>
        ) : (
          // 热门搜索
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">热门搜索</h3>
              <span className="text-sm text-gray-500">基于搜索频率</span>
            </div>

            {popularSearches.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {popularSearches.map((item, index) => (
                  <Link
                    key={item.query}
                    href={`/search?q=${encodeURIComponent(item.query)}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-medium text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.query}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>{item.count} 次搜索</span>
                          {item.category && item.category !== 'all' && (
                            <>
                              <span>•</span>
                              <span className="capitalize">{item.category}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <FireIcon className="w-4 h-4 text-gray-400 group-hover:text-orange-500" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FireIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>暂无热门搜索</p>
                <p className="text-sm mt-1">多次搜索相同内容会出现在这里</p>
              </div>
            )}
          </div>
        )}

        {/* 搜索统计（如果启用） */}
        {showStats && stats && stats.totalSearches > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">搜索统计</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-lg font-semibold text-gray-900">{stats.totalSearches}</div>
                <div className="text-xs text-gray-500">总搜索次数</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-lg font-semibold text-gray-900">{stats.uniqueQueries}</div>
                <div className="text-xs text-gray-500">独特查询</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-lg font-semibold text-gray-900">{stats.averageSearchesPerDay}</div>
                <div className="text-xs text-gray-500">日均搜索</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-lg font-semibold text-gray-900">
                  {stats.topCategories[0]?.category || 'N/A'}
                </div>
                <div className="text-xs text-gray-500">热门类别</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { Suspense } from 'react';
import { Metadata } from 'next';
import { SearchResults } from '@/app/components/search/SearchResults';
import { SearchFilters } from '@/app/components/search/SearchFilters';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';
import { SearchHistorySection } from '@/app/components/search/SearchHistorySection';

interface SearchPageProps {
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

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const query = searchParams.q || '';
  
  return {
    title: query ? `搜索结果: ${query} - 吉卜力观影指南` : '搜索 - 吉卜力观影指南',
    description: query 
      ? `搜索 "${query}" 的结果，包括电影、角色、评论和观影指南等内容。`
      : '搜索吉卜力工作室的电影、角色、评论和观影指南等内容。',
    openGraph: {
      title: query ? `搜索结果: ${query}` : '搜索',
      description: query 
        ? `搜索 "${query}" 的结果，包括电影、角色、评论和观影指南等内容。`
        : '搜索吉卜力工作室的电影、角色、评论和观影指南等内容。',
    },
  };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  const hasQuery = query.length >= 2;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {query ? `搜索结果: "${query}"` : '搜索'}
          </h1>
          {query && (
            <p className="text-gray-600">
              搜索电影、角色、评论和观影指南等内容
            </p>
          )}
        </div>

        {hasQuery ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 筛选器侧边栏 */}
            <div className="lg:col-span-1">
              <Suspense fallback={<div className="bg-white rounded-lg shadow p-6"><LoadingSpinner size="sm" /></div>}>
                <SearchFilters searchParams={searchParams} />
              </Suspense>
            </div>

            {/* 搜索结果主区域 */}
            <div className="lg:col-span-3">
              <Suspense fallback={<SearchResultsSkeleton />}>
                <SearchResults searchParams={searchParams} />
              </Suspense>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 搜索提示 */}
            <div className="text-center py-8">
              <div className="max-w-md mx-auto">
                <div className="mb-6">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  开始搜索
                </h2>
                <p className="text-gray-600 mb-6">
                  输入关键词搜索电影、角色、评论和观影指南等内容
                </p>

                {/* 搜索建议 */}
                <div className="text-left">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">推荐搜索</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      '千与千寻',
                      '龙猫',
                      '萤火虫之墓',
                      '哈尔的移动城堡',
                      '天空之城',
                      '魔女宅急便',
                      '宫崎骏',
                      '环保主题',
                      '家庭观影'
                    ].map((suggestion) => (
                      <a
                        key={suggestion}
                        href={`/search?q=${encodeURIComponent(suggestion)}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                      >
                        {suggestion}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 搜索历史和热门搜索 */}
            <div className="max-w-4xl mx-auto">
              <SearchHistorySection showStats={true} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 搜索结果骨架屏
function SearchResultsSkeleton() {
  return (
    <div className="space-y-6">
      {/* 结果统计骨架 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="flex space-x-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 bg-gray-200 rounded w-16"></div>
          ))}
        </div>
      </div>

      {/* 搜索结果骨架 */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white rounded-lg shadow p-6">
          <div className="flex space-x-4">
            <div className="w-16 h-20 bg-gray-200 rounded"></div>
            <div className="flex-1">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

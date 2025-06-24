'use client';

import { useState, useEffect } from 'react';
import { GuideCard } from './GuideCard';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';
import { WatchGuide, WatchGuidesResponse } from '@/app/types';

interface GuideListProps {
  initialGuides?: WatchGuide[];
  showFilters?: boolean;
}

const guideTypeOptions = [
  { value: '', label: '全部类型' },
  { value: 'CHRONOLOGICAL', label: '时间线指南' },
  { value: 'BEGINNER', label: '新手入门' },
  { value: 'THEMATIC', label: '主题分类' },
  { value: 'FAMILY', label: '家庭观影' },
  { value: 'ADVANCED', label: '进阶指南' },
  { value: 'SEASONAL', label: '季节推荐' }
];

export function GuideList({ initialGuides = [], showFilters = true }: GuideListProps) {
  const [guides, setGuides] = useState<WatchGuide[]>(initialGuides);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 获取观影指南数据
  const fetchGuides = async (type: string = '', page: number = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      params.append('page', page.toString());
      params.append('limit', '12');

      const response = await fetch(`/api/guides?${params}`);
      if (!response.ok) {
        throw new Error('获取观影指南失败');
      }

      const data: WatchGuidesResponse = await response.json();
      setGuides(data.guides);
      setTotalPages(data.pagination.totalPages);
      setCurrentPage(data.pagination.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取观影指南失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理类型筛选
  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setCurrentPage(1);
    fetchGuides(type, 1);
  };

  // 处理分页
  const handlePageChange = (page: number) => {
    fetchGuides(selectedType, page);
  };

  // 初始化时如果没有初始数据则获取数据
  useEffect(() => {
    if (initialGuides.length === 0) {
      fetchGuides();
    }
  }, []);

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium">{error}</p>
        </div>
        <button
          onClick={() => fetchGuides(selectedType, currentPage)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 筛选器 */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-gray-700">筛选类型:</span>
            <div className="flex flex-wrap gap-2">
              {guideTypeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleTypeChange(option.value)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedType === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 加载状态 */}
      {loading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      )}

      {/* 观影指南网格 */}
      {!loading && guides.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide) => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>
      )}

      {/* 空状态 */}
      {!loading && guides.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-lg font-medium text-gray-500">暂无观影指南</p>
            <p className="text-gray-400">请稍后再试或联系管理员</p>
          </div>
        </div>
      )}

      {/* 分页控件 */}
      {!loading && guides.length > 0 && totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

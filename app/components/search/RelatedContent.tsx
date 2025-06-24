'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { OptimizedImage } from '@/app/components/OptimizedImage';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';

interface RelatedItem {
  id: string;
  type: 'movie' | 'character' | 'review' | 'guide';
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  url: string;
  score: number;
}

interface RelatedContentProps {
  contentType: 'movie' | 'character' | 'review' | 'guide';
  contentId: string;
  title?: string;
  maxItems?: number;
  className?: string;
}

export function RelatedContent({ 
  contentType, 
  contentId, 
  title = "相关内容",
  maxItems = 6,
  className = ""
}: RelatedContentProps) {
  const [relatedItems, setRelatedItems] = useState<RelatedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedContent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/recommendations/${contentType}/${contentId}?limit=${maxItems}`
        );
        
        if (!response.ok) {
          throw new Error('获取相关内容失败');
        }

        const data = await response.json();
        setRelatedItems(data.recommendations || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取相关内容时出错');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelatedContent();
  }, [contentType, contentId, maxItems]);

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex justify-center py-8">
          <LoadingSpinner size="sm" text="加载中..." />
        </div>
      </div>
    );
  }

  if (error || relatedItems.length === 0) {
    return null; // 不显示错误或空状态，保持页面简洁
  }

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
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {relatedItems.map((item) => (
            <RelatedItemCard
              key={`${item.type}-${item.id}`}
              item={item}
              typeLabel={typeLabels[item.type]}
              typeColor={typeColors[item.type]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// 相关内容卡片组件
interface RelatedItemCardProps {
  item: RelatedItem;
  typeLabel: string;
  typeColor: string;
}

function RelatedItemCard({ item, typeLabel, typeColor }: RelatedItemCardProps) {
  return (
    <Link
      href={item.url}
      className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
    >
      <div className="flex space-x-3">
        {item.imageUrl && (
          <div className="flex-shrink-0">
            <OptimizedImage
              src={item.imageUrl}
              alt={item.title}
              width={48}
              height={60}
              className="w-12 h-15 object-cover rounded"
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-medium text-gray-900 text-sm leading-tight truncate">
              {item.title}
            </h4>
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${typeColor}`}>
              {typeLabel}
            </span>
          </div>
          
          {item.subtitle && (
            <p className="text-xs text-gray-600 mb-2 truncate">
              {item.subtitle}
            </p>
          )}
          
          {item.description && (
            <p className="text-xs text-gray-500 line-clamp-2">
              {item.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

// 基于内容的推荐Hook
export function useContentRecommendations(
  contentType: string,
  contentId: string,
  options: { limit?: number; includeTypes?: string[] } = {}
) {
  const [recommendations, setRecommendations] = useState<RelatedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          limit: (options.limit || 6).toString(),
        });

        if (options.includeTypes) {
          params.set('types', options.includeTypes.join(','));
        }

        const response = await fetch(
          `/api/recommendations/${contentType}/${contentId}?${params.toString()}`
        );
        
        if (!response.ok) {
          throw new Error('获取推荐内容失败');
        }

        const data = await response.json();
        setRecommendations(data.recommendations || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取推荐内容时出错');
      } finally {
        setIsLoading(false);
      }
    };

    if (contentType && contentId) {
      fetchRecommendations();
    }
  }, [contentType, contentId, options.limit, options.includeTypes]);

  return { recommendations, isLoading, error };
}

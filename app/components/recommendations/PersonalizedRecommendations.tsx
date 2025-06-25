'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UserBehaviorManager } from '@/app/utils/user-behavior-manager';

// 推荐结果类型
interface PersonalizedRecommendation {
  id: string;
  type: 'movie' | 'character' | 'review' | 'guide';
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string | null;
  url: string;
  score: number;
  algorithm: 'content' | 'collaborative' | 'hybrid' | 'popular';
  reasons: RecommendationReason[];
  metadata?: Record<string, any>;
}

interface RecommendationReason {
  type: string;
  description: string;
  confidence: number;
}

interface PersonalizedRecommendationsProps {
  contextType?: 'general' | 'movie_detail' | 'search_result';
  contextId?: string;
  limit?: number;
  types?: string[];
  title?: string;
  showReasons?: boolean;
  className?: string;
}

export function PersonalizedRecommendations({
  contextType = 'general',
  contextId,
  limit = 6,
  types = ['movie', 'character', 'review', 'guide'],
  title = '为您推荐',
  showReasons = false,
  className = '',
}: PersonalizedRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');

  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        limit: limit.toString(),
        types: types.join(','),
        context: contextType,
      });

      if (contextId) {
        params.append('contextId', contextId);
      }

      if (sessionId) {
        params.append('sessionId', sessionId);
      }

      const response = await fetch(`/api/recommendations/personalized?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('获取推荐内容失败');
    } finally {
      setLoading(false);
    }
  }, [limit, types, contextType, contextId, sessionId]);

  useEffect(() => {
    const behaviorManager = UserBehaviorManager.getInstance();
    const context = behaviorManager.getRecommendationContext();
    setSessionId(context.sessionId);

    fetchRecommendations();
  }, [contextType, contextId, limit, types, fetchRecommendations]);

  const handleRecommendationClick = (recommendation: PersonalizedRecommendation, position: number) => {
    // 记录推荐点击行为
    const behaviorManager = UserBehaviorManager.getInstance();
    behaviorManager.recordRecommendationFeedback(
      `rec_${Date.now()}`,
      recommendation.id,
      recommendation.type,
      position,
      'click'
    );

    // 记录内容交互
    behaviorManager.recordContentInteraction(
      recommendation.type,
      recommendation.id,
      'view',
      {
        source: 'recommendation',
        algorithm: recommendation.algorithm,
        position,
        score: recommendation.score,
      }
    );
  };

  const getAlgorithmBadge = (algorithm: string) => {
    const badges = {
      content: { text: '相似内容', color: 'bg-blue-100 text-blue-800' },
      collaborative: { text: '用户推荐', color: 'bg-green-100 text-green-800' },
      popular: { text: '热门内容', color: 'bg-red-100 text-red-800' },
      hybrid: { text: '智能推荐', color: 'bg-purple-100 text-purple-800' },
    };
    
    const badge = badges[algorithm as keyof typeof badges] || badges.hybrid;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      movie: '🎬',
      character: '👤',
      review: '📝',
      guide: '📖',
    };
    return icons[type as keyof typeof icons] || '📄';
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: limit }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 aspect-[3/4] rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchRecommendations}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className={`${className}`}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">暂无推荐内容</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <button
          onClick={fetchRecommendations}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          刷新推荐
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((recommendation, index) => (
          <div
            key={`${recommendation.type}_${recommendation.id}`}
            className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <Link
              href={recommendation.url}
              onClick={() => handleRecommendationClick(recommendation, index)}
              className="block"
            >
              {/* 图片区域 */}
              <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-t-lg">
                {recommendation.imageUrl ? (
                  <Image
                    src={recommendation.imageUrl}
                    alt={recommendation.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-4xl">{getTypeIcon(recommendation.type)}</span>
                  </div>
                )}
                
                {/* 算法标签 */}
                <div className="absolute top-2 left-2">
                  {getAlgorithmBadge(recommendation.algorithm)}
                </div>
                
                {/* 评分 */}
                <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                  {Math.round(recommendation.score * 100)}%
                </div>
              </div>

              {/* 内容区域 */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {recommendation.title}
                </h3>
                
                {recommendation.subtitle && (
                  <p className="text-sm text-gray-600 mb-2">
                    {recommendation.subtitle}
                  </p>
                )}
                
                {recommendation.description && (
                  <p className="text-sm text-gray-500 line-clamp-3 mb-3">
                    {recommendation.description}
                  </p>
                )}

                {/* 推荐原因 */}
                {showReasons && recommendation.reasons.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400 mb-1">推荐理由：</p>
                    <div className="space-y-1">
                      {recommendation.reasons.slice(0, 2).map((reason, reasonIndex) => (
                        <div key={reasonIndex} className="flex items-center text-xs text-gray-500">
                          <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 flex-shrink-0"></span>
                          <span className="line-clamp-1">{reason.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 元数据 */}
                {recommendation.metadata && (
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                    {recommendation.metadata.viewCount && (
                      <span>{recommendation.metadata.viewCount} 次浏览</span>
                    )}
                    {recommendation.metadata.rating && (
                      <span>评分 {recommendation.metadata.rating.toFixed(1)}</span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* 调试信息（开发环境） */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-6 p-4 bg-gray-50 rounded-lg">
          <summary className="cursor-pointer text-sm font-medium text-gray-700">
            调试信息
          </summary>
          <div className="mt-2 text-xs text-gray-600">
            <p>会话ID: {sessionId}</p>
            <p>上下文类型: {contextType}</p>
            <p>上下文ID: {contextId || '无'}</p>
            <p>推荐数量: {recommendations.length}</p>
            <p>算法分布: {
              JSON.stringify(recommendations.reduce((acc, rec) => {
                acc[rec.algorithm] = (acc[rec.algorithm] || 0) + 1;
                return acc;
              }, {} as Record<string, number>))
            }</p>
          </div>
        </details>
      )}
    </div>
  );
}

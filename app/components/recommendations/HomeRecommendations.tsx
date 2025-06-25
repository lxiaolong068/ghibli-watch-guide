'use client';

import React from 'react';
import { PersonalizedRecommendations } from './PersonalizedRecommendations';

interface HomeRecommendationsProps {
  className?: string;
}

export function HomeRecommendations({ className = '' }: HomeRecommendationsProps) {
  return (
    <div className={`space-y-12 ${className}`}>
      {/* 个性化电影推荐 */}
      <PersonalizedRecommendations
        contextType="general"
        types={['movie']}
        limit={6}
        title="🎬 为您推荐的电影"
        showReasons={false}
        className="bg-white rounded-lg p-6 shadow-sm"
      />

      {/* 角色推荐 */}
      <PersonalizedRecommendations
        contextType="general"
        types={['character']}
        limit={4}
        title="👤 精彩角色"
        showReasons={false}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6"
      />

      {/* 评论和指南混合推荐 */}
      <PersonalizedRecommendations
        contextType="general"
        types={['review', 'guide']}
        limit={4}
        title="📚 深度内容"
        showReasons={true}
        className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6"
      />
    </div>
  );
}

// 电影详情页推荐组件
interface MovieDetailRecommendationsProps {
  movieId: string;
  className?: string;
}

export function MovieDetailRecommendations({ 
  movieId, 
  className = '' 
}: MovieDetailRecommendationsProps) {
  return (
    <div className={`space-y-8 ${className}`}>
      {/* 相似电影推荐 */}
      <PersonalizedRecommendations
        contextType="movie_detail"
        contextId={movieId}
        types={['movie']}
        limit={6}
        title="🎯 相似电影推荐"
        showReasons={true}
        className="bg-white rounded-lg p-6 shadow-sm"
      />

      {/* 相关内容推荐 */}
      <PersonalizedRecommendations
        contextType="movie_detail"
        contextId={movieId}
        types={['character', 'review', 'guide']}
        limit={4}
        title="📖 相关内容"
        showReasons={false}
        className="bg-gray-50 rounded-lg p-6"
      />
    </div>
  );
}

// 搜索结果页推荐组件
interface SearchRecommendationsProps {
  query?: string;
  className?: string;
}

export function SearchRecommendations({ 
  query, 
  className = '' 
}: SearchRecommendationsProps) {
  return (
    <div className={`${className}`}>
      <PersonalizedRecommendations
        contextType="search_result"
        types={['movie', 'character', 'review', 'guide']}
        limit={8}
        title="💡 您可能感兴趣的内容"
        showReasons={false}
        className="bg-white rounded-lg p-6 shadow-sm"
      />
    </div>
  );
}

// 紧凑型推荐组件（侧边栏使用）
interface CompactRecommendationsProps {
  contextType?: 'general' | 'movie_detail' | 'search_result';
  contextId?: string;
  types?: string[];
  limit?: number;
  title?: string;
  className?: string;
}

export function CompactRecommendations({
  contextType = 'general',
  contextId,
  types = ['movie'],
  limit = 3,
  title = '推荐内容',
  className = '',
}: CompactRecommendationsProps) {
  return (
    <div className={`${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <PersonalizedRecommendations
        contextType={contextType}
        contextId={contextId}
        types={types}
        limit={limit}
        title=""
        showReasons={false}
        className="space-y-4"
      />
    </div>
  );
}

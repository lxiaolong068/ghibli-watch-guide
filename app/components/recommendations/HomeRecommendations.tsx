'use client';

import React from 'react';
import { PersonalizedRecommendations } from './PersonalizedRecommendations';

interface HomeRecommendationsProps {
  className?: string;
}

export function HomeRecommendations({ className = '' }: HomeRecommendationsProps) {
  return (
    <div className={`space-y-12 ${className}`}>
      {/* Personalized Movie Recommendations */}
      <PersonalizedRecommendations
        contextType="general"
        types={['movie']}
        limit={6}
        title="🎬 Recommended Movies for You"
        showReasons={false}
        className="bg-white rounded-lg p-6 shadow-sm"
      />

      {/* Character Recommendations */}
      <PersonalizedRecommendations
        contextType="general"
        types={['character']}
        limit={4}
        title="👤 Featured Characters"
        showReasons={false}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6"
      />

      {/* Reviews and Guides Mixed Recommendations */}
      <PersonalizedRecommendations
        contextType="general"
        types={['review', 'guide']}
        limit={4}
        title="📚 In-Depth Content"
        showReasons={true}
        className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6"
      />
    </div>
  );
}

// Movie Detail Page Recommendation Component
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
      {/* Similar Movie Recommendations */}
      <PersonalizedRecommendations
        contextType="movie_detail"
        contextId={movieId}
        types={['movie']}
        limit={6}
        title="🎯 Similar Movies"
        showReasons={true}
        className="bg-white rounded-lg p-6 shadow-sm"
      />

      {/* Related Content Recommendations */}
      <PersonalizedRecommendations
        contextType="movie_detail"
        contextId={movieId}
        types={['character', 'review', 'guide']}
        limit={4}
        title="📖 Related Content"
        showReasons={false}
        className="bg-gray-50 rounded-lg p-6"
      />
    </div>
  );
}

// Search Results Page Recommendation Component
interface SearchRecommendationsProps {
  query?: string;
  className?: string;
}

export function SearchRecommendations({
  query: _query,
  className = ''
}: SearchRecommendationsProps) {
  return (
    <div className={`${className}`}>
      <PersonalizedRecommendations
        contextType="search_result"
        types={['movie', 'character', 'review', 'guide']}
        limit={8}
        title="💡 Content You Might Be Interested In"
        showReasons={false}
        className="bg-white rounded-lg p-6 shadow-sm"
      />
    </div>
  );
}

// Compact Recommendation Component (for sidebar use)
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
  title = 'Recommended Content',
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

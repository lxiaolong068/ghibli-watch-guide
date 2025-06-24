'use client';

import { StarIcon } from '@heroicons/react/24/solid';

interface ReviewStatsProps {
  movieId: string;
  reviews: Array<{
    id: string;
    rating?: number | null;
    reviewType: string;
    publishedAt?: Date | null;
  }>;
}

export function ReviewStats({ movieId, reviews }: ReviewStatsProps) {
  // 计算统计数据
  const totalReviews = reviews.length;
  const reviewsWithRating = reviews.filter(r => r.rating);
  const averageRating = reviewsWithRating.length > 0 
    ? reviewsWithRating.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsWithRating.length
    : 0;
  
  // 按类型分组统计
  const reviewTypeStats = reviews.reduce((acc, review) => {
    acc[review.reviewType] = (acc[review.reviewType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 评分分布
  const ratingDistribution = [5, 4, 3, 2, 1].map(star => {
    const count = reviewsWithRating.filter(r => {
      const rating = r.rating || 0;
      return rating >= star * 2 - 1 && rating < star * 2 + 1;
    }).length;
    return { star, count, percentage: reviewsWithRating.length > 0 ? (count / reviewsWithRating.length) * 100 : 0 };
  });

  const getReviewTypeLabel = (type: string) => {
    const labels = {
      PROFESSIONAL: '专业影评',
      EDITORIAL: '编辑评论',
      ANALYSIS: '深度分析',
      BEHIND_SCENES: '幕后故事',
      TRIVIA: '趣闻轶事'
    };
    return labels[type as keyof typeof labels] || '评论';
  };

  const getReviewTypeIcon = (type: string) => {
    const icons = {
      PROFESSIONAL: '🎬',
      EDITORIAL: '✍️',
      ANALYSIS: '🔍',
      BEHIND_SCENES: '🎭',
      TRIVIA: '💡'
    };
    return icons[type as keyof typeof icons] || '📝';
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 mb-8 border border-gray-200">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 总体评分 */}
        <div className="lg:col-span-1">
          <div className="text-center">
            <div className="mb-4">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {averageRating > 0 ? averageRating.toFixed(1) : '--'}
              </div>
              <div className="flex items-center justify-center mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    className={`w-6 h-6 ${
                      star <= Math.round(averageRating / 2)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600">
                基于 {reviewsWithRating.length} 个专业评分
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-blue-600 mb-1">{totalReviews}</div>
              <div className="text-sm text-gray-600">篇深度评论</div>
            </div>
          </div>
        </div>

        {/* 评分分布 */}
        <div className="lg:col-span-1">
          <h4 className="font-semibold text-gray-900 mb-4">评分分布</h4>
          <div className="space-y-2">
            {ratingDistribution.map(({ star, count, percentage }) => (
              <div key={star} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-sm font-medium">{star}</span>
                  <StarIcon className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 评论类型统计 */}
        <div className="lg:col-span-1">
          <h4 className="font-semibold text-gray-900 mb-4">评论类型</h4>
          <div className="space-y-3">
            {Object.entries(reviewTypeStats).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getReviewTypeIcon(type)}</span>
                  <span className="text-sm text-gray-700">
                    {getReviewTypeLabel(type)}
                  </span>
                </div>
                <span className="bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-900 shadow-sm">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 底部信息 */}
      <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <span>📅 最新更新：{new Date().toLocaleDateString('zh-CN')}</span>
          <span>🔄 定期更新评论内容</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span>评论质量：</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-green-600 font-medium">优质</span>
          </div>
        </div>
      </div>
    </div>
  );
}

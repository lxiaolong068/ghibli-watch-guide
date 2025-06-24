'use client';

import { useState } from 'react';
import { StarIcon, ShareIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface ReviewCardProps {
  review: {
    id: string;
    title: string;
    content: string;
    author: string;
    rating?: number;
    reviewType: string;
    publishedAt?: Date;
    isPublished: boolean;
  };
  index: number;
}

export function ReviewCard({ review, index }: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

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

  const getReviewTypeColor = (type: string) => {
    const colors = {
      PROFESSIONAL: 'bg-blue-100 text-blue-800 border-blue-200',
      EDITORIAL: 'bg-green-100 text-green-800 border-green-200',
      ANALYSIS: 'bg-purple-100 text-purple-800 border-purple-200',
      BEHIND_SCENES: 'bg-orange-100 text-orange-800 border-orange-200',
      TRIVIA: 'bg-pink-100 text-pink-800 border-pink-200'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
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

  // 检查内容长度，决定是否需要展开功能
  const contentLength = review.content.replace(/<[^>]*>/g, '').length;
  const needsExpansion = contentLength > 500;
  const displayContent = needsExpansion && !isExpanded 
    ? review.content.substring(0, 500) + '...'
    : review.content;

  // 渲染评分星星（5星制）
  const renderRating = (rating: number) => {
    const stars = [];
    const scaledRating = rating / 2; // 将10分制转换为5分制
    const fullStars = Math.floor(scaledRating);
    const hasHalfStar = scaledRating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarIconSolid key={i} className="w-5 h-5 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <StarIcon className="w-5 h-5 text-gray-300" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <StarIconSolid className="w-5 h-5 text-yellow-400" />
          </div>
        </div>
      );
    }

    const emptyStars = 5 - Math.ceil(scaledRating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className="w-5 h-5 text-gray-300" />
      );
    }

    return stars;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: review.title,
          text: `阅读这篇关于吉卜力电影的精彩评论：${review.title}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('分享失败:', error);
      }
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    }
  };

  return (
    <article className={`
      relative bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300
      ${index === 0 ? 'ring-2 ring-blue-100 border-blue-200' : ''}
    `}>
      {/* 特色标记 */}
      {index === 0 && (
        <div className="absolute -top-3 left-6">
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            ⭐ 精选评论
          </span>
        </div>
      )}

      <div className="p-6 md:p-8">
        {/* 头部信息 */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className={`
                inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border
                ${getReviewTypeColor(review.reviewType)}
              `}>
                <span className="mr-1">{getReviewTypeIcon(review.reviewType)}</span>
                {getReviewTypeLabel(review.reviewType)}
              </span>
              
              {review.rating && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {renderRating(review.rating).slice(0, 5)}
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {review.rating}/10
                  </span>
                </div>
              )}
            </div>
            
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 leading-tight">
              {review.title}
            </h3>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {review.author}
              </span>
              {review.publishedAt && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(review.publishedAt).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              )}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`
                p-2 rounded-lg transition-colors
                ${isBookmarked 
                  ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
              title="收藏评论"
            >
              <BookmarkIcon className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleShare}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              title="分享评论"
            >
              <ShareIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 评论内容 */}
        <div className="prose prose-lg prose-gray max-w-none">
          <div 
            dangerouslySetInnerHTML={{ __html: displayContent }}
            className="leading-relaxed"
          />
        </div>

        {/* 展开/收起按钮 */}
        {needsExpansion && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              {isExpanded ? (
                <>
                  <span>收起</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </>
              ) : (
                <>
                  <span>展开全文</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}

        {/* 底部信息 */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span>阅读时间：约 {Math.ceil(contentLength / 200)} 分钟</span>
            <span>字数：{contentLength.toLocaleString()}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span>觉得有用？</span>
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              👍 有帮助
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

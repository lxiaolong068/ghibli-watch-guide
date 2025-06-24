import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';
import { UserBehaviorTracker } from '@/app/components/analytics/UserBehaviorTracker';
import { ResponsiveAdSenseAd } from '@/app/components/SEOOptimizer';

export const metadata: Metadata = {
  title: '吉卜力电影评论大全 | 专业影评与深度分析',
  description: '阅读关于吉卜力工作室电影的专业影评和深度分析，包含艺术解读、制作幕后、文化内涵等多个维度的评论文章。',
  keywords: '吉卜力电影评论, 宫崎骏影评, 专业影评, 深度分析, 电影评论',
  openGraph: {
    title: '吉卜力电影评论大全 | 专业影评与深度分析',
    description: '阅读关于吉卜力工作室电影的专业影评和深度分析，包含艺术解读、制作幕后、文化内涵等多个维度的评论文章。',
    type: 'website',
    url: 'https://www.whereghibli.cc/reviews',
    images: [
      {
        url: 'https://www.whereghibli.cc/images/reviews-og.jpg',
        width: 1200,
        height: 630,
        alt: '吉卜力电影评论大全'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: '吉卜力电影评论大全 | 专业影评与深度分析',
    description: '阅读关于吉卜力工作室电影的专业影评和深度分析，包含艺术解读、制作幕后、文化内涵等多个维度的评论文章。',
    images: ['https://www.whereghibli.cc/images/reviews-og.jpg']
  }
};

interface ReviewWithMovie {
  id: string;
  title: string;
  content: string;
  author: string;
  rating?: number;
  reviewType: string;
  publishedAt?: Date;
  movie: {
    id: string;
    titleEn: string;
    titleJa?: string;
    year: number;
    posterUrl?: string;
  };
}

async function getAllReviews(): Promise<ReviewWithMovie[]> {
  try {
    // 检查表是否存在
    await prisma.$queryRaw`SELECT 1 FROM "MovieReview" LIMIT 1`;
    
    const reviews = await prisma.movieReview.findMany({
      where: {
        isPublished: true
      },
      include: {
        movie: {
          select: {
            id: true,
            titleEn: true,
            titleJa: true,
            year: true,
            posterUrl: true
          }
        }
      },
      orderBy: [
        { publishedAt: 'desc' },
        { reviewType: 'asc' }
      ]
    });
    
    return reviews;
  } catch (error) {
    console.log('MovieReview table not yet created, returning sample data');
    
    // 返回示例数据
    const movies = await prisma.movie.findMany({
      select: {
        id: true,
        titleEn: true,
        titleJa: true,
        year: true,
        posterUrl: true
      },
      take: 3
    });

    return movies.flatMap(movie => [
      {
        id: `sample-${movie.id}-1`,
        title: `${movie.titleEn}：宫崎骏的艺术巅峰之作`,
        content: `这部电影展现了宫崎骏独特的艺术视野和深刻的人文关怀。通过精美的画面和动人的故事，观众能够感受到人与自然和谐共处的重要性...`,
        author: '影评专家',
        reviewType: 'ANALYSIS',
        rating: 9.2,
        publishedAt: new Date('2024-01-15'),
        movie
      },
      {
        id: `sample-${movie.id}-2`,
        title: `${movie.titleEn} 制作幕后：手绘动画的坚持与创新`,
        content: `在数字动画盛行的时代，吉卜力工作室依然坚持手绘动画的传统工艺，这种坚持不仅体现了对艺术的尊重...`,
        author: '制作团队',
        reviewType: 'BEHIND_SCENES',
        rating: 8.8,
        publishedAt: new Date('2024-01-10'),
        movie
      }
    ]);
  }
}

function ReviewCard({ review }: { review: ReviewWithMovie }) {
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
      PROFESSIONAL: 'bg-blue-100 text-blue-800',
      EDITORIAL: 'bg-green-100 text-green-800',
      ANALYSIS: 'bg-purple-100 text-purple-800',
      BEHIND_SCENES: 'bg-orange-100 text-orange-800',
      TRIVIA: 'bg-pink-100 text-pink-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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

  // 提取纯文本内容用于预览
  const getTextContent = (html: string) => {
    return html.replace(/<[^>]*>/g, '').substring(0, 200) + '...';
  };

  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="flex">
        {/* 电影海报 */}
        <div className="flex-shrink-0 w-24 md:w-32">
          <Link href={`/movies/${review.movie.id}`}>
            {review.movie.posterUrl ? (
              <Image
                src={review.movie.posterUrl}
                alt={review.movie.titleEn}
                width={128}
                height={192}
                className="w-full h-full object-cover hover:opacity-90 transition-opacity"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4z" />
                </svg>
              </div>
            )}
          </Link>
        </div>

        {/* 评论内容 */}
        <div className="flex-1 p-4 md:p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getReviewTypeColor(review.reviewType)}`}>
                <span className="mr-1">{getReviewTypeIcon(review.reviewType)}</span>
                {getReviewTypeLabel(review.reviewType)}
              </span>
              
              {review.rating && (
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400">★</span>
                  <span className="text-sm font-medium">{review.rating}/10</span>
                </div>
              )}
            </div>
          </div>

          <Link href={`/movies/${review.movie.id}/reviews`} className="group">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
              {review.title}
            </h3>
          </Link>

          <div className="text-sm text-gray-600 mb-3">
            <Link href={`/movies/${review.movie.id}`} className="hover:text-blue-600 transition-colors">
              {review.movie.titleEn} ({review.movie.year})
            </Link>
            {review.movie.titleJa && (
              <span className="text-gray-500"> • {review.movie.titleJa}</span>
            )}
          </div>

          <p className="text-gray-700 text-sm mb-4"
             style={{
               display: '-webkit-box',
               WebkitLineClamp: 3,
               WebkitBoxOrient: 'vertical',
               overflow: 'hidden'
             }}>
            {getTextContent(review.content)}
          </p>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>作者：{review.author}</span>
            {review.publishedAt && (
              <span>{new Date(review.publishedAt).toLocaleDateString('zh-CN')}</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default async function ReviewsPage() {
  const reviews = await getAllReviews();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 用户行为跟踪 */}
      <UserBehaviorTracker pageType="reviews" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            吉卜力电影评论大全
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            深入解读吉卜力工作室的经典作品，从艺术分析到制作幕后，
            从文化内涵到现代意义，为您呈现最专业的影评和分析。
          </p>
        </div>

        {/* 广告位 */}
        <div className="flex justify-center mb-8">
          <ResponsiveAdSenseAd
            adSlot="1234567890"
            adFormat="auto"
            fullWidthResponsive={true}
          />
        </div>

        {/* 评论列表 */}
        <Suspense fallback={<LoadingSpinner />}>
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 mb-4">暂无评论内容</p>
              <p className="text-sm text-gray-400">我们正在为您准备精彩的影评内容</p>
            </div>
          )}
        </Suspense>

        {/* 底部广告位 */}
        <div className="flex justify-center mt-12">
          <ResponsiveAdSenseAd
            adSlot="9876543210"
            adFormat="auto"
            fullWidthResponsive={true}
          />
        </div>

        {/* SEO内容 */}
        <div className="mt-16 bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            关于吉卜力电影评论
          </h2>
          <div className="prose prose-lg max-w-none text-gray-700">
            <p>
              我们的评论团队由专业影评人、文化学者和资深动画爱好者组成，
              致力于为您提供最深入、最专业的吉卜力电影分析。
            </p>
            <p>
              每篇评论都经过精心撰写和严格审核，确保内容的准确性和深度。
              我们从多个角度解读每部作品：
            </p>
            <ul>
              <li><strong>艺术分析</strong>：画面构图、色彩运用、动画技法等视觉艺术层面</li>
              <li><strong>主题探讨</strong>：环保理念、人文关怀、成长主题等深层内涵</li>
              <li><strong>制作幕后</strong>：创作过程、技术创新、团队合作等制作细节</li>
              <li><strong>文化解读</strong>：日本文化、传统元素、现代意义等文化层面</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

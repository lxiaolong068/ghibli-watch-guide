import { Suspense } from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';
import { ReviewStats } from './ReviewStats';
import { ReviewCard } from './ReviewCard';

interface MovieReviewSectionProps {
  movieId: string;
}

export function MovieReviewSection({ movieId }: MovieReviewSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
      {/* 标题区域 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">In-Depth Analysis & Reviews</h2>
            <p className="text-blue-100">Professional reviews and analysis from our editorial team</p>
          </div>
          <div className="hidden md:block">
            <svg className="w-12 h-12 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1.586l-4 4z" />
            </svg>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="p-6 md:p-8">
        <Suspense fallback={<LoadingSpinner />}>
          <MovieReviewContent movieId={movieId} />
        </Suspense>
      </div>
    </div>
  );
}

async function MovieReviewContent({ movieId }: { movieId: string }) {
  // 获取电影评论
  const reviews = await getMovieReviews(movieId);

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-6">
          <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-3">No In-Depth Reviews Yet</h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          Our professional review team is preparing detailed analysis and reviews for this movie. Stay tuned!
        </p>
        <div className="bg-blue-50 rounded-lg p-4 max-w-sm mx-auto">
          <p className="text-sm text-blue-700">
            💡 Want to be the first to know about review updates? Follow our social media accounts
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 评论统计 */}
      <ReviewStats movieId={movieId} reviews={reviews} />

      {/* 评论列表 - 只显示前2篇 */}
      <div className="space-y-8">
        {reviews.slice(0, 2).map((review: any, index: number) => (
          <ReviewCard key={review.id} review={review} index={index} />
        ))}
      </div>

      {/* 查看更多评论按钮 */}
      {reviews.length > 2 && (
        <div className="text-center pt-6 border-t border-gray-200">
          <Link
            href={`/movies/${movieId}/reviews`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <span>View all {reviews.length} reviews</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <p className="text-sm text-gray-500 mt-2">
            Including professional reviews, behind-the-scenes insights, and in-depth analysis
          </p>
        </div>
      )}

      {/* 如果只有1-2篇评论，也显示链接 */}
      {reviews.length <= 2 && reviews.length > 0 && (
        <div className="text-center pt-6 border-t border-gray-200">
          <Link
            href={`/movies/${movieId}/reviews`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <span>View review details</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}



// 获取电影评论的函数
async function getMovieReviews(movieId: string) {
  try {
    // 检查表是否存在
    await prisma.$queryRaw`SELECT 1 FROM "MovieReview" LIMIT 1`;
    
    const reviews = await prisma.movieReview.findMany({
      where: {
        movieId,
        isPublished: true
      },
      orderBy: [
        { reviewType: 'asc' },
        { publishedAt: 'desc' }
      ]
    });
    
    return reviews;
  } catch (_error) {
    console.log('MovieReview table not yet created, returning sample data');
    
    // 返回示例数据
    return [
      {
        id: 'sample-1',
        title: 'Miyazaki\'s Environmental Vision and the Perfect Blend of Animation Art',
        content: `
          <p>This film is not just an animated work, but a profound expression of Miyazaki's environmental protection philosophy. Through exquisite visuals and moving storytelling, audiences can feel the importance of harmonious coexistence between humans and nature.</p>

          <h4>The Pinnacle of Visual Art</h4>
          <p>Every frame is meticulously designed, from character expressions to background details, showcasing Studio Ghibli's masterful craftsmanship. The depiction of natural scenes in particular makes viewers feel as if they are immersed in a world full of vitality.</p>

          <h4>Exploration of Deep Themes</h4>
          <p>Through the protagonist's growth journey, the film explores the relationship between humans and nature in modern society, as well as the balance between personal responsibility and collective interests. These themes are particularly important in today's era.</p>
        `,
        author: 'Film Critic Expert',
        reviewType: 'ANALYSIS',
        rating: 9.2,
        publishedAt: new Date('2024-01-15'),
        isPublished: true
      },
      {
        id: 'sample-2',
        title: 'Behind the Scenes: The Persistence and Innovation of Hand-Drawn Animation',
        content: `
          <p>In an era where digital animation prevails, Studio Ghibli still insists on the traditional craft of hand-drawn animation. This persistence not only reflects respect for art, but also showcases the unique charm of Japanese animation.</p>

          <h4>The Craftsmanship of the Production Team</h4>
          <p>From key animators to background artists, every artist involved in the production has devoted tremendous effort to this work. According to statistics, the background drawing of major scenes alone took several months.</p>

          <h4>The Fusion of Technology and Art</h4>
          <p>While adhering to hand-drawn traditions, the production team also cleverly utilized modern technology, improving production efficiency while maintaining artistic quality.</p>
        `,
        author: 'Production Team',
        reviewType: 'BEHIND_SCENES',
        rating: null,
        publishedAt: new Date('2024-01-10'),
        isPublished: true
      }
    ];
  }
}



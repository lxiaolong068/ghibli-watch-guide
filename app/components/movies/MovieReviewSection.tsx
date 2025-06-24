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
            <h2 className="text-2xl md:text-3xl font-bold mb-2">深度解析与评论</h2>
            <p className="text-blue-100">专业影评人和编辑团队的深度分析</p>
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
        <h3 className="text-xl font-semibold text-gray-700 mb-3">暂无深度评论</h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          我们的专业影评团队正在为这部电影准备详细的分析和评论，敬请期待！
        </p>
        <div className="bg-blue-50 rounded-lg p-4 max-w-sm mx-auto">
          <p className="text-sm text-blue-700">
            💡 想要第一时间获得评论更新？关注我们的社交媒体账号
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
            <span>查看全部 {reviews.length} 篇评论</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <p className="text-sm text-gray-500 mt-2">
            包含专业影评、制作幕后、深度分析等多种类型的评论
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
            <span>查看评论详情页</span>
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
  } catch (error) {
    console.log('MovieReview table not yet created, returning sample data');
    
    // 返回示例数据
    return [
      {
        id: 'sample-1',
        title: '宫崎骏的环保理念与动画艺术的完美结合',
        content: `
          <p>这部电影不仅仅是一部动画作品，更是宫崎骏对环境保护理念的深刻表达。通过精美的画面和动人的故事，观众能够感受到人与自然和谐共处的重要性。</p>
          
          <h4>视觉艺术的巅峰</h4>
          <p>每一帧画面都经过精心设计，从角色的表情到背景的细节，都体现了吉卜力工作室的匠心独运。特别是自然场景的描绘，让观众仿佛置身于一个充满生机的世界。</p>
          
          <h4>深层主题的探讨</h4>
          <p>影片通过主人公的成长历程，探讨了现代社会中人类与自然的关系，以及个人责任与集体利益之间的平衡。这些主题在当今时代显得尤为重要。</p>
        `,
        author: '影评专家',
        reviewType: 'ANALYSIS',
        rating: 9.2,
        publishedAt: new Date('2024-01-15'),
        isPublished: true
      },
      {
        id: 'sample-2',
        title: '制作幕后：手绘动画的坚持与创新',
        content: `
          <p>在数字动画盛行的时代，吉卜力工作室依然坚持手绘动画的传统工艺，这种坚持不仅体现了对艺术的尊重，更展现了日本动画的独特魅力。</p>
          
          <h4>制作团队的匠心</h4>
          <p>从原画师到背景美术，每一位参与制作的艺术家都为这部作品倾注了大量心血。据统计，仅主要场景的背景绘制就耗时数月。</p>
          
          <h4>技术与艺术的融合</h4>
          <p>虽然坚持手绘传统，但制作团队也巧妙地运用了现代技术，在保持艺术性的同时提高了制作效率。</p>
        `,
        author: '制作团队',
        reviewType: 'BEHIND_SCENES',
        rating: null,
        publishedAt: new Date('2024-01-10'),
        isPublished: true
      }
    ];
  }
}



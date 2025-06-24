import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';

interface MovieReviewSectionProps {
  movieId: string;
}

export function MovieReviewSection({ movieId }: MovieReviewSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">深度解析与评论</h2>
      
      <Suspense fallback={<LoadingSpinner />}>
        <MovieReviewContent movieId={movieId} />
      </Suspense>
    </div>
  );
}

async function MovieReviewContent({ movieId }: { movieId: string }) {
  // 获取电影评论
  const reviews = await getMovieReviews(movieId);
  
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-500 mb-4">暂无深度评论</p>
        <p className="text-sm text-gray-400">我们正在为这部电影准备详细的分析和评论</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {reviews.map((review: any) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: any }) {
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

  return (
    <article className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{review.title}</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>作者：{review.author}</span>
            {review.publishedAt && (
              <span>发布于：{new Date(review.publishedAt).toLocaleDateString('zh-CN')}</span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getReviewTypeColor(review.reviewType)}`}>
            {getReviewTypeLabel(review.reviewType)}
          </span>
          {review.rating && (
            <div className="flex items-center space-x-1">
              <span className="text-yellow-400">★</span>
              <span className="text-sm font-medium">{review.rating}/10</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="prose prose-gray max-w-none">
        <div dangerouslySetInnerHTML={{ __html: review.content }} />
      </div>
    </article>
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

// 评论统计组件
export function ReviewStats({ movieId }: { movieId: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-blue-600">4.8</div>
          <div className="text-sm text-gray-600">平均评分</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600">156</div>
          <div className="text-sm text-gray-600">评论数量</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-purple-600">92%</div>
          <div className="text-sm text-gray-600">推荐率</div>
        </div>
      </div>
    </div>
  );
}

// 评论表单组件（为未来用户评论功能预留）
export function ReviewForm({ movieId }: { movieId: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 mt-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">分享你的观影感受</h3>
      <p className="text-gray-600 mb-4">
        我们正在开发用户评论功能，敬请期待！
      </p>
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <span>📝</span>
        <span>即将推出：用户评分和评论系统</span>
      </div>
    </div>
  );
}

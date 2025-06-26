/**
 * 个性化推荐API
 * 整合多种推荐算法，根据用户行为动态调整推荐权重
 */

import { NextRequest, NextResponse } from 'next/server';
import { ContentBasedRecommender } from '@/app/utils/content-based-recommender';
import { CollaborativeFilteringRecommender } from '@/app/utils/collaborative-filtering-recommender';
import { UserBehaviorManager } from '@/app/utils/user-behavior-manager';
import { RecommendationContext } from '@/app/types/user-behavior';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/app/lib/error-handler';

// 将此路由标记为动态路由，防止在构建时静态生成
export const dynamic = 'force-dynamic';

// 个性化推荐结果
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

// 推荐算法权重配置
interface AlgorithmWeights {
  contentBased: number;
  collaborative: number;
  popularity: number;
  recency: number;
}

// 默认权重配置
const DEFAULT_WEIGHTS: AlgorithmWeights = {
  contentBased: 0.4,
  collaborative: 0.3,
  popularity: 0.2,
  recency: 0.1,
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const types = searchParams.get('types')?.split(',') || ['movie', 'character', 'review', 'guide'];
    const contextType = searchParams.get('context') || 'general'; // general, movie_detail, search_result
    const contextId = searchParams.get('contextId') || undefined; // 当前页面的内容ID
    const _sessionId = searchParams.get('sessionId'); // 用户会话ID

    // 获取用户行为管理器
    const behaviorManager = UserBehaviorManager.getInstance();
    
    // 获取推荐上下文 - 如果没有活动会话则使用默认值
    let context: RecommendationContext;
    let userPreferences: any = null;
    
    try {
      context = behaviorManager.getRecommendationContext();
      userPreferences = behaviorManager.analyzeUserPreferences();
    } catch (error) {
      // 服务器端没有活动会话时的默认上下文
      const sessionId = `server_session_${Date.now()}`;
      context = {
        sessionId,
        currentPageType: 'home',
        currentEntityId: undefined,
        recentViews: [],
        recentSearches: [],
        timeOfDay: new Date().getHours(),
        dayOfWeek: new Date().getDay(),
        deviceType: 'desktop',
        referrer: undefined,
      };
    }
    
    // 根据用户行为调整算法权重
    const weights = await calculateDynamicWeights(userPreferences, context);
    
    // 获取各种推荐结果
    const recommendations = await generateHybridRecommendations({
      context,
      contextType,
      contextId,
      types,
      limit: limit * 2, // 获取更多候选结果
      weights,
    });

    // 去重和最终排序
    const finalRecommendations = deduplicateAndRank(recommendations, limit);

    // 记录推荐结果用于后续分析
    await logRecommendations(context.sessionId, finalRecommendations);

    return NextResponse.json({
      recommendations: finalRecommendations,
      total: finalRecommendations.length,
      context: {
        sessionId: context.sessionId,
        contextType,
        contextId,
        weights,
      },
      metadata: {
        userPreferences: userPreferences ? {
          contentTypes: userPreferences.preferredContentTypes,
          searchPatterns: userPreferences.searchPatterns.slice(0, 3),
          lastActivity: userPreferences.lastActivity,
        } : null,
      },
    });
  } catch (error) {
    console.error('Personalized recommendation error:', error);
    return handleApiError(error);
  }
}

/**
 * 生成混合推荐结果
 */
async function generateHybridRecommendations({
  context,
  contextType,
  contextId,
  types,
  limit,
  weights,
}: {
  context: any;
  contextType: string;
  contextId?: string;
  types: string[];
  limit: number;
  weights: AlgorithmWeights;
}): Promise<PersonalizedRecommendation[]> {
  const allRecommendations: PersonalizedRecommendation[] = [];

  // 1. 基于内容的推荐
  if (weights.contentBased > 0) {
    const contentRecommendations = await getContentBasedRecommendations(
      contextId,
      contextType,
      types,
      Math.ceil(limit * weights.contentBased)
    );
    allRecommendations.push(...contentRecommendations);
  }

  // 2. 协同过滤推荐
  if (weights.collaborative > 0) {
    const collaborativeRecommendations = await getCollaborativeRecommendations(
      context,
      types,
      Math.ceil(limit * weights.collaborative)
    );
    allRecommendations.push(...collaborativeRecommendations);
  }

  // 3. 热门内容推荐
  if (weights.popularity > 0) {
    const popularRecommendations = await getPopularRecommendations(
      types,
      Math.ceil(limit * weights.popularity)
    );
    allRecommendations.push(...popularRecommendations);
  }

  // 4. 最新内容推荐
  if (weights.recency > 0) {
    const recentRecommendations = await getRecentRecommendations(
      types,
      Math.ceil(limit * weights.recency)
    );
    allRecommendations.push(...recentRecommendations);
  }

  return allRecommendations;
}

/**
 * 获取基于内容的推荐
 */
async function getContentBasedRecommendations(
  contextId?: string,
  contextType?: string,
  types?: string[],
  limit?: number
): Promise<PersonalizedRecommendation[]> {
  if (!contextId || contextType !== 'movie_detail') {
    return [];
  }

  try {
    const recommender = new ContentBasedRecommender();
    const similarities = await recommender.getRecommendations(contextId, limit);
    
    const recommendations: PersonalizedRecommendation[] = [];
    
    for (const similarity of similarities) {
      const movie = await prisma.movie.findUnique({
        where: { id: similarity.movieId },
      });
      
      if (movie) {
        recommendations.push({
          id: movie.id,
          type: 'movie',
          title: movie.titleEn,
          subtitle: `${movie.year} • ${movie.director || '未知导演'}`,
          description: movie.synopsis?.substring(0, 150),
          imageUrl: movie.posterUrl,
          url: `/movies/${movie.id}`,
          score: similarity.score,
          algorithm: 'content',
          reasons: similarity.reasons.map(reason => ({
            type: reason.type,
            description: reason.description,
            confidence: reason.score,
          })),
        });
      }
    }
    
    return recommendations;
  } catch (error) {
    console.error('Content-based recommendation error:', error);
    return [];
  }
}

/**
 * 获取协同过滤推荐
 */
async function getCollaborativeRecommendations(
  context: any,
  types: string[],
  limit: number
): Promise<PersonalizedRecommendation[]> {
  try {
    const recommender = new CollaborativeFilteringRecommender();
    const collaborativeResults = await recommender.getRecommendations(context, limit);
    
    const recommendations: PersonalizedRecommendation[] = [];
    
    for (const result of collaborativeResults) {
      let content = null;
      let url = '';
      let subtitle = '';
      
      if (result.contentType === 'movie') {
        content = await prisma.movie.findUnique({
          where: { id: result.contentId },
        });
        url = `/movies/${result.contentId}`;
        subtitle = content ? `${content.year} • ${content.director || '未知导演'}` : '';
      }
      // 可以添加其他内容类型的处理
      
      if (content) {
        recommendations.push({
          id: result.contentId,
          type: result.contentType as any,
          title: (content as any).titleEn || (content as any).name || '未知标题',
          subtitle,
          description: (content as any).synopsis?.substring(0, 150),
          imageUrl: (content as any).posterUrl || (content as any).imageUrl,
          url,
          score: result.score,
          algorithm: 'collaborative',
          reasons: result.reasons.map(reason => ({
            type: reason.type,
            description: reason.description,
            confidence: reason.score,
          })),
          metadata: {
            similarUsers: result.similarUsers.length,
          },
        });
      }
    }
    
    return recommendations;
  } catch (error) {
    console.error('Collaborative filtering error:', error);
    return [];
  }
}

/**
 * 获取热门内容推荐
 */
async function getPopularRecommendations(
  types: string[],
  limit: number
): Promise<PersonalizedRecommendation[]> {
  const recommendations: PersonalizedRecommendation[] = [];
  
  if (types.includes('movie')) {
    try {
      const popularMovies = await prisma.movie.findMany({
        include: {
          stats: true,
        },
        orderBy: [
          { stats: { viewCount: 'desc' } },
          { voteAverage: 'desc' },
        ],
        take: limit,
      });
      
      recommendations.push(...popularMovies.map(movie => ({
        id: movie.id,
        type: 'movie' as const,
        title: movie.titleEn,
        subtitle: `${movie.year} • ${movie.director || '未知导演'}`,
        description: movie.synopsis?.substring(0, 150),
        imageUrl: movie.posterUrl,
        url: `/movies/${movie.id}`,
        score: 0.8, // 固定分数
        algorithm: 'popular' as const,
        reasons: [{
          type: 'popularity',
          description: `热门电影 (${movie.stats?.viewCount || 0} 次浏览)`,
          confidence: 0.8,
        }],
        metadata: {
          viewCount: movie.stats?.viewCount || 0,
          rating: movie.voteAverage,
        },
      })));
    } catch (error) {
      console.error('Popular movies error:', error);
    }
  }

  if (types.includes('character')) {
    try {
      const popularCharacters = await prisma.character.findMany({
        include: {
          movieCharacters: {
            include: {
              movie: {
                select: { 
                  id: true, 
                  titleEn: true, 
                  posterUrl: true, 
                  stats: true,
                  year: true,
                },
              },
            },
            orderBy: { importance: 'desc' },
            take: 1, // 取最重要的电影关联
          },
        },
        where: { 
          isMainCharacter: true,
          movieCharacters: {
            some: {} // 确保有关联的电影
          }
        },
        orderBy: { name: 'asc' },
        take: limit,
      });
      
      recommendations.push(...popularCharacters.map(character => {
        const mainMovie = character.movieCharacters[0]?.movie;
        return {
          id: character.id,
          type: 'character' as const,
          title: character.name || character.nameJa || character.nameZh || '未知角色',
          subtitle: mainMovie ? `来自《${mainMovie.titleEn}》(${mainMovie.year})` : '吉卜力角色',
          description: character.description?.substring(0, 150) || '经典吉卜力动画角色',
          imageUrl: character.imageUrl || mainMovie?.posterUrl,
          url: `/characters/${character.id}`,
          score: 0.75,
          algorithm: 'popular' as const,
          reasons: [{
            type: 'popularity',
            description: `经典主要角色`,
            confidence: 0.75,
          }],
          metadata: {
            movieTitle: mainMovie?.titleEn,
            movieYear: mainMovie?.year,
            isMainCharacter: character.isMainCharacter,
          },
        };
      }));
    } catch (error) {
      console.error('Popular characters error:', error);
    }
  }
  
  return recommendations;
}

/**
 * 获取最新内容推荐
 */
async function getRecentRecommendations(
  types: string[],
  limit: number
): Promise<PersonalizedRecommendation[]> {
  const recommendations: PersonalizedRecommendation[] = [];
  
  if (types.includes('review')) {
    try {
      const recentReviews = await prisma.movieReview.findMany({
        where: { isPublished: true },
        include: { movie: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
      
      recommendations.push(...recentReviews.map(review => ({
        id: review.id,
        type: 'review' as const,
        title: review.title,
        subtitle: `${review.author} • ${review.movie.titleEn}`,
        description: review.content.substring(0, 150),
        imageUrl: review.movie.posterUrl,
        url: `/reviews/${review.id}`,
        score: 0.6,
        algorithm: 'popular' as const,
        reasons: [{
          type: 'recency',
          description: '最新发布的评论',
          confidence: 0.6,
        }],
        metadata: {
          publishDate: review.createdAt,
          movieTitle: review.movie.titleEn,
        },
      })));
    } catch (error) {
      console.error('Recent reviews error:', error);
    }
  }

  if (types.includes('character')) {
    try {
      const recentCharacters = await prisma.character.findMany({
        include: {
          movieCharacters: {
            include: {
              movie: {
                select: { 
                  id: true, 
                  titleEn: true, 
                  posterUrl: true,
                  year: true,
                },
              },
            },
            orderBy: { importance: 'desc' },
            take: 1,
          },
        },
        where: { 
          movieCharacters: {
            some: {} // 确保有关联的电影
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
      });
      
      recommendations.push(...recentCharacters.map(character => {
        const mainMovie = character.movieCharacters[0]?.movie;
        return {
          id: character.id,
          type: 'character' as const,
          title: character.name || character.nameJa || character.nameZh || '未知角色',
          subtitle: mainMovie ? `来自《${mainMovie.titleEn}》(${mainMovie.year})` : '吉卜力角色',
          description: character.description?.substring(0, 150) || '经典吉卜力动画角色',
          imageUrl: character.imageUrl || mainMovie?.posterUrl,
          url: `/characters/${character.id}`,
          score: 0.5,
          algorithm: 'popular' as const,
          reasons: [{
            type: 'recency',
            description: '最近更新的角色信息',
            confidence: 0.5,
          }],
          metadata: {
            movieTitle: mainMovie?.titleEn,
            movieYear: mainMovie?.year,
            lastUpdated: character.updatedAt,
          },
        };
      }));
    } catch (error) {
      console.error('Recent characters error:', error);
    }
  }
  
  return recommendations;
}

/**
 * 根据用户行为动态计算算法权重
 */
async function calculateDynamicWeights(
  userPreferences: any,
  _context: unknown
): Promise<AlgorithmWeights> {
  const weights = { ...DEFAULT_WEIGHTS };

  if (!userPreferences) {
    return weights;
  }

  // 根据用户活跃度调整权重
  const engagementLevel = userPreferences.averageSessionDuration || 0;
  
  if (engagementLevel > 60000) { // 高活跃用户（超过1分钟平均停留）
    weights.collaborative += 0.1;
    weights.contentBased += 0.1;
    weights.popularity -= 0.2;
  } else if (engagementLevel < 30000) { // 低活跃用户（少于30秒）
    weights.popularity += 0.2;
    weights.collaborative -= 0.1;
    weights.contentBased -= 0.1;
  }
  
  // 根据搜索行为调整权重
  if (userPreferences.searchPatterns && userPreferences.searchPatterns.length > 0) {
    weights.contentBased += 0.1;
    weights.popularity -= 0.1;
  }
  
  // 确保权重总和为1
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  Object.keys(weights).forEach(key => {
    weights[key as keyof AlgorithmWeights] /= totalWeight;
  });
  
  return weights;
}

/**
 * 去重和最终排序
 */
function deduplicateAndRank(
  recommendations: PersonalizedRecommendation[],
  limit: number
): PersonalizedRecommendation[] {
  const seen = new Set<string>();
  const unique = recommendations.filter(rec => {
    const key = `${rec.type}_${rec.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  return unique
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * 记录推荐结果用于分析
 */
async function logRecommendations(
  sessionId: string,
  recommendations: PersonalizedRecommendation[]
): Promise<void> {
  try {
    // 这里可以记录推荐结果到数据库或日志系统
    // 用于后续的推荐效果分析和优化
    console.log(`Generated ${recommendations.length} recommendations for session ${sessionId}`);
  } catch (error) {
    console.error('Failed to log recommendations:', error);
  }
}

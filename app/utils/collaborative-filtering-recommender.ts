/**
 * 协同过滤推荐算法
 * 基于用户行为数据，实现简化版协同过滤算法
 * 由于没有用户系统，基于会话和行为模式进行推荐
 */

import { UserBehaviorManager } from './user-behavior-manager';
import {
  PageView,
  SearchBehavior,
  ContentInteraction,
  // UserPreferences,
  RecommendationContext
} from '@/app/types/user-behavior';
import { prisma } from '@/lib/prisma';

// 用户行为模式
export interface UserBehaviorPattern {
  sessionId: string;
  contentPreferences: ContentPreference[];
  searchPatterns: SearchPattern[];
  timePatterns: TimePattern[];
  engagementLevel: number; // 参与度评分 0-100
  lastActivity: number;
}

// 内容偏好
export interface ContentPreference {
  contentType: 'movie' | 'character' | 'review' | 'guide';
  contentId: string;
  score: number; // 偏好分数，基于浏览时间、交互次数等
  interactions: number;
  lastInteraction: number;
}

// 搜索模式
export interface SearchPattern {
  keywords: string[];
  frequency: number;
  successRate: number;
  categories: string[];
}

// 时间模式
export interface TimePattern {
  preferredHours: number[];
  preferredDays: number[];
  sessionDuration: number;
}

// 相似用户
export interface SimilarUser {
  sessionId: string;
  similarity: number;
  commonInterests: string[];
  behaviorPattern: UserBehaviorPattern;
}

// 协同过滤推荐结果
export interface CollaborativeRecommendation {
  contentId: string;
  contentType: string;
  score: number;
  reasons: CollaborativeReason[];
  similarUsers: string[]; // 推荐此内容的相似用户会话ID
}

// 推荐原因
export interface CollaborativeReason {
  type: 'similar_users' | 'popular_among_similar' | 'trending' | 'complementary';
  score: number;
  description: string;
  userCount?: number;
}

export class CollaborativeFilteringRecommender {
  private behaviorManager: UserBehaviorManager;
  private minSimilarity: number = 0.3; // 最小相似度阈值
  private minUserInteractions: number = 3; // 最少交互次数

  constructor() {
    this.behaviorManager = UserBehaviorManager.getInstance();
  }

  /**
   * 获取协同过滤推荐
   */
  async getRecommendations(
    context: RecommendationContext,
    limit: number = 10
  ): Promise<CollaborativeRecommendation[]> {
    // 获取当前用户的行为模式
    const currentPattern = await this.getCurrentUserPattern(context.sessionId);
    if (!currentPattern) {
      return [];
    }

    // 找到相似用户
    const similarUsers = await this.findSimilarUsers(currentPattern);
    if (similarUsers.length === 0) {
      return [];
    }

    // 基于相似用户生成推荐
    const recommendations = await this.generateRecommendations(
      currentPattern,
      similarUsers,
      context
    );

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * 获取当前用户的行为模式
   */
  private async getCurrentUserPattern(sessionId: string): Promise<UserBehaviorPattern | null> {
    try {
      // 从本地存储获取用户行为数据
      const pageViews = this.getSessionData<PageView[]>('ghibli_page_views', sessionId);
      const searches = this.getSessionData<SearchBehavior[]>('ghibli_search_behavior', sessionId);
      const interactions = this.getSessionData<ContentInteraction[]>('ghibli_content_interactions', sessionId);

      if (pageViews.length === 0 && interactions.length === 0) {
        return null;
      }

      // 分析内容偏好
      const contentPreferences = this.analyzeContentPreferences(pageViews, interactions);
      
      // 分析搜索模式
      const searchPatterns = this.analyzeSearchPatterns(searches);
      
      // 分析时间模式
      const timePatterns = this.analyzeTimePatterns(pageViews);
      
      // 计算参与度
      const engagementLevel = this.calculateEngagementLevel(pageViews, interactions);

      return {
        sessionId,
        contentPreferences,
        searchPatterns,
        timePatterns,
        engagementLevel,
        lastActivity: Math.max(
          ...pageViews.map(pv => pv.timestamp),
          ...interactions.map(i => i.timestamp),
          0
        ),
      };
    } catch (error) {
      console.error('Error getting user pattern:', error);
      return null;
    }
  }

  /**
   * 找到相似用户
   */
  private async findSimilarUsers(currentPattern: UserBehaviorPattern): Promise<SimilarUser[]> {
    // 获取所有其他用户的行为模式
    const allPatterns = await this.getAllUserPatterns(currentPattern.sessionId);
    
    const similarUsers: SimilarUser[] = [];

    for (const pattern of allPatterns) {
      const similarity = this.calculateUserSimilarity(currentPattern, pattern);
      
      if (similarity >= this.minSimilarity) {
        const commonInterests = this.findCommonInterests(currentPattern, pattern);
        
        similarUsers.push({
          sessionId: pattern.sessionId,
          similarity,
          commonInterests,
          behaviorPattern: pattern,
        });
      }
    }

    return similarUsers.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * 基于相似用户生成推荐
   */
  private async generateRecommendations(
    currentPattern: UserBehaviorPattern,
    similarUsers: SimilarUser[],
    _context: RecommendationContext
  ): Promise<CollaborativeRecommendation[]> {
    const recommendations = new Map<string, CollaborativeRecommendation>();
    
    // 获取当前用户已经交互过的内容
    const currentUserContent = new Set(
      currentPattern.contentPreferences.map(cp => cp.contentId)
    );

    // 分析相似用户的偏好
    for (const similarUser of similarUsers) {
      for (const preference of similarUser.behaviorPattern.contentPreferences) {
        // 跳过当前用户已经交互过的内容
        if (currentUserContent.has(preference.contentId)) {
          continue;
        }

        const key = `${preference.contentType}_${preference.contentId}`;
        const existing = recommendations.get(key);
        
        if (existing) {
          // 更新现有推荐
          existing.score += preference.score * similarUser.similarity;
          existing.similarUsers.push(similarUser.sessionId);
          existing.reasons[0].userCount = (existing.reasons[0].userCount || 0) + 1;
        } else {
          // 创建新推荐
          recommendations.set(key, {
            contentId: preference.contentId,
            contentType: preference.contentType,
            score: preference.score * similarUser.similarity,
            reasons: [{
              type: 'similar_users',
              score: similarUser.similarity,
              description: `相似用户喜欢的内容`,
              userCount: 1,
            }],
            similarUsers: [similarUser.sessionId],
          });
        }
      }
    }

    // 添加热门内容推荐
    await this.addTrendingRecommendations(recommendations, currentUserContent);

    return Array.from(recommendations.values());
  }

  /**
   * 计算用户相似度
   */
  private calculateUserSimilarity(user1: UserBehaviorPattern, user2: UserBehaviorPattern): number {
    let totalSimilarity = 0;
    let weightSum = 0;

    // 1. 内容偏好相似度 (权重: 0.5)
    const contentSimilarity = this.calculateContentSimilarity(
      user1.contentPreferences,
      user2.contentPreferences
    );
    totalSimilarity += contentSimilarity * 0.5;
    weightSum += 0.5;

    // 2. 搜索模式相似度 (权重: 0.3)
    const searchSimilarity = this.calculateSearchSimilarity(
      user1.searchPatterns,
      user2.searchPatterns
    );
    totalSimilarity += searchSimilarity * 0.3;
    weightSum += 0.3;

    // 3. 时间模式相似度 (权重: 0.2)
    const timeSimilarity = this.calculateTimeSimilarity(
      user1.timePatterns,
      user2.timePatterns
    );
    totalSimilarity += timeSimilarity * 0.2;
    weightSum += 0.2;

    return weightSum > 0 ? totalSimilarity / weightSum : 0;
  }

  /**
   * 计算内容偏好相似度
   */
  private calculateContentSimilarity(
    prefs1: ContentPreference[],
    prefs2: ContentPreference[]
  ): number {
    if (prefs1.length === 0 || prefs2.length === 0) return 0;

    const content1 = new Set(prefs1.map(p => p.contentId));
    const content2 = new Set(prefs2.map(p => p.contentId));
    
    const intersection = new Set([...content1].filter(id => content2.has(id)));
    const union = new Set([...content1, ...content2]);
    
    // Jaccard相似度
    return intersection.size / union.size;
  }

  /**
   * 计算搜索模式相似度
   */
  private calculateSearchSimilarity(
    patterns1: SearchPattern[],
    patterns2: SearchPattern[]
  ): number {
    if (patterns1.length === 0 || patterns2.length === 0) return 0;

    const keywords1 = new Set(patterns1.flatMap(p => p.keywords));
    const keywords2 = new Set(patterns2.flatMap(p => p.keywords));
    
    const intersection = new Set([...keywords1].filter(kw => keywords2.has(kw)));
    const union = new Set([...keywords1, ...keywords2]);
    
    return intersection.size / union.size;
  }

  /**
   * 计算时间模式相似度
   */
  private calculateTimeSimilarity(
    patterns1: TimePattern[],
    patterns2: TimePattern[]
  ): number {
    if (patterns1.length === 0 || patterns2.length === 0) return 0;

    // 简化实现：比较活跃时间段的重叠度
    const hours1 = new Set(patterns1.flatMap(p => p.preferredHours));
    const hours2 = new Set(patterns2.flatMap(p => p.preferredHours));
    
    const intersection = new Set([...hours1].filter(h => hours2.has(h)));
    const union = new Set([...hours1, ...hours2]);
    
    return intersection.size / union.size;
  }

  /**
   * 找到共同兴趣
   */
  private findCommonInterests(
    pattern1: UserBehaviorPattern,
    pattern2: UserBehaviorPattern
  ): string[] {
    const interests1 = new Set(pattern1.contentPreferences.map(cp => cp.contentId));
    const interests2 = new Set(pattern2.contentPreferences.map(cp => cp.contentId));
    
    return [...interests1].filter(id => interests2.has(id));
  }

  /**
   * 添加热门内容推荐
   */
  private async addTrendingRecommendations(
    recommendations: Map<string, CollaborativeRecommendation>,
    excludeContent: Set<string>
  ): Promise<void> {
    try {
      // 获取最受欢迎的电影
      const popularMovies = await prisma.movieStats.findMany({
        where: {
          movie: {
            id: { notIn: Array.from(excludeContent) }
          }
        },
        include: { movie: true },
        orderBy: [
          { viewCount: 'desc' },
          { favoriteCount: 'desc' }
        ],
        take: 5,
      });

      for (const movieStat of popularMovies) {
        const key = `movie_${movieStat.movieId}`;
        if (!recommendations.has(key)) {
          const popularityScore = Math.min(1, movieStat.viewCount / 100); // 标准化分数
          
          recommendations.set(key, {
            contentId: movieStat.movieId,
            contentType: 'movie',
            score: popularityScore * 0.3, // 降低热门内容的权重
            reasons: [{
              type: 'trending',
              score: popularityScore,
              description: `热门内容 (${movieStat.viewCount} 次浏览)`,
            }],
            similarUsers: [],
          });
        }
      }
    } catch (error) {
      console.error('Error adding trending recommendations:', error);
    }
  }

  // 辅助方法
  private getSessionData<T extends { sessionId: string }[]>(
    storageKey: string,
    sessionId: string
  ): T {
    if (typeof window === 'undefined') return [] as unknown as T;
    
    try {
      const data = localStorage.getItem(storageKey);
      if (!data) return [] as unknown as T;
      
      const allData = JSON.parse(data) as T;
      return allData.filter(item => item.sessionId === sessionId) as T;
    } catch {
      return [] as unknown as T;
    }
  }

  private async getAllUserPatterns(_excludeSessionId: string): Promise<UserBehaviorPattern[]> {
    // 简化实现：从本地存储获取其他会话的数据
    // 在实际应用中，这些数据应该存储在服务器端
    const patterns: UserBehaviorPattern[] = [];
    
    // 这里需要实现获取其他用户会话数据的逻辑
    // 由于隐私考虑，实际实现中可能需要匿名化处理
    
    return patterns;
  }

  private analyzeContentPreferences(
    pageViews: PageView[],
    interactions: ContentInteraction[]
  ): ContentPreference[] {
    const preferences = new Map<string, ContentPreference>();

    // 分析页面浏览
    pageViews.forEach(pv => {
      if (!pv.entityId) return;
      
      const key = `${pv.pageType}_${pv.entityId}`;
      const existing = preferences.get(key);
      const score = Math.min(100, (pv.dwellTime || 0) / 1000 + pv.scrollDepth / 10);
      
      if (existing) {
        existing.score = Math.max(existing.score, score);
        existing.interactions++;
        existing.lastInteraction = Math.max(existing.lastInteraction, pv.timestamp);
      } else {
        preferences.set(key, {
          contentType: pv.pageType as any,
          contentId: pv.entityId,
          score,
          interactions: 1,
          lastInteraction: pv.timestamp,
        });
      }
    });

    // 分析交互行为
    interactions.forEach(interaction => {
      const key = `${interaction.contentType}_${interaction.contentId}`;
      const existing = preferences.get(key);
      const interactionScore = this.getInteractionScore(interaction.interactionType);
      
      if (existing) {
        existing.score += interactionScore;
        existing.interactions++;
        existing.lastInteraction = Math.max(existing.lastInteraction, interaction.timestamp);
      } else {
        preferences.set(key, {
          contentType: interaction.contentType,
          contentId: interaction.contentId,
          score: interactionScore,
          interactions: 1,
          lastInteraction: interaction.timestamp,
        });
      }
    });

    return Array.from(preferences.values())
      .filter(pref => pref.interactions >= this.minUserInteractions)
      .sort((a, b) => b.score - a.score);
  }

  private analyzeSearchPatterns(searches: SearchBehavior[]): SearchPattern[] {
    if (searches.length === 0) return [];

    const patterns = new Map<string, {
      keywords: Set<string>;
      frequency: number;
      successCount: number;
      categories: Set<string>;
    }>();

    searches.forEach(search => {
      const keywords = search.query.toLowerCase().split(/\s+/);
      const key = keywords.sort().join('_');
      
      const existing = patterns.get(key) || {
        keywords: new Set<string>(),
        frequency: 0,
        successCount: 0,
        categories: new Set<string>(),
      };

      keywords.forEach(kw => existing.keywords.add(kw));
      existing.frequency++;
      if (search.clickedResults.length > 0) existing.successCount++;
      if (search.category) existing.categories.add(search.category);
      
      patterns.set(key, existing);
    });

    return Array.from(patterns.entries()).map(([_, data]) => ({
      keywords: Array.from(data.keywords),
      frequency: data.frequency,
      successRate: data.successCount / data.frequency,
      categories: Array.from(data.categories),
    }));
  }

  private analyzeTimePatterns(pageViews: PageView[]): TimePattern[] {
    if (pageViews.length === 0) return [];

    const hourCounts = new Array(24).fill(0);
    const dayCounts = new Array(7).fill(0);
    let totalDuration = 0;

    pageViews.forEach(pv => {
      const date = new Date(pv.timestamp);
      hourCounts[date.getHours()]++;
      dayCounts[date.getDay()]++;
      totalDuration += pv.dwellTime || 0;
    });

    const preferredHours = hourCounts
      .map((count, hour) => ({ hour, count }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
      .map(item => item.hour);

    const preferredDays = dayCounts
      .map((count, day) => ({ day, count }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
      .map(item => item.day);

    return [{
      preferredHours,
      preferredDays,
      sessionDuration: totalDuration / pageViews.length,
    }];
  }

  private calculateEngagementLevel(
    pageViews: PageView[],
    interactions: ContentInteraction[]
  ): number {
    if (pageViews.length === 0) return 0;

    const avgDwellTime = pageViews.reduce((sum, pv) => sum + (pv.dwellTime || 0), 0) / pageViews.length;
    const avgScrollDepth = pageViews.reduce((sum, pv) => sum + pv.scrollDepth, 0) / pageViews.length;
    const interactionRate = interactions.length / pageViews.length;

    // 综合计算参与度分数
    const dwellScore = Math.min(50, avgDwellTime / 1000); // 最高50分
    const scrollScore = Math.min(30, avgScrollDepth * 0.3); // 最高30分
    const interactionScore = Math.min(20, interactionRate * 20); // 最高20分

    return dwellScore + scrollScore + interactionScore;
  }

  private getInteractionScore(type: ContentInteraction['interactionType']): number {
    const scores = {
      'view': 5,
      'like': 15,
      'share': 25,
      'favorite': 30,
      'comment': 20,
      'tag_click': 10,
    };
    return scores[type] || 5;
  }
}

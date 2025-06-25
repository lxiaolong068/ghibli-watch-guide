/**
 * 推荐效果评估和分析工具
 * 用于跟踪推荐系统的性能指标和优化建议
 */

import { UserBehaviorManager } from './user-behavior-manager';
import { RecommendationFeedback } from '@/app/types/user-behavior';

// 推荐效果指标
export interface RecommendationMetrics {
  // 基础指标
  totalRecommendations: number;
  totalClicks: number;
  totalViews: number;
  totalDismissals: number;
  
  // 转化率指标
  clickThroughRate: number; // 点击率
  viewThroughRate: number; // 浏览率
  engagementRate: number; // 参与率
  
  // 算法效果对比
  algorithmPerformance: AlgorithmPerformance[];
  
  // 位置效果分析
  positionAnalysis: PositionAnalysis[];
  
  // 内容类型效果
  contentTypeAnalysis: ContentTypeAnalysis[];
  
  // 时间趋势
  timeSeriesData: TimeSeriesPoint[];
  
  // 用户满意度
  userSatisfaction: UserSatisfactionMetrics;
}

export interface AlgorithmPerformance {
  algorithm: 'content' | 'collaborative' | 'popular' | 'hybrid';
  totalRecommendations: number;
  clicks: number;
  views: number;
  clickThroughRate: number;
  averageDwellTime: number;
  conversionScore: number; // 综合转化分数
}

export interface PositionAnalysis {
  position: number;
  totalRecommendations: number;
  clicks: number;
  clickThroughRate: number;
  averageScore: number; // 推荐分数
}

export interface ContentTypeAnalysis {
  contentType: 'movie' | 'character' | 'review' | 'guide';
  totalRecommendations: number;
  clicks: number;
  views: number;
  clickThroughRate: number;
  averageDwellTime: number;
  userPreference: number; // 用户偏好分数
}

export interface TimeSeriesPoint {
  timestamp: number;
  clickThroughRate: number;
  totalRecommendations: number;
  totalClicks: number;
  algorithmDistribution: Record<string, number>;
}

export interface UserSatisfactionMetrics {
  averageSessionDuration: number;
  bounceRate: number;
  returnUserRate: number;
  diversityScore: number; // 推荐多样性分数
  noveltyScore: number; // 推荐新颖性分数
}

// 推荐优化建议
export interface OptimizationSuggestion {
  type: 'algorithm_weight' | 'content_type' | 'position' | 'timing' | 'diversity';
  priority: 'high' | 'medium' | 'low';
  description: string;
  expectedImprovement: number; // 预期改善百分比
  implementation: string;
  metrics: string[];
}

export class RecommendationAnalytics {
  private behaviorManager: UserBehaviorManager;
  private readonly STORAGE_KEY = 'ghibli_recommendation_analytics';

  constructor() {
    this.behaviorManager = UserBehaviorManager.getInstance();
  }

  /**
   * 分析推荐效果
   */
  async analyzeRecommendationPerformance(
    timeRange: { start: number; end: number } = {
      start: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30天前
      end: Date.now()
    }
  ): Promise<RecommendationMetrics> {
    const feedbackData = this.getRecommendationFeedback(timeRange);
    const behaviorData = this.behaviorManager.getBehaviorAnalytics();

    // 计算基础指标
    const totalRecommendations = feedbackData.length;
    const totalClicks = feedbackData.filter(f => f.action === 'click').length;
    const totalViews = feedbackData.filter(f => f.action === 'view').length;
    const totalDismissals = feedbackData.filter(f => f.action === 'dismiss').length;

    const clickThroughRate = totalRecommendations > 0 ? totalClicks / totalRecommendations : 0;
    const viewThroughRate = totalRecommendations > 0 ? totalViews / totalRecommendations : 0;
    const engagementRate = totalRecommendations > 0 ? (totalClicks + totalViews) / totalRecommendations : 0;

    // 分析算法效果
    const algorithmPerformance = this.analyzeAlgorithmPerformance(feedbackData);

    // 分析位置效果
    const positionAnalysis = this.analyzePositionEffectiveness(feedbackData);

    // 分析内容类型效果
    const contentTypeAnalysis = this.analyzeContentTypePerformance(feedbackData);

    // 生成时间序列数据
    const timeSeriesData = this.generateTimeSeriesData(feedbackData, timeRange);

    // 计算用户满意度指标
    const userSatisfaction = this.calculateUserSatisfaction(behaviorData, feedbackData);

    return {
      totalRecommendations,
      totalClicks,
      totalViews,
      totalDismissals,
      clickThroughRate,
      viewThroughRate,
      engagementRate,
      algorithmPerformance,
      positionAnalysis,
      contentTypeAnalysis,
      timeSeriesData,
      userSatisfaction,
    };
  }

  /**
   * 生成优化建议
   */
  generateOptimizationSuggestions(metrics: RecommendationMetrics): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // 1. 算法权重优化建议
    const bestAlgorithm = metrics.algorithmPerformance
      .sort((a, b) => b.conversionScore - a.conversionScore)[0];
    
    if (bestAlgorithm && bestAlgorithm.conversionScore > 0.1) {
      suggestions.push({
        type: 'algorithm_weight',
        priority: 'high',
        description: `${bestAlgorithm.algorithm}算法表现最佳，建议增加其权重`,
        expectedImprovement: 15,
        implementation: `将${bestAlgorithm.algorithm}算法权重提升10-15%`,
        metrics: ['clickThroughRate', 'conversionScore'],
      });
    }

    // 2. 位置优化建议
    const positionEffectiveness = metrics.positionAnalysis
      .sort((a, b) => b.clickThroughRate - a.clickThroughRate);
    
    if (positionEffectiveness.length > 0) {
      const bestPosition = positionEffectiveness[0];
      if (bestPosition.clickThroughRate > 0.1) {
        suggestions.push({
          type: 'position',
          priority: 'medium',
          description: `位置${bestPosition.position}的点击率最高，建议优化推荐排序`,
          expectedImprovement: 8,
          implementation: '调整推荐算法，将高质量推荐放在前面位置',
          metrics: ['clickThroughRate', 'positionAnalysis'],
        });
      }
    }

    // 3. 内容类型优化建议
    const contentTypePerformance = metrics.contentTypeAnalysis
      .sort((a, b) => b.clickThroughRate - a.clickThroughRate);
    
    if (contentTypePerformance.length > 0) {
      const bestContentType = contentTypePerformance[0];
      const worstContentType = contentTypePerformance[contentTypePerformance.length - 1];
      
      if (bestContentType.clickThroughRate - worstContentType.clickThroughRate > 0.05) {
        suggestions.push({
          type: 'content_type',
          priority: 'medium',
          description: `${bestContentType.contentType}类型内容表现最佳，建议增加此类型推荐比例`,
          expectedImprovement: 12,
          implementation: `增加${bestContentType.contentType}类型推荐的权重和数量`,
          metrics: ['contentTypeAnalysis', 'userPreference'],
        });
      }
    }

    // 4. 多样性优化建议
    if (metrics.userSatisfaction.diversityScore < 0.6) {
      suggestions.push({
        type: 'diversity',
        priority: 'high',
        description: '推荐内容多样性不足，建议增加推荐的多样性',
        expectedImprovement: 20,
        implementation: '在推荐算法中加入多样性约束，避免推荐过于相似的内容',
        metrics: ['diversityScore', 'userSatisfaction'],
      });
    }

    // 5. 时机优化建议
    const recentTrend = metrics.timeSeriesData.slice(-7); // 最近7天
    if (recentTrend.length > 0) {
      const avgRecentCTR = recentTrend.reduce((sum, point) => sum + point.clickThroughRate, 0) / recentTrend.length;
      if (avgRecentCTR < metrics.clickThroughRate * 0.8) {
        suggestions.push({
          type: 'timing',
          priority: 'medium',
          description: '最近推荐效果下降，建议调整推荐策略',
          expectedImprovement: 10,
          implementation: '分析用户行为变化，调整推荐时机和内容',
          metrics: ['timeSeriesData', 'clickThroughRate'],
        });
      }
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * 记录推荐效果数据
   */
  recordRecommendationMetrics(metrics: RecommendationMetrics): void {
    try {
      const existingData = this.getStoredAnalytics();
      const newEntry = {
        timestamp: Date.now(),
        metrics,
      };

      existingData.push(newEntry);

      // 只保留最近90天的数据
      const cutoffTime = Date.now() - 90 * 24 * 60 * 60 * 1000;
      const filteredData = existingData.filter(entry => entry.timestamp > cutoffTime);

      this.storeAnalytics(filteredData);
    } catch (error) {
      console.error('Failed to record recommendation metrics:', error);
    }
  }

  /**
   * 获取历史分析数据
   */
  getHistoricalMetrics(days: number = 30): RecommendationMetrics[] {
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
    return this.getStoredAnalytics()
      .filter(entry => entry.timestamp > cutoffTime)
      .map(entry => entry.metrics);
  }

  // 私有方法
  private getRecommendationFeedback(timeRange: { start: number; end: number }): RecommendationFeedback[] {
    if (typeof window === 'undefined') return [];

    try {
      const data = localStorage.getItem('ghibli_recommendation_feedback');
      if (!data) return [];

      const allFeedback = JSON.parse(data) as RecommendationFeedback[];
      return allFeedback.filter(
        feedback => feedback.timestamp >= timeRange.start && feedback.timestamp <= timeRange.end
      );
    } catch {
      return [];
    }
  }

  private analyzeAlgorithmPerformance(feedbackData: RecommendationFeedback[]): AlgorithmPerformance[] {
    const algorithmStats = new Map<string, {
      total: number;
      clicks: number;
      views: number;
      totalDwellTime: number;
    }>();

    // 这里需要从推荐日志中获取算法信息
    // 简化实现，假设从metadata中获取
    feedbackData.forEach(feedback => {
      const algorithm = 'hybrid'; // 实际应该从推荐日志中获取
      const current = algorithmStats.get(algorithm) || { total: 0, clicks: 0, views: 0, totalDwellTime: 0 };
      
      current.total++;
      if (feedback.action === 'click') current.clicks++;
      if (feedback.action === 'view') current.views++;
      if (feedback.dwellTime) current.totalDwellTime += feedback.dwellTime;
      
      algorithmStats.set(algorithm, current);
    });

    return Array.from(algorithmStats.entries()).map(([algorithm, stats]) => ({
      algorithm: algorithm as any,
      totalRecommendations: stats.total,
      clicks: stats.clicks,
      views: stats.views,
      clickThroughRate: stats.total > 0 ? stats.clicks / stats.total : 0,
      averageDwellTime: stats.clicks > 0 ? stats.totalDwellTime / stats.clicks : 0,
      conversionScore: this.calculateConversionScore(stats),
    }));
  }

  private analyzePositionEffectiveness(feedbackData: RecommendationFeedback[]): PositionAnalysis[] {
    const positionStats = new Map<number, {
      total: number;
      clicks: number;
      totalScore: number;
    }>();

    feedbackData.forEach(feedback => {
      const current = positionStats.get(feedback.position) || { total: 0, clicks: 0, totalScore: 0 };
      current.total++;
      if (feedback.action === 'click') current.clicks++;
      // 假设从推荐日志中获取分数
      current.totalScore += 0.5; // 简化实现
      
      positionStats.set(feedback.position, current);
    });

    return Array.from(positionStats.entries()).map(([position, stats]) => ({
      position,
      totalRecommendations: stats.total,
      clicks: stats.clicks,
      clickThroughRate: stats.total > 0 ? stats.clicks / stats.total : 0,
      averageScore: stats.total > 0 ? stats.totalScore / stats.total : 0,
    }));
  }

  private analyzeContentTypePerformance(feedbackData: RecommendationFeedback[]): ContentTypeAnalysis[] {
    const contentTypeStats = new Map<string, {
      total: number;
      clicks: number;
      views: number;
      totalDwellTime: number;
    }>();

    feedbackData.forEach(feedback => {
      const current = contentTypeStats.get(feedback.contentType) || { 
        total: 0, clicks: 0, views: 0, totalDwellTime: 0 
      };
      
      current.total++;
      if (feedback.action === 'click') current.clicks++;
      if (feedback.action === 'view') current.views++;
      if (feedback.dwellTime) current.totalDwellTime += feedback.dwellTime;
      
      contentTypeStats.set(feedback.contentType, current);
    });

    return Array.from(contentTypeStats.entries()).map(([contentType, stats]) => ({
      contentType: contentType as any,
      totalRecommendations: stats.total,
      clicks: stats.clicks,
      views: stats.views,
      clickThroughRate: stats.total > 0 ? stats.clicks / stats.total : 0,
      averageDwellTime: stats.clicks > 0 ? stats.totalDwellTime / stats.clicks : 0,
      userPreference: this.calculateUserPreference(stats),
    }));
  }

  private generateTimeSeriesData(
    feedbackData: RecommendationFeedback[],
    timeRange: { start: number; end: number }
  ): TimeSeriesPoint[] {
    const dayMs = 24 * 60 * 60 * 1000;
    const points: TimeSeriesPoint[] = [];

    for (let time = timeRange.start; time <= timeRange.end; time += dayMs) {
      const dayData = feedbackData.filter(
        f => f.timestamp >= time && f.timestamp < time + dayMs
      );

      const totalRecommendations = dayData.length;
      const totalClicks = dayData.filter(f => f.action === 'click').length;
      const clickThroughRate = totalRecommendations > 0 ? totalClicks / totalRecommendations : 0;

      points.push({
        timestamp: time,
        clickThroughRate,
        totalRecommendations,
        totalClicks,
        algorithmDistribution: { hybrid: 1 }, // 简化实现
      });
    }

    return points;
  }

  private calculateUserSatisfaction(
    behaviorData: any,
    feedbackData: RecommendationFeedback[]
  ): UserSatisfactionMetrics {
    return {
      averageSessionDuration: behaviorData.averageSessionDuration || 0,
      bounceRate: behaviorData.bounceRate || 0,
      returnUserRate: 0.3, // 简化实现
      diversityScore: this.calculateDiversityScore(feedbackData),
      noveltyScore: this.calculateNoveltyScore(feedbackData),
    };
  }

  private calculateConversionScore(stats: any): number {
    const ctr = stats.total > 0 ? stats.clicks / stats.total : 0;
    const engagementRate = stats.total > 0 ? (stats.clicks + stats.views) / stats.total : 0;
    return (ctr * 0.7 + engagementRate * 0.3);
  }

  private calculateUserPreference(stats: any): number {
    const ctr = stats.total > 0 ? stats.clicks / stats.total : 0;
    const avgDwellTime = stats.clicks > 0 ? stats.totalDwellTime / stats.clicks : 0;
    return Math.min(1, ctr * 2 + Math.min(1, avgDwellTime / 30000) * 0.5);
  }

  private calculateDiversityScore(feedbackData: RecommendationFeedback[]): number {
    const uniqueContent = new Set(feedbackData.map(f => f.contentId));
    const totalRecommendations = feedbackData.length;
    return totalRecommendations > 0 ? uniqueContent.size / totalRecommendations : 0;
  }

  private calculateNoveltyScore(_feedbackData: RecommendationFeedback[]): number {
    // 简化实现：基于内容的新颖性
    return 0.7; // 假设70%的推荐是新颖的
  }

  private getStoredAnalytics(): Array<{ timestamp: number; metrics: RecommendationMetrics }> {
    if (typeof window === 'undefined') return [];
    
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private storeAnalytics(data: Array<{ timestamp: number; metrics: RecommendationMetrics }>): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to store analytics data:', error);
    }
  }
}

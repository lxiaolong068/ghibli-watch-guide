/**
 * 用户行为数据管理工具
 * 负责收集、存储和分析用户行为数据，为智能推荐系统提供数据支持
 */

import {
  UserSession,
  PageView,
  SearchBehavior,
  ContentInteraction,
  UserPreferences,
  RecommendationContext,
  RecommendationFeedback,
  BehaviorAnalytics,
  STORAGE_KEYS,
  DATA_RETENTION,
} from '@/app/types/user-behavior';

export class UserBehaviorManager {
  private static instance: UserBehaviorManager;
  private currentSession: UserSession | null = null;

  private constructor() {
    this.initializeSession();
  }

  public static getInstance(): UserBehaviorManager {
    if (!UserBehaviorManager.instance) {
      UserBehaviorManager.instance = new UserBehaviorManager();
    }
    return UserBehaviorManager.instance;
  }

  /**
   * 初始化用户会话
   */
  private initializeSession(): void {
    if (typeof window === 'undefined') return;

    const existingSession = this.getStoredData<UserSession>(STORAGE_KEYS.USER_SESSION);
    const now = Date.now();

    // 如果没有会话或会话超时（30分钟），创建新会话
    if (!existingSession || (now - existingSession.startTime) > 30 * 60 * 1000) {
      this.currentSession = {
        sessionId: this.generateSessionId(),
        startTime: now,
        userAgent: navigator.userAgent,
        referrer: document.referrer || undefined,
      };
      this.storeData(STORAGE_KEYS.USER_SESSION, this.currentSession);
    } else {
      this.currentSession = existingSession;
    }
  }

  /**
   * 记录页面访问
   */
  public recordPageView(
    pageType: PageView['pageType'],
    entityId?: string,
    additionalData?: Partial<PageView>
  ): void {
    if (!this.currentSession) return;

    const pageView: PageView = {
      id: this.generateId(),
      sessionId: this.currentSession.sessionId,
      pageType,
      entityId,
      url: window.location.href,
      title: document.title,
      timestamp: Date.now(),
      scrollDepth: 0,
      clickCount: 0,
      ...additionalData,
    };

    this.appendToStoredArray(STORAGE_KEYS.PAGE_VIEWS, pageView);
    this.cleanupOldData(STORAGE_KEYS.PAGE_VIEWS, DATA_RETENTION.PAGE_VIEWS);
  }

  /**
   * 更新页面访问数据
   */
  public updatePageView(
    pageViewId: string,
    updates: Partial<Pick<PageView, 'dwellTime' | 'scrollDepth' | 'clickCount' | 'exitType'>>
  ): void {
    const pageViews = this.getStoredData<PageView[]>(STORAGE_KEYS.PAGE_VIEWS) || [];
    const index = pageViews.findIndex(pv => pv.id === pageViewId);
    
    if (index !== -1) {
      pageViews[index] = { ...pageViews[index], ...updates };
      this.storeData(STORAGE_KEYS.PAGE_VIEWS, pageViews);
    }
  }

  /**
   * 记录搜索行为
   */
  public recordSearchBehavior(
    query: string,
    resultsCount: number,
    category?: string
  ): string {
    if (!this.currentSession) return '';

    const searchBehavior: SearchBehavior = {
      id: this.generateId(),
      sessionId: this.currentSession.sessionId,
      query,
      timestamp: Date.now(),
      resultsCount,
      clickedResults: [],
      refinements: [],
      category,
    };

    this.appendToStoredArray(STORAGE_KEYS.SEARCH_BEHAVIOR, searchBehavior);
    this.cleanupOldData(STORAGE_KEYS.SEARCH_BEHAVIOR, DATA_RETENTION.SEARCH_BEHAVIOR);
    
    return searchBehavior.id;
  }

  /**
   * 记录搜索结果点击
   */
  public recordSearchClick(
    searchId: string,
    resultId: string,
    resultType: 'movie' | 'character' | 'review' | 'guide',
    position: number
  ): void {
    const searches = this.getStoredData<SearchBehavior[]>(STORAGE_KEYS.SEARCH_BEHAVIOR) || [];
    const searchIndex = searches.findIndex(s => s.id === searchId);
    
    if (searchIndex !== -1) {
      searches[searchIndex].clickedResults.push({
        resultId,
        resultType,
        position,
        timestamp: Date.now(),
      });
      this.storeData(STORAGE_KEYS.SEARCH_BEHAVIOR, searches);
    }
  }

  /**
   * 记录内容交互
   */
  public recordContentInteraction(
    contentType: ContentInteraction['contentType'],
    contentId: string,
    interactionType: ContentInteraction['interactionType'],
    metadata?: Record<string, any>
  ): void {
    if (!this.currentSession) return;

    const interaction: ContentInteraction = {
      id: this.generateId(),
      sessionId: this.currentSession.sessionId,
      contentType,
      contentId,
      interactionType,
      timestamp: Date.now(),
      metadata,
    };

    this.appendToStoredArray(STORAGE_KEYS.CONTENT_INTERACTIONS, interaction);
    this.cleanupOldData(STORAGE_KEYS.CONTENT_INTERACTIONS, DATA_RETENTION.CONTENT_INTERACTIONS);
  }

  /**
   * 记录推荐反馈
   */
  public recordRecommendationFeedback(
    recommendationId: string,
    contentId: string,
    contentType: string,
    position: number,
    action: RecommendationFeedback['action'],
    dwellTime?: number
  ): void {
    if (!this.currentSession) return;

    const feedback: RecommendationFeedback = {
      recommendationId,
      sessionId: this.currentSession.sessionId,
      contentId,
      contentType,
      position,
      action,
      timestamp: Date.now(),
      dwellTime,
    };

    this.appendToStoredArray(STORAGE_KEYS.RECOMMENDATION_FEEDBACK, feedback);
    this.cleanupOldData(STORAGE_KEYS.RECOMMENDATION_FEEDBACK, DATA_RETENTION.RECOMMENDATION_FEEDBACK);
  }

  /**
   * 获取推荐上下文
   */
  public getRecommendationContext(): RecommendationContext {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    const recentViews = this.getRecentPageViews(10).map(pv => pv.entityId).filter(Boolean) as string[];
    const recentSearches = this.getRecentSearches(5).map(s => s.query);
    const now = new Date();

    return {
      sessionId: this.currentSession.sessionId,
      currentPageType: this.getCurrentPageType(),
      currentEntityId: this.getCurrentEntityId(),
      recentViews,
      recentSearches,
      timeOfDay: now.getHours(),
      dayOfWeek: now.getDay(),
      deviceType: this.getDeviceType(),
      referrer: this.currentSession.referrer,
    };
  }

  /**
   * 分析用户偏好
   */
  public analyzeUserPreferences(): UserPreferences | null {
    if (!this.currentSession) return null;

    const pageViews = this.getStoredData<PageView[]>(STORAGE_KEYS.PAGE_VIEWS) || [];
    const searches = this.getStoredData<SearchBehavior[]>(STORAGE_KEYS.SEARCH_BEHAVIOR) || [];
    const interactions = this.getStoredData<ContentInteraction[]>(STORAGE_KEYS.CONTENT_INTERACTIONS) || [];

    // 基础统计
    const totalDwellTime = pageViews.reduce((sum, pv) => sum + (pv.dwellTime || 0), 0);
    const averageSessionDuration = totalDwellTime / Math.max(pageViews.length, 1);
    const averagePageDwellTime = totalDwellTime / Math.max(pageViews.length, 1);

    // 内容类型偏好分析
    const contentTypeStats = this.analyzeContentTypePreferences(pageViews, interactions);
    
    // 搜索模式分析
    const searchPatterns = this.analyzeSearchPatterns(searches);

    // 活跃时间分析
    const activeTimeRanges = this.analyzeActiveTimeRanges(pageViews);

    const preferences: UserPreferences = {
      sessionId: this.currentSession.sessionId,
      favoriteGenres: [], // 需要结合电影标签数据分析
      favoriteDirectors: [], // 需要结合电影数据分析
      favoriteYearRanges: [], // 需要结合电影数据分析
      favoriteCharacterTypes: [], // 需要结合角色数据分析
      averageSessionDuration,
      averagePageDwellTime,
      preferredContentTypes: contentTypeStats,
      searchPatterns,
      activeTimeRanges,
      lastActivity: Math.max(...pageViews.map(pv => pv.timestamp), 0),
      contentBasedWeight: 0.4,
      collaborativeWeight: 0.3,
      popularityWeight: 0.3,
      updatedAt: Date.now(),
    };

    this.storeData(STORAGE_KEYS.USER_PREFERENCES, preferences);
    return preferences;
  }

  /**
   * 获取行为分析数据
   */
  public getBehaviorAnalytics(): BehaviorAnalytics {
    const pageViews = this.getStoredData<PageView[]>(STORAGE_KEYS.PAGE_VIEWS) || [];
    const searches = this.getStoredData<SearchBehavior[]>(STORAGE_KEYS.SEARCH_BEHAVIOR) || [];
    const interactions = this.getStoredData<ContentInteraction[]>(STORAGE_KEYS.CONTENT_INTERACTIONS) || [];

    // 计算会话数（基于sessionId去重）
    const uniqueSessions = new Set(pageViews.map(pv => pv.sessionId));
    
    // 计算平均会话时长
    const sessionDurations = Array.from(uniqueSessions).map(sessionId => {
      const sessionViews = pageViews.filter(pv => pv.sessionId === sessionId);
      return sessionViews.reduce((sum, pv) => sum + (pv.dwellTime || 0), 0);
    });
    const averageSessionDuration = sessionDurations.reduce((sum, duration) => sum + duration, 0) / Math.max(sessionDurations.length, 1);

    // 计算跳出率（只有一个页面访问的会话比例）
    const singlePageSessions = Array.from(uniqueSessions).filter(sessionId => {
      return pageViews.filter(pv => pv.sessionId === sessionId).length === 1;
    });
    const bounceRate = singlePageSessions.length / Math.max(uniqueSessions.size, 1);

    return {
      totalSessions: uniqueSessions.size,
      totalPageViews: pageViews.length,
      totalSearches: searches.length,
      averageSessionDuration,
      bounceRate,
      mostViewedContent: this.getMostViewedContent(pageViews, interactions),
      mostSearchedTerms: this.getMostSearchedTerms(searches),
      preferredContentTypes: this.analyzeContentTypePreferences(pageViews, interactions),
      activityHeatmap: this.generateActivityHeatmap(pageViews),
    };
  }

  // 私有辅助方法
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getStoredData<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private storeData<T>(key: string, data: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to store data:', error);
    }
  }

  private appendToStoredArray<T>(key: string, item: T): void {
    const existingData = this.getStoredData<T[]>(key) || [];
    existingData.push(item);
    this.storeData(key, existingData);
  }

  private cleanupOldData(key: string, maxAge: number): void {
    const data = this.getStoredData<any[]>(key);
    if (!data) return;

    const cutoffTime = Date.now() - maxAge;
    const filteredData = data.filter(item => item.timestamp > cutoffTime);
    
    if (filteredData.length !== data.length) {
      this.storeData(key, filteredData);
    }
  }

  private getRecentPageViews(limit: number): PageView[] {
    const pageViews = this.getStoredData<PageView[]>(STORAGE_KEYS.PAGE_VIEWS) || [];
    return pageViews
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  private getRecentSearches(limit: number): SearchBehavior[] {
    const searches = this.getStoredData<SearchBehavior[]>(STORAGE_KEYS.SEARCH_BEHAVIOR) || [];
    return searches
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  private getCurrentPageType(): string {
    if (typeof window === 'undefined') return 'unknown';
    const path = window.location.pathname;

    if (path === '/') return 'home';
    if (path.startsWith('/movies/')) return 'movie';
    if (path.startsWith('/characters/')) return 'character';
    if (path.startsWith('/reviews/')) return 'review';
    if (path.startsWith('/guides/')) return 'guide';
    if (path.startsWith('/search')) return 'search';

    return 'other';
  }

  private getCurrentEntityId(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    const path = window.location.pathname;
    const matches = path.match(/\/(movies|characters|reviews|guides)\/([^\/]+)/);
    return matches ? matches[2] : undefined;
  }

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop';
    const width = window.innerWidth;

    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private analyzeContentTypePreferences(pageViews: PageView[], interactions: ContentInteraction[]) {
    const stats = new Map<string, { viewCount: number; totalDwellTime: number; engagementCount: number }>();

    // 分析页面访问
    pageViews.forEach(pv => {
      if (!pv.pageType || pv.pageType === 'home' || pv.pageType === 'search') return;

      const current = stats.get(pv.pageType) || { viewCount: 0, totalDwellTime: 0, engagementCount: 0 };
      current.viewCount++;
      current.totalDwellTime += pv.dwellTime || 0;
      stats.set(pv.pageType, current);
    });

    // 分析交互行为
    interactions.forEach(interaction => {
      const current = stats.get(interaction.contentType) || { viewCount: 0, totalDwellTime: 0, engagementCount: 0 };
      current.engagementCount++;
      stats.set(interaction.contentType, current);
    });

    return Array.from(stats.entries()).map(([type, data]) => ({
      type: type as any,
      score: Math.min(100, (data.viewCount * 10 + data.engagementCount * 20) / Math.max(pageViews.length, 1) * 100),
      viewCount: data.viewCount,
      averageDwellTime: data.totalDwellTime / Math.max(data.viewCount, 1),
    }));
  }

  private analyzeSearchPatterns(searches: SearchBehavior[]) {
    const patterns = new Map<string, { frequency: number; successCount: number; lastUsed: number }>();

    searches.forEach(search => {
      const pattern = search.query.toLowerCase().trim();
      const current = patterns.get(pattern) || { frequency: 0, successCount: 0, lastUsed: 0 };

      current.frequency++;
      current.lastUsed = Math.max(current.lastUsed, search.timestamp);

      if (search.clickedResults.length > 0) {
        current.successCount++;
      }

      patterns.set(pattern, current);
    });

    return Array.from(patterns.entries()).map(([pattern, data]) => ({
      pattern,
      frequency: data.frequency,
      successRate: data.successCount / Math.max(data.frequency, 1),
      lastUsed: data.lastUsed,
    }));
  }

  private analyzeActiveTimeRanges(pageViews: PageView[]) {
    const hourlyActivity = new Array(24).fill(0);
    const dailyActivity = new Array(7).fill(0);

    pageViews.forEach(pv => {
      const date = new Date(pv.timestamp);
      hourlyActivity[date.getHours()]++;
      dailyActivity[date.getDay()]++;
    });

    const ranges = [];

    // 找出活跃时间段
    for (let hour = 0; hour < 24; hour++) {
      if (hourlyActivity[hour] > 0) {
        const score = hourlyActivity[hour] / Math.max(pageViews.length, 1) * 100;
        if (score > 10) { // 只记录活跃度超过10%的时间段
          ranges.push({
            startHour: hour,
            endHour: hour + 1,
            activityScore: score,
          });
        }
      }
    }

    return ranges;
  }

  private getMostViewedContent(pageViews: PageView[], interactions: ContentInteraction[]) {
    const contentStats = new Map<string, {
      contentId: string;
      contentType: string;
      title: string;
      viewCount: number;
      totalDwellTime: number;
      shareCount: number;
    }>();

    pageViews.forEach(pv => {
      if (!pv.entityId) return;

      const key = `${pv.pageType}_${pv.entityId}`;
      const current = contentStats.get(key) || {
        contentId: pv.entityId,
        contentType: pv.pageType,
        title: pv.title,
        viewCount: 0,
        totalDwellTime: 0,
        shareCount: 0,
      };

      current.viewCount++;
      current.totalDwellTime += pv.dwellTime || 0;
      contentStats.set(key, current);
    });

    interactions.forEach(interaction => {
      const key = `${interaction.contentType}_${interaction.contentId}`;
      const current = contentStats.get(key);

      if (current && interaction.interactionType === 'share') {
        current.shareCount++;
      }
    });

    return Array.from(contentStats.values())
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 10)
      .map(stat => ({
        ...stat,
        averageDwellTime: stat.totalDwellTime / Math.max(stat.viewCount, 1),
      }));
  }

  private getMostSearchedTerms(searches: SearchBehavior[]) {
    const termStats = new Map<string, { count: number; totalResults: number; clickCount: number }>();

    searches.forEach(search => {
      const term = search.query.toLowerCase().trim();
      const current = termStats.get(term) || { count: 0, totalResults: 0, clickCount: 0 };

      current.count++;
      current.totalResults += search.resultsCount;
      current.clickCount += search.clickedResults.length;

      termStats.set(term, current);
    });

    return Array.from(termStats.entries())
      .map(([term, stats]) => ({
        term,
        count: stats.count,
        averageResults: stats.totalResults / Math.max(stats.count, 1),
        clickThroughRate: stats.clickCount / Math.max(stats.count, 1),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private generateActivityHeatmap(pageViews: PageView[]) {
    const hourly = new Array(24).fill(0);
    const daily = new Array(7).fill(0);
    const monthly = new Array(12).fill(0);

    pageViews.forEach(pv => {
      const date = new Date(pv.timestamp);
      hourly[date.getHours()]++;
      daily[date.getDay()]++;
      monthly[date.getMonth()]++;
    });

    return { hourly, daily, monthly };
  }
}

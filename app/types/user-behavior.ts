/**
 * 用户行为数据模型定义
 * 用于智能推荐系统的用户偏好分析和行为跟踪
 */

// 用户会话信息
export interface UserSession {
  sessionId: string;
  userId?: string; // 未来用户系统预留
  startTime: number;
  endTime?: number;
  userAgent: string;
  referrer?: string;
  ipHash?: string; // 匿名化IP
}

// 页面访问记录
export interface PageView {
  id: string;
  sessionId: string;
  pageType: 'home' | 'movie' | 'character' | 'review' | 'guide' | 'search' | 'about';
  entityId?: string; // 电影ID、角色ID等
  url: string;
  title: string;
  timestamp: number;
  dwellTime?: number; // 停留时间（毫秒）
  scrollDepth: number; // 滚动深度百分比
  clickCount: number; // 点击次数
  exitType?: 'navigation' | 'close' | 'timeout'; // 退出方式
}

// 搜索行为记录
export interface SearchBehavior {
  id: string;
  sessionId: string;
  query: string;
  timestamp: number;
  resultsCount: number;
  clickedResults: SearchClickResult[];
  refinements: string[]; // 搜索优化记录
  category?: string; // 搜索类别
}

// 搜索结果点击记录
export interface SearchClickResult {
  resultId: string;
  resultType: 'movie' | 'character' | 'review' | 'guide';
  position: number; // 在搜索结果中的位置
  timestamp: number;
}

// 内容交互记录
export interface ContentInteraction {
  id: string;
  sessionId: string;
  contentType: 'movie' | 'character' | 'review' | 'guide';
  contentId: string;
  interactionType: 'view' | 'like' | 'share' | 'favorite' | 'comment' | 'tag_click';
  timestamp: number;
  metadata?: Record<string, any>; // 额外的交互数据
}

// 用户偏好分析结果
export interface UserPreferences {
  userId?: string;
  sessionId: string;
  
  // 内容偏好
  favoriteGenres: GenrePreference[];
  favoriteDirectors: DirectorPreference[];
  favoriteYearRanges: YearRangePreference[];
  favoriteCharacterTypes: CharacterTypePreference[];
  
  // 行为模式
  averageSessionDuration: number;
  averagePageDwellTime: number;
  preferredContentTypes: ContentTypePreference[];
  searchPatterns: SearchPattern[];
  
  // 时间偏好
  activeTimeRanges: TimeRange[];
  lastActivity: number;
  
  // 推荐权重
  contentBasedWeight: number; // 基于内容的推荐权重
  collaborativeWeight: number; // 协同过滤推荐权重
  popularityWeight: number; // 热门内容推荐权重
  
  updatedAt: number;
}

// 类型偏好定义
export interface GenrePreference {
  tagId: string;
  tagName: string;
  score: number; // 偏好分数 0-100
  interactionCount: number;
  lastInteraction: number;
}

export interface DirectorPreference {
  director: string;
  score: number;
  movieCount: number;
  lastInteraction: number;
}

export interface YearRangePreference {
  startYear: number;
  endYear: number;
  score: number;
  movieCount: number;
}

export interface CharacterTypePreference {
  characterType: string;
  score: number;
  interactionCount: number;
}

export interface ContentTypePreference {
  type: 'movie' | 'character' | 'review' | 'guide';
  score: number;
  viewCount: number;
  averageDwellTime: number;
}

export interface SearchPattern {
  pattern: string;
  frequency: number;
  successRate: number; // 搜索成功率（有点击结果的比例）
  lastUsed: number;
}

export interface TimeRange {
  startHour: number;
  endHour: number;
  dayOfWeek?: number; // 0-6, 0为周日
  activityScore: number;
}

// 推荐上下文
export interface RecommendationContext {
  sessionId: string;
  currentPageType: string;
  currentEntityId?: string;
  recentViews: string[]; // 最近浏览的内容ID
  recentSearches: string[]; // 最近搜索的关键词
  timeOfDay: number; // 小时 0-23
  dayOfWeek: number; // 0-6
  deviceType: 'mobile' | 'tablet' | 'desktop';
  referrer?: string;
}

// 推荐结果评估
export interface RecommendationFeedback {
  recommendationId: string;
  sessionId: string;
  contentId: string;
  contentType: string;
  position: number;
  action: 'view' | 'click' | 'ignore' | 'dismiss';
  timestamp: number;
  dwellTime?: number; // 如果点击了，停留时间
}

// 用户行为分析工具类型
export interface BehaviorAnalytics {
  totalSessions: number;
  totalPageViews: number;
  totalSearches: number;
  averageSessionDuration: number;
  bounceRate: number;
  mostViewedContent: ContentStats[];
  mostSearchedTerms: SearchTermStats[];
  preferredContentTypes: ContentTypeStats[];
  activityHeatmap: ActivityHeatmap;
}

export interface ContentStats {
  contentId: string;
  contentType: string;
  title: string;
  viewCount: number;
  averageDwellTime: number;
  shareCount: number;
}

export interface SearchTermStats {
  term: string;
  count: number;
  averageResults: number;
  clickThroughRate: number;
}

export interface ContentTypeStats {
  type: string;
  viewCount: number;
  averageDwellTime: number;
  engagementRate: number;
}

export interface ActivityHeatmap {
  hourly: number[]; // 24小时活跃度
  daily: number[]; // 7天活跃度
  monthly: number[]; // 12个月活跃度
}

// 本地存储键名常量
export const STORAGE_KEYS = {
  USER_SESSION: 'ghibli_user_session',
  PAGE_VIEWS: 'ghibli_page_views',
  SEARCH_BEHAVIOR: 'ghibli_search_behavior',
  CONTENT_INTERACTIONS: 'ghibli_content_interactions',
  USER_PREFERENCES: 'ghibli_user_preferences',
  RECOMMENDATION_FEEDBACK: 'ghibli_recommendation_feedback',
} as const;

// 数据保留策略
export const DATA_RETENTION = {
  PAGE_VIEWS: 30 * 24 * 60 * 60 * 1000, // 30天
  SEARCH_BEHAVIOR: 60 * 24 * 60 * 60 * 1000, // 60天
  CONTENT_INTERACTIONS: 90 * 24 * 60 * 60 * 1000, // 90天
  USER_PREFERENCES: 365 * 24 * 60 * 60 * 1000, // 1年
  RECOMMENDATION_FEEDBACK: 30 * 24 * 60 * 60 * 1000, // 30天
} as const;

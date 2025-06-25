// 基础电影类型（与Prisma schema保持一致）
export interface Movie {
  id: string;
  tmdbId: number;
  titleEn: string;
  titleJa: string;
  titleZh?: string | null;
  year: number;
  director?: string | null;
  duration?: number | null;
  synopsis?: string | null;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  voteAverage?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

// 平台类型（与Prisma schema保持一致）
export interface Platform {
  id: string;
  name: string;
  website: string;
  type: PlatformType;
  logo?: string | null;
  createdAt: Date;
  updatedAt: Date;
  availabilities?: Availability[];
}

// 地区类型（与Prisma schema保持一致）
export interface Region {
  id: string;
  code: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  availabilities?: Availability[];
}

// 价格信息接口（保留供将来使用）
export interface PriceInfo {
  price?: number;
  currency?: string; // 例如 'USD', 'JPY', 'EUR'
  format?: 'HD' | 'SD' | '4K'; // 租赁/购买的格式
  // 可以根据需要添加更多字段，例如租赁时长
}

// 可用性类型（与Prisma schema保持一致）
export interface Availability {
  id: string;
  movieId: string;
  platformId: string;
  regionId: string;
  url?: string | null;
  price?: number | null;
  currency?: string | null;
  notes?: string | null;
  type: AvailabilityType;
  isAvailable: boolean;
  lastChecked: Date;
  createdAt: Date;
  updatedAt: Date;
  // 关联数据
  movie?: Movie;
  platform?: Platform;
  region?: Region;
}

// 枚举类型（与Prisma schema保持一致）
export enum PlatformType {
  STREAMING = 'STREAMING',
  RENTAL = 'RENTAL',
  PURCHASE = 'PURCHASE',
  FREE = 'FREE',
  CINEMA = 'CINEMA',
  PHYSICAL = 'PHYSICAL',
}

export enum AvailabilityType {
  SUBSCRIPTION = 'SUBSCRIPTION',
  RENT = 'RENT',
  BUY = 'BUY',
  FREE = 'FREE',
  CINEMA = 'CINEMA',
  LIBRARY = 'LIBRARY',
  DVD = 'DVD',
}

// 组件相关类型
export interface MovieSearchResult {
  id: string;
  titleEn: string;
  titleJa: string;
  year: number;
  posterUrl?: string | null;
}

export interface RegionOption {
  code: string;
  name: string;
  flag: string;
}

export interface PlatformDisplayInfo {
  id: string;
  name: string;
  logo?: string | null;
  type: 'streaming' | 'rental' | 'purchase';
  price?: string;
  url?: string;
}

// 标签相关类型
export interface Tag {
  id: string;
  name: string;
  nameJa?: string | null;
  nameZh?: string | null;
  description?: string | null;
  color?: string | null;
  category?: string | null;
  createdAt: Date;
  count?: number; // 用于显示标签关联的电影数量
}

export interface MovieTag {
  id: string;
  movieId: string;
  tagId: string;
  createdAt: Date;
  movie?: Movie;
  tag?: Tag;
}

// 标签分类枚举
export enum TagCategory {
  THEME = 'theme',        // 主题标签：环保、成长、爱情等
  GENRE = 'genre',        // 类型标签：奇幻、冒险、剧情等
  MOOD = 'mood',          // 情感标签：治愈、感人、轻松等
  AUDIENCE = 'audience',  // 受众标签：全年龄、儿童友好、成人向等
  QUALITY = 'quality',    // 品质标签：经典、获奖、口碑等
  STYLE = 'style',        // 风格标签：手绘、写实、梦幻等
  SETTING = 'setting',    // 背景标签：现代、历史、乡村等
  CHARACTER = 'character' // 角色标签：强女性、动物伙伴等
}

// 标签筛选参数
export interface TagFilterParams {
  category?: TagCategory | string;
  search?: string;
  withCount?: boolean;
  limit?: number;
  movieId?: string; // 用于获取特定电影的标签
}

// API 响应类型
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// TMDB API 相关类型
export interface TmdbMovieDetails {
  id: number;
  title: string;
  original_title: string;
  overview: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number | null;
  vote_average: number;
  credits?: {
    crew: Array<{
      job: string;
      name: string;
    }>;
  };
}

export interface TmdbWatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

export interface TmdbWatchProvidersResponse {
  results: {
    [countryCode: string]: {
      link?: string;
      flatrate?: TmdbWatchProvider[];
      rent?: TmdbWatchProvider[];
      buy?: TmdbWatchProvider[];
    };
  };
}

// 观影指南相关类型
// GuideType 从 Prisma 客户端导入以确保类型一致性
import { GuideType as PrismaGuideType } from '../../prisma/generated/client';
export type GuideType = PrismaGuideType;

export interface WatchGuideMovie {
  order: number;
  notes?: string | null;
  movie: {
    id: string;
    titleEn: string;
    titleJa: string;
    titleZh?: string | null;
    year: number;
    posterUrl?: string | null;
    backdropUrl?: string | null;
    synopsis?: string | null;
    voteAverage?: number | null;
    duration?: number | null;
    director?: string | null;
    tmdbId?: number;
  };
}

export interface WatchGuide {
  id: string;
  title: string;
  description: string;
  guideType: GuideType;
  content: string | object; // JSON content
  language: string;
  createdAt: Date;
  updatedAt: Date;
  movieCount?: number;
  movies: WatchGuideMovie[];
  relatedGuides?: RelatedGuide[];
}

export interface RelatedGuide {
  id: string;
  title: string;
  description: string;
  guideType: GuideType;
  createdAt: Date;
  coverImage?: string | null;
}

export interface WatchGuidesResponse {
  guides: WatchGuide[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 搜索功能相关类型
export interface SearchResult {
  id: string;
  type: 'movie' | 'character' | 'review' | 'guide' | 'media';
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string | null;
  url: string;
  relevanceScore: number;
  metadata?: Record<string, any>;
}
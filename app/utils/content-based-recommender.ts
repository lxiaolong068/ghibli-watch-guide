/**
 * 基于内容的推荐算法
 * 利用电影标签、导演、年份等属性，计算内容相似性并生成推荐
 */

import { prisma } from '@/lib/prisma';
import { Movie, Tag, MovieTag } from '@/app/types';

// 电影特征向量
export interface MovieFeatures {
  movieId: string;
  title: string;
  director?: string;
  year: number;
  duration?: number;
  voteAverage?: number;
  tags: TagFeature[];
  synopsis?: string;
}

// 标签特征
export interface TagFeature {
  id: string;
  name: string;
  category: string;
  weight: number; // 标签权重，基于类别和重要性
}

// 相似度计算结果
export interface SimilarityScore {
  movieId: string;
  score: number;
  reasons: SimilarityReason[];
}

// 相似性原因
export interface SimilarityReason {
  type: 'director' | 'year' | 'tag' | 'rating' | 'duration';
  score: number;
  description: string;
}

// 推荐配置
export interface RecommendationConfig {
  directorWeight: number;    // 导演权重
  yearWeight: number;        // 年份权重
  tagWeight: number;         // 标签权重
  ratingWeight: number;      // 评分权重
  durationWeight: number;    // 时长权重
  yearTolerance: number;     // 年份容忍度
  minScore: number;          // 最低推荐分数
}

// 默认推荐配置
const DEFAULT_CONFIG: RecommendationConfig = {
  directorWeight: 0.3,
  yearWeight: 0.15,
  tagWeight: 0.4,
  ratingWeight: 0.1,
  durationWeight: 0.05,
  yearTolerance: 8,
  minScore: 0.2,
};

// 标签类别权重
const TAG_CATEGORY_WEIGHTS: Record<string, number> = {
  'theme': 1.0,      // 主题标签最重要
  'genre': 0.9,      // 类型标签很重要
  'mood': 0.8,       // 情感标签重要
  'style': 0.7,      // 风格标签较重要
  'audience': 0.6,   // 受众标签中等重要
  'setting': 0.5,    // 背景标签一般重要
  'quality': 0.4,    // 品质标签参考价值
  'character': 0.3,  // 角色标签辅助参考
};

export class ContentBasedRecommender {
  private config: RecommendationConfig;

  constructor(config: Partial<RecommendationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 为指定电影生成基于内容的推荐
   */
  async getRecommendations(
    movieId: string,
    limit: number = 10,
    excludeIds: string[] = []
  ): Promise<SimilarityScore[]> {
    // 获取目标电影的特征
    const targetMovie = await this.getMovieFeatures(movieId);
    if (!targetMovie) {
      throw new Error(`Movie with ID ${movieId} not found`);
    }

    // 获取所有其他电影的特征
    const candidateMovies = await this.getAllMovieFeatures([movieId, ...excludeIds]);

    // 计算相似度
    const similarities = candidateMovies.map(candidate => 
      this.calculateSimilarity(targetMovie, candidate)
    );

    // 过滤和排序
    return similarities
      .filter(sim => sim.score >= this.config.minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * 批量计算多个电影的推荐
   */
  async getBatchRecommendations(
    movieIds: string[],
    limit: number = 5
  ): Promise<Record<string, SimilarityScore[]>> {
    const results: Record<string, SimilarityScore[]> = {};

    for (const movieId of movieIds) {
      try {
        results[movieId] = await this.getRecommendations(movieId, limit, movieIds);
      } catch (error) {
        console.error(`Failed to get recommendations for movie ${movieId}:`, error);
        results[movieId] = [];
      }
    }

    return results;
  }

  /**
   * 获取电影特征向量
   */
  private async getMovieFeatures(movieId: string): Promise<MovieFeatures | null> {
    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
      include: {
        movieTags: {
          include: { tag: true }
        }
      }
    });

    if (!movie) return null;

    return {
      movieId: movie.id,
      title: movie.titleEn,
      director: movie.director || undefined,
      year: movie.year,
      duration: movie.duration || undefined,
      voteAverage: movie.voteAverage || undefined,
      tags: movie.movieTags.map(mt => ({
        id: mt.tag.id,
        name: mt.tag.name,
        category: mt.tag.category || 'other',
        weight: TAG_CATEGORY_WEIGHTS[mt.tag.category || 'other'] || 0.2,
      })),
      synopsis: movie.synopsis || undefined,
    };
  }

  /**
   * 获取所有电影特征（排除指定ID）
   */
  private async getAllMovieFeatures(excludeIds: string[]): Promise<MovieFeatures[]> {
    const movies = await prisma.movie.findMany({
      where: {
        id: { notIn: excludeIds }
      },
      include: {
        movieTags: {
          include: { tag: true }
        }
      }
    });

    return movies.map(movie => ({
      movieId: movie.id,
      title: movie.titleEn,
      director: movie.director || undefined,
      year: movie.year,
      duration: movie.duration || undefined,
      voteAverage: movie.voteAverage || undefined,
      tags: movie.movieTags.map(mt => ({
        id: mt.tag.id,
        name: mt.tag.name,
        category: mt.tag.category || 'other',
        weight: TAG_CATEGORY_WEIGHTS[mt.tag.category || 'other'] || 0.2,
      })),
      synopsis: movie.synopsis || undefined,
    }));
  }

  /**
   * 计算两部电影的相似度
   */
  private calculateSimilarity(target: MovieFeatures, candidate: MovieFeatures): SimilarityScore {
    const reasons: SimilarityReason[] = [];
    let totalScore = 0;

    // 1. 导演相似度
    const directorScore = this.calculateDirectorSimilarity(target, candidate);
    if (directorScore > 0) {
      reasons.push({
        type: 'director',
        score: directorScore,
        description: `同一导演: ${target.director}`,
      });
      totalScore += directorScore * this.config.directorWeight;
    }

    // 2. 年份相似度
    const yearScore = this.calculateYearSimilarity(target, candidate);
    if (yearScore > 0) {
      reasons.push({
        type: 'year',
        score: yearScore,
        description: `相近年份: ${target.year} vs ${candidate.year}`,
      });
      totalScore += yearScore * this.config.yearWeight;
    }

    // 3. 标签相似度
    const tagScore = this.calculateTagSimilarity(target, candidate);
    if (tagScore.score > 0) {
      reasons.push({
        type: 'tag',
        score: tagScore.score,
        description: `共同标签: ${tagScore.commonTags.join(', ')}`,
      });
      totalScore += tagScore.score * this.config.tagWeight;
    }

    // 4. 评分相似度
    const ratingScore = this.calculateRatingSimilarity(target, candidate);
    if (ratingScore > 0) {
      reasons.push({
        type: 'rating',
        score: ratingScore,
        description: `相似评分: ${target.voteAverage?.toFixed(1)} vs ${candidate.voteAverage?.toFixed(1)}`,
      });
      totalScore += ratingScore * this.config.ratingWeight;
    }

    // 5. 时长相似度
    const durationScore = this.calculateDurationSimilarity(target, candidate);
    if (durationScore > 0) {
      reasons.push({
        type: 'duration',
        score: durationScore,
        description: `相似时长: ${target.duration}分钟 vs ${candidate.duration}分钟`,
      });
      totalScore += durationScore * this.config.durationWeight;
    }

    return {
      movieId: candidate.movieId,
      score: Math.min(1, totalScore), // 确保分数不超过1
      reasons,
    };
  }

  /**
   * 计算导演相似度
   */
  private calculateDirectorSimilarity(target: MovieFeatures, candidate: MovieFeatures): number {
    if (!target.director || !candidate.director) return 0;
    return target.director === candidate.director ? 1 : 0;
  }

  /**
   * 计算年份相似度
   */
  private calculateYearSimilarity(target: MovieFeatures, candidate: MovieFeatures): number {
    const yearDiff = Math.abs(target.year - candidate.year);
    if (yearDiff > this.config.yearTolerance) return 0;
    
    // 年份差距越小，相似度越高
    return Math.max(0, 1 - yearDiff / this.config.yearTolerance);
  }

  /**
   * 计算标签相似度
   */
  private calculateTagSimilarity(
    target: MovieFeatures, 
    candidate: MovieFeatures
  ): { score: number; commonTags: string[] } {
    if (target.tags.length === 0 || candidate.tags.length === 0) {
      return { score: 0, commonTags: [] };
    }

    const targetTagIds = new Set(target.tags.map(t => t.id));
    const candidateTagIds = new Set(candidate.tags.map(t => t.id));
    
    // 找出共同标签
    const commonTagIds = Array.from(targetTagIds).filter(id => candidateTagIds.has(id));
    const commonTags = target.tags
      .filter(t => commonTagIds.includes(t.id))
      .map(t => t.name);

    if (commonTagIds.length === 0) {
      return { score: 0, commonTags: [] };
    }

    // 计算加权相似度
    const commonTagWeights = target.tags
      .filter(t => commonTagIds.includes(t.id))
      .reduce((sum, tag) => sum + tag.weight, 0);

    const maxPossibleWeight = Math.max(
      target.tags.reduce((sum, tag) => sum + tag.weight, 0),
      candidate.tags.reduce((sum, tag) => sum + tag.weight, 0)
    );

    const score = maxPossibleWeight > 0 ? commonTagWeights / maxPossibleWeight : 0;

    return { score, commonTags };
  }

  /**
   * 计算评分相似度
   */
  private calculateRatingSimilarity(target: MovieFeatures, candidate: MovieFeatures): number {
    if (!target.voteAverage || !candidate.voteAverage) return 0;
    
    const ratingDiff = Math.abs(target.voteAverage - candidate.voteAverage);
    // 评分差距在2分以内认为相似
    return Math.max(0, 1 - ratingDiff / 2);
  }

  /**
   * 计算时长相似度
   */
  private calculateDurationSimilarity(target: MovieFeatures, candidate: MovieFeatures): number {
    if (!target.duration || !candidate.duration) return 0;
    
    const durationDiff = Math.abs(target.duration - candidate.duration);
    // 时长差距在30分钟以内认为相似
    return Math.max(0, 1 - durationDiff / 30);
  }

  /**
   * 更新推荐配置
   */
  updateConfig(newConfig: Partial<RecommendationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 获取当前配置
   */
  getConfig(): RecommendationConfig {
    return { ...this.config };
  }
}

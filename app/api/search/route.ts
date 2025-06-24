import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, createError } from '@/app/lib/error-handler';
import { SearchResult } from '@/app/types';

// 搜索结果类型定义
/*
interface SearchResult {
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
*/

interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  filters: SearchFilters;
  suggestions: string[];
  facets: SearchFacets;
}

interface SearchFilters {
  type?: string[];
  year?: number[];
  director?: string[];
  tags?: string[];
  language?: string[];
}

interface SearchFacets {
  types: { name: string; count: number }[];
  years: { name: string; count: number }[];
  directors: { name: string; count: number }[];
  tags: { name: string; count: number }[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type');
    const year = searchParams.get('year');
    const director = searchParams.get('director');
    const tags = searchParams.get('tags');
    const language = searchParams.get('language') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = (page - 1) * limit;

    if (!query || query.length < 2) {
      return Response.json({
        results: [],
        total: 0,
        query: query || '',
        filters: {},
        suggestions: [],
        facets: { types: [], years: [], directors: [], tags: [] }
      });
    }

    const results: SearchResult[] = [];
    let total = 0;

    // 搜索电影
    if (!type || type === 'movie') {
      const movieResults = await searchMovies(
        query,
        {
          year: year || undefined,
          director: director || undefined,
          tags: tags || undefined,
          language
        },
        limit
      );
      results.push(...movieResults);
    }

    // 搜索角色
    if (!type || type === 'character') {
      const characterResults = await searchCharacters(query, { language }, limit);
      results.push(...characterResults);
    }

    // 搜索评论
    if (!type || type === 'review') {
      const reviewResults = await searchReviews(query, { language }, limit);
      results.push(...reviewResults);
    }

    // 搜索观影指南
    if (!type || type === 'guide') {
      const guideResults = await searchGuides(query, { language }, limit);
      results.push(...guideResults);
    }

    // 搜索媒体内容
    if (!type || type === 'media') {
      const mediaResults = await searchMedia(query, { language }, limit);
      results.push(...mediaResults);
    }

    // 按相关性排序
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // 分页
    const paginatedResults = results.slice(offset, offset + limit);
    total = results.length;

    // 生成搜索建议
    const suggestions = await generateSearchSuggestions(query);

    // 生成搜索面向
    const facets = await generateSearchFacets(query);

    const response: SearchResponse = {
      results: paginatedResults,
      total,
      query,
      filters: {
        type: type ? [type] : undefined,
        year: year ? [parseInt(year)] : undefined,
        director: director ? [director] : undefined,
        tags: tags ? tags.split(',') : undefined,
        language: language !== 'all' ? [language] : undefined,
      },
      suggestions,
      facets
    };

    return Response.json(response);
  } catch (error) {
    return handleApiError(error);
  }
}

// 搜索电影
async function searchMovies(
  query: string, 
  filters: { year?: string; director?: string; tags?: string; language?: string }, 
  limit: number
): Promise<SearchResult[]> {
  const whereConditions: any = {
    OR: [
      { titleEn: { contains: query, mode: 'insensitive' } },
      { titleJa: { contains: query, mode: 'insensitive' } },
      { titleZh: { contains: query, mode: 'insensitive' } },
      { synopsis: { contains: query, mode: 'insensitive' } },
      { director: { contains: query, mode: 'insensitive' } },
    ],
  };

  // 应用筛选条件
  if (filters.year) {
    whereConditions.year = parseInt(filters.year);
  }
  if (filters.director) {
    whereConditions.director = { contains: filters.director, mode: 'insensitive' };
  }

  const movies = await prisma.movie.findMany({
    where: whereConditions,
    include: {
      movieTags: {
        include: {
          tag: true
        }
      }
    },
    take: limit,
  });

  return movies.map(movie => ({
    id: movie.id,
    type: 'movie' as const,
    title: movie.titleEn,
    subtitle: `${movie.year} • ${movie.director || 'Unknown Director'}`,
    description: movie.synopsis?.substring(0, 200) + (movie.synopsis && movie.synopsis.length > 200 ? '...' : ''),
    imageUrl: movie.posterUrl,
    url: `/movies/${movie.id}`,
    relevanceScore: calculateRelevanceScore(query, [
      movie.titleEn,
      movie.titleJa,
      movie.titleZh,
      movie.synopsis,
      movie.director
    ].filter(Boolean) as string[]),
    metadata: {
      year: movie.year,
      director: movie.director,
      tags: movie.movieTags.map(mt => mt.tag.name)
    }
  }));
}

// 搜索角色
async function searchCharacters(
  query: string,
  filters: { language?: string },
  limit: number
): Promise<SearchResult[]> {
  const characters = await prisma.character.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { nameJa: { contains: query, mode: 'insensitive' } },
        { nameZh: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: {
      movieCharacters: {
        include: {
          movie: true
        }
      }
    },
    take: limit,
  });

  return characters.map(character => ({
    id: character.id,
    type: 'character' as const,
    title: character.name,
    subtitle: character.movieCharacters.map(mc => mc.movie.titleEn).join(', '),
    description: character.description?.substring(0, 200) + (character.description && character.description.length > 200 ? '...' : ''),
    imageUrl: character.imageUrl,
    url: `/characters/${character.id}`,
    relevanceScore: calculateRelevanceScore(query, [
      character.name,
      character.nameJa,
      character.nameZh,
      character.description
    ].filter(Boolean) as string[]),
    metadata: {
      isMainCharacter: character.isMainCharacter,
      movies: character.movieCharacters.map(mc => mc.movie.titleEn)
    }
  }));
}

// 搜索评论
async function searchReviews(
  query: string,
  filters: { language?: string },
  limit: number
): Promise<SearchResult[]> {
  const reviews = await prisma.movieReview.findMany({
    where: {
      AND: [
        { isPublished: true },
        {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
            { author: { contains: query, mode: 'insensitive' } },
          ],
        }
      ]
    },
    include: {
      movie: true
    },
    take: limit,
  });

  return reviews.map(review => ({
    id: review.id,
    type: 'review' as const,
    title: review.title,
    subtitle: `${review.movie.titleEn} • ${review.author}`,
    description: review.content.substring(0, 200) + (review.content.length > 200 ? '...' : ''),
    imageUrl: review.movie.posterUrl,
    url: `/reviews/${review.id}`,
    relevanceScore: calculateRelevanceScore(query, [
      review.title,
      review.content,
      review.author
    ]),
    metadata: {
      author: review.author,
      rating: review.rating,
      reviewType: review.reviewType,
      movieTitle: review.movie.titleEn
    }
  }));
}

// 搜索观影指南
async function searchGuides(
  query: string,
  filters: { language?: string },
  limit: number
): Promise<SearchResult[]> {
  const guides = await prisma.watchGuide.findMany({
    where: {
      AND: [
        { isPublished: true },
        {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        }
      ]
    },
    include: {
      movies: {
        include: {
          movie: true
        }
      }
    },
    take: limit,
  });

  return guides.map(guide => ({
    id: guide.id,
    type: 'guide' as const,
    title: guide.title,
    subtitle: `${guide.guideType} • ${guide.movies.length} movies`,
    description: guide.description?.substring(0, 200) + (guide.description && guide.description.length > 200 ? '...' : ''),
    imageUrl: guide.movies[0]?.movie.posterUrl,
    url: `/guides/${guide.id}`,
    relevanceScore: calculateRelevanceScore(query, [
      guide.title,
      guide.description
    ].filter(Boolean) as string[]),
    metadata: {
      guideType: guide.guideType,
      movieCount: guide.movies.length
    }
  }));
}

// 搜索媒体内容
async function searchMedia(
  query: string,
  filters: { language?: string },
  limit: number
): Promise<SearchResult[]> {
  const media = await prisma.mediaContent.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: {
      movie: true
    },
    take: limit,
  });

  return media.map(item => ({
    id: item.id,
    type: 'media' as const,
    title: item.title,
    subtitle: item.movie ? `${item.movie.titleEn} • ${item.mediaType}` : item.mediaType,
    description: item.description?.substring(0, 200) + (item.description && item.description.length > 200 ? '...' : ''),
    imageUrl: item.thumbnailUrl || item.movie?.posterUrl,
    url: item.movie ? `/movies/${item.movie.id}#media-${item.id}` : `/media/${item.id}`,
    relevanceScore: calculateRelevanceScore(query, [
      item.title,
      item.description
    ].filter(Boolean) as string[]),
    metadata: {
      mediaType: item.mediaType,
      duration: item.duration,
      movieTitle: item.movie?.titleEn
    }
  }));
}

// 计算相关性分数
function calculateRelevanceScore(query: string, texts: string[]): number {
  const queryLower = query.toLowerCase();
  let score = 0;

  texts.forEach(text => {
    const textLower = text.toLowerCase();
    
    // 完全匹配得分最高
    if (textLower === queryLower) {
      score += 100;
    }
    // 开头匹配
    else if (textLower.startsWith(queryLower)) {
      score += 80;
    }
    // 包含匹配
    else if (textLower.includes(queryLower)) {
      score += 60;
    }
    // 单词匹配
    else {
      const queryWords = queryLower.split(' ');
      const textWords = textLower.split(' ');
      const matchingWords = queryWords.filter(qw => 
        textWords.some(tw => tw.includes(qw) || qw.includes(tw))
      );
      score += (matchingWords.length / queryWords.length) * 40;
    }
  });

  return score;
}

// 生成搜索建议
async function generateSearchSuggestions(query: string): Promise<string[]> {
  // 这里可以实现更复杂的搜索建议逻辑
  // 暂时返回一些基本的建议
  const suggestions: string[] = [];
  
  // 基于电影标题的建议
  const movies = await prisma.movie.findMany({
    where: {
      OR: [
        { titleEn: { contains: query, mode: 'insensitive' } },
        { titleJa: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: { titleEn: true, titleJa: true },
    take: 5,
  });

  movies.forEach(movie => {
    if (movie.titleEn.toLowerCase().includes(query.toLowerCase())) {
      suggestions.push(movie.titleEn);
    }
    if (movie.titleJa && movie.titleJa.toLowerCase().includes(query.toLowerCase())) {
      suggestions.push(movie.titleJa);
    }
  });

  return [...new Set(suggestions)].slice(0, 5);
}

// 生成搜索面向
async function generateSearchFacets(query: string): Promise<SearchFacets> {
  // 这里可以实现搜索面向统计
  // 暂时返回空的面向数据
  return {
    types: [
      { name: 'movie', count: 0 },
      { name: 'character', count: 0 },
      { name: 'review', count: 0 },
      { name: 'guide', count: 0 },
      { name: 'media', count: 0 },
    ],
    years: [],
    directors: [],
    tags: [],
  };
}

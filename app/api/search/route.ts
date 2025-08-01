import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/app/lib/error-handler';
import { SearchResult } from '@/app/types';
import { searchCache } from '@/app/utils/searchCache';

// 将此路由标记为动态路由，防止在构建时静态生成
export const dynamic = 'force-dynamic';

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

    // 构建缓存键的筛选条件
    const cacheFilters = {
      type,
      year,
      director,
      tags,
      language,
      page,
      limit
    };

    // 检查缓存
    const cachedResult = searchCache.get(query, cacheFilters);
    if (cachedResult) {
      return Response.json(cachedResult);
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

    // 缓存搜索结果（仅缓存有结果的搜索）
    if (response.results.length > 0) {
      // 转换为兼容的缓存数据格式
      const cacheData = {
        ...response,
        filters: response.filters as unknown as Record<string, unknown>,
        facets: response.facets as unknown as Record<string, unknown>
      };
      searchCache.set(query, cacheData, cacheFilters);
    }

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
      // 添加标签搜索
      {
        movieTags: {
          some: {
            tag: {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { nameJa: { contains: query, mode: 'insensitive' } },
                { nameZh: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } }
              ]
            }
          }
        }
      }
    ],
  };

  // 应用筛选条件
  if (filters.year) {
    whereConditions.year = parseInt(filters.year);
  }
  if (filters.director) {
    whereConditions.director = { contains: filters.director, mode: 'insensitive' };
  }
  if (filters.tags) {
    const tagNames = filters.tags.split(',').map(tag => tag.trim());
    whereConditions.movieTags = {
      some: {
        tag: {
          name: { in: tagNames }
        }
      }
    };
  }

  const movies = await prisma.movie.findMany({
    where: whereConditions,
    include: {
      movieTags: {
        include: {
          tag: true
        }
      },
      movieCrew: {
        include: {
          crewMember: true
        },
        take: 5 // 限制制作人员数量以提高性能
      }
    },
    take: limit * 2, // 获取更多结果用于相关性排序
  });

  // 计算相关性分数并排序
  const moviesWithScore = movies.map(movie => {
    // 准备搜索文本和权重
    const searchTexts = [
      movie.titleEn,      // 权重: 10 (最重要)
      movie.titleJa,      // 权重: 10
      movie.titleZh,      // 权重: 10
      movie.director,     // 权重: 8
      movie.synopsis,     // 权重: 6
      // 标签文本
      ...movie.movieTags.map(mt => mt.tag.name),           // 权重: 5
      ...movie.movieTags.map(mt => mt.tag.nameJa).filter(Boolean),  // 权重: 5
      ...movie.movieTags.map(mt => mt.tag.nameZh).filter(Boolean),  // 权重: 5
      ...movie.movieTags.map(mt => mt.tag.description).filter(Boolean), // 权重: 3
      // 制作人员
      ...movie.movieCrew.map(mc => mc.crewMember.name),    // 权重: 4
      ...movie.movieCrew.map(mc => mc.crewMember.nameJa).filter(Boolean) // 权重: 4
    ].filter(Boolean) as string[];

    const fieldWeights = [
      10, 10, 10, 8, 6, // 标题、导演、简介
      ...Array(movie.movieTags.length).fill(5), // 标签名称
      ...Array(movie.movieTags.filter(mt => mt.tag.nameJa).length).fill(5), // 日文标签
      ...Array(movie.movieTags.filter(mt => mt.tag.nameZh).length).fill(5), // 中文标签
      ...Array(movie.movieTags.filter(mt => mt.tag.description).length).fill(3), // 标签描述
      ...Array(movie.movieCrew.length).fill(4), // 制作人员名称
      ...Array(movie.movieCrew.filter(mc => mc.crewMember.nameJa).length).fill(4) // 日文制作人员
    ];

    const relevanceScore = calculateRelevanceScore(query, searchTexts, fieldWeights);

    return {
      id: movie.id,
      type: 'movie' as const,
      title: movie.titleEn,
      subtitle: `${movie.year} • ${movie.director || 'Unknown Director'}`,
      description: movie.synopsis?.substring(0, 200) + (movie.synopsis && movie.synopsis.length > 200 ? '...' : ''),
      imageUrl: movie.posterUrl,
      url: `/movies/${movie.id}`,
      relevanceScore,
      metadata: {
        year: movie.year,
        director: movie.director,
        tags: movie.movieTags.map(mt => mt.tag.name),
        crew: movie.movieCrew.map(mc => ({ name: mc.crewMember.name, role: mc.role }))
      }
    };
  });

  // 按相关性排序并返回指定数量的结果
  return moviesWithScore
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit);
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
        // 添加配音演员搜索
        {
          movieCharacters: {
            some: {
              OR: [
                { voiceActor: { contains: query, mode: 'insensitive' } },
                { voiceActorJa: { contains: query, mode: 'insensitive' } }
              ]
            }
          }
        }
      ],
    },
    include: {
      movieCharacters: {
        include: {
          movie: true
        }
      }
    },
    take: limit * 2,
  });

  const charactersWithScore = characters.map(character => {
    // 准备搜索文本和权重
    const searchTexts = [
      character.name,        // 权重: 10
      character.nameJa,      // 权重: 10
      character.nameZh,      // 权重: 10
      character.description, // 权重: 6
      // 配音演员
      ...character.movieCharacters.map(mc => mc.voiceActor).filter(Boolean),   // 权重: 7
      ...character.movieCharacters.map(mc => mc.voiceActorJa).filter(Boolean), // 权重: 7
      // 相关电影标题
      ...character.movieCharacters.map(mc => mc.movie.titleEn),  // 权重: 4
      ...character.movieCharacters.map(mc => mc.movie.titleJa),  // 权重: 4
      ...character.movieCharacters.map(mc => mc.movie.titleZh).filter(Boolean) // 权重: 4
    ].filter(Boolean) as string[];

    const fieldWeights = [
      10, 10, 10, 6, // 角色名称和描述
      ...Array(character.movieCharacters.filter(mc => mc.voiceActor).length).fill(7), // 配音演员
      ...Array(character.movieCharacters.filter(mc => mc.voiceActorJa).length).fill(7), // 日文配音演员
      ...Array(character.movieCharacters.length).fill(4), // 电影标题
      ...Array(character.movieCharacters.length).fill(4), // 日文电影标题
      ...Array(character.movieCharacters.filter(mc => mc.movie.titleZh).length).fill(4) // 中文电影标题
    ];

    const relevanceScore = calculateRelevanceScore(query, searchTexts, fieldWeights);

    return {
      id: character.id,
      type: 'character' as const,
      title: character.name,
      subtitle: character.movieCharacters.map(mc => mc.movie.titleEn).join(', '),
      description: character.description?.substring(0, 200) + (character.description && character.description.length > 200 ? '...' : ''),
      imageUrl: character.imageUrl,
      url: `/characters/${character.id}`,
      relevanceScore,
      metadata: {
        isMainCharacter: character.isMainCharacter,
        movies: character.movieCharacters.map(mc => mc.movie.titleEn),
        voiceActors: character.movieCharacters.map(mc => ({
          actor: mc.voiceActor,
          actorJa: mc.voiceActorJa,
          movie: mc.movie.titleEn
        })).filter(va => va.actor || va.actorJa)
      }
    };
  });

  return charactersWithScore
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit);
}

// 搜索评论
async function searchReviews(
  query: string,
  filters: { language?: string },
  limit: number
): Promise<SearchResult[]> {
  const whereConditions: any = {
    AND: [
      { isPublished: true },
      {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { author: { contains: query, mode: 'insensitive' } },
          // 添加电影标题搜索
          { movie: { titleEn: { contains: query, mode: 'insensitive' } } },
          { movie: { titleJa: { contains: query, mode: 'insensitive' } } },
          { movie: { titleZh: { contains: query, mode: 'insensitive' } } }
        ],
      }
    ]
  };

  if (filters.language && filters.language !== 'all') {
    whereConditions.AND.push({ language: filters.language });
  }

  const reviews = await prisma.movieReview.findMany({
    where: whereConditions,
    include: {
      movie: true
    },
    take: limit * 2,
  });

  const reviewsWithScore = reviews.map(review => {
    // 准备搜索文本和权重
    const searchTexts = [
      review.title,           // 权重: 10
      review.author,          // 权重: 8
      review.content,         // 权重: 6
      review.movie.titleEn,   // 权重: 7
      review.movie.titleJa,   // 权重: 7
      review.movie.titleZh,   // 权重: 7
      review.movie.director   // 权重: 5
    ].filter(Boolean) as string[];

    const fieldWeights = [10, 8, 6, 7, 7, 7, 5];

    const relevanceScore = calculateRelevanceScore(query, searchTexts, fieldWeights);

    return {
      id: review.id,
      type: 'review' as const,
      title: review.title,
      subtitle: `${review.movie.titleEn} • ${review.author}`,
      description: review.content.substring(0, 200) + (review.content.length > 200 ? '...' : ''),
      imageUrl: review.movie.posterUrl,
      url: `/reviews/${review.id}`,
      relevanceScore,
      metadata: {
        author: review.author,
        rating: review.rating,
        reviewType: review.reviewType,
        movieTitle: review.movie.titleEn,
        language: review.language,
        publishedAt: review.publishedAt
      }
    };
  });

  return reviewsWithScore
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit);
}

// 搜索观影指南
async function searchGuides(
  query: string,
  filters: { language?: string },
  limit: number
): Promise<SearchResult[]> {
  const whereConditions: any = {
    AND: [
      { isPublished: true },
      {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          // 搜索关联电影的标题
          {
            movies: {
              some: {
                movie: {
                  OR: [
                    { titleEn: { contains: query, mode: 'insensitive' } },
                    { titleJa: { contains: query, mode: 'insensitive' } },
                    { titleZh: { contains: query, mode: 'insensitive' } }
                  ]
                }
              }
            }
          }
        ],
      }
    ]
  };

  if (filters.language && filters.language !== 'all') {
    whereConditions.AND.push({ language: filters.language });
  }

  const guides = await prisma.watchGuide.findMany({
    where: whereConditions,
    include: {
      movies: {
        include: {
          movie: true
        }
      }
    },
    take: limit * 2,
  });

  const guidesWithScore = guides.map(guide => {
    // 准备搜索文本和权重
    const searchTexts = [
      guide.title,                    // 权重: 10
      guide.description,              // 权重: 8
      // 关联电影标题
      ...guide.movies.map(gm => gm.movie.titleEn),  // 权重: 6
      ...guide.movies.map(gm => gm.movie.titleJa),  // 权重: 6
      ...guide.movies.map(gm => gm.movie.titleZh).filter(Boolean), // 权重: 6
      // 电影导演
      ...guide.movies.map(gm => gm.movie.director).filter(Boolean), // 权重: 4
      // 备注信息
      ...guide.movies.map(gm => gm.notes).filter(Boolean) // 权重: 5
    ].filter(Boolean) as string[];

    const fieldWeights = [
      10, 8, // 标题和描述
      ...Array(guide.movies.length).fill(6), // 英文电影标题
      ...Array(guide.movies.length).fill(6), // 日文电影标题
      ...Array(guide.movies.filter(gm => gm.movie.titleZh).length).fill(6), // 中文电影标题
      ...Array(guide.movies.filter(gm => gm.movie.director).length).fill(4), // 导演
      ...Array(guide.movies.filter(gm => gm.notes).length).fill(5) // 备注
    ];

    const relevanceScore = calculateRelevanceScore(query, searchTexts, fieldWeights);

    return {
      id: guide.id,
      type: 'guide' as const,
      title: guide.title,
      subtitle: `${guide.guideType} • ${guide.movies.length} movies`,
      description: guide.description?.substring(0, 200) + (guide.description && guide.description.length > 200 ? '...' : ''),
      imageUrl: guide.movies[0]?.movie.posterUrl,
      url: `/guides/${guide.id}`,
      relevanceScore,
      metadata: {
        guideType: guide.guideType,
        movieCount: guide.movies.length,
        language: guide.language,
        movies: guide.movies.map(gm => ({
          title: gm.movie.titleEn,
          order: gm.order,
          notes: gm.notes
        }))
      }
    };
  });

  return guidesWithScore
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit);
}

// Search media content
async function searchMedia(
  query: string,
  filters: { language?: string },
  limit: number
): Promise<SearchResult[]> {
  const whereConditions: any = {
    AND: [
      { isPublished: true },
      {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          // Search associated movie titles
          { movie: { titleEn: { contains: query, mode: 'insensitive' } } },
          { movie: { titleJa: { contains: query, mode: 'insensitive' } } },
          { movie: { titleZh: { contains: query, mode: 'insensitive' } } }
        ],
      }
    ]
  };

  if (filters.language && filters.language !== 'all') {
    whereConditions.AND.push({ language: filters.language });
  }

  const media = await prisma.mediaContent.findMany({
    where: whereConditions,
    include: {
      movie: true
    },
    take: limit * 2,
  });

  const mediaWithScore = media.map(item => {
    // 准备搜索文本和权重
    const searchTexts = [
      item.title,                 // 权重: 10
      item.description,           // 权重: 7
      item.movie?.titleEn,        // 权重: 8
      item.movie?.titleJa,        // 权重: 8
      item.movie?.titleZh,        // 权重: 8
      item.movie?.director,       // 权重: 5
      item.mediaType              // 权重: 6
    ].filter(Boolean) as string[];

    const fieldWeights = [10, 7, 8, 8, 8, 5, 6];

    const relevanceScore = calculateRelevanceScore(query, searchTexts, fieldWeights);

    return {
      id: item.id,
      type: 'media' as const,
      title: item.title,
      subtitle: item.movie ? `${item.movie.titleEn} • ${item.mediaType}` : item.mediaType,
      description: item.description?.substring(0, 200) + (item.description && item.description.length > 200 ? '...' : ''),
      imageUrl: item.thumbnailUrl || item.movie?.posterUrl,
      url: item.movie ? `/movies/${item.movie.id}#media-${item.id}` : `/media/${item.id}`,
      relevanceScore,
      metadata: {
        mediaType: item.mediaType,
        duration: item.duration,
        movieTitle: item.movie?.titleEn,
        language: item.language,
        fileSize: item.fileSize
      }
    };
  });

  return mediaWithScore
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit);
}

// 计算相关性分数 - 改进版本
function calculateRelevanceScore(
  query: string,
  texts: string[],
  fieldWeights: number[] = [],
  options: {
    exactMatchBonus?: number;
    prefixMatchBonus?: number;
    containsMatchBonus?: number;
    wordMatchBonus?: number;
    fuzzyMatchThreshold?: number;
  } = {}
): number {
  const {
    exactMatchBonus = 100,
    prefixMatchBonus = 80,
    containsMatchBonus = 60,
    fuzzyMatchThreshold = 0.8
  } = options;

  const queryLower = query.toLowerCase().trim();
  const queryWords = queryLower.split(/\s+/).filter(word => word.length > 0);
  let totalScore = 0;

  texts.forEach((text, index) => {
    if (!text) return;

    const textLower = text.toLowerCase().trim();
    const textWords = textLower.split(/\s+/).filter(word => word.length > 0);
    const fieldWeight = fieldWeights[index] || 1;
    let fieldScore = 0;

    // 1. 完全匹配 - 最高分
    if (textLower === queryLower) {
      fieldScore = exactMatchBonus;
    }
    // 2. 前缀匹配 - 高分
    else if (textLower.startsWith(queryLower)) {
      fieldScore = prefixMatchBonus;
    }
    // 3. 包含匹配 - 中等分数
    else if (textLower.includes(queryLower)) {
      fieldScore = containsMatchBonus;
      // 根据匹配位置调整分数 - 越靠前分数越高
      const matchIndex = textLower.indexOf(queryLower);
      const positionBonus = Math.max(0, (textLower.length - matchIndex) / textLower.length * 20);
      fieldScore += positionBonus;
    }
    // 4. 单词级别匹配
    else {
      let wordMatchScore = 0;
      let exactWordMatches = 0;
      let partialWordMatches = 0;

      queryWords.forEach(queryWord => {
        // 完全单词匹配
        if (textWords.includes(queryWord)) {
          exactWordMatches++;
          wordMatchScore += 15;
        }
        // 部分单词匹配
        else {
          const partialMatches = textWords.filter(textWord =>
            textWord.includes(queryWord) || queryWord.includes(textWord)
          );
          if (partialMatches.length > 0) {
            partialWordMatches++;
            wordMatchScore += 8;
          }
          // 模糊匹配 (简单的编辑距离)
          else {
            const fuzzyMatches = textWords.filter(textWord =>
              calculateSimilarity(queryWord, textWord) >= fuzzyMatchThreshold
            );
            if (fuzzyMatches.length > 0) {
              wordMatchScore += 5;
            }
          }
        }
      });

      // 计算单词匹配的覆盖率
      const wordCoverage = (exactWordMatches * 2 + partialWordMatches) / (queryWords.length * 2);
      fieldScore = wordMatchScore * wordCoverage;
    }

    // 应用字段权重
    totalScore += fieldScore * fieldWeight;
  });

  return Math.round(totalScore * 100) / 100; // 保留两位小数
}

// 计算字符串相似度 (简化版Levenshtein距离)
function calculateSimilarity(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;

  if (len1 === 0) return len2 === 0 ? 1 : 0;
  if (len2 === 0) return 0;

  const maxLen = Math.max(len1, len2);
  const minLen = Math.min(len1, len2);

  // 简单的相似度计算：基于长度差异和公共字符
  if (maxLen - minLen > maxLen * 0.5) return 0; // 长度差异太大

  let commonChars = 0;
  const shorter = len1 <= len2 ? str1 : str2;
  const longer = len1 > len2 ? str1 : str2;

  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) {
      commonChars++;
    }
  }

  return commonChars / maxLen;
}

// 生成搜索建议
async function generateSearchSuggestions(query: string): Promise<string[]> {
  if (query.length < 2) return [];

  const suggestions: Set<string> = new Set();
  const queryLower = query.toLowerCase();

  try {
    // 1. 电影标题建议
    const movies = await prisma.movie.findMany({
      where: {
        OR: [
          { titleEn: { contains: query, mode: 'insensitive' } },
          { titleJa: { contains: query, mode: 'insensitive' } },
          { titleZh: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: { titleEn: true, titleJa: true, titleZh: true },
      take: 8,
    });

    movies.forEach(movie => {
      [movie.titleEn, movie.titleJa, movie.titleZh].forEach(title => {
        if (title && title.toLowerCase().includes(queryLower)) {
          suggestions.add(title);
        }
      });
    });

    // 2. 导演建议
    const directors = await prisma.movie.findMany({
      where: {
        director: { contains: query, mode: 'insensitive' }
      },
      select: { director: true },
      distinct: ['director'],
      take: 3,
    });

    directors.forEach(movie => {
      if (movie.director && movie.director.toLowerCase().includes(queryLower)) {
        suggestions.add(movie.director);
      }
    });

    // 3. 角色名称建议
    const characters = await prisma.character.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { nameJa: { contains: query, mode: 'insensitive' } },
          { nameZh: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: { name: true, nameJa: true, nameZh: true },
      take: 5,
    });

    characters.forEach(character => {
      [character.name, character.nameJa, character.nameZh].forEach(name => {
        if (name && name.toLowerCase().includes(queryLower)) {
          suggestions.add(name);
        }
      });
    });

    // 4. 标签建议
    const tags = await prisma.tag.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { nameJa: { contains: query, mode: 'insensitive' } },
          { nameZh: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: { name: true, nameJa: true, nameZh: true },
      take: 4,
    });

    tags.forEach(tag => {
      [tag.name, tag.nameJa, tag.nameZh].forEach(name => {
        if (name && name.toLowerCase().includes(queryLower)) {
          suggestions.add(name);
        }
      });
    });

    // 5. 常见搜索词建议（如果没有找到足够的建议）
    if (suggestions.size < 3) {
      const commonTerms = [
        '宫崎骏', '千与千寻', '龙猫', '天空之城', '魔女宅急便',
        '哈尔的移动城堡', '萤火虫之墓', '风之谷', '红猪', '幽灵公主',
        '环保', '成长', '友情', '家庭', '冒险', '魔法', '战争', '爱情'
      ];

      commonTerms.forEach(term => {
        if (term.toLowerCase().includes(queryLower) || queryLower.includes(term.toLowerCase())) {
          suggestions.add(term);
        }
      });
    }

    return Array.from(suggestions).slice(0, 6);
  } catch (error) {
    console.error('Error generating search suggestions:', error);
    return [];
  }
}

// 生成搜索面向
async function generateSearchFacets(_query: string): Promise<SearchFacets> {
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

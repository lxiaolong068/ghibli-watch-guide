import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/app/lib/error-handler';
import { quickSearchCache } from '@/app/utils/searchCache';

interface QuickSearchResult {
  id: string;
  type: 'movie' | 'character' | 'review' | 'guide' | 'suggestion';
  title: string;
  subtitle?: string;
  imageUrl?: string;
  url: string;
  relevanceScore: number;
}

interface QuickSearchResponse {
  results: QuickSearchResult[];
  suggestions: string[];
  total: number;
  query: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = Math.min(parseInt(searchParams.get('limit') || '8'), 20);

    if (!query || query.length < 2) {
      return Response.json({
        results: [],
        suggestions: [],
        total: 0,
        query: query || ''
      });
    }

    // 检查缓存
    const cacheFilters = { limit };
    const cachedResult = quickSearchCache.get(query, cacheFilters);
    if (cachedResult) {
      return Response.json(cachedResult);
    }

    const results: QuickSearchResult[] = [];

    // 1. 搜索电影（优先级最高）
    const movies = await prisma.movie.findMany({
      where: {
        OR: [
          { titleEn: { contains: query, mode: 'insensitive' } },
          { titleJa: { contains: query, mode: 'insensitive' } },
          { titleZh: { contains: query, mode: 'insensitive' } },
          { director: { contains: query, mode: 'insensitive' } }
        ],
      },
      select: {
        id: true,
        titleEn: true,
        titleJa: true,
        titleZh: true,
        year: true,
        director: true,
        posterUrl: true
      },
      take: Math.ceil(limit * 0.6), // 60% 给电影
    });

    movies.forEach(movie => {
      const relevanceScore = calculateQuickRelevanceScore(query, [
        movie.titleEn,
        movie.titleJa,
        movie.titleZh,
        movie.director
      ].filter(Boolean) as string[]);

      results.push({
        id: movie.id,
        type: 'movie',
        title: movie.titleEn,
        subtitle: `${movie.year} • ${movie.director || 'Unknown Director'}`,
        imageUrl: movie.posterUrl,
        url: `/movies/${movie.id}`,
        relevanceScore
      });
    });

    // 2. 搜索角色（如果还有空间）
    if (results.length < limit) {
      const characters = await prisma.character.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { nameJa: { contains: query, mode: 'insensitive' } },
            { nameZh: { contains: query, mode: 'insensitive' } }
          ],
        },
        include: {
          movieCharacters: {
            include: {
              movie: {
                select: {
                  titleEn: true,
                  posterUrl: true
                }
              }
            },
            take: 1
          }
        },
        take: Math.ceil(limit * 0.25), // 25% 给角色
      });

      characters.forEach(character => {
        const relevanceScore = calculateQuickRelevanceScore(query, [
          character.name,
          character.nameJa,
          character.nameZh
        ].filter(Boolean) as string[]);

        const firstMovie = character.movieCharacters[0]?.movie;
        results.push({
          id: character.id,
          type: 'character',
          title: character.name,
          subtitle: firstMovie ? `角色 • ${firstMovie.titleEn}` : '角色',
          imageUrl: character.imageUrl || firstMovie?.posterUrl,
          url: `/characters/${character.id}`,
          relevanceScore
        });
      });
    }

    // 3. 搜索观影指南（如果还有空间）
    if (results.length < limit) {
      const guides = await prisma.watchGuide.findMany({
        where: {
          AND: [
            { isPublished: true },
            {
              OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } }
              ]
            }
          ]
        },
        include: {
          movies: {
            include: {
              movie: {
                select: {
                  posterUrl: true
                }
              }
            },
            take: 1
          }
        },
        take: Math.ceil(limit * 0.15), // 15% 给指南
      });

      guides.forEach(guide => {
        const relevanceScore = calculateQuickRelevanceScore(query, [
          guide.title,
          guide.description
        ].filter(Boolean) as string[]);

        results.push({
          id: guide.id,
          type: 'guide',
          title: guide.title,
          subtitle: `观影指南 • ${guide.guideType}`,
          imageUrl: guide.movies[0]?.movie.posterUrl,
          url: `/guides/${guide.id}`,
          relevanceScore
        });
      });
    }

    // 按相关性排序
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // 生成搜索建议
    const suggestions = await generateQuickSearchSuggestions(query, limit);

    const response: QuickSearchResponse = {
      results: results.slice(0, limit),
      suggestions,
      total: results.length,
      query
    };

    // 缓存快速搜索结果
    if (response.results.length > 0) {
      quickSearchCache.set(query, response, cacheFilters);
    }

    return Response.json(response);
  } catch (error) {
    return handleApiError(error);
  }
}

// 快速搜索相关性评分（简化版）
function calculateQuickRelevanceScore(query: string, texts: string[]): number {
  const queryLower = query.toLowerCase();
  let score = 0;

  texts.forEach(text => {
    if (!text) return;
    const textLower = text.toLowerCase();
    
    // 完全匹配
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
      // 位置加分
      const index = textLower.indexOf(queryLower);
      score += Math.max(0, (textLower.length - index) / textLower.length * 20);
    }
    // 单词匹配
    else {
      const queryWords = queryLower.split(/\s+/);
      const textWords = textLower.split(/\s+/);
      const matches = queryWords.filter(qw => 
        textWords.some(tw => tw.includes(qw) || qw.includes(tw))
      );
      score += (matches.length / queryWords.length) * 40;
    }
  });

  return score;
}

// 生成快速搜索建议
async function generateQuickSearchSuggestions(query: string, limit: number): Promise<string[]> {
  const suggestions: Set<string> = new Set();
  const queryLower = query.toLowerCase();

  try {
    // 电影标题建议
    const movies = await prisma.movie.findMany({
      where: {
        OR: [
          { titleEn: { startsWith: query, mode: 'insensitive' } },
          { titleJa: { startsWith: query, mode: 'insensitive' } },
          { titleZh: { startsWith: query, mode: 'insensitive' } }
        ],
      },
      select: { titleEn: true, titleJa: true, titleZh: true },
      take: 5,
    });

    movies.forEach(movie => {
      [movie.titleEn, movie.titleJa, movie.titleZh].forEach(title => {
        if (title && title.toLowerCase().startsWith(queryLower)) {
          suggestions.add(title);
        }
      });
    });

    // 导演建议
    const directors = await prisma.movie.findMany({
      where: {
        director: { startsWith: query, mode: 'insensitive' }
      },
      select: { director: true },
      distinct: ['director'],
      take: 3,
    });

    directors.forEach(movie => {
      if (movie.director && movie.director.toLowerCase().startsWith(queryLower)) {
        suggestions.add(movie.director);
      }
    });

    // 角色名称建议
    const characters = await prisma.character.findMany({
      where: {
        OR: [
          { name: { startsWith: query, mode: 'insensitive' } },
          { nameJa: { startsWith: query, mode: 'insensitive' } },
          { nameZh: { startsWith: query, mode: 'insensitive' } }
        ],
      },
      select: { name: true, nameJa: true, nameZh: true },
      take: 3,
    });

    characters.forEach(character => {
      [character.name, character.nameJa, character.nameZh].forEach(name => {
        if (name && name.toLowerCase().startsWith(queryLower)) {
          suggestions.add(name);
        }
      });
    });

    return Array.from(suggestions).slice(0, Math.min(limit, 6));
  } catch (error) {
    console.error('Error generating quick search suggestions:', error);
    return [];
  }
}

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/app/lib/error-handler';
import { quickSearchCache } from '@/app/utils/searchCache';

// Mark this route as dynamic to prevent static generation at build time
export const dynamic = 'force-dynamic';

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

    // Check cache
    const cacheFilters = { limit };
    const cachedResult = quickSearchCache.get(query, cacheFilters);
    if (cachedResult) {
      return Response.json(cachedResult);
    }

    const results: QuickSearchResult[] = [];

    // 1. Search movies (highest priority)
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
      take: Math.ceil(limit * 0.6), // 60% for movies
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
        imageUrl: movie.posterUrl || undefined,
        url: `/movies/${movie.id}`,
        relevanceScore
      });
    });

    // 2. Search characters (if there's still space)
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
        take: Math.ceil(limit * 0.25), // 25% for characters
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
          subtitle: firstMovie ? `Character • ${firstMovie.titleEn}` : 'Character',
          imageUrl: character.imageUrl || firstMovie?.posterUrl || undefined,
          url: `/characters/${character.id}`,
          relevanceScore
        });
      });
    }

    // 3. Search watch guides (if there's still space)
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
        take: Math.ceil(limit * 0.15), // 15% for guides
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
          subtitle: `Watch Guide • ${guide.guideType}`,
          imageUrl: guide.movies[0]?.movie.posterUrl || undefined,
          url: `/guides/${guide.id}`,
          relevanceScore
        });
      });
    }

    // Sort by relevance
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Generate search suggestions
    const suggestions = await generateQuickSearchSuggestions(query, limit);

    const response: QuickSearchResponse = {
      results: results.slice(0, limit),
      suggestions,
      total: results.length,
      query
    };

    // Cache quick search results
    if (response.results.length > 0) {
      quickSearchCache.set(query, response, cacheFilters);
    }

    return Response.json(response);
  } catch (error) {
    return handleApiError(error);
  }
}

// Quick search relevance scoring (simplified version)
function calculateQuickRelevanceScore(query: string, texts: string[]): number {
  const queryLower = query.toLowerCase();
  let score = 0;

  texts.forEach(text => {
    if (!text) return;
    const textLower = text.toLowerCase();

    // Exact match
    if (textLower === queryLower) {
      score += 100;
    }
    // Starts with match
    else if (textLower.startsWith(queryLower)) {
      score += 80;
    }
    // Contains match
    else if (textLower.includes(queryLower)) {
      score += 60;
      // Position bonus
      const index = textLower.indexOf(queryLower);
      score += Math.max(0, (textLower.length - index) / textLower.length * 20);
    }
    // Word match
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

// Generate quick search suggestions
async function generateQuickSearchSuggestions(query: string, limit: number): Promise<string[]> {
  const suggestions: Set<string> = new Set();
  const queryLower = query.toLowerCase();

  try {
    // Movie title suggestions
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

    // Director suggestions
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

    // Character name suggestions
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

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/app/lib/error-handler';

interface RecommendationItem {
  id: string;
  type: 'movie' | 'character' | 'review' | 'guide';
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  url: string;
  score: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string; id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '6'), 20);
    const includeTypes = searchParams.get('types')?.split(',') || ['movie', 'character', 'review', 'guide'];

    const { type, id } = params;

    let recommendations: RecommendationItem[] = [];

    switch (type) {
      case 'movie':
        recommendations = await getMovieRecommendations(id, limit, includeTypes);
        break;
      case 'character':
        recommendations = await getCharacterRecommendations(id, limit, includeTypes);
        break;
      case 'review':
        recommendations = await getReviewRecommendations(id, limit, includeTypes);
        break;
      case 'guide':
        recommendations = await getGuideRecommendations(id, limit, includeTypes);
        break;
      default:
        return Response.json(
          { error: 'Invalid content type' },
          { status: 400 }
        );
    }

    // 按相关性分数排序
    recommendations.sort((a, b) => b.score - a.score);

    return Response.json({
      recommendations: recommendations.slice(0, limit),
      total: recommendations.length,
      contentType: type,
      contentId: id,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// 电影推荐
async function getMovieRecommendations(
  movieId: string,
  limit: number,
  includeTypes: string[]
): Promise<RecommendationItem[]> {
  const recommendations: RecommendationItem[] = [];

  // 获取当前电影信息
  const currentMovie = await prisma.movie.findUnique({
    where: { id: movieId },
    include: {
      movieTags: {
        include: { tag: true }
      }
    }
  });

  if (!currentMovie) return [];

  // 推荐相似电影
  if (includeTypes.includes('movie')) {
    const similarMovies = await prisma.movie.findMany({
      where: {
        AND: [
          { id: { not: movieId } },
          {
            OR: [
              { director: currentMovie.director },
              { year: { gte: currentMovie.year - 5, lte: currentMovie.year + 5 } },
              {
                movieTags: {
                  some: {
                    tagId: {
                      in: currentMovie.movieTags.map(mt => mt.tagId)
                    }
                  }
                }
              }
            ]
          }
        ]
      },
      include: {
        movieTags: {
          include: { tag: true }
        }
      },
      take: Math.ceil(limit * 0.4),
    });

    recommendations.push(...similarMovies.map(movie => ({
      id: movie.id,
      type: 'movie' as const,
      title: movie.titleEn,
      subtitle: `${movie.year} • ${movie.director || 'Unknown Director'}`,
      description: movie.synopsis?.substring(0, 100),
      imageUrl: movie.posterUrl,
      url: `/movies/${movie.id}`,
      score: calculateMovieSimilarity(currentMovie, movie),
    })));
  }

  // 推荐电影角色
  if (includeTypes.includes('character')) {
    const movieCharacters = await prisma.movieCharacter.findMany({
      where: { movieId },
      include: {
        character: true
      },
      orderBy: { importance: 'desc' },
      take: Math.ceil(limit * 0.3),
    });

    recommendations.push(...movieCharacters.map(mc => ({
      id: mc.character.id,
      type: 'character' as const,
      title: mc.character.name,
      subtitle: `${currentMovie.titleEn}中的角色`,
      description: mc.character.description?.substring(0, 100),
      imageUrl: mc.character.imageUrl,
      url: `/characters/${mc.character.id}`,
      score: 80 + mc.importance,
    })));
  }

  // 推荐电影评论
  if (includeTypes.includes('review')) {
    const movieReviews = await prisma.movieReview.findMany({
      where: {
        movieId,
        isPublished: true,
      },
      take: Math.ceil(limit * 0.2),
    });

    recommendations.push(...movieReviews.map(review => ({
      id: review.id,
      type: 'review' as const,
      title: review.title,
      subtitle: `${review.author}的评论`,
      description: review.content.substring(0, 100),
      imageUrl: currentMovie.posterUrl,
      url: `/reviews/${review.id}`,
      score: 70 + (review.rating || 0) * 5,
    })));
  }

  // 推荐包含此电影的观影指南
  if (includeTypes.includes('guide')) {
    const guides = await prisma.watchGuide.findMany({
      where: {
        isPublished: true,
        movies: {
          some: { movieId }
        }
      },
      include: {
        movies: {
          include: { movie: true }
        }
      },
      take: Math.ceil(limit * 0.1),
    });

    recommendations.push(...guides.map(guide => ({
      id: guide.id,
      type: 'guide' as const,
      title: guide.title,
      subtitle: `${guide.guideType} • ${guide.movies.length}部电影`,
      description: guide.description?.substring(0, 100),
      imageUrl: guide.movies[0]?.movie.posterUrl,
      url: `/guides/${guide.id}`,
      score: 60,
    })));
  }

  return recommendations;
}

// 角色推荐
async function getCharacterRecommendations(
  characterId: string,
  limit: number,
  includeTypes: string[]
): Promise<RecommendationItem[]> {
  const recommendations: RecommendationItem[] = [];

  const currentCharacter = await prisma.character.findUnique({
    where: { id: characterId },
    include: {
      movieCharacters: {
        include: { movie: true }
      }
    }
  });

  if (!currentCharacter) return [];

  // 推荐相关电影
  if (includeTypes.includes('movie')) {
    recommendations.push(...currentCharacter.movieCharacters.map(mc => ({
      id: mc.movie.id,
      type: 'movie' as const,
      title: mc.movie.titleEn,
      subtitle: `${mc.movie.year} • ${currentCharacter.name}出演`,
      description: mc.movie.synopsis?.substring(0, 100),
      imageUrl: mc.movie.posterUrl,
      url: `/movies/${mc.movie.id}`,
      score: 90 + mc.importance,
    })));
  }

  // 推荐同电影的其他角色
  if (includeTypes.includes('character')) {
    const movieIds = currentCharacter.movieCharacters.map(mc => mc.movieId);
    const relatedCharacters = await prisma.character.findMany({
      where: {
        AND: [
          { id: { not: characterId } },
          {
            movieCharacters: {
              some: {
                movieId: { in: movieIds }
              }
            }
          }
        ]
      },
      include: {
        movieCharacters: {
          include: { movie: true }
        }
      },
      take: limit,
    });

    recommendations.push(...relatedCharacters.map(character => ({
      id: character.id,
      type: 'character' as const,
      title: character.name,
      subtitle: character.movieCharacters.map(mc => mc.movie.titleEn).join(', '),
      description: character.description?.substring(0, 100),
      imageUrl: character.imageUrl,
      url: `/characters/${character.id}`,
      score: 70,
    })));
  }

  return recommendations;
}

// 评论推荐
async function getReviewRecommendations(
  reviewId: string,
  limit: number,
  includeTypes: string[]
): Promise<RecommendationItem[]> {
  const recommendations: RecommendationItem[] = [];

  const currentReview = await prisma.movieReview.findUnique({
    where: { id: reviewId },
    include: { movie: true }
  });

  if (!currentReview) return [];

  // 推荐相关电影
  if (includeTypes.includes('movie')) {
    recommendations.push({
      id: currentReview.movie.id,
      type: 'movie' as const,
      title: currentReview.movie.titleEn,
      subtitle: `${currentReview.movie.year} • 被评论的电影`,
      description: currentReview.movie.synopsis?.substring(0, 100),
      imageUrl: currentReview.movie.posterUrl,
      url: `/movies/${currentReview.movie.id}`,
      score: 100,
    });
  }

  // 推荐同一电影的其他评论
  if (includeTypes.includes('review')) {
    const relatedReviews = await prisma.movieReview.findMany({
      where: {
        AND: [
          { id: { not: reviewId } },
          { movieId: currentReview.movieId },
          { isPublished: true }
        ]
      },
      include: { movie: true },
      take: limit,
    });

    recommendations.push(...relatedReviews.map(review => ({
      id: review.id,
      type: 'review' as const,
      title: review.title,
      subtitle: `${review.author}的评论`,
      description: review.content.substring(0, 100),
      imageUrl: review.movie.posterUrl,
      url: `/reviews/${review.id}`,
      score: 80,
    })));
  }

  return recommendations;
}

// 指南推荐
async function getGuideRecommendations(
  guideId: string,
  limit: number,
  includeTypes: string[]
): Promise<RecommendationItem[]> {
  const recommendations: RecommendationItem[] = [];

  const currentGuide = await prisma.watchGuide.findUnique({
    where: { id: guideId },
    include: {
      movies: {
        include: { movie: true }
      }
    }
  });

  if (!currentGuide) return [];

  // 推荐指南中的电影
  if (includeTypes.includes('movie')) {
    recommendations.push(...currentGuide.movies.map(wgm => ({
      id: wgm.movie.id,
      type: 'movie' as const,
      title: wgm.movie.titleEn,
      subtitle: `${wgm.movie.year} • 指南推荐`,
      description: wgm.movie.synopsis?.substring(0, 100),
      imageUrl: wgm.movie.posterUrl,
      url: `/movies/${wgm.movie.id}`,
      score: 90 - wgm.order,
    })));
  }

  // 推荐相似类型的其他指南
  if (includeTypes.includes('guide')) {
    const similarGuides = await prisma.watchGuide.findMany({
      where: {
        AND: [
          { id: { not: guideId } },
          { guideType: currentGuide.guideType },
          { isPublished: true }
        ]
      },
      include: {
        movies: {
          include: { movie: true }
        }
      },
      take: limit,
    });

    recommendations.push(...similarGuides.map(guide => ({
      id: guide.id,
      type: 'guide' as const,
      title: guide.title,
      subtitle: `${guide.guideType} • ${guide.movies.length}部电影`,
      description: guide.description?.substring(0, 100),
      imageUrl: guide.movies[0]?.movie.posterUrl,
      url: `/guides/${guide.id}`,
      score: 70,
    })));
  }

  return recommendations;
}

// 计算电影相似度
function calculateMovieSimilarity(movie1: any, movie2: any): number {
  let score = 0;

  // 导演相同
  if (movie1.director && movie2.director && movie1.director === movie2.director) {
    score += 30;
  }

  // 年份相近
  const yearDiff = Math.abs(movie1.year - movie2.year);
  if (yearDiff <= 2) score += 20;
  else if (yearDiff <= 5) score += 10;

  // 标签相似
  const tags1 = movie1.movieTags?.map((mt: any) => mt.tagId) || [];
  const tags2 = movie2.movieTags?.map((mt: any) => mt.tagId) || [];
  const commonTags = tags1.filter((tag: string) => tags2.includes(tag));
  score += commonTags.length * 10;

  return score;
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/app/lib/error-handler';

// 将此路由标记为动态路由
export const dynamic = 'force-dynamic';

// 根据标签筛选电影
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tagIds = searchParams.get('tagIds')?.split(',').filter(Boolean) || [];
    const categories = searchParams.get('categories')?.split(',').filter(Boolean) || [];
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '12')));
    const sortBy = searchParams.get('sortBy') || 'year'; // year, title, rating
    const sortOrder = searchParams.get('sortOrder') || 'desc'; // asc, desc
    const matchAll = searchParams.get('matchAll') === 'true'; // 是否需要匹配所有标签

    const skip = (page - 1) * pageSize;

    // 构建基础查询条件
    let whereCondition: any = {};

    // 如果指定了标签ID或分类
    if (tagIds.length > 0 || categories.length > 0) {
      const tagConditions: any[] = [];

      // 按标签ID筛选
      if (tagIds.length > 0) {
        if (matchAll) {
          // 需要匹配所有指定的标签
          whereCondition.AND = tagIds.map(tagId => ({
            movieTags: {
              some: {
                tagId: tagId
              }
            }
          }));
        } else {
          // 匹配任意一个标签即可
          tagConditions.push({
            movieTags: {
              some: {
                tagId: { in: tagIds }
              }
            }
          });
        }
      }

      // 按分类筛选
      if (categories.length > 0) {
        tagConditions.push({
          movieTags: {
            some: {
              tag: {
                category: { in: categories }
              }
            }
          }
        });
      }

      // 如果有多个条件且不是matchAll模式，使用OR连接
      if (tagConditions.length > 0 && !matchAll) {
        if (tagConditions.length === 1) {
          whereCondition = { ...whereCondition, ...tagConditions[0] };
        } else {
          whereCondition.OR = tagConditions;
        }
      }
    }

    // 构建排序条件
    let orderBy: any = {};
    switch (sortBy) {
      case 'title':
        orderBy = { titleZh: sortOrder };
        break;
      case 'rating':
        orderBy = { voteAverage: sortOrder };
        break;
      case 'year':
      default:
        orderBy = { year: sortOrder };
        break;
    }

    // 获取总数
    const total = await prisma.movie.count({
      where: whereCondition
    });

    // 获取电影列表
    const movies = await prisma.movie.findMany({
      where: whereCondition,
      include: {
        movieTags: {
          include: {
            tag: true
          },
          orderBy: {
            tag: {
              category: 'asc'
            }
          }
        }
      },
      orderBy,
      skip,
      take: pageSize
    });

    // 格式化响应数据
    const formattedMovies = movies.map(movie => ({
      id: movie.id,
      tmdbId: movie.tmdbId,
      titleEn: movie.titleEn,
      titleJa: movie.titleJa,
      titleZh: movie.titleZh,
      year: movie.year,
      director: movie.director,
      duration: movie.duration,
      synopsis: movie.synopsis,
      posterUrl: movie.posterUrl,
      backdropUrl: movie.backdropUrl,
      voteAverage: movie.voteAverage,
      createdAt: movie.createdAt,
      updatedAt: movie.updatedAt,
      tags: movie.movieTags.map(movieTag => ({
        id: movieTag.tag.id,
        name: movieTag.tag.name,
        nameJa: movieTag.tag.nameJa,
        nameZh: movieTag.tag.nameZh,
        description: movieTag.tag.description,
        color: movieTag.tag.color,
        category: movieTag.tag.category,
      })),
      tagsByCategory: movie.movieTags.reduce((acc, movieTag) => {
        const category = movieTag.tag.category || 'other';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push({
          id: movieTag.tag.id,
          name: movieTag.tag.name,
          nameJa: movieTag.tag.nameJa,
          nameZh: movieTag.tag.nameZh,
          color: movieTag.tag.color,
        });
        return acc;
      }, {} as Record<string, any[]>)
    }));

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      movies: formattedMovies,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        tagIds,
        categories,
        sortBy,
        sortOrder,
        matchAll
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// 获取筛选选项统计
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tagIds: _tagIds = [], categories: _categories = [] } = body;

    // 获取所有标签的电影数量统计
    const tagStats = await prisma.tag.findMany({
      include: {
        movieTags: {
          select: {
            id: true
          }
        }
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });

    const formattedTagStats = tagStats.map(tag => ({
      id: tag.id,
      name: tag.name,
      nameJa: tag.nameJa,
      nameZh: tag.nameZh,
      description: tag.description,
      color: tag.color,
      category: tag.category,
      movieCount: tag.movieTags.length,
      createdAt: tag.createdAt
    }));

    // 按分类分组
    const tagStatsByCategory = formattedTagStats.reduce((acc, tag) => {
      const category = tag.category || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(tag);
      return acc;
    }, {} as Record<string, typeof formattedTagStats>);

    // 获取分类统计
    const categoryStats = await prisma.tag.groupBy({
      by: ['category'],
      _count: {
        id: true
      },
      orderBy: {
        category: 'asc'
      }
    });

    return NextResponse.json({
      tagStats: formattedTagStats,
      tagStatsByCategory,
      categoryStats: categoryStats.map(stat => ({
        category: stat.category,
        tagCount: stat._count.id
      })),
      total: formattedTagStats.length
    });
  } catch (error) {
    return handleApiError(error);
  }
}

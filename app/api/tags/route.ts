import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/app/lib/error-handler';
import { TAG_CATEGORIES } from '@/data/tag-categories';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const withCount = searchParams.get('withCount') === 'true';
    const movieId = searchParams.get('movieId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const includeCategories = searchParams.get('includeCategories') === 'true';

    // 如果请求标签分类信息
    if (includeCategories) {
      return Response.json({
        categories: TAG_CATEGORIES,
        tags: [],
        total: 0,
      });
    }

    // 构建查询条件
    const whereCondition: Record<string, unknown> = {};
    if (category) {
      whereCondition.category = category;
    }
    if (search) {
      whereCondition.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameJa: { contains: search, mode: 'insensitive' } },
        { nameZh: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // 如果指定了电影ID，只返回该电影的标签
    if (movieId) {
      const movieTags = await prisma.movieTag.findMany({
        where: { movieId },
        include: {
          tag: true
        },
        orderBy: {
          tag: {
            name: 'asc'
          }
        }
      });

      const formattedTags = movieTags.map(movieTag => ({
        id: movieTag.tag.id,
        name: movieTag.tag.name,
        nameJa: movieTag.tag.nameJa,
        nameZh: movieTag.tag.nameZh,
        description: movieTag.tag.description,
        color: movieTag.tag.color,
        category: movieTag.tag.category,
        createdAt: movieTag.tag.createdAt,
      }));

      return Response.json({
        tags: formattedTags,
        total: formattedTags.length,
      });
    }

    // 获取标签列表
    const tags = await prisma.tag.findMany({
      where: whereCondition,
      include: {
        movieTags: withCount ? {
          select: {
            id: true
          }
        } : false
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ],
      take: limit,
    });

    const formattedTags = tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      nameJa: tag.nameJa,
      nameZh: tag.nameZh,
      description: tag.description,
      color: tag.color,
      category: tag.category,
      count: withCount ? tag.movieTags?.length || 0 : undefined,
      createdAt: tag.createdAt,
    }));

    return Response.json({
      tags: formattedTags,
      total: formattedTags.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, nameJa, nameZh, description, color, category } = body;

    if (!name) {
      return Response.json(
        { error: 'Tag name is required' },
        { status: 400 }
      );
    }

    // 检查标签是否已存在
    const existingTag = await prisma.tag.findUnique({
      where: { name }
    });

    if (existingTag) {
      return Response.json(
        { error: 'Tag already exists' },
        { status: 409 }
      );
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        nameJa,
        nameZh,
        description,
        color,
        category,
      },
    });

    return Response.json({
      tag: {
        id: tag.id,
        name: tag.name,
        nameJa: tag.nameJa,
        nameZh: tag.nameZh,
        description: tag.description,
        color: tag.color,
        category: tag.category,
        createdAt: tag.createdAt,
      }
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

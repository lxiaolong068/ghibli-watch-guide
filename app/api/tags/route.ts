import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/app/lib/error-handler';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const withCount = searchParams.get('withCount') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    const whereCondition: any = {};
    if (category) {
      whereCondition.category = category;
    }

    const tags = await prisma.tag.findMany({
      where: whereCondition,
      include: withCount ? {
        movieTags: {
          select: {
            id: true
          }
        }
      } : undefined,
      orderBy: {
        name: 'asc'
      },
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

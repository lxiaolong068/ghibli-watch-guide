import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma, GuideType } from '../../../prisma/generated/client';

// 将此路由标记为动态路由，防止在构建时静态生成
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const guideType = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: Prisma.WatchGuideWhereInput = {
      isPublished: true,
    };

    // 如果指定了指南类型，添加筛选条件
    if (guideType && ['CHRONOLOGICAL', 'BEGINNER', 'THEMATIC', 'FAMILY', 'ADVANCED', 'SEASONAL'].includes(guideType)) {
      where.guideType = guideType as GuideType;
    }

    // 获取观影指南列表
    const [guides, total] = await Promise.all([
      prisma.watchGuide.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { order: 'asc' },
          { createdAt: 'desc' }
        ],
        include: {
          movies: {
            include: {
              movie: {
                select: {
                  id: true,
                  titleEn: true,
                  titleJa: true,
                  titleZh: true,
                  year: true,
                  posterUrl: true,
                  synopsis: true,
                  voteAverage: true,
                  duration: true
                }
              }
            },
            orderBy: { order: 'asc' }
          }
        }
      }),
      prisma.watchGuide.count({ where })
    ]);

    // 格式化返回数据
    const formattedGuides = guides.map(guide => ({
      id: guide.id,
      title: guide.title,
      description: guide.description,
      guideType: guide.guideType,
      content: guide.content,
      language: guide.language,
      createdAt: guide.createdAt,
      updatedAt: guide.updatedAt,
      movieCount: guide.movies.length,
      movies: guide.movies.map(gm => ({
        order: gm.order,
        notes: gm.notes,
        movie: gm.movie
      }))
    }));

    return NextResponse.json({
      guides: formattedGuides,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('获取观影指南列表失败:', error);
    return NextResponse.json(
      { error: '获取观影指南列表失败' },
      { status: 500 }
    );
  }
}

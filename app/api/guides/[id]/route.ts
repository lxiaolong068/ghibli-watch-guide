import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 将此路由标记为动态路由，防止在构建时静态生成
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: '观影指南ID是必需的' },
        { status: 400 }
      );
    }

    // 获取观影指南详情
    const guide = await prisma.watchGuide.findUnique({
      where: { 
        id,
        isPublished: true 
      },
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
                backdropUrl: true,
                synopsis: true,
                voteAverage: true,
                duration: true,
                director: true,
                tmdbId: true
              }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!guide) {
      return NextResponse.json(
        { error: '观影指南不存在或未发布' },
        { status: 404 }
      );
    }

    // 获取相关的其他指南（同类型或推荐）
    const relatedGuides = await prisma.watchGuide.findMany({
      where: {
        isPublished: true,
        id: { not: id },
        OR: [
          { guideType: guide.guideType },
          { guideType: 'BEGINNER' } // 总是包含新手指南作为推荐
        ]
      },
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        guideType: true,
        createdAt: true,
        movies: {
          take: 1,
          include: {
            movie: {
              select: {
                posterUrl: true
              }
            }
          }
        }
      }
    });

    // 格式化返回数据
    const formattedGuide = {
      id: guide.id,
      title: guide.title,
      description: guide.description,
      guideType: guide.guideType,
      content: guide.content,
      language: guide.language,
      createdAt: guide.createdAt,
      updatedAt: guide.updatedAt,
      movies: guide.movies.map(gm => ({
        order: gm.order,
        notes: gm.notes,
        movie: gm.movie
      })),
      relatedGuides: relatedGuides.map(rg => ({
        id: rg.id,
        title: rg.title,
        description: rg.description,
        guideType: rg.guideType,
        createdAt: rg.createdAt,
        coverImage: rg.movies[0]?.movie.posterUrl || null
      }))
    };

    return NextResponse.json(formattedGuide);

  } catch (error) {
    console.error('获取观影指南详情失败:', error);
    return NextResponse.json(
      { error: '获取观影指南详情失败' },
      { status: 500 }
    );
  }
}

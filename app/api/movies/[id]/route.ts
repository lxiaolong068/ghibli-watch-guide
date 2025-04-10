import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 将此路由标记为动态路由，防止在构建时静态生成
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const movie = await prisma.movie.findUnique({
      where: {
        id: params.id,
      },
      include: {
        availabilities: {
          include: {
            platform: true,
            region: true,
          },
        },
      },
    });

    if (!movie) {
      return NextResponse.json(
        { error: '电影不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(movie);
  } catch (error) {
    console.error('获取电影详情失败：', error);
    return NextResponse.json(
      { error: '获取电影详情失败' },
      { status: 500 }
    );
  }
} 
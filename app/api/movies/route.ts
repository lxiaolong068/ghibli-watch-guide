import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 将此路由标记为动态路由，防止在构建时静态生成
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const movies = await prisma.movie.findMany({
      orderBy: {
        year: 'desc',
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

    return NextResponse.json(movies);
  } catch (error) {
    console.error('获取Movie List失败：', error);
    return NextResponse.json(
      { error: '获取Movie List失败' },
      { status: 500 }
    );
  }
} 
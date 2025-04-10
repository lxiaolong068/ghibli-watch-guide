import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 将此路由标记为动态路由，防止在构建时静态生成
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get('movieId');
    const regionId = searchParams.get('regionId');
    const platformId = searchParams.get('platformId');

    const availability = await prisma.availability.findMany({
      where: {
        ...(movieId && { movieId }),
        ...(regionId && { regionId }),
        ...(platformId && { platformId }),
      },
      include: {
        movie: true,
        platform: true,
        region: true,
      },
      orderBy: {
        lastChecked: 'desc',
      },
    });

    return NextResponse.json(availability);
  } catch (error) {
    console.error('获取观看信息失败：', error);
    return NextResponse.json(
      { error: '获取观看信息失败' },
      { status: 500 }
    );
  }
} 
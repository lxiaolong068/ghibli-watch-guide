import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    console.error('获取电影列表失败：', error);
    return NextResponse.json(
      { error: '获取电影列表失败' },
      { status: 500 }
    );
  }
} 
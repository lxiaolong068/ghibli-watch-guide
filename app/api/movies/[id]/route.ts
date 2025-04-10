import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const movie = await prisma.movie.findUnique({
      where: {
        id: context.params.id,
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
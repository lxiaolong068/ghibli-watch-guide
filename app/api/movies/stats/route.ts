import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { movieId, action } = await request.json();

    if (!movieId || !action) {
      return NextResponse.json(
        { error: 'Missing movieId or action' },
        { status: 400 }
      );
    }

    // 验证 action 类型
    if (!['view', 'favorite', 'share'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action type' },
        { status: 400 }
      );
    }

    // 检查电影是否存在
    const movie = await prisma.movie.findUnique({
      where: { id: movieId }
    });

    if (!movie) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      );
    }

    // 更新或创建统计记录
    const stats = await prisma.movieStats.upsert({
      where: { movieId },
      update: {
        ...(action === 'view' && { 
          viewCount: { increment: 1 },
          lastViewed: new Date()
        }),
        ...(action === 'favorite' && { 
          favoriteCount: { increment: 1 }
        }),
        ...(action === 'share' && { 
          shareCount: { increment: 1 }
        }),
        updatedAt: new Date()
      },
      create: {
        movieId,
        viewCount: action === 'view' ? 1 : 0,
        favoriteCount: action === 'favorite' ? 1 : 0,
        shareCount: action === 'share' ? 1 : 0,
        lastViewed: action === 'view' ? new Date() : null
      }
    });

    return NextResponse.json({ 
      success: true, 
      stats: {
        viewCount: stats.viewCount,
        favoriteCount: stats.favoriteCount,
        shareCount: stats.shareCount
      }
    });

  } catch (error) {
    console.error('Error updating movie stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get('movieId');

    if (!movieId) {
      return NextResponse.json(
        { error: 'Missing movieId parameter' },
        { status: 400 }
      );
    }

    // 获取电影统计数据
    const stats = await prisma.movieStats.findUnique({
      where: { movieId }
    });

    if (!stats) {
      return NextResponse.json({
        viewCount: 0,
        favoriteCount: 0,
        shareCount: 0,
        lastViewed: null
      });
    }

    return NextResponse.json({
      viewCount: stats.viewCount,
      favoriteCount: stats.favoriteCount,
      shareCount: stats.shareCount,
      lastViewed: stats.lastViewed
    });

  } catch (error) {
    console.error('Error fetching movie stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

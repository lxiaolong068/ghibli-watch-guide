import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 将此路由标记为动态路由，防止在构建时静态生成
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const movieId = searchParams.get('movieId');
    const isMainCharacter = searchParams.get('isMainCharacter');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameJa: { contains: search, mode: 'insensitive' } },
        { nameZh: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (isMainCharacter !== null && isMainCharacter !== undefined) {
      where.isMainCharacter = isMainCharacter === 'true';
    }

    // 如果指定了电影ID，则通过关联查询
    let characters;
    let total;

    if (movieId) {
      const movieCharacters = await prisma.movieCharacter.findMany({
        where: {
          movieId: movieId,
          character: where
        },
        include: {
          character: true,
          movie: {
            select: {
              id: true,
              titleEn: true,
              titleJa: true,
              titleZh: true,
              year: true,
              posterUrl: true
            }
          }
        },
        orderBy: [
          { importance: 'desc' },
          { character: { isMainCharacter: 'desc' } },
          { character: { name: 'asc' } }
        ],
        skip,
        take: limit
      });

      characters = movieCharacters.map(mc => ({
        ...mc.character,
        voiceActor: mc.voiceActor,
        voiceActorJa: mc.voiceActorJa,
        importance: mc.importance,
        movie: mc.movie
      }));

      total = await prisma.movieCharacter.count({
        where: {
          movieId: movieId,
          character: where
        }
      });
    } else {
      characters = await prisma.character.findMany({
        where,
        include: {
          movieCharacters: {
            include: {
              movie: {
                select: {
                  id: true,
                  titleEn: true,
                  titleJa: true,
                  titleZh: true,
                  year: true,
                  posterUrl: true
                }
              }
            },
            orderBy: { importance: 'desc' }
          }
        },
        orderBy: [
          { isMainCharacter: 'desc' },
          { name: 'asc' }
        ],
        skip,
        take: limit
      });

      total = await prisma.character.count({ where });
    }

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      characters,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('获取角色列表失败：', error);
    return NextResponse.json(
      { error: '获取角色列表失败' },
      { status: 500 }
    );
  }
}

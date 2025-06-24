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

    const character = await prisma.character.findUnique({
      where: { id },
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
                posterUrl: true,
                backdropUrl: true,
                synopsis: true,
                voteAverage: true,
                duration: true
              }
            }
          },
          orderBy: { importance: 'desc' }
        }
      }
    });

    if (!character) {
      return NextResponse.json(
        { error: '角色不存在' },
        { status: 404 }
      );
    }

    // 获取相关角色（出现在相同电影中的其他角色）
    const relatedCharacters = await prisma.character.findMany({
      where: {
        AND: [
          { id: { not: character.id } },
          {
            movieCharacters: {
              some: {
                movieId: {
                  in: character.movieCharacters.map(mc => mc.movieId)
                }
              }
            }
          }
        ]
      },
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
      take: 6
    });

    // 格式化角色数据
    const formattedCharacter = {
      ...character,
      movies: character.movieCharacters.map(mc => ({
        ...mc.movie,
        voiceActor: mc.voiceActor,
        voiceActorJa: mc.voiceActorJa,
        importance: mc.importance
      }))
    };

    const formattedRelatedCharacters = relatedCharacters.map(char => ({
      ...char,
      movies: char.movieCharacters.map(mc => ({
        ...mc.movie,
        voiceActor: mc.voiceActor,
        voiceActorJa: mc.voiceActorJa,
        importance: mc.importance
      }))
    }));

    return NextResponse.json({
      character: formattedCharacter,
      relatedCharacters: formattedRelatedCharacters
    });

  } catch (error) {
    console.error('获取角色详情失败：', error);
    return NextResponse.json(
      { error: '获取角色详情失败' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const { name, nameJa, nameZh, description, imageUrl, isMainCharacter } = body;

    const character = await prisma.character.update({
      where: { id },
      data: {
        name,
        nameJa,
        nameZh,
        description,
        imageUrl,
        isMainCharacter
      },
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
          }
        }
      }
    });

    return NextResponse.json(character);

  } catch (error) {
    console.error('更新角色失败：', error);
    return NextResponse.json(
      { error: '更新角色失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 先删除相关的电影角色关联
    await prisma.movieCharacter.deleteMany({
      where: { characterId: id }
    });

    // 然后删除角色
    await prisma.character.delete({
      where: { id }
    });

    return NextResponse.json({ message: '角色删除成功' });

  } catch (error) {
    console.error('删除角色失败：', error);
    return NextResponse.json(
      { error: '删除角色失败' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 创建内容（电影评论、角色档案等）
export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json();

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Missing type or data' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'movie_review':
        result = await createMovieReview(data);
        break;
      case 'character':
        result = await createCharacter(data);
        break;
      case 'movie_character':
        result = await createMovieCharacter(data);
        break;
      case 'crew_member':
        result = await createCrewMember(data);
        break;
      case 'movie_crew':
        result = await createMovieCrew(data);
        break;
      case 'watch_guide':
        result = await createWatchGuide(data);
        break;
      case 'media_content':
        result = await createMediaContent(data);
        break;
      case 'tag':
        result = await createTag(data);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid content type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, data: result });

  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 获取内容列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    if (!type) {
      return NextResponse.json(
        { error: 'Missing type parameter' },
        { status: 400 }
      );
    }

    let result;
    let total;

    switch (type) {
      case 'movie_reviews':
        [result, total] = await Promise.all([
          prisma.movieReview.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
              movie: {
                select: { titleEn: true, titleJa: true }
              }
            }
          }),
          prisma.movieReview.count()
        ]);
        break;
      case 'characters':
        [result, total] = await Promise.all([
          prisma.character.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
              movieCharacters: {
                include: {
                  movie: {
                    select: { titleEn: true }
                  }
                }
              }
            }
          }),
          prisma.character.count()
        ]);
        break;
      case 'crew_members':
        [result, total] = await Promise.all([
          prisma.crewMember.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
              movieCrew: {
                include: {
                  movie: {
                    select: { titleEn: true }
                  }
                }
              }
            }
          }),
          prisma.crewMember.count()
        ]);
        break;
      case 'watch_guides':
        [result, total] = await Promise.all([
          prisma.watchGuide.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
              movies: {
                include: {
                  movie: {
                    select: { titleEn: true }
                  }
                }
              }
            }
          }),
          prisma.watchGuide.count()
        ]);
        break;
      case 'media_content':
        [result, total] = await Promise.all([
          prisma.mediaContent.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
              movie: {
                select: { titleEn: true }
              }
            }
          }),
          prisma.mediaContent.count()
        ]);
        break;
      case 'tags':
        [result, total] = await Promise.all([
          prisma.tag.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
              movieTags: {
                include: {
                  movie: {
                    select: { titleEn: true }
                  }
                }
              }
            }
          }),
          prisma.tag.count()
        ]);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid content type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      data: result,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 辅助函数：创建电影评论
async function createMovieReview(data: any) {
  return await prisma.movieReview.create({
    data: {
      movieId: data.movieId,
      title: data.title,
      content: data.content,
      author: data.author,
      rating: data.rating,
      reviewType: data.reviewType,
      language: data.language || 'en',
      isPublished: data.isPublished || false
    }
  });
}

// 辅助函数：创建角色
async function createCharacter(data: any) {
  return await prisma.character.create({
    data: {
      name: data.name,
      nameJa: data.nameJa,
      nameZh: data.nameZh,
      description: data.description,
      imageUrl: data.imageUrl,
      isMainCharacter: data.isMainCharacter || false
    }
  });
}

// 辅助函数：创建电影角色关联
async function createMovieCharacter(data: any) {
  return await prisma.movieCharacter.create({
    data: {
      movieId: data.movieId,
      characterId: data.characterId,
      voiceActor: data.voiceActor,
      voiceActorJa: data.voiceActorJa,
      importance: data.importance || 0
    }
  });
}

// 辅助函数：创建制作人员
async function createCrewMember(data: any) {
  return await prisma.crewMember.create({
    data: {
      name: data.name,
      nameJa: data.nameJa,
      biography: data.biography,
      imageUrl: data.imageUrl,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      nationality: data.nationality
    }
  });
}

// 辅助函数：创建电影制作人员关联
async function createMovieCrew(data: any) {
  return await prisma.movieCrew.create({
    data: {
      movieId: data.movieId,
      crewMemberId: data.crewMemberId,
      role: data.role,
      department: data.department
    }
  });
}

// 辅助函数：创建观影指南
async function createWatchGuide(data: any) {
  return await prisma.watchGuide.create({
    data: {
      title: data.title,
      description: data.description,
      guideType: data.guideType,
      content: data.content,
      order: data.order || 0,
      isPublished: data.isPublished || false,
      language: data.language || 'en'
    }
  });
}

// 辅助函数：创建多媒体内容
async function createMediaContent(data: any) {
  return await prisma.mediaContent.create({
    data: {
      movieId: data.movieId,
      title: data.title,
      description: data.description,
      mediaType: data.mediaType,
      url: data.url,
      thumbnailUrl: data.thumbnailUrl,
      duration: data.duration,
      fileSize: data.fileSize,
      language: data.language,
      isPublished: data.isPublished || false
    }
  });
}

// 辅助函数：创建标签
async function createTag(data: any) {
  return await prisma.tag.create({
    data: {
      name: data.name,
      nameJa: data.nameJa,
      nameZh: data.nameZh,
      description: data.description,
      color: data.color,
      category: data.category
    }
  });
}

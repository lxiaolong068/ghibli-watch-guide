import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

// 获取单个内容项
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const { id } = params;

    if (!type) {
      return NextResponse.json(
        { error: 'Missing type parameter' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'movie_review':
        result = await prisma.movieReview.findUnique({
          where: { id },
          include: {
            movie: {
              select: { titleEn: true, titleJa: true }
            }
          }
        });
        break;
      case 'character':
        result = await prisma.character.findUnique({
          where: { id },
          include: {
            movieCharacters: {
              include: {
                movie: {
                  select: { titleEn: true }
                }
              }
            }
          }
        });
        break;
      case 'crew_member':
        result = await prisma.crewMember.findUnique({
          where: { id },
          include: {
            movieCrew: {
              include: {
                movie: {
                  select: { titleEn: true }
                }
              }
            }
          }
        });
        break;
      case 'watch_guide':
        result = await prisma.watchGuide.findUnique({
          where: { id },
          include: {
            movies: {
              include: {
                movie: {
                  select: { titleEn: true }
                }
              }
            }
          }
        });
        break;
      case 'media_content':
        result = await prisma.mediaContent.findUnique({
          where: { id },
          include: {
            movie: {
              select: { titleEn: true }
            }
          }
        });
        break;
      case 'tag':
        result = await prisma.tag.findUnique({
          where: { id },
          include: {
            movieTags: {
              include: {
                movie: {
                  select: { titleEn: true }
                }
              }
            }
          }
        });
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid content type' },
          { status: 400 }
        );
    }

    if (!result) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: result });

  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 更新内容
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { type, data } = await request.json();
    const { id } = params;

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Missing type or data' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'movie_review':
        result = await prisma.movieReview.update({
          where: { id },
          data: {
            title: data.title,
            content: data.content,
            author: data.author,
            rating: data.rating,
            reviewType: data.reviewType,
            language: data.language,
            isPublished: data.isPublished,
            publishedAt: data.isPublished ? new Date() : null
          }
        });
        break;
      case 'character':
        result = await prisma.character.update({
          where: { id },
          data: {
            name: data.name,
            nameJa: data.nameJa,
            nameZh: data.nameZh,
            description: data.description,
            imageUrl: data.imageUrl,
            isMainCharacter: data.isMainCharacter
          }
        });
        break;
      case 'crew_member':
        result = await prisma.crewMember.update({
          where: { id },
          data: {
            name: data.name,
            nameJa: data.nameJa,
            biography: data.biography,
            imageUrl: data.imageUrl,
            birthDate: data.birthDate ? new Date(data.birthDate) : null,
            nationality: data.nationality
          }
        });
        break;
      case 'watch_guide':
        result = await prisma.watchGuide.update({
          where: { id },
          data: {
            title: data.title,
            description: data.description,
            guideType: data.guideType,
            content: data.content,
            order: data.order,
            isPublished: data.isPublished,
            language: data.language
          }
        });
        break;
      case 'media_content':
        result = await prisma.mediaContent.update({
          where: { id },
          data: {
            title: data.title,
            description: data.description,
            mediaType: data.mediaType,
            url: data.url,
            thumbnailUrl: data.thumbnailUrl,
            duration: data.duration,
            fileSize: data.fileSize,
            language: data.language,
            isPublished: data.isPublished
          }
        });
        break;
      case 'tag':
        result = await prisma.tag.update({
          where: { id },
          data: {
            name: data.name,
            nameJa: data.nameJa,
            nameZh: data.nameZh,
            description: data.description,
            color: data.color,
            category: data.category
          }
        });
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid content type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, data: result });

  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 删除内容
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const { id } = params;

    if (!type) {
      return NextResponse.json(
        { error: 'Missing type parameter' },
        { status: 400 }
      );
    }

    switch (type) {
      case 'movie_review':
        await prisma.movieReview.delete({ where: { id } });
        break;
      case 'character':
        await prisma.character.delete({ where: { id } });
        break;
      case 'crew_member':
        await prisma.crewMember.delete({ where: { id } });
        break;
      case 'watch_guide':
        await prisma.watchGuide.delete({ where: { id } });
        break;
      case 'media_content':
        await prisma.mediaContent.delete({ where: { id } });
        break;
      case 'tag':
        await prisma.tag.delete({ where: { id } });
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid content type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

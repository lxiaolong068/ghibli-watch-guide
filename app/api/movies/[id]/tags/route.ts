import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/app/lib/error-handler';

// 将此路由标记为动态路由
export const dynamic = 'force-dynamic';

// 获取电影的标签
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const movieId = params.id;

    // 验证电影是否存在
    const movie = await prisma.movie.findUnique({
      where: { id: movieId }
    });

    if (!movie) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      );
    }

    // 获取电影的所有标签
    const movieTags = await prisma.movieTag.findMany({
      where: { movieId },
      include: {
        tag: true
      },
      orderBy: {
        tag: {
          category: 'asc'
        }
      }
    });

    const tags = movieTags.map(movieTag => ({
      id: movieTag.tag.id,
      name: movieTag.tag.name,
      nameJa: movieTag.tag.nameJa,
      nameZh: movieTag.tag.nameZh,
      description: movieTag.tag.description,
      color: movieTag.tag.color,
      category: movieTag.tag.category,
      createdAt: movieTag.tag.createdAt,
    }));

    // 按分类分组
    const tagsByCategory = tags.reduce((acc, tag) => {
      const category = tag.category || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(tag);
      return acc;
    }, {} as Record<string, typeof tags>);

    return NextResponse.json({
      movieId,
      tags,
      tagsByCategory,
      total: tags.length
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// 为电影添加标签
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const movieId = params.id;
    const body = await request.json();
    const { tagIds } = body;

    if (!Array.isArray(tagIds) || tagIds.length === 0) {
      return NextResponse.json(
        { error: 'Tag IDs array is required' },
        { status: 400 }
      );
    }

    // 验证电影是否存在
    const movie = await prisma.movie.findUnique({
      where: { id: movieId }
    });

    if (!movie) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      );
    }

    // 验证标签是否存在
    const tags = await prisma.tag.findMany({
      where: {
        id: { in: tagIds }
      }
    });

    if (tags.length !== tagIds.length) {
      return NextResponse.json(
        { error: 'Some tags not found' },
        { status: 404 }
      );
    }

    // 创建电影标签关联（忽略已存在的关联）
    const movieTagsData = tagIds.map(tagId => ({
      movieId,
      tagId
    }));

    const result = await prisma.movieTag.createMany({
      data: movieTagsData,
      skipDuplicates: true
    });

    return NextResponse.json({
      message: `Added ${result.count} new tag associations`,
      movieId,
      addedCount: result.count
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

// 删除电影的标签
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const movieId = params.id;
    const { searchParams } = new URL(request.url);
    const tagId = searchParams.get('tagId');

    if (!tagId) {
      return NextResponse.json(
        { error: 'Tag ID is required' },
        { status: 400 }
      );
    }

    // 验证电影是否存在
    const movie = await prisma.movie.findUnique({
      where: { id: movieId }
    });

    if (!movie) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      );
    }

    // 删除电影标签关联
    const deletedMovieTag = await prisma.movieTag.deleteMany({
      where: {
        movieId,
        tagId
      }
    });

    if (deletedMovieTag.count === 0) {
      return NextResponse.json(
        { error: 'Movie tag association not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Tag removed from movie successfully',
      movieId,
      tagId
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// 批量更新电影标签
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const movieId = params.id;
    const body = await request.json();
    const { tagIds } = body;

    if (!Array.isArray(tagIds)) {
      return NextResponse.json(
        { error: 'Tag IDs array is required' },
        { status: 400 }
      );
    }

    // 验证电影是否存在
    const movie = await prisma.movie.findUnique({
      where: { id: movieId }
    });

    if (!movie) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      );
    }

    // 如果提供了标签ID，验证标签是否存在
    if (tagIds.length > 0) {
      const tags = await prisma.tag.findMany({
        where: {
          id: { in: tagIds }
        }
      });

      if (tags.length !== tagIds.length) {
        return NextResponse.json(
          { error: 'Some tags not found' },
          { status: 404 }
        );
      }
    }

    // 使用事务来确保数据一致性
    const result = await prisma.$transaction(async (tx) => {
      // 删除现有的所有标签关联
      await tx.movieTag.deleteMany({
        where: { movieId }
      });

      // 如果有新标签，创建新的关联
      if (tagIds.length > 0) {
        const movieTagsData = tagIds.map(tagId => ({
          movieId,
          tagId
        }));

        await tx.movieTag.createMany({
          data: movieTagsData
        });
      }

      return tagIds.length;
    });

    return NextResponse.json({
      message: `Updated movie tags successfully`,
      movieId,
      tagCount: result
    });
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/app/lib/error-handler';

// 将此路由标记为动态路由
export const dynamic = 'force-dynamic';

// 获取单个标签详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tagId = params.id;

    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
      include: {
        movieTags: {
          include: {
            movie: {
              select: {
                id: true,
                titleEn: true,
                titleJa: true,
                titleZh: true,
                year: true,
                posterUrl: true,
                voteAverage: true
              }
            }
          },
          orderBy: {
            movie: {
              year: 'desc'
            }
          }
        }
      }
    });

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    const formattedTag = {
      id: tag.id,
      name: tag.name,
      nameJa: tag.nameJa,
      nameZh: tag.nameZh,
      description: tag.description,
      color: tag.color,
      category: tag.category,
      createdAt: tag.createdAt,
      movieCount: tag.movieTags.length,
      movies: tag.movieTags.map(movieTag => ({
        id: movieTag.movie.id,
        titleEn: movieTag.movie.titleEn,
        titleJa: movieTag.movie.titleJa,
        titleZh: movieTag.movie.titleZh,
        year: movieTag.movie.year,
        posterUrl: movieTag.movie.posterUrl,
        voteAverage: movieTag.movie.voteAverage,
        associatedAt: movieTag.createdAt
      }))
    };

    return NextResponse.json({
      tag: formattedTag
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// 更新标签
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tagId = params.id;
    const body = await request.json();
    const { name, nameJa, nameZh, description, color, category } = body;

    // 验证标签是否存在
    const existingTag = await prisma.tag.findUnique({
      where: { id: tagId }
    });

    if (!existingTag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    // 如果更新名称，检查是否与其他标签冲突
    if (name && name !== existingTag.name) {
      const duplicateTag = await prisma.tag.findUnique({
        where: { name }
      });

      if (duplicateTag) {
        return NextResponse.json(
          { error: 'Tag name already exists' },
          { status: 409 }
        );
      }
    }

    // 更新标签
    const updatedTag = await prisma.tag.update({
      where: { id: tagId },
      data: {
        ...(name && { name }),
        ...(nameJa !== undefined && { nameJa }),
        ...(nameZh !== undefined && { nameZh }),
        ...(description !== undefined && { description }),
        ...(color !== undefined && { color }),
        ...(category !== undefined && { category })
      }
    });

    return NextResponse.json({
      tag: {
        id: updatedTag.id,
        name: updatedTag.name,
        nameJa: updatedTag.nameJa,
        nameZh: updatedTag.nameZh,
        description: updatedTag.description,
        color: updatedTag.color,
        category: updatedTag.category,
        createdAt: updatedTag.createdAt
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// 删除标签
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tagId = params.id;

    // 验证标签是否存在
    const existingTag = await prisma.tag.findUnique({
      where: { id: tagId },
      include: {
        movieTags: {
          select: {
            id: true
          }
        }
      }
    });

    if (!existingTag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    // 检查是否有电影使用此标签
    if (existingTag.movieTags.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete tag that is associated with movies',
          movieCount: existingTag.movieTags.length
        },
        { status: 409 }
      );
    }

    // 删除标签
    await prisma.tag.delete({
      where: { id: tagId }
    });

    return NextResponse.json({
      message: 'Tag deleted successfully',
      tagId
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// 强制删除标签（包括所有关联）
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tagId = params.id;
    const body = await request.json();
    const { forceDelete } = body;

    if (!forceDelete) {
      return NextResponse.json(
        { error: 'Force delete flag is required' },
        { status: 400 }
      );
    }

    // 验证标签是否存在
    const existingTag = await prisma.tag.findUnique({
      where: { id: tagId }
    });

    if (!existingTag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    // 使用事务删除标签及其所有关联
    const result = await prisma.$transaction(async (tx) => {
      // 删除所有电影标签关联
      const deletedAssociations = await tx.movieTag.deleteMany({
        where: { tagId }
      });

      // 删除标签
      await tx.tag.delete({
        where: { id: tagId }
      });

      return deletedAssociations.count;
    });

    return NextResponse.json({
      message: 'Tag and all associations deleted successfully',
      tagId,
      deletedAssociations: result
    });
  } catch (error) {
    return handleApiError(error);
  }
}

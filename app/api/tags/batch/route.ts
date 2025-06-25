import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/app/lib/error-handler';
import { PRESET_TAGS } from '@/data/tag-categories';

// 将此路由标记为动态路由
export const dynamic = 'force-dynamic';

// 批量创建标签
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tags, usePresets } = body;

    let tagsToCreate = [];

    if (usePresets) {
      // 使用预设标签
      tagsToCreate = PRESET_TAGS.map(tag => ({
        name: tag.nameZh, // 使用中文名作为主名称
        nameJa: tag.nameJa,
        nameZh: tag.nameZh,
        description: tag.description,
        category: tag.category,
        color: tag.color
      }));
    } else if (Array.isArray(tags)) {
      // 使用提供的标签数据
      tagsToCreate = tags;
    } else {
      return NextResponse.json(
        { error: 'Tags array or usePresets flag is required' },
        { status: 400 }
      );
    }

    if (tagsToCreate.length === 0) {
      return NextResponse.json(
        { error: 'No tags to create' },
        { status: 400 }
      );
    }

    // 验证标签数据
    for (const tag of tagsToCreate) {
      if (!tag.name) {
        return NextResponse.json(
          { error: 'Tag name is required for all tags' },
          { status: 400 }
        );
      }
    }

    const results = {
      created: [] as any[],
      skipped: [] as any[],
      errors: [] as any[]
    };

    // 逐个创建标签，跳过已存在的
    for (const tagData of tagsToCreate) {
      try {
        // 检查标签是否已存在
        const existingTag = await prisma.tag.findUnique({
          where: { name: tagData.name }
        });

        if (existingTag) {
          results.skipped.push({
            name: tagData.name,
            reason: 'Tag already exists'
          });
          continue;
        }

        // 创建标签
        const createdTag = await prisma.tag.create({
          data: {
            name: tagData.name,
            nameJa: tagData.nameJa,
            nameZh: tagData.nameZh,
            description: tagData.description,
            color: tagData.color,
            category: tagData.category
          }
        });

        results.created.push({
          id: createdTag.id,
          name: createdTag.name,
          nameJa: createdTag.nameJa,
          nameZh: createdTag.nameZh,
          description: createdTag.description,
          color: createdTag.color,
          category: createdTag.category,
          createdAt: createdTag.createdAt
        });
      } catch (error) {
        results.errors.push({
          name: tagData.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      message: `Batch operation completed`,
      summary: {
        total: tagsToCreate.length,
        created: results.created.length,
        skipped: results.skipped.length,
        errors: results.errors.length
      },
      results
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

// 批量更新标签
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { updates } = body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'Updates array is required' },
        { status: 400 }
      );
    }

    const results = {
      updated: [] as any[],
      notFound: [] as any[],
      errors: [] as any[]
    };

    // 逐个更新标签
    for (const update of updates) {
      try {
        const { id, ...updateData } = update;

        if (!id) {
          results.errors.push({
            update,
            error: 'Tag ID is required'
          });
          continue;
        }

        // 检查标签是否存在
        const existingTag = await prisma.tag.findUnique({
          where: { id }
        });

        if (!existingTag) {
          results.notFound.push({
            id,
            error: 'Tag not found'
          });
          continue;
        }

        // 如果更新名称，检查是否与其他标签冲突
        if (updateData.name && updateData.name !== existingTag.name) {
          const duplicateTag = await prisma.tag.findUnique({
            where: { name: updateData.name }
          });

          if (duplicateTag) {
            results.errors.push({
              id,
              error: 'Tag name already exists'
            });
            continue;
          }
        }

        // 更新标签
        const updatedTag = await prisma.tag.update({
          where: { id },
          data: updateData
        });

        results.updated.push({
          id: updatedTag.id,
          name: updatedTag.name,
          nameJa: updatedTag.nameJa,
          nameZh: updatedTag.nameZh,
          description: updatedTag.description,
          color: updatedTag.color,
          category: updatedTag.category,
          createdAt: updatedTag.createdAt
        });
      } catch (error) {
        results.errors.push({
          update,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      message: 'Batch update completed',
      summary: {
        total: updates.length,
        updated: results.updated.length,
        notFound: results.notFound.length,
        errors: results.errors.length
      },
      results
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// 批量删除标签
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { tagIds, forceDelete = false } = body;

    if (!Array.isArray(tagIds) || tagIds.length === 0) {
      return NextResponse.json(
        { error: 'Tag IDs array is required' },
        { status: 400 }
      );
    }

    const results = {
      deleted: [] as any[],
      notFound: [] as any[],
      hasAssociations: [] as any[],
      errors: [] as any[]
    };

    // 逐个删除标签
    for (const tagId of tagIds) {
      try {
        // 检查标签是否存在
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
          results.notFound.push({
            id: tagId,
            error: 'Tag not found'
          });
          continue;
        }

        // 检查是否有关联的电影
        if (existingTag.movieTags.length > 0 && !forceDelete) {
          results.hasAssociations.push({
            id: tagId,
            name: existingTag.name,
            movieCount: existingTag.movieTags.length,
            error: 'Tag has movie associations'
          });
          continue;
        }

        // 删除标签（如果强制删除，先删除关联）
        if (forceDelete && existingTag.movieTags.length > 0) {
          await prisma.$transaction(async (tx) => {
            // 删除所有电影标签关联
            await tx.movieTag.deleteMany({
              where: { tagId }
            });

            // 删除标签
            await tx.tag.delete({
              where: { id: tagId }
            });
          });
        } else {
          // 直接删除标签
          await prisma.tag.delete({
            where: { id: tagId }
          });
        }

        results.deleted.push({
          id: tagId,
          name: existingTag.name,
          deletedAssociations: existingTag.movieTags.length
        });
      } catch (error) {
        results.errors.push({
          id: tagId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      message: 'Batch delete completed',
      summary: {
        total: tagIds.length,
        deleted: results.deleted.length,
        notFound: results.notFound.length,
        hasAssociations: results.hasAssociations.length,
        errors: results.errors.length
      },
      results
    });
  } catch (error) {
    return handleApiError(error);
  }
}

#!/usr/bin/env tsx
/**
 * 幕后故事种子脚本
 * 为吉卜力电影添加幕后故事和制作花絮
 */

import { PrismaClient } from '../prisma/generated/client';
import { GHIBLI_BEHIND_SCENES } from '../data/ghibli-behind-scenes';

const prisma = new PrismaClient();

async function seedBehindTheScenes() {
  console.log('🎬 开始添加幕后故事数据...');

  try {
    let totalMediaContentCreated = 0;

    for (const behindScenes of GHIBLI_BEHIND_SCENES) {
      console.log(`\n📽️ 处理幕后故事: ${behindScenes.title}`);

      // 查找数据库中的电影记录
      const dbMovie = await prisma.movie.findUnique({
        where: { tmdbId: behindScenes.movieTmdbId }
      });

      if (!dbMovie) {
        console.log(`⚠️ 电影 TMDB ID: ${behindScenes.movieTmdbId} 在数据库中不存在，跳过`);
        continue;
      }

      console.log(`✅ 找到电影记录: ${dbMovie.titleZh || dbMovie.titleEn}`);

      try {
        // 检查媒体内容是否已存在
        const existingContent = await prisma.mediaContent.findFirst({
          where: {
            movieId: dbMovie.id,
            title: behindScenes.title
          }
        });

        // 映射媒体类型到 schema 中定义的枚举值
        const mediaTypeMapping: Record<string, 'BEHIND_SCENES' | 'SOUNDTRACK' | 'ARTWORK'> = {
          'ARTICLE': 'BEHIND_SCENES',
          'VIDEO': 'BEHIND_SCENES',
          'AUDIO': 'SOUNDTRACK',
          'IMAGE': 'ARTWORK'
        };
        const mappedMediaType = mediaTypeMapping[behindScenes.mediaType] || 'BEHIND_SCENES';

        if (existingContent) {
          console.log(`  ℹ️ 幕后故事已存在，更新内容`);
          await prisma.mediaContent.update({
            where: { id: existingContent.id },
            data: {
              description: `${behindScenes.category} - ${behindScenes.tags.join(', ')}`,
              mediaType: mappedMediaType,
              url: `#${behindScenes.title.replace(/\s+/g, '-').toLowerCase()}`, // 生成锚点链接
              language: 'zh',
              isPublished: behindScenes.isPublished
            }
          });
        } else {
          console.log(`  ✨ 创建新幕后故事`);
          await prisma.mediaContent.create({
            data: {
              movieId: dbMovie.id,
              title: behindScenes.title,
              description: `${behindScenes.category} - ${behindScenes.tags.join(', ')}`,
              mediaType: mappedMediaType,
              url: `#${behindScenes.title.replace(/\s+/g, '-').toLowerCase()}`, // 生成锚点链接
              language: 'zh',
              isPublished: behindScenes.isPublished
            }
          });
          totalMediaContentCreated++;
        }

        console.log(`  ✅ 幕后故事处理完成`);

      } catch (error) {
        console.error(`  ❌ 处理幕后故事时出错:`, error);
      }
    }

    console.log('\n🎉 幕后故事数据添加完成!');
    console.log(`📊 统计信息:`);
    console.log(`  - 新创建幕后故事: ${totalMediaContentCreated}`);

    // 显示最终统计
    const totalMediaContent = await prisma.mediaContent.count();
    const publishedMediaContent = await prisma.mediaContent.count({
      where: { isPublished: true }
    });
    
    console.log(`\n📈 数据库总计:`);
    console.log(`  - 总媒体内容数: ${totalMediaContent}`);
    console.log(`  - 已发布媒体内容数: ${publishedMediaContent}`);

    // 显示各类型媒体内容统计
    const mediaTypeStats = await prisma.mediaContent.groupBy({
      by: ['mediaType'],
      where: { isPublished: true },
      _count: {
        id: true
      }
    });

    console.log(`\n🎭 媒体类型统计:`);
    mediaTypeStats.forEach(stat => {
      const typeNames = {
        'BEHIND_SCENES': '幕后花絮',
        'SOUNDTRACK': '原声音乐',
        'ARTWORK': '艺术作品',
        'TRAILER': '预告片',
        'CLIP': '片段',
        'INTERVIEW': '访谈',
        'POSTER': '海报',
        'WALLPAPER': '壁纸'
      };
      console.log(`  - ${typeNames[stat.mediaType as keyof typeof typeNames] || stat.mediaType}: ${stat._count.id} 个内容`);
    });

    // 显示每部电影的媒体内容数量
    const movieMediaCounts = await prisma.movie.findMany({
      select: {
        titleZh: true,
        titleEn: true,
        _count: {
          select: {
            mediaContent: {
              where: { isPublished: true }
            }
          }
        }
      },
      where: {
        mediaContent: {
          some: {
            isPublished: true
          }
        }
      }
    });

    console.log(`\n📚 各电影媒体内容统计:`);
    movieMediaCounts.forEach(movie => {
      console.log(`  - ${movie.titleZh || movie.titleEn}: ${movie._count.mediaContent} 个媒体内容`);
    });

  } catch (error) {
    console.error('❌ 幕后故事种子脚本执行失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  seedBehindTheScenes()
    .then(() => {
      console.log('✅ 幕后故事种子脚本执行成功');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 幕后故事种子脚本执行失败:', error);
      process.exit(1);
    });
}

export { seedBehindTheScenes };

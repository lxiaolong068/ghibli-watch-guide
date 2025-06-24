#!/usr/bin/env tsx
/**
 * 观影指南种子脚本
 * 为吉卜力电影添加不同类型的观影指南
 */

import { PrismaClient } from '../prisma/generated/client';
import { GHIBLI_WATCH_GUIDES } from '../data/ghibli-watch-guides';

const prisma = new PrismaClient();

async function seedWatchGuides() {
  console.log('📚 开始添加观影指南数据...');

  try {
    let totalGuidesCreated = 0;
    let totalGuideMoviesCreated = 0;

    for (const guide of GHIBLI_WATCH_GUIDES) {
      console.log(`\n📖 处理观影指南: ${guide.title}`);

      try {
        // 检查指南是否已存在
        const existingGuide = await prisma.watchGuide.findFirst({
          where: {
            title: guide.title
          }
        });

        let guideRecord;

        if (existingGuide) {
          console.log(`  ℹ️ 指南已存在，更新内容`);
          guideRecord = await prisma.watchGuide.update({
            where: { id: existingGuide.id },
            data: {
              description: guide.description,
              guideType: guide.guideType,
              content: guide.content,
              isPublished: guide.isPublished
            }
          });

          // 删除现有的电影关联
          await prisma.watchGuideMovie.deleteMany({
            where: { guideId: existingGuide.id }
          });
        } else {
          console.log(`  ✨ 创建新指南`);
          guideRecord = await prisma.watchGuide.create({
            data: {
              title: guide.title,
              description: guide.description,
              guideType: guide.guideType,
              content: guide.content,
              isPublished: guide.isPublished
            }
          });
          totalGuidesCreated++;
        }

        console.log(`  🎬 添加电影关联 (${guide.movies.length} 部电影)`);

        // 添加电影关联
        for (const guideMovie of guide.movies) {
          // 查找电影记录
          const dbMovie = await prisma.movie.findUnique({
            where: { tmdbId: guideMovie.tmdbId }
          });

          if (!dbMovie) {
            console.log(`    ⚠️ 电影 TMDB ID: ${guideMovie.tmdbId} 不存在，跳过`);
            continue;
          }

          await prisma.watchGuideMovie.create({
            data: {
              guideId: guideRecord.id,
              movieId: dbMovie.id,
              order: guideMovie.order,
              notes: guideMovie.reason + (guideMovie.notes ? ` | ${guideMovie.notes}` : '')
            }
          });

          totalGuideMoviesCreated++;
          console.log(`    ✅ 添加电影: ${dbMovie.titleZh || dbMovie.titleEn} (顺序: ${guideMovie.order})`);
        }

        console.log(`  ✅ 指南处理完成`);

      } catch (error) {
        console.error(`  ❌ 处理指南时出错:`, error);
      }
    }

    console.log('\n🎉 观影指南数据添加完成!');
    console.log(`📊 统计信息:`);
    console.log(`  - 新创建指南: ${totalGuidesCreated}`);
    console.log(`  - 新创建电影关联: ${totalGuideMoviesCreated}`);

    // 显示最终统计
    const totalGuides = await prisma.watchGuide.count();
    const publishedGuides = await prisma.watchGuide.count({
      where: { isPublished: true }
    });
    const totalGuideMovies = await prisma.watchGuideMovie.count();
    
    console.log(`\n📈 数据库总计:`);
    console.log(`  - 总指南数: ${totalGuides}`);
    console.log(`  - 已发布指南数: ${publishedGuides}`);
    console.log(`  - 总电影关联数: ${totalGuideMovies}`);

    // 显示各类型指南统计
    const guideTypeStats = await prisma.watchGuide.groupBy({
      by: ['guideType'],
      where: { isPublished: true },
      _count: {
        id: true
      }
    });

    console.log(`\n📚 指南类型统计:`);
    guideTypeStats.forEach(stat => {
      const typeNames = {
        'CHRONOLOGICAL': '时间线',
        'BEGINNER': '新手入门',
        'THEMATIC': '主题分类',
        'FAMILY': '家庭观影'
      };
      console.log(`  - ${typeNames[stat.guideType as keyof typeof typeNames]}: ${stat._count.id} 个指南`);
    });

  } catch (error) {
    console.error('❌ 观影指南种子脚本执行失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  seedWatchGuides()
    .then(() => {
      console.log('✅ 观影指南种子脚本执行成功');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 观影指南种子脚本执行失败:', error);
      process.exit(1);
    });
}

export { seedWatchGuides };

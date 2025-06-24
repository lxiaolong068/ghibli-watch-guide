#!/usr/bin/env tsx
/**
 * 最终版内容种子脚本
 * 完全匹配数据库schema的字段定义
 */

import { PrismaClient } from '../prisma/generated/client';
import { GHIBLI_MOVIES } from '../data/ghibli-movies-complete';
import { GHIBLI_REVIEWS } from '../data/ghibli-reviews';
import { GHIBLI_WATCH_GUIDES } from '../data/ghibli-watch-guides';
import { GHIBLI_BEHIND_SCENES } from '../data/ghibli-behind-scenes';

const prisma = new PrismaClient();

async function finalSeedCharacters() {
  console.log('🎭 开始添加角色档案（最终版）...');
  let totalMovieCharacterRelationsCreated = 0;

  for (const movie of GHIBLI_MOVIES) {
    console.log(`\n📽️ 处理电影: ${movie.titleZh} (${movie.titleEn})`);

    const dbMovie = await prisma.movie.findUnique({
      where: { tmdbId: movie.tmdbId }
    });

    if (!dbMovie) {
      console.log(`⚠️ 电影 ${movie.titleEn} (TMDB ID: ${movie.tmdbId}) 在数据库中不存在，跳过`);
      continue;
    }

    for (const character of movie.mainCharacters) {
      console.log(`  👤 处理角色: ${character.nameZh} (${character.name})`);

      try {
        const existingCharacter = await prisma.character.findFirst({
          where: {
            OR: [
              { name: character.name },
              { nameZh: character.nameZh }
            ]
          }
        });

        if (!existingCharacter) {
          console.log(`    ⚠️ 角色不存在，跳过关联创建`);
          continue;
        }

        // 检查电影-角色关联是否已存在
        const existingMovieCharacter = await prisma.movieCharacter.findFirst({
          where: {
            movieId: dbMovie.id,
            characterId: existingCharacter.id
          }
        });

        if (!existingMovieCharacter) {
          console.log(`    🔗 创建电影-角色关联`);
          await prisma.movieCharacter.create({
            data: {
              movieId: dbMovie.id,
              characterId: existingCharacter.id,
              voiceActorJa: character.voiceActorJa,
              voiceActor: character.voiceActorEn, // 使用schema中的voiceActor字段
              importance: character.isMainCharacter ? 90 : 60
            }
          });
          totalMovieCharacterRelationsCreated++;
          console.log(`    ✅ 关联创建成功`);
        } else {
          console.log(`    ℹ️ 电影-角色关联已存在`);
        }

      } catch (error) {
        console.error(`    ❌ 处理角色 ${character.name} 时出错:`, error.message);
      }
    }
  }

  console.log(`\n📊 角色关联统计: 新建 ${totalMovieCharacterRelationsCreated}`);
}

async function finalSeedWatchGuides() {
  console.log('📚 开始添加观影指南（最终版）...');
  let totalGuidesCreated = 0;

  for (const guide of GHIBLI_WATCH_GUIDES) {
    console.log(`\n📖 处理观影指南: ${guide.title}`);

    try {
      const existingGuide = await prisma.watchGuide.findFirst({
        where: { title: guide.title }
      });

      let guideRecord;

      if (existingGuide) {
        console.log(`  ℹ️ 指南已存在，更新内容`);
        guideRecord = await prisma.watchGuide.update({
          where: { id: existingGuide.id },
          data: {
            description: guide.description,
            guideType: guide.guideType,
            content: guide.content, // Json类型，直接使用字符串
            isPublished: guide.isPublished,
            language: 'zh'
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
            isPublished: guide.isPublished,
            language: 'zh'
          }
        });
        totalGuidesCreated++;
      }

      console.log(`  🎬 添加电影关联 (${guide.movies.length} 部电影)`);

      // 添加电影关联
      for (const guideMovie of guide.movies) {
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

        console.log(`    ✅ 添加电影: ${dbMovie.titleEn} (顺序: ${guideMovie.order})`);
      }

      console.log(`  ✅ 指南处理完成`);

    } catch (error) {
      console.error(`  ❌ 处理指南时出错:`, error.message);
    }
  }

  console.log(`\n📊 指南统计: 新建 ${totalGuidesCreated}`);
}

async function finalSeedContent() {
  console.log('🛡️ 最终版内容种子脚本启动');
  console.log('📅 执行时间:', new Date().toLocaleString('zh-CN'));

  const startTime = Date.now();

  try {
    await prisma.$connect();
    console.log('✅ 数据库连接成功');

    // 显示开始前统计
    console.log('\n📊 开始前统计:');
    const beforeStats = {
      movies: await prisma.movie.count(),
      characters: await prisma.character.count(),
      movieCharacters: await prisma.movieCharacter.count(),
      reviews: await prisma.movieReview.count(),
      guides: await prisma.watchGuide.count(),
      mediaContent: await prisma.mediaContent.count()
    };
    console.log('  电影:', beforeStats.movies);
    console.log('  角色:', beforeStats.characters);
    console.log('  电影-角色关联:', beforeStats.movieCharacters);
    console.log('  评论:', beforeStats.reviews);
    console.log('  观影指南:', beforeStats.guides);
    console.log('  媒体内容:', beforeStats.mediaContent);

    // 执行剩余的内容添加
    console.log('\n🚀 开始剩余内容添加:');
    
    await finalSeedCharacters();
    await finalSeedWatchGuides();

    // 显示结束后统计
    console.log('\n📊 完成后统计:');
    const afterStats = {
      movies: await prisma.movie.count(),
      characters: await prisma.character.count(),
      movieCharacters: await prisma.movieCharacter.count(),
      reviews: await prisma.movieReview.count(),
      guides: await prisma.watchGuide.count(),
      mediaContent: await prisma.mediaContent.count()
    };
    console.log('  电影:', afterStats.movies);
    console.log('  角色:', afterStats.characters);
    console.log('  电影-角色关联:', afterStats.movieCharacters);
    console.log('  评论:', afterStats.reviews);
    console.log('  观影指南:', afterStats.guides);
    console.log('  媒体内容:', afterStats.mediaContent);

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    console.log('\n🎉 最终版内容添加完成!');
    console.log(`⏱️ 耗时: ${duration} 秒`);
    console.log('\n📈 变化统计:');
    console.log(`  角色: +${afterStats.characters - beforeStats.characters}`);
    console.log(`  电影-角色关联: +${afterStats.movieCharacters - beforeStats.movieCharacters}`);
    console.log(`  评论: +${afterStats.reviews - beforeStats.reviews}`);
    console.log(`  观影指南: +${afterStats.guides - beforeStats.guides}`);
    console.log(`  媒体内容: +${afterStats.mediaContent - beforeStats.mediaContent}`);

    console.log('\n✅ 第三阶段内容充实最终完成!');

  } catch (error) {
    console.error('\n❌ 执行过程中发生错误:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  finalSeedContent()
    .then(() => {
      console.log('\n✅ 最终版种子脚本执行成功');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 最终版种子脚本执行失败:', error);
      process.exit(1);
    });
}

export { finalSeedContent };

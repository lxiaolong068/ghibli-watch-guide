#!/usr/bin/env tsx
/**
 * 修复版内容种子脚本
 * 根据实际数据库schema调整字段映射
 */

import { PrismaClient } from '../prisma/generated/client';
import { GHIBLI_MOVIES } from '../data/ghibli-movies-complete';
import { GHIBLI_REVIEWS } from '../data/ghibli-reviews';
import { GHIBLI_WATCH_GUIDES } from '../data/ghibli-watch-guides';
import { GHIBLI_BEHIND_SCENES } from '../data/ghibli-behind-scenes';

const prisma = new PrismaClient();

async function fixedSeedCharacters() {
  console.log('🎭 开始添加角色档案（修复版）...');
  let totalCharactersCreated = 0;
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

    console.log(`✅ 找到电影记录: ${dbMovie.id}`);

    for (const character of movie.mainCharacters) {
      console.log(`  👤 添加角色: ${character.nameZh} (${character.name})`);

      try {
        const existingCharacter = await prisma.character.findFirst({
          where: {
            OR: [
              { name: character.name },
              { nameZh: character.nameZh }
            ]
          }
        });

        let characterRecord;

        if (existingCharacter) {
          console.log(`    ℹ️ 角色已存在，更新信息`);
          characterRecord = await prisma.character.update({
            where: { id: existingCharacter.id },
            data: {
              name: character.name,
              nameJa: character.nameJa,
              nameZh: character.nameZh,
              description: character.description,
              isMainCharacter: character.isMainCharacter
            }
          });
        } else {
          console.log(`    ✨ 创建新角色`);
          characterRecord = await prisma.character.create({
            data: {
              name: character.name,
              nameJa: character.nameJa,
              nameZh: character.nameZh,
              description: character.description,
              isMainCharacter: character.isMainCharacter
            }
          });
          totalCharactersCreated++;
        }

        // 检查电影-角色关联是否已存在
        const existingMovieCharacter = await prisma.movieCharacter.findFirst({
          where: {
            movieId: dbMovie.id,
            characterId: characterRecord.id
          }
        });

        if (!existingMovieCharacter) {
          console.log(`    🔗 创建电影-角色关联`);
          await prisma.movieCharacter.create({
            data: {
              movieId: dbMovie.id,
              characterId: characterRecord.id,
              voiceActorJa: character.voiceActorJa,
              voiceActorEn: character.voiceActorEn,
              importance: character.isMainCharacter ? 1 : 2
            }
          });
          totalMovieCharacterRelationsCreated++;
        } else {
          console.log(`    ℹ️ 电影-角色关联已存在`);
        }

      } catch (error) {
        console.error(`    ❌ 处理角色 ${character.name} 时出错:`, error.message);
      }
    }
  }

  console.log(`\n📊 角色档案统计: 新建 ${totalCharactersCreated}, 关联 ${totalMovieCharacterRelationsCreated}`);
}

async function fixedSeedReviews() {
  console.log('📝 开始添加电影评论（修复版）...');
  let totalReviewsCreated = 0;

  for (const review of GHIBLI_REVIEWS) {
    console.log(`\n📽️ 处理评论: ${review.title}`);

    const dbMovie = await prisma.movie.findUnique({
      where: { tmdbId: review.movieTmdbId }
    });

    if (!dbMovie) {
      console.log(`⚠️ 电影 TMDB ID: ${review.movieTmdbId} 在数据库中不存在，跳过评论`);
      continue;
    }

    console.log(`✅ 找到电影记录: ${dbMovie.titleEn}`);

    try {
      const existingReview = await prisma.movieReview.findFirst({
        where: {
          movieId: dbMovie.id,
          title: review.title
        }
      });

      if (existingReview) {
        console.log(`  ℹ️ 评论已存在，更新内容`);
        await prisma.movieReview.update({
          where: { id: existingReview.id },
          data: {
            content: review.content,
            rating: review.rating,
            author: review.author,
            reviewType: review.reviewType,
            publishedAt: review.publishedAt,
            language: review.language,
            isPublished: true
          }
        });
      } else {
        console.log(`  ✨ 创建新评论`);
        await prisma.movieReview.create({
          data: {
            movieId: dbMovie.id,
            title: review.title,
            content: review.content,
            rating: review.rating,
            author: review.author,
            reviewType: review.reviewType,
            publishedAt: review.publishedAt,
            language: review.language,
            isPublished: true
          }
        });
        totalReviewsCreated++;
      }

      console.log(`  ✅ 评论处理完成`);

    } catch (error) {
      console.error(`  ❌ 处理评论时出错:`, error.message);
    }
  }

  console.log(`\n📊 评论统计: 新建 ${totalReviewsCreated}`);
}

async function fixedSeedWatchGuides() {
  console.log('📚 开始添加观影指南（修复版）...');
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
            content: guide.content, // 直接使用字符串，schema中是Json类型
            isPublished: guide.isPublished,
            publishedAt: guide.publishedAt
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
            publishedAt: guide.publishedAt
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

async function fixedSeedBehindTheScenes() {
  console.log('🎬 开始添加幕后故事（修复版）...');
  let totalMediaContentCreated = 0;

  for (const behindScenes of GHIBLI_BEHIND_SCENES) {
    console.log(`\n📽️ 处理幕后故事: ${behindScenes.title}`);

    const dbMovie = await prisma.movie.findUnique({
      where: { tmdbId: behindScenes.movieTmdbId }
    });

    if (!dbMovie) {
      console.log(`⚠️ 电影 TMDB ID: ${behindScenes.movieTmdbId} 在数据库中不存在，跳过`);
      continue;
    }

    console.log(`✅ 找到电影记录: ${dbMovie.titleEn}`);

    try {
      const existingContent = await prisma.mediaContent.findFirst({
        where: {
          movieId: dbMovie.id,
          title: behindScenes.title
        }
      });

      if (existingContent) {
        console.log(`  ℹ️ 幕后故事已存在，更新内容`);
        await prisma.mediaContent.update({
          where: { id: existingContent.id },
          data: {
            description: `${behindScenes.category} - ${behindScenes.tags.join(', ')}`,
            mediaType: 'BEHIND_SCENES', // 使用schema中定义的枚举值
            url: `#${behindScenes.title.replace(/\s+/g, '-').toLowerCase()}`,
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
            mediaType: 'BEHIND_SCENES',
            url: `#${behindScenes.title.replace(/\s+/g, '-').toLowerCase()}`,
            language: 'zh',
            isPublished: behindScenes.isPublished
          }
        });
        totalMediaContentCreated++;
      }

      console.log(`  ✅ 幕后故事处理完成`);

    } catch (error) {
      console.error(`  ❌ 处理幕后故事时出错:`, error.message);
    }
  }

  console.log(`\n📊 幕后故事统计: 新建 ${totalMediaContentCreated}`);
}

async function fixedSeedContent() {
  console.log('🛡️ 修复版内容种子脚本启动');
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

    // 执行内容添加
    console.log('\n🚀 开始内容添加:');
    
    await fixedSeedCharacters();
    await fixedSeedReviews();
    await fixedSeedWatchGuides();
    await fixedSeedBehindTheScenes();

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

    console.log('\n🎉 修复版内容添加完成!');
    console.log(`⏱️ 耗时: ${duration} 秒`);
    console.log('\n📈 变化统计:');
    console.log(`  角色: +${afterStats.characters - beforeStats.characters}`);
    console.log(`  电影-角色关联: +${afterStats.movieCharacters - beforeStats.movieCharacters}`);
    console.log(`  评论: +${afterStats.reviews - beforeStats.reviews}`);
    console.log(`  观影指南: +${afterStats.guides - beforeStats.guides}`);
    console.log(`  媒体内容: +${afterStats.mediaContent - beforeStats.mediaContent}`);

    console.log('\n✅ 第三阶段内容充实成功完成!');

  } catch (error) {
    console.error('\n❌ 执行过程中发生错误:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  fixedSeedContent()
    .then(() => {
      console.log('\n✅ 修复版种子脚本执行成功');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 修复版种子脚本执行失败:', error);
      process.exit(1);
    });
}

export { fixedSeedContent };

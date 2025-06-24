#!/usr/bin/env tsx
/**
 * 演示版内容种子脚本
 * 如果无法连接到生产数据库，将以演示模式运行
 */

import { GHIBLI_MOVIES } from '../data/ghibli-movies-complete';
import { GHIBLI_REVIEWS } from '../data/ghibli-reviews';
import { GHIBLI_WATCH_GUIDES } from '../data/ghibli-watch-guides';
import { GHIBLI_BEHIND_SCENES } from '../data/ghibli-behind-scenes';
import { GHIBLI_VOICE_ACTORS } from '../data/ghibli-voice-actors';

// 模拟数据库操作的结果
interface MockDatabaseStats {
  movies: number;
  characters: number;
  movieCharacters: number;
  reviews: number;
  guides: number;
  mediaContent: number;
}

class MockPrismaClient {
  private stats: MockDatabaseStats = {
    movies: 3, // 假设已有3部电影
    characters: 0,
    movieCharacters: 0,
    reviews: 0,
    guides: 0,
    mediaContent: 0
  };

  async $connect() {
    console.log('🔗 连接到模拟数据库...');
  }

  async $disconnect() {
    console.log('🔌 断开模拟数据库连接');
  }

  movie = {
    findUnique: async ({ where }: any) => {
      const movie = GHIBLI_MOVIES.find(m => m.tmdbId === where.tmdbId);
      if (movie) {
        return {
          id: `movie_${movie.tmdbId}`,
          tmdbId: movie.tmdbId,
          titleEn: movie.titleEn,
          titleZh: movie.titleZh,
          titleJa: movie.titleJa
        };
      }
      return null;
    },
    count: async () => this.stats.movies
  };

  character = {
    findFirst: async () => null, // 假设角色不存在
    create: async (data: any) => {
      this.stats.characters++;
      return { id: `char_${this.stats.characters}`, ...data.data };
    },
    update: async (data: any) => {
      return { id: data.where.id, ...data.data };
    },
    count: async () => this.stats.characters
  };

  movieCharacter = {
    findFirst: async () => null, // 假设关联不存在
    create: async (data: any) => {
      this.stats.movieCharacters++;
      return { id: `mc_${this.stats.movieCharacters}`, ...data.data };
    },
    count: async () => this.stats.movieCharacters
  };

  movieReview = {
    findFirst: async () => null, // 假设评论不存在
    create: async (data: any) => {
      this.stats.reviews++;
      return { id: `review_${this.stats.reviews}`, ...data.data };
    },
    update: async (data: any) => {
      return { id: data.where.id, ...data.data };
    },
    count: async () => this.stats.reviews
  };

  watchGuide = {
    findFirst: async () => null, // 假设指南不存在
    create: async (data: any) => {
      this.stats.guides++;
      return { id: `guide_${this.stats.guides}`, ...data.data };
    },
    update: async (data: any) => {
      return { id: data.where.id, ...data.data };
    },
    count: async () => this.stats.guides
  };

  watchGuideMovie = {
    deleteMany: async () => ({ count: 0 }),
    create: async (data: any) => {
      return { id: `gm_${Date.now()}`, ...data.data };
    }
  };

  mediaContent = {
    findFirst: async () => null, // 假设媒体内容不存在
    create: async (data: any) => {
      this.stats.mediaContent++;
      return { id: `media_${this.stats.mediaContent}`, ...data.data };
    },
    update: async (data: any) => {
      return { id: data.where.id, ...data.data };
    },
    count: async () => this.stats.mediaContent
  };
}

async function tryConnectToRealDatabase() {
  try {
    const { PrismaClient } = require('../prisma/generated/client');
    const prisma = new PrismaClient();
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ 成功连接到生产数据库');
    return prisma;
  } catch (error) {
    console.log('⚠️ 无法连接到生产数据库，将使用演示模式');
    console.log('📝 错误信息:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

async function demoSeedCharacters(prisma: any) {
  console.log('🎭 演示：添加角色档案');
  let created = 0;
  let updated = 0;

  for (const movie of GHIBLI_MOVIES) {
    const dbMovie = await prisma.movie.findUnique({
      where: { tmdbId: movie.tmdbId }
    });

    if (!dbMovie) {
      console.log(`  ⚠️ 电影 ${movie.titleEn} 不存在，跳过`);
      continue;
    }

    console.log(`  📽️ 处理电影: ${movie.titleZh}`);

    for (const character of movie.mainCharacters) {
      const existing = await prisma.character.findFirst({
        where: { name: character.name }
      });

      if (existing) {
        await prisma.character.update({
          where: { id: existing.id },
          data: {
            name: character.name,
            nameJa: character.nameJa,
            nameZh: character.nameZh,
            description: character.description,
            isMainCharacter: character.isMainCharacter
          }
        });
        updated++;
        console.log(`    ✏️ 更新角色: ${character.nameZh}`);
      } else {
        const newChar = await prisma.character.create({
          data: {
            name: character.name,
            nameJa: character.nameJa,
            nameZh: character.nameZh,
            description: character.description,
            isMainCharacter: character.isMainCharacter
          }
        });
        created++;
        console.log(`    ✨ 创建角色: ${character.nameZh}`);

        await prisma.movieCharacter.create({
          data: {
            movieId: dbMovie.id,
            characterId: newChar.id,
            role: character.isMainCharacter ? 'MAIN' : 'SUPPORTING',
            voiceActorJa: character.voiceActorJa,
            voiceActorEn: character.voiceActorEn,
            characterOrder: character.isMainCharacter ? 1 : 2
          }
        });
      }
    }
  }

  console.log(`  📊 角色统计: 新建 ${created}, 更新 ${updated}`);
}

async function demoSeedReviews(prisma: any) {
  console.log('📝 演示：添加电影评论');
  let created = 0;
  let updated = 0;

  for (const review of GHIBLI_REVIEWS) {
    const dbMovie = await prisma.movie.findUnique({
      where: { tmdbId: review.movieTmdbId }
    });

    if (!dbMovie) {
      console.log(`  ⚠️ 电影 TMDB ID ${review.movieTmdbId} 不存在，跳过`);
      continue;
    }

    const existing = await prisma.movieReview.findFirst({
      where: { title: review.title }
    });

    if (existing) {
      await prisma.movieReview.update({
        where: { id: existing.id },
        data: {
          content: review.content,
          rating: review.rating,
          author: review.author,
          reviewType: review.reviewType,
          tags: review.tags,
          publishedAt: review.publishedAt,
          language: review.language,
          isPublished: true
        }
      });
      updated++;
      console.log(`  ✏️ 更新评论: ${review.title}`);
    } else {
      await prisma.movieReview.create({
        data: {
          movieId: dbMovie.id,
          title: review.title,
          content: review.content,
          rating: review.rating,
          author: review.author,
          reviewType: review.reviewType,
          tags: review.tags,
          publishedAt: review.publishedAt,
          language: review.language,
          isPublished: true
        }
      });
      created++;
      console.log(`  ✨ 创建评论: ${review.title}`);
    }
  }

  console.log(`  📊 评论统计: 新建 ${created}, 更新 ${updated}`);
}

async function demoSeedWatchGuides(prisma: any) {
  console.log('📚 演示：添加观影指南');
  let created = 0;
  let updated = 0;

  for (const guide of GHIBLI_WATCH_GUIDES) {
    const existing = await prisma.watchGuide.findFirst({
      where: { title: guide.title }
    });

    let guideRecord;
    if (existing) {
      guideRecord = await prisma.watchGuide.update({
        where: { id: existing.id },
        data: {
          description: guide.description,
          guideType: guide.guideType,
          content: guide.content,
          tags: guide.tags,
          isPublished: guide.isPublished,
          publishedAt: guide.publishedAt
        }
      });
      await prisma.watchGuideMovie.deleteMany({
        where: { guideId: existing.id }
      });
      updated++;
      console.log(`  ✏️ 更新指南: ${guide.title}`);
    } else {
      guideRecord = await prisma.watchGuide.create({
        data: {
          title: guide.title,
          description: guide.description,
          guideType: guide.guideType,
          content: guide.content,
          tags: guide.tags,
          isPublished: guide.isPublished,
          publishedAt: guide.publishedAt
        }
      });
      created++;
      console.log(`  ✨ 创建指南: ${guide.title}`);
    }

    // 添加电影关联
    for (const guideMovie of guide.movies) {
      const dbMovie = await prisma.movie.findUnique({
        where: { tmdbId: guideMovie.tmdbId }
      });

      if (dbMovie) {
        await prisma.watchGuideMovie.create({
          data: {
            guideId: guideRecord.id,
            movieId: dbMovie.id,
            order: guideMovie.order,
            reason: guideMovie.reason,
            notes: guideMovie.notes
          }
        });
      }
    }
  }

  console.log(`  📊 指南统计: 新建 ${created}, 更新 ${updated}`);
}

async function demoSeedBehindTheScenes(prisma: any) {
  console.log('🎬 演示：添加幕后故事');
  let created = 0;
  let updated = 0;

  for (const behindScenes of GHIBLI_BEHIND_SCENES) {
    const dbMovie = await prisma.movie.findUnique({
      where: { tmdbId: behindScenes.movieTmdbId }
    });

    if (!dbMovie) {
      console.log(`  ⚠️ 电影 TMDB ID ${behindScenes.movieTmdbId} 不存在，跳过`);
      continue;
    }

    const existing = await prisma.mediaContent.findFirst({
      where: { title: behindScenes.title }
    });

    if (existing) {
      await prisma.mediaContent.update({
        where: { id: existing.id },
        data: {
          description: `${behindScenes.category} - ${behindScenes.tags.join(', ')}`,
          mediaType: behindScenes.mediaType,
          url: `#${behindScenes.title.replace(/\s+/g, '-').toLowerCase()}`,
          language: 'zh',
          isPublished: behindScenes.isPublished
        }
      });
      updated++;
      console.log(`  ✏️ 更新幕后故事: ${behindScenes.title}`);
    } else {
      await prisma.mediaContent.create({
        data: {
          movieId: dbMovie.id,
          title: behindScenes.title,
          description: `${behindScenes.category} - ${behindScenes.tags.join(', ')}`,
          mediaType: behindScenes.mediaType,
          url: `#${behindScenes.title.replace(/\s+/g, '-').toLowerCase()}`,
          language: 'zh',
          isPublished: behindScenes.isPublished
        }
      });
      created++;
      console.log(`  ✨ 创建幕后故事: ${behindScenes.title}`);
    }
  }

  console.log(`  📊 幕后故事统计: 新建 ${created}, 更新 ${updated}`);
}

async function demoSeedContent() {
  console.log('🎬 第三阶段内容充实演示');
  console.log('📅 执行时间:', new Date().toLocaleString('zh-CN'));
  
  const startTime = Date.now();

  // 尝试连接真实数据库，如果失败则使用模拟数据库
  let prisma = await tryConnectToRealDatabase();
  if (!prisma) {
    console.log('🎭 使用模拟数据库进行演示');
    prisma = new MockPrismaClient();
  }

  try {
    await prisma.$connect();

    // 显示开始状态
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
    console.log('\n🚀 开始内容添加演示:');
    
    await demoSeedCharacters(prisma);
    await demoSeedReviews(prisma);
    await demoSeedWatchGuides(prisma);
    await demoSeedBehindTheScenes(prisma);

    // 显示结束状态
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

    console.log('\n🎉 演示完成!');
    console.log(`⏱️ 耗时: ${duration} 秒`);
    console.log('\n📈 变化统计:');
    console.log(`  角色: +${afterStats.characters - beforeStats.characters}`);
    console.log(`  电影-角色关联: +${afterStats.movieCharacters - beforeStats.movieCharacters}`);
    console.log(`  评论: +${afterStats.reviews - beforeStats.reviews}`);
    console.log(`  观影指南: +${afterStats.guides - beforeStats.guides}`);
    console.log(`  媒体内容: +${afterStats.mediaContent - beforeStats.mediaContent}`);

    console.log('\n✅ 第三阶段内容充实演示成功完成!');

  } catch (error) {
    console.error('\n❌ 演示过程中发生错误:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  demoSeedContent()
    .then(() => {
      console.log('\n✅ 演示脚本执行成功');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 演示脚本执行失败:', error);
      process.exit(1);
    });
}

export { demoSeedContent };

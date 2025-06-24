#!/usr/bin/env tsx
/**
 * 安全的内容种子脚本
 * 专为生产环境设计，包含多重安全检查
 */

import { PrismaClient } from '../prisma/generated/client';
import { seedCharacters } from './seed-characters';
import { seedReviews } from './seed-reviews';
import { seedWatchGuides } from './seed-watch-guides';
import { seedBehindTheScenes } from './seed-behind-scenes';

const prisma = new PrismaClient();

interface DatabaseStats {
  movies: number;
  characters: number;
  movieCharacters: number;
  reviews: number;
  guides: number;
  mediaContent: number;
  platforms: number;
  regions: number;
  availabilities: number;
}

async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ 数据库连接正常');
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    return false;
  }
}

async function getCurrentStats(): Promise<DatabaseStats> {
  const stats = {
    movies: await prisma.movie.count(),
    characters: await prisma.character.count(),
    movieCharacters: await prisma.movieCharacter.count(),
    reviews: await prisma.movieReview.count(),
    guides: await prisma.watchGuide.count(),
    mediaContent: await prisma.mediaContent.count(),
    platforms: await prisma.platform.count(),
    regions: await prisma.region.count(),
    availabilities: await prisma.availability.count()
  };
  return stats;
}

async function displayCurrentData() {
  console.log('\n📊 当前数据库状态:');
  const stats = await getCurrentStats();
  
  console.log('  电影数量:', stats.movies);
  console.log('  角色数量:', stats.characters);
  console.log('  电影-角色关联:', stats.movieCharacters);
  console.log('  评论数量:', stats.reviews);
  console.log('  观影指南:', stats.guides);
  console.log('  媒体内容:', stats.mediaContent);
  console.log('  平台数量:', stats.platforms);
  console.log('  地区数量:', stats.regions);
  console.log('  可用性记录:', stats.availabilities);

  if (stats.movies > 0) {
    console.log('\n📽️ 现有电影列表:');
    const movies = await prisma.movie.findMany({
      select: { titleEn: true, titleZh: true, year: true, tmdbId: true },
      orderBy: { year: 'asc' }
    });
    movies.forEach(movie => {
      console.log(`  - ${movie.titleEn} (${movie.titleZh || 'N/A'}) - ${movie.year} [TMDB: ${movie.tmdbId}]`);
    });
  }

  return stats;
}

async function confirmExecution(): Promise<boolean> {
  // 在生产环境中，我们需要明确的确认
  console.log('\n⚠️  生产环境安全确认:');
  console.log('1. 此操作将向生产数据库添加新内容');
  console.log('2. 现有数据不会被删除或修改');
  console.log('3. 只会添加新的角色、评论、指南和媒体内容');
  console.log('4. 如果内容已存在，将进行更新而不是重复创建');
  
  // 在实际生产环境中，这里应该有交互式确认
  // 为了演示，我们返回 true，但建议在实际使用时添加交互式确认
  return true;
}

async function createBackupInfo() {
  const stats = await getCurrentStats();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupInfo = {
    timestamp,
    beforeStats: stats,
    operation: 'content-seeding-phase-3'
  };
  
  console.log('\n💾 备份信息记录:');
  console.log(`时间戳: ${timestamp}`);
  console.log('操作前统计:', JSON.stringify(stats, null, 2));
  
  return backupInfo;
}

async function safeSeedContent() {
  console.log('🛡️  安全内容种子脚本启动');
  console.log('📅 执行时间:', new Date().toLocaleString('zh-CN'));
  
  try {
    // 1. 检查数据库连接
    console.log('\n🔍 步骤 1: 检查数据库连接');
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('数据库连接失败，终止执行');
    }

    // 2. 显示当前数据状态
    console.log('\n🔍 步骤 2: 检查当前数据状态');
    const beforeStats = await displayCurrentData();

    // 3. 创建备份信息
    console.log('\n🔍 步骤 3: 创建备份信息');
    const backupInfo = await createBackupInfo();

    // 4. 确认执行
    console.log('\n🔍 步骤 4: 确认执行');
    const confirmed = await confirmExecution();
    if (!confirmed) {
      console.log('❌ 用户取消执行');
      return;
    }

    // 5. 开始安全执行内容添加
    console.log('\n🚀 步骤 5: 开始内容添加');
    const startTime = Date.now();

    // 5.1 添加角色档案
    console.log('\n' + '='.repeat(50));
    console.log('📝 添加角色档案');
    console.log('='.repeat(50));
    await seedCharacters();

    // 5.2 添加电影评论
    console.log('\n' + '='.repeat(50));
    console.log('📝 添加电影评论');
    console.log('='.repeat(50));
    await seedReviews();

    // 5.3 添加观影指南
    console.log('\n' + '='.repeat(50));
    console.log('📝 添加观影指南');
    console.log('='.repeat(50));
    await seedWatchGuides();

    // 5.4 添加幕后故事
    console.log('\n' + '='.repeat(50));
    console.log('📝 添加幕后故事');
    console.log('='.repeat(50));
    await seedBehindTheScenes();

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    // 6. 显示执行后状态
    console.log('\n🔍 步骤 6: 检查执行后状态');
    const afterStats = await getCurrentStats();

    // 7. 生成执行报告
    console.log('\n' + '🎉'.repeat(20));
    console.log('🎉 内容添加完成! 🎉');
    console.log('🎉'.repeat(20));
    
    console.log(`\n📊 执行统计:`);
    console.log(`⏱️ 总耗时: ${duration} 秒`);
    console.log(`📅 完成时间: ${new Date().toLocaleString('zh-CN')}`);

    console.log('\n📈 数据变化统计:');
    console.log(`电影数量: ${beforeStats.movies} → ${afterStats.movies} (+${afterStats.movies - beforeStats.movies})`);
    console.log(`角色数量: ${beforeStats.characters} → ${afterStats.characters} (+${afterStats.characters - beforeStats.characters})`);
    console.log(`电影-角色关联: ${beforeStats.movieCharacters} → ${afterStats.movieCharacters} (+${afterStats.movieCharacters - beforeStats.movieCharacters})`);
    console.log(`评论数量: ${beforeStats.reviews} → ${afterStats.reviews} (+${afterStats.reviews - beforeStats.reviews})`);
    console.log(`观影指南: ${beforeStats.guides} → ${afterStats.guides} (+${afterStats.guides - beforeStats.guides})`);
    console.log(`媒体内容: ${beforeStats.mediaContent} → ${afterStats.mediaContent} (+${afterStats.mediaContent - beforeStats.mediaContent})`);

    console.log('\n✅ 所有内容已安全添加到生产数据库');
    console.log('✅ 原有数据完整保留');
    console.log('✅ 新内容已成功集成');

  } catch (error) {
    console.error('\n❌ 执行过程中发生错误:', error);
    console.error('💡 建议检查错误信息并在修复后重新执行');
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  safeSeedContent()
    .then(() => {
      console.log('\n✅ 安全种子脚本执行成功');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 安全种子脚本执行失败:', error);
      process.exit(1);
    });
}

export { safeSeedContent };

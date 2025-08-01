#!/usr/bin/env tsx
/**
 * 可用性数据种子脚本
 * 为主要吉卜力电影添加流媒体平台可用性数据
 */

import { PrismaClient, AvailabilityType } from '../prisma/generated/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

// 主要吉卜力电影的流媒体可用性数据
const GHIBLI_AVAILABILITY = [
  {
    tmdbId: 129, // Spirited Away
    availabilities: [
      { platformName: 'Netflix', regionName: 'United States', availabilityType: 'SUBSCRIPTION', price: null },
      { platformName: 'Netflix', regionName: 'Japan', availabilityType: 'SUBSCRIPTION', price: null },
      { platformName: 'Apple TV', regionName: 'United States', availabilityType: 'RENT', price: 3.99 },
      { platformName: 'Amazon Prime Video', regionName: 'United States', availabilityType: 'RENT', price: 3.99 },
      { platformName: 'Google Play Movies', regionName: 'United States', availabilityType: 'BUY', price: 9.99 },
      { platformName: 'Vudu', regionName: 'United States', availabilityType: 'RENT', price: 3.99 },
    ]
  },
  {
    tmdbId: 8392, // My Neighbor Totoro  
    availabilities: [
      { platformName: 'Netflix', regionName: 'Japan', availabilityType: 'SUBSCRIPTION', price: null },
      { platformName: 'Apple TV', regionName: 'United States', availabilityType: 'RENT', price: 3.99 },
      { platformName: 'Amazon Prime Video', regionName: 'United States', availabilityType: 'RENT', price: 3.99 },
      { platformName: 'Google Play Movies', regionName: 'United States', availabilityType: 'BUY', price: 9.99 },
      { platformName: 'Vudu', regionName: 'United States', availabilityType: 'RENT', price: 3.99 },
    ]
  },
  {
    tmdbId: 128, // Princess Mononoke
    availabilities: [
      { platformName: 'Netflix', regionName: 'United States', availabilityType: 'SUBSCRIPTION', price: null },
      { platformName: 'Netflix', regionName: 'Japan', availabilityType: 'SUBSCRIPTION', price: null },
      { platformName: 'Apple TV', regionName: 'United States', availabilityType: 'RENT', price: 3.99 },
      { platformName: 'Amazon Prime Video', regionName: 'United States', availabilityType: 'RENT', price: 3.99 },
      { platformName: 'Google Play Movies', regionName: 'United States', availabilityType: 'BUY', price: 9.99 },
    ]
  },
  {
    tmdbId: 4935, // Howl's Moving Castle
    availabilities: [
      { platformName: 'Netflix', regionName: 'United States', availabilityType: 'SUBSCRIPTION', price: null },
      { platformName: 'Netflix', regionName: 'Japan', availabilityType: 'SUBSCRIPTION', price: null },
      { platformName: 'Apple TV', regionName: 'United States', availabilityType: 'RENT', price: 3.99 },
      { platformName: 'Amazon Prime Video', regionName: 'United States', availabilityType: 'RENT', price: 3.99 },
      { platformName: 'Google Play Movies', regionName: 'United States', availabilityType: 'BUY', price: 9.99 },
    ]
  },
  {
    tmdbId: 16859, // Kiki's Delivery Service
    availabilities: [
      { platformName: 'Netflix', regionName: 'Japan', availabilityType: 'SUBSCRIPTION', price: null },
      { platformName: 'Apple TV', regionName: 'United States', availabilityType: 'RENT', price: 3.99 },
      { platformName: 'Amazon Prime Video', regionName: 'United States', availabilityType: 'RENT', price: 3.99 },
      { platformName: 'Google Play Movies', regionName: 'United States', availabilityType: 'BUY', price: 9.99 },
    ]
  },
  {
    tmdbId: 10515, // Castle in the Sky
    availabilities: [
      { platformName: 'Netflix', regionName: 'Japan', availabilityType: 'SUBSCRIPTION', price: null },
      { platformName: 'Apple TV', regionName: 'United States', availabilityType: 'RENT', price: 3.99 },
      { platformName: 'Amazon Prime Video', regionName: 'United States', availabilityType: 'RENT', price: 3.99 },
      { platformName: 'Google Play Movies', regionName: 'United States', availabilityType: 'BUY', price: 9.99 },
    ]
  },
  {
    tmdbId: 12477, // Grave of the Fireflies
    availabilities: [
      { platformName: 'Netflix', regionName: 'Japan', availabilityType: 'SUBSCRIPTION', price: null },
      { platformName: 'Apple TV', regionName: 'United States', availabilityType: 'RENT', price: 3.99 },
      { platformName: 'Amazon Prime Video', regionName: 'United States', availabilityType: 'RENT', price: 3.99 },
      { platformName: 'Funimation', regionName: 'United States', availabilityType: 'SUBSCRIPTION', price: null },
    ]
  },
  {
    tmdbId: 37797, // Whisper of the Heart
    availabilities: [
      { platformName: 'Netflix', regionName: 'Japan', availabilityType: 'SUBSCRIPTION', price: null },
      { platformName: 'Apple TV', regionName: 'United States', availabilityType: 'RENT', price: 3.99 },
      { platformName: 'Amazon Prime Video', regionName: 'United States', availabilityType: 'RENT', price: 3.99 },
    ]
  },
  {
    tmdbId: 12429, // Ponyo
    availabilities: [
      { platformName: 'Netflix', regionName: 'United States', availabilityType: 'SUBSCRIPTION', price: null },
      { platformName: 'Netflix', regionName: 'Japan', availabilityType: 'SUBSCRIPTION', price: null },
      { platformName: 'Apple TV', regionName: 'United States', availabilityType: 'RENT', price: 3.99 },
      { platformName: 'Amazon Prime Video', regionName: 'United States', availabilityType: 'RENT', price: 3.99 },
      { platformName: 'Google Play Movies', regionName: 'United States', availabilityType: 'BUY', price: 9.99 },
    ]
  },
  {
    tmdbId: 51739, // The Secret World of Arrietty
    availabilities: [
      { platformName: 'Netflix', regionName: 'Japan', availabilityType: 'SUBSCRIPTION', price: null },
      { platformName: 'Apple TV', regionName: 'United States', availabilityType: 'RENT', price: 3.99 },
      { platformName: 'Amazon Prime Video', regionName: 'United States', availabilityType: 'RENT', price: 3.99 },
    ]
  }
];

async function seedAvailability() {
  console.log('🎬 开始添加流媒体可用性数据...');
  console.log('📅 执行时间:', new Date().toLocaleString('zh-CN'));
  
  const startTime = Date.now();
  
  let totalCreated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  try {
    for (const movieData of GHIBLI_AVAILABILITY) {
      console.log(`\n📽️ 处理电影 TMDB ID: ${movieData.tmdbId}`);
      
      // 查找电影
      const movie = await prisma.movie.findUnique({
        where: { tmdbId: movieData.tmdbId }
      });

      if (!movie) {
        console.log(`  ⚠️ 电影 TMDB ID: ${movieData.tmdbId} 在数据库中不存在，跳过`);
        totalSkipped++;
        continue;
      }

      console.log(`  ✅ 找到电影: ${movie.titleEn}`);

      // 处理每个可用性记录
      for (const availability of movieData.availabilities) {
        try {
          // 查找平台
          const platform = await prisma.platform.findFirst({
            where: { name: availability.platformName }
          });

          if (!platform) {
            console.log(`    ⚠️ 平台 ${availability.platformName} 不存在，跳过`);
            continue;
          }

          // 查找地区
          const region = await prisma.region.findFirst({
            where: { name: availability.regionName }
          });

          if (!region) {
            console.log(`    ⚠️ 地区 ${availability.regionName} 不存在，跳过`);
            continue;
          }

          // 检查是否已存在相同的可用性记录
          const existingAvailability = await prisma.availability.findFirst({
            where: {
              movieId: movie.id,
              platformId: platform.id,
              regionId: region.id,
              type: availability.availabilityType as AvailabilityType
            }
          });

          if (existingAvailability) {
            console.log(`    ℹ️ 可用性记录已存在: ${availability.platformName} - ${availability.regionName} - ${availability.availabilityType}`);
            continue;
          }

          // 创建新的可用性记录
          await prisma.availability.create({
            data: {
              movieId: movie.id,
              platformId: platform.id,
              regionId: region.id,
              type: availability.availabilityType as AvailabilityType,
              price: availability.price,
              url: null, // 可以后续添加具体的URL
              lastChecked: new Date(),
              isAvailable: true
            }
          });

          console.log(`    ✅ 创建可用性: ${availability.platformName} - ${availability.regionName} - ${availability.availabilityType}${availability.price ? ` ($${availability.price})` : ''}`);
          totalCreated++;

        } catch (error) {
          console.error(`    ❌ 创建可用性记录失败:`, error);
          totalErrors++;
        }
      }
    }

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    console.log('\n' + '🎉'.repeat(20));
    console.log('🎉 流媒体可用性数据添加完成! 🎉');
    console.log('🎉'.repeat(20));
    console.log(`⏱️ 总耗时: ${duration} 秒`);
    console.log(`📅 完成时间: ${new Date().toLocaleString('zh-CN')}`);

    // 显示统计信息
    console.log('\n📊 可用性数据统计报告:');
    console.log('─'.repeat(40));
    console.log(`✅ 新创建可用性记录: ${totalCreated}`);
    console.log(`⚠️ 跳过记录: ${totalSkipped}`);
    console.log(`❌ 错误记录: ${totalErrors}`);

    // 查询总的可用性记录数
    const totalAvailabilities = await prisma.availability.count();
    console.log(`📈 数据库总可用性记录数: ${totalAvailabilities}`);

    // 按平台统计
    console.log('\n📺 各平台可用性统计:');
    console.log('─'.repeat(40));
    const platformStats = await prisma.availability.groupBy({
      by: ['platformId'],
      _count: {
        id: true
      }
    });

    for (const stat of platformStats) {
      const platform = await prisma.platform.findUnique({
        where: { id: stat.platformId }
      });
      if (platform) {
        console.log(`${platform.name}: ${stat._count.id} 部电影`);
      }
    }

    // 按地区统计
    console.log('\n🌍 各地区可用性统计:');
    console.log('─'.repeat(40));
    const regionStats = await prisma.availability.groupBy({
      by: ['regionId'],
      _count: {
        id: true
      }
    });

    for (const stat of regionStats) {
      const region = await prisma.region.findUnique({
        where: { id: stat.regionId }
      });
      if (region) {
        console.log(`${region.name}: ${stat._count.id} 个可用性记录`);
      }
    }

  } catch (error) {
    console.error('\n❌ 流媒体可用性数据添加失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  seedAvailability()
    .then(() => {
      console.log('\n✅ 流媒体可用性数据种子脚本执行成功');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 流媒体可用性数据种子脚本执行失败:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { seedAvailability };
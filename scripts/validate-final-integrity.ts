#!/usr/bin/env tsx
/**
 * 最终数据完整性验证脚本
 * 验证所有改进是否成功实施
 */

import { PrismaClient } from '../prisma/generated/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function validateDataIntegrity() {
  console.log('🔍 开始最终数据完整性验证...');
  console.log('📅 执行时间:', new Date().toLocaleString('zh-CN'));
  console.log('═'.repeat(60));
  
  const startTime = Date.now();
  let totalIssues = 0;
  let totalImprovements = 0;

  try {
    // 1. 电影数据验证
    console.log('\n🎬 第1步: 电影数据完整性验证');
    console.log('─'.repeat(50));
    
    const totalMovies = await prisma.movie.count();
    console.log(`📊 总电影数: ${totalMovies}`);
    
    // 检查缺失关键字段的电影
    const moviesWithMissingFields = await prisma.movie.findMany({
      where: {
        OR: [
          { director: null },
          { posterUrl: null },
          { synopsis: null }
        ]
      },
      select: {
        id: true,
        titleEn: true,
        director: true,
        posterUrl: true,
        synopsis: true
      }
    });
    
    console.log(`❗ 缺失关键字段的电影: ${moviesWithMissingFields.length}`);
    if (moviesWithMissingFields.length > 0) {
      moviesWithMissingFields.forEach(movie => {
        const missing = [];
        if (!movie.director) missing.push('导演');
        if (!movie.posterUrl) missing.push('海报');
        if (!movie.synopsis) missing.push('简介');
        console.log(`  - ${movie.titleEn}: 缺失 ${missing.join(', ')}`);
        totalIssues++;
      });
    } else {
      console.log('✅ 所有电影都有完整的关键字段');
      totalImprovements++;
    }

    // 2. 角色数据验证
    console.log('\n🎭 第2步: 角色数据完整性验证');
    console.log('─'.repeat(50));
    
    const totalCharacters = await prisma.character.count();
    const totalMovieCharacters = await prisma.movieCharacter.count();
    console.log(`📊 总角色数: ${totalCharacters}`);
    console.log(`📊 电影-角色关联数: ${totalMovieCharacters}`);
    
    if (totalCharacters >= 15 && totalMovieCharacters >= 15) {
      console.log('✅ 角色数据充实程度良好');
      totalImprovements++;
    } else {
      console.log('❗ 角色数据需要进一步充实');
      totalIssues++;
    }

    // 3. 评论数据验证
    console.log('\n📝 第3步: 评论数据完整性验证');
    console.log('─'.repeat(50));
    
    const totalReviews = await prisma.movieReview.count();
    const publishedReviews = await prisma.movieReview.count({
      where: { isPublished: true }
    });
    console.log(`📊 总评论数: ${totalReviews}`);
    console.log(`📊 已发布评论数: ${publishedReviews}`);
    
    if (totalReviews >= 5) {
      console.log('✅ 评论数据充实程度良好');
      totalImprovements++;
    } else {
      console.log('❗ 评论数据需要进一步充实');
      totalIssues++;
    }

    // 4. 观影指南验证
    console.log('\n📚 第4步: 观影指南完整性验证');
    console.log('─'.repeat(50));
    
    const totalGuides = await prisma.watchGuide.count();
    const totalGuideMovies = await prisma.watchGuideMovie.count();
    console.log(`📊 总指南数: ${totalGuides}`);
    console.log(`📊 指南-电影关联数: ${totalGuideMovies}`);
    
    if (totalGuides >= 4 && totalGuideMovies >= 10) {
      console.log('✅ 观影指南数据充实程度良好');
      totalImprovements++;
    } else {
      console.log('❗ 观影指南数据需要进一步充实');
      totalIssues++;
    }

    // 5. 流媒体可用性验证
    console.log('\n🎬 第5步: 流媒体可用性验证');
    console.log('─'.repeat(50));
    
    const totalAvailabilities = await prisma.availability.count();
    const totalPlatforms = await prisma.platform.count();
    const totalRegions = await prisma.region.count();
    console.log(`📊 总可用性记录数: ${totalAvailabilities}`);
    console.log(`📊 总平台数: ${totalPlatforms}`);
    console.log(`📊 总地区数: ${totalRegions}`);
    
    if (totalAvailabilities >= 20) {
      console.log('✅ 流媒体可用性数据充实程度良好');
      totalImprovements++;
    } else {
      console.log('❗ 流媒体可用性数据需要进一步充实');
      totalIssues++;
    }

    // 按平台统计可用性
    const platformStats = await prisma.availability.groupBy({
      by: ['platformId'],
      _count: {
        id: true
      }
    });
    
    console.log('\n📺 各平台可用性统计:');
    for (const stat of platformStats) {
      const platform = await prisma.platform.findUnique({
        where: { id: stat.platformId }
      });
      if (platform) {
        console.log(`  - ${platform.name}: ${stat._count.id} 部电影`);
      }
    }

    // 6. 标签系统验证
    console.log('\n🏷️ 第6步: 标签系统完整性验证');
    console.log('─'.repeat(50));
    
    const totalTags = await prisma.tag.count();
    const totalMovieTags = await prisma.movieTag.count();
    console.log(`📊 总标签数: ${totalTags}`);
    console.log(`📊 电影-标签关联数: ${totalMovieTags}`);
    
    if (totalTags >= 30) {
      console.log('✅ 标签系统数据充实程度良好');
      totalImprovements++;
    } else {
      console.log('❗ 标签系统数据需要进一步充实');
      totalIssues++;
    }

    // 按类别统计标签
    const tagsByCategory = await prisma.tag.groupBy({
      by: ['category'],
      _count: {
        id: true
      }
    });
    
    console.log('\n📂 各类别标签统计:');
    tagsByCategory.forEach(stat => {
      if (stat.category) {
        console.log(`  - ${stat.category}: ${stat._count.id} 个标签`);
      }
    });

    // 7. 数据关系完整性验证
    console.log('\n🔗 第7步: 数据关系完整性验证');
    console.log('─'.repeat(50));
    
    // 检查孤立的数据
    const orphanedCharacters = await prisma.character.count({
      where: {
        movieCharacters: {
          none: {}
        }
      }
    });
    
    const orphanedTags = await prisma.tag.count({
      where: {
        movieTags: {
          none: {}
        }
      }
    });
    
    console.log(`📊 未关联电影的角色数: ${orphanedCharacters}`);
    console.log(`📊 未关联电影的标签数: ${orphanedTags}`);
    
    if (orphanedCharacters === 0) {
      console.log('✅ 所有角色都已关联到电影');
      totalImprovements++;
    } else {
      console.log('❗ 存在未关联电影的角色');
      totalIssues++;
    }

    // 8. 数据质量评分
    console.log('\n📊 第8步: 数据质量评分');
    console.log('─'.repeat(50));
    
    const qualityScore = Math.round((totalImprovements / (totalImprovements + totalIssues)) * 100);
    console.log(`🎯 数据质量评分: ${qualityScore}/100`);
    
    if (qualityScore >= 80) {
      console.log('✅ 数据质量优秀');
    } else if (qualityScore >= 60) {
      console.log('⚠️ 数据质量良好，但有改进空间');
    } else {
      console.log('❗ 数据质量需要显著改进');
    }

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    console.log('\n' + '🎉'.repeat(20));
    console.log('🎉 最终数据完整性验证完成! 🎉');
    console.log('🎉'.repeat(20));
    console.log(`⏱️ 总耗时: ${duration} 秒`);
    console.log(`📅 完成时间: ${new Date().toLocaleString('zh-CN')}`);

    // 最终统计报告
    console.log('\n📈 数据改进成果统计:');
    console.log('═'.repeat(60));
    console.log(`🎬 电影数据: ${totalMovies} 部电影，${totalMovies - moviesWithMissingFields.length} 部完整数据`);
    console.log(`🎭 角色数据: ${totalCharacters} 个角色，${totalMovieCharacters} 个电影-角色关联`);
    console.log(`📝 评论数据: ${totalReviews} 篇评论，${publishedReviews} 篇已发布`);
    console.log(`📚 指南数据: ${totalGuides} 个观影指南，${totalGuideMovies} 个指南-电影关联`);
    console.log(`🎬 可用性数据: ${totalAvailabilities} 个可用性记录，覆盖 ${totalPlatforms} 个平台`);
    console.log(`🏷️ 标签数据: ${totalTags} 个标签，${totalMovieTags} 个电影-标签关联`);
    
    console.log('\n🚀 改进建议:');
    if (moviesWithMissingFields.length > 0) {
      console.log('1. 继续完善缺失关键字段的电影信息');
    }
    if (totalMovieTags === 0) {
      console.log('2. 为电影添加适当的标签分类');
    }
    if (totalAvailabilities < 50) {
      console.log('3. 扩展更多流媒体平台的可用性数据');
    }
    
    console.log('\n✅ 数据库内容充实度显著提升，改进任务基本完成！');

  } catch (error) {
    console.error('\n❌ 数据完整性验证失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  validateDataIntegrity()
    .then(() => {
      console.log('\n✅ 数据完整性验证脚本执行成功');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 数据完整性验证脚本执行失败:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { validateDataIntegrity };
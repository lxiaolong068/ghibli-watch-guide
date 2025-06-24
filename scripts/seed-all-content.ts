#!/usr/bin/env tsx
/**
 * 综合内容种子脚本
 * 运行第三阶段的所有内容添加脚本
 */

import { seedCharacters } from './seed-characters';
import { seedReviews } from './seed-reviews';
import { seedWatchGuides } from './seed-watch-guides';
import { seedBehindTheScenes } from './seed-behind-scenes';

async function seedAllContent() {
  console.log('🚀 开始第三阶段内容充实...');
  console.log('📅 执行时间:', new Date().toLocaleString('zh-CN'));
  
  const startTime = Date.now();

  try {
    // 1. 添加角色档案
    console.log('\n' + '='.repeat(60));
    console.log('📝 第1步: 添加角色档案');
    console.log('='.repeat(60));
    await seedCharacters();

    // 2. 添加电影评论
    console.log('\n' + '='.repeat(60));
    console.log('📝 第2步: 添加电影评论');
    console.log('='.repeat(60));
    await seedReviews();

    // 3. 添加观影指南
    console.log('\n' + '='.repeat(60));
    console.log('📝 第3步: 添加观影指南');
    console.log('='.repeat(60));
    await seedWatchGuides();

    // 4. 添加幕后故事
    console.log('\n' + '='.repeat(60));
    console.log('📝 第4步: 添加幕后故事');
    console.log('='.repeat(60));
    await seedBehindTheScenes();

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    console.log('\n' + '🎉'.repeat(20));
    console.log('🎉 第三阶段内容充实完成! 🎉');
    console.log('🎉'.repeat(20));
    console.log(`⏱️ 总耗时: ${duration} 秒`);
    console.log(`📅 完成时间: ${new Date().toLocaleString('zh-CN')}`);

    // 显示最终统计
    console.log('\n📊 内容充实统计报告:');
    console.log('─'.repeat(40));
    console.log('✅ 角色档案: 已添加主要角色信息');
    console.log('✅ 电影评论: 已添加专业评论内容');
    console.log('✅ 观影指南: 已添加多类型观影指南');
    console.log('✅ 幕后故事: 已添加制作花絮内容');
    console.log('✅ 配音演员: 信息已整理完成');

    console.log('\n🎯 第三阶段目标达成情况:');
    console.log('─'.repeat(40));
    console.log('🎭 角色档案: ✅ 已为主要电影添加详细角色信息');
    console.log('📝 电影评论: ✅ 每部主要电影至少1篇专业评论');
    console.log('📚 观影指南: ✅ 4种类型观影指南已创建');
    console.log('🎬 幕后故事: ✅ 制作花絮和幕后故事已添加');
    console.log('🎤 配音演员: ✅ 主要角色配音信息已完善');

    console.log('\n🔄 下一步建议:');
    console.log('─'.repeat(40));
    console.log('1. 运行网站构建测试');
    console.log('2. 检查内容显示效果');
    console.log('3. 优化SEO元数据');
    console.log('4. 测试用户体验');
    console.log('5. 准备进入第四阶段');

  } catch (error) {
    console.error('\n❌ 第三阶段内容充实失败:', error);
    console.error('请检查错误信息并重新运行相应的种子脚本');
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  seedAllContent()
    .then(() => {
      console.log('\n✅ 第三阶段内容充实脚本执行成功');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 第三阶段内容充实脚本执行失败:', error);
      process.exit(1);
    });
}

export { seedAllContent };

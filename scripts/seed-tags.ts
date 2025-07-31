#!/usr/bin/env tsx
/**
 * 标签系统种子脚本
 * 使用预定义的标签类别和标签数据
 */

import { PrismaClient } from '../prisma/generated/client';
import { PRESET_TAGS, TAG_CATEGORIES } from '../data/tag-categories';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function seedTags() {
  console.log('🏷️ 开始添加标签系统数据...');
  console.log('📅 执行时间:', new Date().toLocaleString('zh-CN'));
  
  const startTime = Date.now();
  
  let tagsCreated = 0;
  let tagsUpdated = 0;
  let tagsSkipped = 0;

  try {
    console.log('\n📂 处理标签类别和预设标签:');
    console.log('─'.repeat(50));

    for (const presetTag of PRESET_TAGS) {
      try {
        // 检查标签是否已存在
        const existingTag = await prisma.tag.findFirst({
          where: { name: presetTag.name }
        });

        if (existingTag) {
          // 更新现有标签
          await prisma.tag.update({
            where: { id: existingTag.id },
            data: {
              nameJa: presetTag.nameJa,
              nameZh: presetTag.nameZh,
              description: presetTag.description,
              color: presetTag.color,
              category: presetTag.category
            }
          });
          console.log(`  ♻️ 更新标签: ${presetTag.name} (${presetTag.nameZh})`);
          tagsUpdated++;
        } else {
          // 创建新标签
          await prisma.tag.create({
            data: {
              name: presetTag.name,
              nameJa: presetTag.nameJa,
              nameZh: presetTag.nameZh,
              description: presetTag.description,
              color: presetTag.color,
              category: presetTag.category
            }
          });
          console.log(`  ✅ 创建标签: ${presetTag.name} (${presetTag.nameZh})`);
          tagsCreated++;
        }

      } catch (error) {
        console.error(`  ❌ 处理标签失败: ${presetTag.name}`, error);
        tagsSkipped++;
      }
    }

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    console.log('\n' + '🎉'.repeat(20));
    console.log('🎉 标签系统数据添加完成! 🎉');
    console.log('🎉'.repeat(20));
    console.log(`⏱️ 总耗时: ${duration} 秒`);
    console.log(`📅 完成时间: ${new Date().toLocaleString('zh-CN')}`);

    // 显示统计信息
    console.log('\n🏷️ 标签系统统计报告:');
    console.log('─'.repeat(40));
    console.log(`✅ 新创建标签: ${tagsCreated}`);
    console.log(`♻️ 更新标签: ${tagsUpdated}`);
    console.log(`⚠️ 跳过标签: ${tagsSkipped}`);

    // 查询总的标签数
    const totalTags = await prisma.tag.count();
    console.log(`📈 数据库总标签数: ${totalTags}`);

    // 按类别统计
    console.log('\n📂 各类别标签统计:');
    console.log('─'.repeat(40));
    
    for (const category of TAG_CATEGORIES) {
      const count = await prisma.tag.count({
        where: { category: category.key }
      });
      console.log(`${category.icon} ${category.nameZh} (${category.key}): ${count} 个标签`);
    }

    // 显示标签类别配置
    console.log('\n🎨 标签类别配置:');
    console.log('─'.repeat(40));
    TAG_CATEGORIES.forEach(category => {
      console.log(`${category.icon} ${category.nameZh} - ${category.description}`);
    });

    console.log('\n💡 使用建议:');
    console.log('─'.repeat(40));
    console.log('1. 可以通过电影-标签关联将标签应用到具体电影');
    console.log('2. 标签支持多语言 (英文、日文、中文)');
    console.log('3. 每个标签都有颜色和优先级设置');
    console.log('4. 可以通过类别对标签进行分组和筛选');

  } catch (error) {
    console.error('\n❌ 标签系统数据添加失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  seedTags()
    .then(() => {
      console.log('\n✅ 标签系统种子脚本执行成功');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 标签系统种子脚本执行失败:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { seedTags };
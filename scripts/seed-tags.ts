import { prisma } from '../lib/prisma';

// 基础标签数据
const baseTags = [
  // 主题标签
  { name: '环保主题', nameJa: '環境テーマ', nameZh: '环保主题', category: 'theme', color: '#10B981', description: '关注环境保护和自然的电影' },
  { name: '成长故事', nameJa: '成長物語', nameZh: '成长故事', category: 'theme', color: '#F59E0B', description: '描述角色成长历程的电影' },
  { name: '奇幻冒险', nameJa: 'ファンタジー冒険', nameZh: '奇幻冒险', category: 'genre', color: '#8B5CF6', description: '充满奇幻元素的冒险故事' },
  { name: '家庭温情', nameJa: '家族の絆', nameZh: '家庭温情', category: 'theme', color: '#EF4444', description: '温馨的家庭故事' },
  { name: '反战主题', nameJa: '反戦テーマ', nameZh: '反战主题', category: 'theme', color: '#6B7280', description: '反映战争残酷性的作品' },
  { name: '爱情故事', nameJa: 'ラブストーリー', nameZh: '爱情故事', category: 'theme', color: '#EC4899', description: '浪漫的爱情故事' },
  { name: '魔法世界', nameJa: '魔法の世界', nameZh: '魔法世界', category: 'setting', color: '#7C3AED', description: '充满魔法的奇幻世界' },
  { name: '乡村生活', nameJa: '田舎暮らし', nameZh: '乡村生活', category: 'setting', color: '#059669', description: '描绘乡村生活的作品' },
  { name: '都市生活', nameJa: '都市生活', nameZh: '都市生活', category: 'setting', color: '#0EA5E9', description: '现代都市背景的故事' },
  { name: '历史背景', nameJa: '歴史的背景', nameZh: '历史背景', category: 'setting', color: '#92400E', description: '具有历史背景的作品' },
  
  // 情感标签
  { name: '温馨治愈', nameJa: '癒し系', nameZh: '温馨治愈', category: 'mood', color: '#10B981', description: '能够治愈心灵的温馨作品' },
  { name: '感人至深', nameJa: '感動的', nameZh: '感人至深', category: 'mood', color: '#F59E0B', description: '令人感动落泪的作品' },
  { name: '轻松愉快', nameJa: '楽しい', nameZh: '轻松愉快', category: 'mood', color: '#06B6D4', description: '轻松愉快的娱乐作品' },
  { name: '深刻思考', nameJa: '深く考える', nameZh: '深刻思考', category: 'mood', color: '#6366F1', description: '引人深思的作品' },
  
  // 年龄标签
  { name: '全年龄', nameJa: '全年齢', nameZh: '全年龄', category: 'audience', color: '#10B981', description: '适合所有年龄观看' },
  { name: '儿童友好', nameJa: '子供向け', nameZh: '儿童友好', category: 'audience', color: '#F59E0B', description: '特别适合儿童观看' },
  { name: '成人向', nameJa: '大人向け', nameZh: '成人向', category: 'audience', color: '#EF4444', description: '更适合成人观看' },
  
  // 特色标签
  { name: '经典之作', nameJa: 'クラシック', nameZh: '经典之作', category: 'quality', color: '#F59E0B', description: '公认的经典作品' },
  { name: '获奖作品', nameJa: '受賞作品', nameZh: '获奖作品', category: 'quality', color: '#8B5CF6', description: '获得重要奖项的作品' },
  { name: '票房佳作', nameJa: 'ヒット作品', nameZh: '票房佳作', category: 'quality', color: '#059669', description: '票房表现优秀的作品' },
  { name: '口碑佳作', nameJa: '評価の高い', nameZh: '口碑佳作', category: 'quality', color: '#DC2626', description: '口碑极佳的作品' },
];

// 电影标签关联数据
const movieTagAssociations = [
  // 千与千寻
  { movieTitleEn: 'Spirited Away', tags: ['奇幻冒险', '成长故事', '环保主题', '温馨治愈', '全年龄', '经典之作', '获奖作品', '票房佳作', '口碑佳作'] },
  
  // 龙猫
  { movieTitleEn: 'My Neighbor Totoro', tags: ['家庭温情', '乡村生活', '奇幻冒险', '温馨治愈', '儿童友好', '全年龄', '经典之作', '口碑佳作'] },
  
  // 萤火虫之墓
  { movieTitleEn: 'Grave of the Fireflies', tags: ['反战主题', '家庭温情', '历史背景', '感人至深', '深刻思考', '成人向', '经典之作', '获奖作品'] },
  
  // 哈尔的移动城堡
  { movieTitleEn: "Howl's Moving Castle", tags: ['爱情故事', '魔法世界', '奇幻冒险', '反战主题', '温馨治愈', '全年龄', '经典之作', '票房佳作'] },
  
  // 天空之城
  { movieTitleEn: 'Castle in the Sky', tags: ['奇幻冒险', '环保主题', '成长故事', '轻松愉快', '全年龄', '经典之作', '口碑佳作'] },
  
  // 魔女宅急便
  { movieTitleEn: "Kiki's Delivery Service", tags: ['成长故事', '魔法世界', '都市生活', '温馨治愈', '儿童友好', '全年龄', '经典之作'] },
  
  // 红猪
  { movieTitleEn: 'Porco Rosso', tags: ['历史背景', '反战主题', '轻松愉快', '成人向', '口碑佳作'] },
  
  // 幽灵公主
  { movieTitleEn: 'Princess Mononoke', tags: ['环保主题', '历史背景', '奇幻冒险', '深刻思考', '成人向', '经典之作', '获奖作品'] },
];

async function seedTags() {
  console.log('开始添加标签数据...');

  try {
    // 1. 创建标签
    console.log('创建基础标签...');
    const createdTags = [];
    
    for (const tagData of baseTags) {
      const existingTag = await prisma.tag.findUnique({
        where: { name: tagData.name }
      });

      if (!existingTag) {
        const tag = await prisma.tag.create({
          data: tagData
        });
        createdTags.push(tag);
        console.log(`✓ 创建标签: ${tag.name}`);
      } else {
        createdTags.push(existingTag);
        console.log(`- 标签已存在: ${existingTag.name}`);
      }
    }

    // 2. 关联电影和标签
    console.log('\n关联电影和标签...');
    let associationCount = 0;

    for (const association of movieTagAssociations) {
      // 查找电影
      const movie = await prisma.movie.findFirst({
        where: { titleEn: association.movieTitleEn }
      });

      if (!movie) {
        console.log(`⚠ 未找到电影: ${association.movieTitleEn}`);
        continue;
      }

      // 为电影添加标签
      for (const tagName of association.tags) {
        const tag = createdTags.find(t => t.name === tagName);
        if (!tag) {
          console.log(`⚠ 未找到标签: ${tagName}`);
          continue;
        }

        // 检查关联是否已存在
        const existingAssociation = await prisma.movieTag.findUnique({
          where: {
            movieId_tagId: {
              movieId: movie.id,
              tagId: tag.id
            }
          }
        });

        if (!existingAssociation) {
          await prisma.movieTag.create({
            data: {
              movieId: movie.id,
              tagId: tag.id
            }
          });
          associationCount++;
          console.log(`✓ 关联: ${movie.titleEn} - ${tag.name}`);
        }
      }
    }

    console.log(`\n✅ 标签数据添加完成!`);
    console.log(`- 创建标签: ${createdTags.length} 个`);
    console.log(`- 创建关联: ${associationCount} 个`);

    // 3. 显示统计信息
    const totalTags = await prisma.tag.count();
    const totalAssociations = await prisma.movieTag.count();
    
    console.log(`\n📊 当前数据统计:`);
    console.log(`- 总标签数: ${totalTags}`);
    console.log(`- 总关联数: ${totalAssociations}`);

  } catch (error) {
    console.error('❌ 添加标签数据时出错:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedTags();
  } catch (error) {
    console.error('脚本执行失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { seedTags };

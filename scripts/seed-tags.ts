import { prisma } from '../lib/prisma';
import { PRESET_TAGS } from '../data/tag-categories';

// 将预设标签转换为数据库格式
const baseTags = PRESET_TAGS.map(tag => ({
  name: tag.nameZh, // 使用中文名作为主名称
  nameJa: tag.nameJa,
  nameZh: tag.nameZh,
  description: tag.description,
  category: tag.category,
  color: tag.color
}));

// 电影标签关联数据 - 使用新的标签体系
const movieTagAssociations = [
  // 千与千寻
  {
    movieTitleEn: 'Spirited Away',
    tags: ['奇幻冒险', '成长故事', '环保主题', '温馨治愈', '全年龄', '经典之作', '获奖作品', '票房佳作', '口碑佳作', '强女性主角', '儿童主角', '魔法世界']
  },

  // 龙猫
  {
    movieTitleEn: 'My Neighbor Totoro',
    tags: ['家庭温情', '乡村生活', '奇幻冒险', '温馨治愈', '儿童友好', '全年龄', '经典之作', '口碑佳作', '动物伙伴', '儿童主角', '手绘动画']
  },

  // 萤火虫之墓
  {
    movieTitleEn: 'Grave of the Fireflies',
    tags: ['反战主题', '家庭温情', '历史背景', '感人至深', '深刻思考', '成人向', '经典之作', '获奖作品', '儿童主角']
  },

  // 哈尔的移动城堡
  {
    movieTitleEn: "Howl's Moving Castle",
    tags: ['爱情故事', '魔法世界', '奇幻冒险', '反战主题', '温馨治愈', '全年龄', '经典之作', '票房佳作', '强女性主角', '手绘动画']
  },

  // 天空之城
  {
    movieTitleEn: 'Castle in the Sky',
    tags: ['奇幻冒险', '环保主题', '成长故事', '轻松愉快', '全年龄', '经典之作', '口碑佳作', '强女性主角', '儿童主角', '手绘动画']
  },

  // 魔女宅急便
  {
    movieTitleEn: "Kiki's Delivery Service",
    tags: ['成长故事', '魔法世界', '都市生活', '温馨治愈', '儿童友好', '全年龄', '经典之作', '强女性主角', '儿童主角', '动物伙伴']
  },

  // 红猪
  {
    movieTitleEn: 'Porco Rosso',
    tags: ['历史背景', '反战主题', '轻松愉快', '成人向', '口碑佳作', '手绘动画']
  },

  // 幽灵公主
  {
    movieTitleEn: 'Princess Mononoke',
    tags: ['环保主题', '历史背景', '奇幻冒险', '深刻思考', '成人向', '经典之作', '获奖作品', '强女性主角', '动物伙伴', '手绘动画']
  },

  // 风之谷
  {
    movieTitleEn: 'Nausicaä of the Valley of the Wind',
    tags: ['环保主题', '奇幻冒险', '深刻思考', '全年龄', '经典之作', '强女性主角', '动物伙伴', '手绘动画']
  },
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

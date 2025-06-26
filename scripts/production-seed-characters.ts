#!/usr/bin/env tsx
/**
 * 生产环境安全的角色数据种子脚本
 * 可以在Vercel等生产环境中安全运行
 */

import { PrismaClient } from '../prisma/generated/client';

const prisma = new PrismaClient();

// 生产环境安全的角色数据
const PRODUCTION_CHARACTERS = [
  {
    name: "Chihiro Ogino",
    nameJa: "荻野千尋",
    nameZh: "荻野千寻",
    description: "10岁的小女孩，勇敢善良，在神灵世界中成长并拯救了父母",
    isMainCharacter: true,
    movieTmdbId: 129, // Spirited Away
    voiceActor: "Daveigh Chase",
    voiceActorJa: "柊瑠美",
    importance: 100
  },
  {
    name: "Haku",
    nameJa: "ハク",
    nameZh: "白龙",
    description: "神秘的少年，实际上是琥珀川的河神，帮助千寻在神灵世界生存",
    isMainCharacter: true,
    movieTmdbId: 129, // Spirited Away
    voiceActor: "Jason Marsden",
    voiceActorJa: "入野自由",
    importance: 95
  },
  {
    name: "No-Face",
    nameJa: "カオナシ",
    nameZh: "无脸男",
    description: "神秘的精灵，渴望被接纳和理解，象征着现代社会的孤独",
    isMainCharacter: true,
    movieTmdbId: 129, // Spirited Away
    voiceActorJa: "中村彰男",
    importance: 90
  },
  {
    name: "Yubaba",
    nameJa: "湯婆婆",
    nameZh: "汤婆婆",
    description: "澡堂的老板娘，贪婪但有自己的原则，千寻的雇主",
    isMainCharacter: true,
    movieTmdbId: 129, // Spirited Away
    voiceActor: "Suzanne Pleshette",
    voiceActorJa: "夏木マリ",
    importance: 85
  },
  {
    name: "Lin",
    nameJa: "リン",
    nameZh: "小玲",
    description: "澡堂的工作人员，千寻的朋友和导师，实际上是白鼬精",
    isMainCharacter: false,
    movieTmdbId: 129, // Spirited Away
    voiceActor: "Susan Egan",
    voiceActorJa: "玉井夕海",
    importance: 70
  },
  {
    name: "Totoro",
    nameJa: "トトロ",
    nameZh: "龙猫",
    description: "森林的守护神，巨大温和的精灵，只有纯真的孩子才能看见",
    isMainCharacter: true,
    movieTmdbId: 8392, // My Neighbor Totoro
    voiceActor: "Frank Welker",
    voiceActorJa: "高木均",
    importance: 100
  },
  {
    name: "Satsuki Kusakabe",
    nameJa: "草壁サツキ",
    nameZh: "草壁皋月",
    description: "10岁的姐姐，懂事负责，照顾妹妹和生病的母亲",
    isMainCharacter: true,
    movieTmdbId: 8392, // My Neighbor Totoro
    voiceActor: "Dakota Fanning",
    voiceActorJa: "日高のり子",
    importance: 95
  },
  {
    name: "Mei Kusakabe",
    nameJa: "草壁メイ",
    nameZh: "草壁梅",
    description: "4岁的妹妹，天真活泼，第一个发现龙猫的人",
    isMainCharacter: true,
    movieTmdbId: 8392, // My Neighbor Totoro
    voiceActor: "Elle Fanning",
    voiceActorJa: "坂本千夏",
    importance: 90
  },
  {
    name: "Howl",
    nameJa: "ハウル",
    nameZh: "哈尔",
    description: "英俊的魔法师，拥有移动城堡，内心脆弱但善良",
    isMainCharacter: true,
    movieTmdbId: 4935, // Howl's Moving Castle
    voiceActor: "Christian Bale",
    voiceActorJa: "木村拓哉",
    importance: 100
  },
  {
    name: "Sophie Hatter",
    nameJa: "ソフィー・ハッター",
    nameZh: "苏菲·哈特",
    description: "帽子店的长女，被变成老婆婆后发现了自己的内在力量",
    isMainCharacter: true,
    movieTmdbId: 4935, // Howl's Moving Castle
    voiceActor: "Jean Simmons",
    voiceActorJa: "倍賞千恵子",
    importance: 95
  },
  {
    name: "Calcifer",
    nameJa: "カルシファー",
    nameZh: "卡西法",
    description: "火恶魔，哈尔的心脏，为城堡提供动力",
    isMainCharacter: true,
    movieTmdbId: 4935, // Howl's Moving Castle
    voiceActor: "Billy Crystal",
    voiceActorJa: "我修院達也",
    importance: 85
  },
  {
    name: "Markl",
    nameJa: "マルクル",
    nameZh: "马鲁克",
    description: "哈尔的徒弟，聪明的小男孩",
    isMainCharacter: false,
    movieTmdbId: 4935, // Howl's Moving Castle
    voiceActor: "Josh Hutcherson",
    voiceActorJa: "神木隆之介",
    importance: 70
  }
];

async function seedProductionCharacters() {
  console.log('🎭 开始生产环境角色数据种子化...');

  try {
    let totalCharactersCreated = 0;
    let totalCharactersUpdated = 0;
    let totalMovieCharacterRelationsCreated = 0;

    for (const characterData of PRODUCTION_CHARACTERS) {
      console.log(`\n👤 处理角色: ${characterData.nameZh} (${characterData.name})`);

      // 查找对应的电影
      const movie = await prisma.movie.findUnique({
        where: { tmdbId: characterData.movieTmdbId }
      });

      if (!movie) {
        console.log(`⚠️ 电影 TMDB ID ${characterData.movieTmdbId} 不存在，跳过角色 ${characterData.name}`);
        continue;
      }

      console.log(`✅ 找到电影: ${movie.titleZh || movie.titleEn}`);

      // 检查角色是否已存在
      const existingCharacter = await prisma.character.findFirst({
        where: {
          OR: [
            { name: characterData.name },
            { nameZh: characterData.nameZh }
          ]
        }
      });

      let character;

      if (existingCharacter) {
        console.log(`    ℹ️ 角色已存在，更新信息`);
        character = await prisma.character.update({
          where: { id: existingCharacter.id },
          data: {
            name: characterData.name,
            nameJa: characterData.nameJa,
            nameZh: characterData.nameZh,
            description: characterData.description,
            isMainCharacter: characterData.isMainCharacter
          }
        });
        totalCharactersUpdated++;
      } else {
        console.log(`    ✨ 创建新角色`);
        character = await prisma.character.create({
          data: {
            name: characterData.name,
            nameJa: characterData.nameJa,
            nameZh: characterData.nameZh,
            description: characterData.description,
            isMainCharacter: characterData.isMainCharacter
          }
        });
        totalCharactersCreated++;
      }

      // 检查电影-角色关联是否已存在
      const existingMovieCharacter = await prisma.movieCharacter.findFirst({
        where: {
          movieId: movie.id,
          characterId: character.id
        }
      });

      if (!existingMovieCharacter) {
        console.log(`    🔗 创建电影-角色关联`);
        await prisma.movieCharacter.create({
          data: {
            movieId: movie.id,
            characterId: character.id,
            voiceActor: characterData.voiceActor,
            voiceActorJa: characterData.voiceActorJa,
            importance: characterData.importance
          }
        });
        totalMovieCharacterRelationsCreated++;
      } else {
        console.log(`    ℹ️ 电影-角色关联已存在，更新信息`);
        await prisma.movieCharacter.update({
          where: { id: existingMovieCharacter.id },
          data: {
            voiceActor: characterData.voiceActor,
            voiceActorJa: characterData.voiceActorJa,
            importance: characterData.importance
          }
        });
      }
    }

    // 获取最终统计
    const totalCharacters = await prisma.character.count();
    const totalMovieCharacterRelations = await prisma.movieCharacter.count();

    console.log('\n🎉 生产环境角色数据种子化完成!');
    console.log('📊 统计信息:');
    console.log(`  - 新创建角色: ${totalCharactersCreated}`);
    console.log(`  - 更新角色: ${totalCharactersUpdated}`);
    console.log(`  - 新创建电影-角色关联: ${totalMovieCharacterRelationsCreated}`);
    console.log('\n📈 数据库总计:');
    console.log(`  - 总角色数: ${totalCharacters}`);
    console.log(`  - 总电影-角色关联数: ${totalMovieCharacterRelations}`);
    console.log('✅ 生产环境角色种子脚本执行成功');

  } catch (error) {
    console.error('❌ 生产环境角色种子化失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  seedProductionCharacters()
    .then(() => {
      console.log('✅ 脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 脚本执行失败:', error);
      process.exit(1);
    });
}

export { seedProductionCharacters };

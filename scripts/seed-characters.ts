#!/usr/bin/env tsx
/**
 * 角色数据种子脚本
 * 为吉卜力电影添加详细的角色档案
 */

import { PrismaClient } from '../prisma/generated/client';
import { GHIBLI_MOVIES, createCharacterData, createMovieCharacterData } from '../data/ghibli-movies-complete';

const prisma = new PrismaClient();

async function seedCharacters() {
  console.log('🎭 开始添加角色数据...');

  try {
    let totalCharactersCreated = 0;
    let totalMovieCharacterRelationsCreated = 0;

    for (const movie of GHIBLI_MOVIES) {
      console.log(`\n📽️ 处理电影: ${movie.titleZh} (${movie.titleEn})`);

      // 查找数据库中的电影记录
      const dbMovie = await prisma.movie.findUnique({
        where: { tmdbId: movie.tmdbId }
      });

      if (!dbMovie) {
        console.log(`⚠️ 电影 ${movie.titleEn} (TMDB ID: ${movie.tmdbId}) 在数据库中不存在，跳过`);
        continue;
      }

      console.log(`✅ 找到电影记录: ${dbMovie.id}`);

      // 为每个角色创建记录
      for (const character of movie.mainCharacters) {
        console.log(`  👤 添加角色: ${character.nameZh} (${character.name})`);

        try {
          // 检查角色是否已存在
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
              data: createCharacterData(movie, character)
            });
          } else {
            console.log(`    ✨ 创建新角色`);
            characterRecord = await prisma.character.create({
              data: createCharacterData(movie, character)
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
              data: createMovieCharacterData(dbMovie.id, characterRecord.id, character)
            });
            totalMovieCharacterRelationsCreated++;
          } else {
            console.log(`    ℹ️ 电影-角色关联已存在`);
          }

        } catch (error) {
          console.error(`    ❌ 处理角色 ${character.name} 时出错:`, error);
        }
      }
    }

    console.log('\n🎉 角色数据添加完成!');
    console.log(`📊 统计信息:`);
    console.log(`  - 新创建角色: ${totalCharactersCreated}`);
    console.log(`  - 新创建电影-角色关联: ${totalMovieCharacterRelationsCreated}`);

    // 显示最终统计
    const totalCharacters = await prisma.character.count();
    const totalMovieCharacters = await prisma.movieCharacter.count();
    
    console.log(`\n📈 数据库总计:`);
    console.log(`  - 总角色数: ${totalCharacters}`);
    console.log(`  - 总电影-角色关联数: ${totalMovieCharacters}`);

  } catch (error) {
    console.error('❌ 种子脚本执行失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  seedCharacters()
    .then(() => {
      console.log('✅ 角色种子脚本执行成功');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 角色种子脚本执行失败:', error);
      process.exit(1);
    });
}

export { seedCharacters };

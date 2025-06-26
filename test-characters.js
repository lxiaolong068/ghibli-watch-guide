#!/usr/bin/env node

const { PrismaClient } = require('./prisma/generated/client');

const prisma = new PrismaClient();

async function testCharacters() {
  try {
    console.log('🔍 检查数据库中的角色数据...\n');

    // 获取所有角色
    const characters = await prisma.character.findMany({
      include: {
        movieCharacters: {
          include: {
            movie: {
              select: {
                id: true,
                titleEn: true,
                titleZh: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    console.log(`📊 总共找到 ${characters.length} 个角色:\n`);

    characters.forEach((character, index) => {
      console.log(`${index + 1}. ${character.name} (${character.nameZh || 'N/A'})`);
      console.log(`   ID: ${character.id}`);
      console.log(`   主角: ${character.isMainCharacter ? '是' : '否'}`);
      console.log(`   描述: ${character.description || 'N/A'}`);
      
      if (character.movieCharacters.length > 0) {
        console.log(`   出演电影:`);
        character.movieCharacters.forEach(mc => {
          console.log(`     - ${mc.movie.titleZh || mc.movie.titleEn} (${mc.movie.id})`);
        });
      }
      console.log('');
    });

    // 测试API端点
    console.log('🌐 测试角色详情API...\n');
    
    if (characters.length > 0) {
      const testCharacter = characters[0];
      console.log(`测试角色: ${testCharacter.name} (ID: ${testCharacter.id})`);
      
      try {
        const response = await fetch(`http://localhost:3000/api/characters/${testCharacter.id}`);
        const data = await response.json();
        
        if (response.ok) {
          console.log('✅ API响应成功');
          console.log(`角色名称: ${data.character.name}`);
        } else {
          console.log('❌ API响应失败');
          console.log(`错误: ${data.error}`);
        }
      } catch (error) {
        console.log('❌ API请求失败');
        console.log(`错误: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCharacters();

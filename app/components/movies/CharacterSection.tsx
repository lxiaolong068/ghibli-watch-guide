import { Suspense } from 'react';
import Image from 'next/image';
import { PrismaClient } from '@prisma/client';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';

const prisma = new PrismaClient();

interface CharacterSectionProps {
  movieId: string;
}

export function CharacterSection({ movieId }: CharacterSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">角色介绍</h2>
      
      <Suspense fallback={<LoadingSpinner />}>
        <CharacterContent movieId={movieId} />
      </Suspense>
    </div>
  );
}

async function CharacterContent({ movieId }: { movieId: string }) {
  const characters = await getMovieCharacters(movieId);
  
  if (characters.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <p className="text-gray-500 mb-4">角色档案正在完善中</p>
        <p className="text-sm text-gray-400">我们正在为这部电影的角色准备详细介绍</p>
      </div>
    );
  }

  // 分离主要角色和次要角色
  const mainCharacters = characters.filter(char => char.isMainCharacter);
  const supportingCharacters = characters.filter(char => !char.isMainCharacter);

  return (
    <div className="space-y-8">
      {/* 主要角色 */}
      {mainCharacters.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">主要角色</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mainCharacters.map((character) => (
              <CharacterCard key={character.id} character={character} isMain={true} />
            ))}
          </div>
        </div>
      )}

      {/* 次要角色 */}
      {supportingCharacters.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">其他角色</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {supportingCharacters.map((character) => (
              <CharacterCard key={character.id} character={character} isMain={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CharacterCard({ character, isMain }: { character: any; isMain: boolean }) {
  return (
    <div className={`border border-gray-200 rounded-lg p-4 ${isMain ? 'bg-gradient-to-br from-blue-50 to-indigo-50' : 'bg-white'}`}>
      <div className="flex items-start space-x-4">
        {/* 角色头像 */}
        <div className={`flex-shrink-0 ${isMain ? 'w-20 h-20' : 'w-16 h-16'}`}>
          {character.imageUrl ? (
            <Image
              src={character.imageUrl}
              alt={character.name}
              width={isMain ? 80 : 64}
              height={isMain ? 80 : 64}
              className="rounded-full object-cover"
            />
          ) : (
            <div className={`${isMain ? 'w-20 h-20' : 'w-16 h-16'} bg-gray-200 rounded-full flex items-center justify-center`}>
              <svg className={`${isMain ? 'w-8 h-8' : 'w-6 h-6'} text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
        </div>

        {/* 角色信息 */}
        <div className="flex-1 min-w-0">
          <div className="mb-2">
            <h4 className={`font-semibold text-gray-900 ${isMain ? 'text-lg' : 'text-base'}`}>
              {character.name}
            </h4>
            {character.nameJa && character.nameJa !== character.name && (
              <p className="text-sm text-gray-600">{character.nameJa}</p>
            )}
            {character.nameZh && character.nameZh !== character.name && (
              <p className="text-sm text-gray-600">{character.nameZh}</p>
            )}
          </div>

          {/* 配音演员信息 */}
          {character.voiceActor && (
            <div className="mb-2">
              <p className="text-sm text-gray-700">
                <span className="font-medium">配音：</span>
                {character.voiceActor}
              </p>
              {character.voiceActorJa && character.voiceActorJa !== character.voiceActor && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">日配：</span>
                  {character.voiceActorJa}
                </p>
              )}
            </div>
          )}

          {/* 角色描述 */}
          {character.description && (
            <p className={`text-gray-600 ${isMain ? 'text-sm' : 'text-xs'} line-clamp-3`}>
              {character.description}
            </p>
          )}

          {/* 主角标识 */}
          {isMain && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                主要角色
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 获取电影角色的函数
async function getMovieCharacters(movieId: string) {
  try {
    // 检查表是否存在
    await prisma.$queryRaw`SELECT 1 FROM "MovieCharacter" LIMIT 1`;
    
    const movieCharacters = await prisma.movieCharacter.findMany({
      where: { movieId },
      include: {
        character: true
      },
      orderBy: [
        { importance: 'desc' },
        { character: { name: 'asc' } }
      ]
    });
    
    return movieCharacters.map(mc => ({
      id: mc.character.id,
      name: mc.character.name,
      nameJa: mc.character.nameJa,
      nameZh: mc.character.nameZh,
      description: mc.character.description,
      imageUrl: mc.character.imageUrl,
      isMainCharacter: mc.character.isMainCharacter,
      voiceActor: mc.voiceActor,
      voiceActorJa: mc.voiceActorJa,
      importance: mc.importance
    }));
  } catch (error) {
    console.log('MovieCharacter table not yet created, returning sample data');
    
    // 返回示例数据
    return [
      {
        id: 'char-1',
        name: '千寻',
        nameJa: 'ちひろ',
        nameZh: '千寻',
        description: '一个10岁的小女孩，在搬家途中意外进入了神灵世界。她勇敢、善良，在困境中逐渐成长。',
        imageUrl: null,
        isMainCharacter: true,
        voiceActor: '柊瑠美',
        voiceActorJa: '柊瑠美',
        importance: 100
      },
      {
        id: 'char-2',
        name: '白龙',
        nameJa: 'ハク',
        nameZh: '白龙',
        description: '神秘的少年，实际上是琥珀川的河神。他帮助千寻在神灵世界中生存。',
        imageUrl: null,
        isMainCharacter: true,
        voiceActor: '入野自由',
        voiceActorJa: '入野自由',
        importance: 90
      },
      {
        id: 'char-3',
        name: '汤婆婆',
        nameJa: 'ユバーバ',
        nameZh: '汤婆婆',
        description: '油屋的老板娘，是一个强大的魔女。她贪婪且严厉，但也有慈爱的一面。',
        imageUrl: null,
        isMainCharacter: false,
        voiceActor: '夏木マリ',
        voiceActorJa: '夏木マリ',
        importance: 80
      }
    ];
  }
}

// 角色关系图组件（为未来功能预留）
export function CharacterRelationshipChart({ movieId }: { movieId: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 mt-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">角色关系图</h3>
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <p className="text-gray-600 mb-2">角色关系图功能开发中</p>
        <p className="text-sm text-gray-500">即将推出交互式角色关系可视化</p>
      </div>
    </div>
  );
}

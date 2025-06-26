import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Production-safe character data
const PRODUCTION_CHARACTERS = [
  {
    name: "Chihiro Ogino",
    nameJa: "荻野千尋",
    nameZh: "荻野千寻",
    description: "A 10-year-old girl who is brave and kind, grows in the spirit world and saves her parents",
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
    description: "A mysterious boy who is actually the river god of the Kohaku River, helps Chihiro survive in the spirit world",
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
    description: "A mysterious spirit who longs to be accepted and understood, symbolizing loneliness in modern society",
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
    description: "The eldest daughter of a hat shop, discovers her inner strength after being transformed into an old woman",
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
    description: "A fire demon, Howl's heart, providing power to the castle",
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
    description: "Howl's apprentice, a clever young boy",
    isMainCharacter: false,
    movieTmdbId: 4935, // Howl's Moving Castle
    voiceActor: "Josh Hutcherson",
    voiceActorJa: "神木隆之介",
    importance: 70
  }
];

export async function GET(request: NextRequest) {
  try {
    // Check if in production environment, if so, special parameters are required
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force');

    if (process.env.NODE_ENV === 'production' && force !== 'true') {
      return NextResponse.json(
        {
          error: 'Production seed requires force=true parameter',
          message: 'Add ?force=true to the URL to run in production'
        },
        { status: 400 }
      );
    }

    console.log('🎭 Starting production character data seeding...');

    let totalCharactersCreated = 0;
    let totalCharactersUpdated = 0;
    let totalMovieCharacterRelationsCreated = 0;

    for (const characterData of PRODUCTION_CHARACTERS) {
      console.log(`👤 Processing character: ${characterData.name} (${characterData.nameZh})`);

      // 查找对应的电影
      const movie = await prisma.movie.findUnique({
        where: { tmdbId: characterData.movieTmdbId }
      });

      if (!movie) {
        console.log(`⚠️ Movie TMDB ID ${characterData.movieTmdbId} does not exist, skipping character ${characterData.name}`);
        continue;
      }

      // Check if character already exists
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

      // Check if movie-character relationship already exists
      const existingMovieCharacter = await prisma.movieCharacter.findFirst({
        where: {
          movieId: movie.id,
          characterId: character.id
        }
      });

      if (!existingMovieCharacter) {
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

    // Get final statistics
    const totalCharacters = await prisma.character.count();
    const totalMovieCharacterRelations = await prisma.movieCharacter.count();

    const result = {
      success: true,
      message: 'Production character data seeding completed',
      statistics: {
        charactersCreated: totalCharactersCreated,
        charactersUpdated: totalCharactersUpdated,
        movieCharacterRelationsCreated: totalMovieCharacterRelationsCreated,
        totalCharacters,
        totalMovieCharacterRelations
      }
    };

    console.log('✅ Production character seeding completed:', result);

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Production character seeding failed:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Character seeding failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

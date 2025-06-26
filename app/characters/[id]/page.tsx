import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CharacterDetail } from '@/app/components/characters/CharacterDetail';
import { RelatedCharacters } from '@/app/components/characters/RelatedCharacters';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';
import { UserBehaviorTracker } from '@/app/components/analytics/UserBehaviorTracker';
import { ResponsiveAdSenseAd } from '@/app/components/SEOOptimizer';
import { prisma } from '@/lib/prisma';

interface CharacterPageProps {
  params: { id: string };
}

async function getCharacter(id: string) {
  try {
    const character = await prisma.character.findUnique({
      where: { id },
      include: {
        movieCharacters: {
          include: {
            movie: {
              select: {
                id: true,
                titleEn: true,
                titleJa: true,
                titleZh: true,
                year: true,
                posterUrl: true,
                backdropUrl: true,
                synopsis: true,
                voteAverage: true,
                duration: true
              }
            }
          },
          orderBy: { importance: 'desc' }
        }
      }
    });

    if (!character) {
      return null;
    }

    // 获取相关角色（出现在相同电影中的其他角色）
    const relatedCharacters = await prisma.character.findMany({
      where: {
        AND: [
          { id: { not: character.id } },
          {
            movieCharacters: {
              some: {
                movieId: {
                  in: character.movieCharacters.map(mc => mc.movieId)
                }
              }
            }
          }
        ]
      },
      include: {
        movieCharacters: {
          include: {
            movie: {
              select: {
                id: true,
                titleEn: true,
                titleJa: true,
                titleZh: true,
                year: true,
                posterUrl: true
              }
            }
          },
          orderBy: { importance: 'desc' }
        }
      },
      orderBy: [
        { isMainCharacter: 'desc' },
        { name: 'asc' }
      ],
      take: 6
    });

    // 格式化角色数据
    const formattedCharacter = {
      ...character,
      movies: character.movieCharacters.map(mc => ({
        ...mc.movie,
        voiceActor: mc.voiceActor,
        voiceActorJa: mc.voiceActorJa,
        importance: mc.importance
      }))
    };

    const formattedRelatedCharacters = relatedCharacters.map(char => ({
      ...char,
      movies: char.movieCharacters.map(mc => ({
        ...mc.movie,
        voiceActor: mc.voiceActor,
        voiceActorJa: mc.voiceActorJa,
        importance: mc.importance
      }))
    }));

    return {
      character: formattedCharacter,
      relatedCharacters: formattedRelatedCharacters
    };

  } catch (error) {
    console.error('Error fetching character:', error);
    return null;
  }
}

export async function generateMetadata({ params }: CharacterPageProps): Promise<Metadata> {
  const data = await getCharacter(params.id);
  
  if (!data?.character) {
    return {
      title: '角色不存在 | 吉卜力观影指南',
      description: '抱歉，您查找的角色不存在。'
    };
  }

  const character = data.character;
  const movieTitles = character.movies?.map((movie: any) => movie.titleEn).join('、') || '';
  
  return {
    title: `${character.name} | 吉卜力电影角色介绍`,
    description: `了解吉卜力电影角色${character.name}的详细信息，包括角色背景、配音演员和出演电影。${character.description || ''}`,
    keywords: `${character.name}, ${character.nameJa || ''}, ${character.nameZh || ''}, 吉卜力角色, ${movieTitles}`,
    openGraph: {
      title: `${character.name} | 吉卜力电影角色介绍`,
      description: `了解吉卜力电影角色${character.name}的详细信息，包括角色背景、配音演员和出演电影。`,
      type: 'article',
      url: `https://www.whereghibli.cc/characters/${params.id}`,
      images: character.imageUrl ? [
        {
          url: character.imageUrl,
          width: 800,
          height: 600,
          alt: character.name
        }
      ] : []
    },
    twitter: {
      card: 'summary_large_image',
      title: `${character.name} | 吉卜力电影角色介绍`,
      description: `了解吉卜力电影角色${character.name}的详细信息，包括角色背景、配音演员和出演电影。`,
      images: character.imageUrl ? [character.imageUrl] : []
    }
  };
}

export default async function CharacterPage({ params }: CharacterPageProps) {
  const data = await getCharacter(params.id);
  
  if (!data?.character) {
    notFound();
  }

  const { character, relatedCharacters } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 用户行为跟踪 */}
      <UserBehaviorTracker pageType="character" characterId={params.id} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 角色详情 */}
        <Suspense fallback={<LoadingSpinner />}>
          <CharacterDetail character={character} />
        </Suspense>

        {/* 广告位 */}
        <div className="flex justify-center my-8">
          <ResponsiveAdSenseAd
            adSlot="1234567890"
            adFormat="auto"
          />
        </div>

        {/* 相关角色 */}
        {relatedCharacters && relatedCharacters.length > 0 && (
          <Suspense fallback={<div className="h-64 bg-white rounded-lg animate-pulse" />}>
            <RelatedCharacters characters={relatedCharacters} />
          </Suspense>
        )}

        {/* 底部广告位 */}
        <div className="flex justify-center mt-12">
          <ResponsiveAdSenseAd
            adSlot="9876543210"
            adFormat="auto"
          />
        </div>
      </div>
    </div>
  );
}

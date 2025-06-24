import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CharacterDetail } from '@/app/components/characters/CharacterDetail';
import { RelatedCharacters } from '@/app/components/characters/RelatedCharacters';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';
import { UserBehaviorTracker } from '@/app/components/analytics/UserBehaviorTracker';
import { ResponsiveAdSenseAd } from '@/app/components/SEOOptimizer';

interface CharacterPageProps {
  params: { id: string };
}

async function getCharacter(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/characters/${id}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
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
            fullWidthResponsive={true}
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
            fullWidthResponsive={true}
          />
        </div>
      </div>
    </div>
  );
}

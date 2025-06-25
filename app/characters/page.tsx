import { Suspense } from 'react';
import type { Metadata } from 'next';
import { CharacterList } from '@/app/components/characters/CharacterList';
import { CharacterSearch } from '@/app/components/characters/CharacterSearch';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';
import { UserBehaviorTracker } from '@/app/components/analytics/UserBehaviorTracker';
import { ResponsiveAdSenseAd } from '@/app/components/SEOOptimizer';

export const metadata: Metadata = {
  title: '吉卜力电影角色大全 | 角色介绍与配音演员信息',
  description: '探索吉卜力工作室电影中的经典角色，包括千寻、龙猫、无脸男等，了解角色背景故事和配音演员信息。',
  keywords: '吉卜力角色, 千寻, 龙猫, 无脸男, 白龙, 汤婆婆, 配音演员, 角色介绍',
  openGraph: {
    title: '吉卜力电影角色大全 | 角色介绍与配音演员信息',
    description: '探索吉卜力工作室电影中的经典角色，包括千寻、龙猫、无脸男等，了解角色背景故事和配音演员信息。',
    type: 'website',
    url: 'https://www.whereghibli.cc/characters',
    images: [
      {
        url: 'https://www.whereghibli.cc/images/characters-og.jpg',
        width: 1200,
        height: 630,
        alt: '吉卜力电影角色大全'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: '吉卜力电影角色大全 | 角色介绍与配音演员信息',
    description: '探索吉卜力工作室电影中的经典角色，包括千寻、龙猫、无脸男等，了解角色背景故事和配音演员信息。',
    images: ['https://www.whereghibli.cc/images/characters-og.jpg']
  }
};

interface CharactersPageProps {
  searchParams: {
    page?: string;
    search?: string;
    isMainCharacter?: string;
    movieId?: string;
  };
}

export default function CharactersPage({ searchParams }: CharactersPageProps) {
  const page = parseInt(searchParams.page || '1');
  const search = searchParams.search || '';
  const isMainCharacter = searchParams.isMainCharacter;
  const movieId = searchParams.movieId;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 用户行为跟踪 */}
      <UserBehaviorTracker pageType="characters" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            吉卜力电影角色大全
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            探索吉卜力工作室电影中的经典角色，了解他们的背景故事、性格特点和配音演员信息。
            从千寻到龙猫，从无脸男到白龙，每个角色都有着独特的魅力和深刻的内涵。
          </p>
        </div>

        {/* 广告位 */}
        <div className="flex justify-center mb-8">
          <ResponsiveAdSenseAd
            adSlot="1234567890"
            adFormat="auto"
          />
        </div>

        {/* 搜索和筛选 */}
        <div className="mb-8">
          <Suspense fallback={<div className="h-16 bg-white rounded-lg animate-pulse" />}>
            <CharacterSearch
              initialSearch={search}
              initialIsMainCharacter={isMainCharacter}
              initialMovieId={movieId}
            />
          </Suspense>
        </div>

        {/* 角色列表 */}
        <Suspense fallback={<LoadingSpinner />}>
          <CharacterList
            page={page}
            search={search}
            isMainCharacter={isMainCharacter}
            movieId={movieId}
          />
        </Suspense>

        {/* 底部广告位 */}
        <div className="flex justify-center mt-12">
          <ResponsiveAdSenseAd
            adSlot="9876543210"
            adFormat="auto"
          />
        </div>

        {/* SEO内容 */}
        <div className="mt-16 bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            关于吉卜力电影角色
          </h2>
          <div className="prose prose-lg max-w-none text-gray-700">
            <p>
              吉卜力工作室创造了无数令人难忘的角色，每个角色都承载着深刻的寓意和情感。
              从《千与千寻》中勇敢成长的千寻，到《龙猫》中温暖守护的龙猫，
              这些角色不仅是动画的主角，更是观众心中永恒的朋友。
            </p>
            <p>
              我们的角色大全收录了吉卜力主要电影中的重要角色，包括：
            </p>
            <ul>
              <li><strong>主要角色</strong>：电影的核心人物，推动故事发展的关键角色</li>
              <li><strong>配音信息</strong>：日文原版和中文配音演员的详细信息</li>
              <li><strong>角色背景</strong>：角色的性格特点、成长历程和象征意义</li>
              <li><strong>相关电影</strong>：角色出现的电影作品和重要场景</li>
            </ul>
            <p>
              通过深入了解这些角色，您可以更好地理解宫崎骏和高畑勋等导演想要传达的主题思想，
              感受吉卜力动画独特的人文关怀和艺术魅力。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

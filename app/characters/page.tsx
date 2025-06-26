import { Suspense } from 'react';
import type { Metadata } from 'next';
import { CharacterList } from '@/app/components/characters/CharacterList';
import { CharacterSearch } from '@/app/components/characters/CharacterSearch';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';
import { UserBehaviorTracker } from '@/app/components/analytics/UserBehaviorTracker';
import { ResponsiveAdSenseAd } from '@/app/components/SEOOptimizer';

export const metadata: Metadata = {
  title: 'Studio Ghibli Characters Guide | Character Profiles & Voice Actors',
  description: 'Explore iconic characters from Studio Ghibli films, including Chihiro, Totoro, No-Face and more. Learn about character backgrounds and voice actor information.',
  keywords: 'ghibli characters, chihiro, totoro, no-face, haku, yubaba, voice actors, character profiles',
  openGraph: {
    title: 'Studio Ghibli Characters Guide | Character Profiles & Voice Actors',
    description: 'Explore iconic characters from Studio Ghibli films, including Chihiro, Totoro, No-Face and more. Learn about character backgrounds and voice actor information.',
    type: 'website',
    url: 'https://www.whereghibli.cc/characters',
    images: [
      {
        url: 'https://www.whereghibli.cc/images/characters-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Studio Ghibli Characters Guide'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Studio Ghibli Characters Guide | Character Profiles & Voice Actors',
    description: 'Explore iconic characters from Studio Ghibli films, including Chihiro, Totoro, No-Face and more. Learn about character backgrounds and voice actor information.',
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
            Studio Ghibli Characters Guide
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore iconic characters from Studio Ghibli films and learn about their background stories, personality traits, and voice actor information.
            From Chihiro to Totoro, from No-Face to Haku, each character has unique charm and profound meaning.
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
            About Studio Ghibli Characters
          </h2>
          <div className="prose prose-lg max-w-none text-gray-700">
            <p>
              Studio Ghibli has created countless unforgettable characters, each carrying profound meaning and emotion.
              From the brave and growing Chihiro in &ldquo;Spirited Away&rdquo; to the warm and protective Totoro in &ldquo;My Neighbor Totoro&rdquo;,
              these characters are not only the protagonists of animations, but also eternal friends in the hearts of audiences.
            </p>
            <p>
              Our character collection includes important characters from major Studio Ghibli films, featuring:
            </p>
            <ul>
              <li><strong>Main Characters</strong>: Core figures of the films, key characters who drive the story forward</li>
              <li><strong>Voice Actor Information</strong>: Detailed information about Japanese original and English voice actors</li>
              <li><strong>Character Background</strong>: Character traits, growth journey, and symbolic meaning</li>
              <li><strong>Related Movies</strong>: Films and important scenes where characters appear</li>
            </ul>
            <p>
              Through in-depth understanding of these characters, you can better comprehend the thematic ideas that directors like Hayao Miyazaki and Isao Takahata want to convey,
              and experience the unique humanistic care and artistic charm of Studio Ghibli animations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

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

    // Get related characters (other characters that appear in the same movies)
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

    // Format character data
    const formattedCharacter = {
      ...character,
      nameJa: character.nameJa || undefined,
      nameZh: character.nameZh || undefined,
      description: character.description || undefined,
      imageUrl: character.imageUrl || undefined,
      movies: character.movieCharacters.map(mc => ({
        id: mc.movie.id,
        titleEn: mc.movie.titleEn,
        titleJa: mc.movie.titleJa || undefined,
        titleZh: mc.movie.titleZh || undefined,
        year: mc.movie.year,
        posterUrl: mc.movie.posterUrl || undefined,
        voiceActor: mc.voiceActor || undefined,
        voiceActorJa: mc.voiceActorJa || undefined,
        importance: mc.importance
      }))
    };

    const formattedRelatedCharacters = relatedCharacters.map(char => ({
      ...char,
      nameJa: char.nameJa || undefined,
      nameZh: char.nameZh || undefined,
      description: char.description || undefined,
      imageUrl: char.imageUrl || undefined,
      movies: char.movieCharacters.map(mc => ({
        id: mc.movie.id,
        titleEn: mc.movie.titleEn,
        titleJa: mc.movie.titleJa || undefined,
        titleZh: mc.movie.titleZh || undefined,
        year: mc.movie.year,
        posterUrl: mc.movie.posterUrl || undefined,
        voiceActor: mc.voiceActor || undefined,
        voiceActorJa: mc.voiceActorJa || undefined,
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
      title: 'Character Not Found | Studio Ghibli Character Guide',
      description: 'Sorry, the character you are looking for does not exist.'
    };
  }

  const character = data.character;
  const movieTitles = character.movies?.map((movie: any) => movie.titleEn).join('、') || '';
  
  return {
    title: `${character.name} | Studio Ghibli Character Profile`,
    description: `Learn about Studio Ghibli character ${character.name}, including character background, voice actors, and featured movies. ${character.description || ''}`,
    keywords: `${character.name}, ${character.nameJa || ''}, ${character.nameZh || ''}, Studio Ghibli character, ${movieTitles}`,
    openGraph: {
      title: `${character.name} | Studio Ghibli Character Profile`,
      description: `Learn about Studio Ghibli character ${character.name}, including character background, voice actors, and featured movies.`,
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
      title: `${character.name} | Studio Ghibli Character Profile`,
      description: `Learn about Studio Ghibli character ${character.name}, including character background, voice actors, and featured movies.`,
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
      {/* User behavior tracking */}
      <UserBehaviorTracker pageType="character" characterId={params.id} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Character details */}
        <Suspense fallback={<LoadingSpinner />}>
          <CharacterDetail character={character} />
        </Suspense>

        {/* Advertisement */}
        <div className="flex justify-center my-8">
          <ResponsiveAdSenseAd
            adSlot="1234567890"
            adFormat="auto"
          />
        </div>

        {/* Related characters */}
        {relatedCharacters && relatedCharacters.length > 0 && (
          <Suspense fallback={<div className="h-64 bg-white rounded-lg animate-pulse" />}>
            <RelatedCharacters characters={relatedCharacters as any} />
          </Suspense>
        )}

        {/* Bottom advertisement */}
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

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

interface Character {
  id: string;
  name: string;
  nameJa?: string;
  nameZh?: string;
  description?: string;
  imageUrl?: string;
  isMainCharacter: boolean;
  voiceActor?: string;
  voiceActorJa?: string;
  importance?: number;
  movies?: Array<{
    id: string;
    titleEn: string;
    titleJa?: string;
    titleZh?: string;
    year: number;
    posterUrl?: string;
  }>;
  movieCharacters?: Array<{
    movie: {
      id: string;
      titleEn: string;
      titleJa?: string;
      titleZh?: string;
      year: number;
      posterUrl?: string;
    };
    voiceActor?: string;
    voiceActorJa?: string;
    importance: number;
  }>;
}

interface CharacterCardProps {
  character: Character;
  isMain: boolean;
}

export function CharacterCard({ character, isMain }: CharacterCardProps) {
  const [imageError, setImageError] = useState(false);

  // 获取角色的电影信息
  const movies = character.movies || character.movieCharacters?.map(mc => mc.movie) || [];
  const primaryMovie = movies[0];
  
  // 获取配音演员信息
  const voiceActor = character.voiceActor || character.movieCharacters?.[0]?.voiceActor;
  const voiceActorJa = character.voiceActorJa || character.movieCharacters?.[0]?.voiceActorJa;

  return (
    <Link href={`/characters/${character.id}`} className="group block">
      <div className={`
        border border-gray-200 rounded-lg overflow-hidden transition-all duration-300
        hover:shadow-lg hover:border-gray-300 hover:-translate-y-1
        ${isMain 
          ? 'bg-gradient-to-br from-blue-50 to-indigo-50 p-6' 
          : 'bg-white p-4'
        }
      `}>
        <div className="flex items-start space-x-4">
          {/* 角色头像 */}
          <div className={`flex-shrink-0 ${isMain ? 'w-20 h-20' : 'w-16 h-16'}`}>
            {character.imageUrl && !imageError ? (
              <Image
                src={character.imageUrl}
                alt={character.name}
                width={isMain ? 80 : 64}
                height={isMain ? 80 : 64}
                className="rounded-full object-cover w-full h-full"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className={`
                ${isMain ? 'w-20 h-20' : 'w-16 h-16'} 
                bg-gradient-to-br from-gray-200 to-gray-300 
                rounded-full flex items-center justify-center
                group-hover:from-gray-300 group-hover:to-gray-400
                transition-colors duration-300
              `}>
                <svg 
                  className={`${isMain ? 'w-8 h-8' : 'w-6 h-6'} text-gray-500`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                  />
                </svg>
              </div>
            )}
          </div>

          {/* 角色信息 */}
          <div className="flex-1 min-w-0">
            {/* 角色名称 */}
            <div className="mb-2">
              <h3 className={`
                font-semibold text-gray-900 group-hover:text-blue-600 transition-colors
                ${isMain ? 'text-lg' : 'text-base'}
              `}>
                {character.name}
              </h3>
              
              {/* 多语言名称 */}
              <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                {character.nameJa && (
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {character.nameJa}
                  </span>
                )}
                {character.nameZh && (
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {character.nameZh}
                  </span>
                )}
              </div>
            </div>

            {/* 配音演员信息 */}
            {(voiceActor || voiceActorJa) && (
              <div className="mb-2 text-sm">
                {voiceActor && (
                  <p className="text-gray-600">
                    <span className="font-medium">Voice Actor: </span>
                    {voiceActor}
                  </p>
                )}
                {voiceActorJa && (
                  <p className="text-gray-600">
                    <span className="font-medium">Japanese VA: </span>
                    {voiceActorJa}
                  </p>
                )}
              </div>
            )}

            {/* 角色描述 */}
            {character.description && (
              <p className={`
                text-gray-700 overflow-hidden
                ${isMain ? 'text-sm' : 'text-xs'}
              `}
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {character.description}
              </p>
            )}

            {/* 出演电影 */}
            {primaryMovie && (
              <div className="mt-2">
                <p className="text-xs text-gray-500">
                  Featured in: {primaryMovie.titleEn}
                  {movies.length > 1 && ` and ${movies.length - 1} more`}
                </p>
              </div>
            )}

            {/* 角色标签 */}
            <div className="mt-2 flex items-center gap-2">
              {character.isMainCharacter && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Main Character
                </span>
              )}

              {character.importance && character.importance > 80 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Important Role
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 悬停效果指示器 */}
        <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center text-blue-600 text-sm">
            <span>View Details</span>
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

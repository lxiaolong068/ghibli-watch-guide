'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StarIcon } from '@heroicons/react/24/solid';

interface Character {
  id: string;
  name: string;
  nameJa?: string;
  nameZh?: string;
  description?: string;
  imageUrl?: string;
  isMainCharacter: boolean;
  movies?: Array<{
    id: string;
    titleEn: string;
    titleJa?: string;
    titleZh?: string;
    year: number;
    posterUrl?: string;
    voiceActor?: string;
    voiceActorJa?: string;
    importance: number;
  }>;
}

interface CharacterDetailProps {
  character: Character;
}

export function CharacterDetail({ character }: CharacterDetailProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* 角色头部信息 */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative px-6 py-8 md:px-8 md:py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* 角色头像 */}
            <div className="flex-shrink-0">
              {character.imageUrl && !imageError ? (
                <Image
                  src={character.imageUrl}
                  alt={character.name}
                  width={120}
                  height={120}
                  className="rounded-full object-cover border-4 border-white shadow-lg"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-30 h-30 bg-white bg-opacity-20 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>

            {/* 角色基本信息 */}
            <div className="flex-1">
              <div className="mb-4">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{character.name}</h1>
                
                {/* 多语言名称 */}
                <div className="flex flex-wrap gap-3 mb-3">
                  {character.nameJa && (
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                      日文：{character.nameJa}
                    </span>
                  )}
                  {character.nameZh && (
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                      中文：{character.nameZh}
                    </span>
                  )}
                </div>

                {/* 角色标签 */}
                <div className="flex flex-wrap gap-2">
                  {character.isMainCharacter && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-400 text-yellow-900">
                      <StarIcon className="w-4 h-4 mr-1" />
                      主要角色
                    </span>
                  )}
                  
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-20 text-white">
                    出演 {character.movies?.length || 0} 部作品
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 角色详细信息 */}
      <div className="px-6 py-8 md:px-8">
        {/* 角色描述 */}
        {character.description && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">角色介绍</h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <p>{character.description}</p>
            </div>
          </div>
        )}

        {/* 出演作品 */}
        {character.movies && character.movies.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">出演作品</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {character.movies.map((movie) => (
                <Link
                  key={movie.id}
                  href={`/movies/${movie.id}`}
                  className="group block border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex">
                    {/* 电影海报 */}
                    <div className="flex-shrink-0 w-20 h-28">
                      {movie.posterUrl ? (
                        <Image
                          src={movie.posterUrl}
                          alt={movie.titleEn}
                          width={80}
                          height={112}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* 电影信息 */}
                    <div className="flex-1 p-4">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                        {movie.titleEn}
                      </h3>
                      
                      {movie.titleJa && (
                        <p className="text-sm text-gray-600 mb-2">{movie.titleJa}</p>
                      )}
                      
                      <p className="text-sm text-gray-500 mb-2">{movie.year}年</p>

                      {/* 配音演员信息 */}
                      {(movie.voiceActor || movie.voiceActorJa) && (
                        <div className="text-sm text-gray-600">
                          {movie.voiceActor && (
                            <p><span className="font-medium">配音：</span>{movie.voiceActor}</p>
                          )}
                          {movie.voiceActorJa && (
                            <p><span className="font-medium">日配：</span>{movie.voiceActorJa}</p>
                          )}
                        </div>
                      )}

                      {/* 重要程度指示器 */}
                      {movie.importance && movie.importance > 80 && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            重要角色
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 返回链接 */}
        <div className="pt-6 border-t border-gray-200">
          <Link
            href="/characters"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回角色列表
          </Link>
        </div>
      </div>
    </div>
  );
}

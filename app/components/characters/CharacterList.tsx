'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CharacterCard } from './CharacterCard';
import { PaginationControls } from '@/app/components/PaginationControls';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';

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

interface CharacterListProps {
  page: number;
  search?: string;
  isMainCharacter?: string;
  movieId?: string;
}

interface ApiResponse {
  characters: Character[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function CharacterList({ page, search, isMainCharacter, movieId }: CharacterListProps) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCharacters() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.set('page', page.toString());
        if (search) params.set('search', search);
        if (isMainCharacter) params.set('isMainCharacter', isMainCharacter);
        if (movieId) params.set('movieId', movieId);

        const response = await fetch(`/api/characters?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch character list');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch character list');
      } finally {
        setLoading(false);
      }
    }

    fetchCharacters();
  }, [page, search, isMainCharacter, movieId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data || data.characters.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          {search ? 'No matching characters found' : 'No character data available'}
        </div>
        {search && (
          <Link
            href="/characters"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            View all characters
          </Link>
        )}
      </div>
    );
  }

  const { characters, pagination } = data;

  // 分离主要角色和次要角色
  const mainCharacters = characters.filter(char => char.isMainCharacter);
  const supportingCharacters = characters.filter(char => !char.isMainCharacter);

  return (
    <div className="space-y-8">
      {/* 统计信息 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Found {pagination.total} characters
            </h2>
            <p className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </p>
          </div>

          {/* 快速筛选 */}
          <div className="flex gap-2">
            <Link
              href="/characters"
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                !isMainCharacter
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </Link>
            <Link
              href="/characters?isMainCharacter=true"
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                isMainCharacter === 'true'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Main Characters
            </Link>
            <Link
              href="/characters?isMainCharacter=false"
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                isMainCharacter === 'false'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Supporting Characters
            </Link>
          </div>
        </div>
      </div>

      {/* 主要角色 */}
      {mainCharacters.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Main Characters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainCharacters.map((character) => (
              <CharacterCard key={character.id} character={character} isMain={true} />
            ))}
          </div>
        </div>
      )}

      {/* 次要角色 */}
      {supportingCharacters.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {mainCharacters.length > 0 ? 'Supporting Characters' : 'Characters'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {supportingCharacters.map((character) => (
              <CharacterCard key={character.id} character={character} isMain={false} />
            ))}
          </div>
        </div>
      )}

      {/* 分页控件 */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <PaginationControls
            totalItems={pagination.total}
            currentPage={pagination.page}
            pageSize={pagination.limit}
          />
        </div>
      )}
    </div>
  );
}

'use client';

import { CharacterCard } from './CharacterCard';

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

interface RelatedCharactersProps {
  characters: Character[];
}

export function RelatedCharacters({ characters }: RelatedCharactersProps) {
  if (!characters || characters.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Characters</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {characters.map((character) => (
          <CharacterCard 
            key={character.id} 
            character={character} 
            isMain={character.isMainCharacter} 
          />
        ))}
      </div>
    </div>
  );
}

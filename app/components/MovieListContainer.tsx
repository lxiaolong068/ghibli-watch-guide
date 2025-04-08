'use client';

import { useState } from 'react';
import type { Movie, Region, Availability } from '@/app/types';
import { RegionSelector } from './RegionSelector';
import { MovieList } from './MovieList';

interface MovieWithAvailabilities extends Movie {
  availabilities: (Availability & {
    region: Region;
  })[];
}

interface MovieListContainerProps {
  initialMovies: MovieWithAvailabilities[];
  initialRegions: Region[];
}

export function MovieListContainer({
  initialMovies,
  initialRegions,
}: MovieListContainerProps) {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  // 处理地区选择
  const handleRegionSelect = (region: Region | null) => {
    setSelectedRegion(region);
  };

  // 根据选择的地区过滤电影
  const filteredMovies = selectedRegion
    ? initialMovies.filter((movie) =>
        movie.availabilities.some((a) => a.region.id === selectedRegion.id)
      )
    : initialMovies;

  return (
    <div className="space-y-6">
      <RegionSelector regions={initialRegions} onRegionSelect={handleRegionSelect} />
      <MovieList movies={filteredMovies} />
    </div>
  );
} 
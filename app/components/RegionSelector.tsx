'use client';

import { useState } from 'react';
import type { Region } from '@/app/generated/prisma';

interface RegionSelectorProps {
  regions: Region[];
  onRegionSelect: (region: Region | null) => void;
}

export function RegionSelector({ regions, onRegionSelect }: RegionSelectorProps) {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  const handleRegionClick = (region: Region) => {
    if (selectedRegion?.id === region.id) {
      setSelectedRegion(null);
      onRegionSelect(null);
    } else {
      setSelectedRegion(region);
      onRegionSelect(region);
    }
  };

  return (
    <section className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">选择您的地区</h2>
          {selectedRegion && (
            <button
              onClick={() => {
                setSelectedRegion(null);
                onRegionSelect(null);
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              重置选择
            </button>
          )}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {regions.map((region) => (
            <button
              key={region.id}
              onClick={() => handleRegionClick(region)}
              className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium 
                ${
                  selectedRegion?.id === region.id
                    ? 'border-indigo-500 text-indigo-700 bg-indigo-50 hover:bg-indigo-100'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {region.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface Region {
  id: string;
  code: string;
  name: string;
}

interface RegionSelectorProps {
  regions: Region[];
  defaultRegionCode?: string;
}

export function RegionSelector({ regions, defaultRegionCode }: RegionSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Use region code from query params, or the default code provided
  const currentRegionCode = searchParams.get('region') || defaultRegionCode;
  
  // Get saved region preference from local storage
  useEffect(() => {
    // If no region is specified, try to get from localStorage
    if (!currentRegionCode) {
      const savedRegion = localStorage.getItem('preferredRegion');
      if (savedRegion && regions.some(r => r.code === savedRegion)) {
        handleRegionChange(savedRegion);
      }
    }
  }, []);
  
  // Handle region selection change
  const handleRegionChange = (regionCode: string) => {
    // Save to localStorage
    localStorage.setItem('preferredRegion', regionCode);
    
    // Update URL query parameters
    const params = new URLSearchParams(searchParams);
    params.set('region', regionCode);
    router.replace(`${pathname}?${params.toString()}`);
  };
  
  if (regions.length === 0) {
    return null; // If no region data, don't show the selector
  }
  
  return (
    <div className="mb-6">
      <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
        Select Region
      </label>
      <select
        id="region"
        name="region"
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        value={currentRegionCode || ''}
        onChange={(e) => handleRegionChange(e.target.value)}
      >
        <option value="">Global</option>
        {regions.map((region) => (
          <option key={region.id} value={region.code}>
            {region.name}
          </option>
        ))}
      </select>
    </div>
  );
} 
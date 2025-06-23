'use client';

import { useState, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface Region {
  code: string;
  name: string;
  flag: string;
}

const REGIONS: Region[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
];

export function RegionSelector() {
  const [selectedRegion, setSelectedRegion] = useState<Region>(REGIONS[0]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // 从 localStorage 读取保存的地区
    const saved = localStorage.getItem('selectedRegion');
    if (saved) {
      const region = REGIONS.find(r => r.code === saved);
      if (region) setSelectedRegion(region);
    }
  }, []);

  const handleRegionChange = (region: Region) => {
    setSelectedRegion(region);
    localStorage.setItem('selectedRegion', region.code);
    setIsOpen(false);
    // 触发地区变更事件
    window.dispatchEvent(new CustomEvent('regionChanged', { 
      detail: region 
    }));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label={`Current region: ${selectedRegion.name}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{selectedRegion.flag}</span>
        <span>{selectedRegion.name}</span>
        <ChevronDownIcon className="w-4 h-4" />
      </button>

      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10"
          role="listbox"
          aria-label="Select region"
        >
          {REGIONS.map((region) => (
            <button
              key={region.code}
              onClick={() => handleRegionChange(region)}
              className="w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-md last:rounded-b-md"
              role="option"
              aria-selected={region.code === selectedRegion.code}
            >
              <span>{region.flag}</span>
              <span>{region.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

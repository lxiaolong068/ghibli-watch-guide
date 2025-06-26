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
    // Read saved region from localStorage
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
    // Trigger region change event
    window.dispatchEvent(new CustomEvent('regionChanged', { 
      detail: region 
    }));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-gray-900 dark:text-slate-100 transition-colors"
        aria-label={`Current region: ${selectedRegion.name}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{selectedRegion.flag}</span>
        <span className="text-gray-900 dark:text-slate-100">{selectedRegion.name}</span>
        <ChevronDownIcon className="w-4 h-4 text-gray-500 dark:text-slate-400" />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md shadow-lg z-10"
          role="listbox"
          aria-label="Select region"
        >
          {REGIONS.map((region) => (
            <button
              key={region.code}
              onClick={() => handleRegionChange(region)}
              className={`w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-slate-700 first:rounded-t-md last:rounded-b-md transition-colors ${
                region.code === selectedRegion.code
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'text-gray-900 dark:text-slate-100'
              }`}
              role="option"
              aria-selected={region.code === selectedRegion.code}
            >
              <span>{region.flag}</span>
              <span className="text-gray-900 dark:text-slate-100">{region.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

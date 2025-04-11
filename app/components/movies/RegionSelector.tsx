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
  
  // 默认使用查询参数中的地区代码，或者传入的默认地区代码
  const currentRegionCode = searchParams.get('region') || defaultRegionCode;
  
  // 从本地存储中获取保存的地区偏好
  useEffect(() => {
    // 如果没有指定地区，尝试从localStorage中获取
    if (!currentRegionCode) {
      const savedRegion = localStorage.getItem('preferredRegion');
      if (savedRegion && regions.some(r => r.code === savedRegion)) {
        handleRegionChange(savedRegion);
      }
    }
  }, []);
  
  // 处理地区选择变化
  const handleRegionChange = (regionCode: string) => {
    // 保存到localStorage
    localStorage.setItem('preferredRegion', regionCode);
    
    // 更新URL查询参数
    const params = new URLSearchParams(searchParams);
    params.set('region', regionCode);
    router.replace(`${pathname}?${params.toString()}`);
  };
  
  if (regions.length === 0) {
    return null; // 如果没有地区数据，不显示选择器
  }
  
  return (
    <div className="mb-6">
      <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
        选择地区
      </label>
      <select
        id="region"
        name="region"
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        value={currentRegionCode || ''}
        onChange={(e) => handleRegionChange(e.target.value)}
      >
        <option value="">全球</option>
        {regions.map((region) => (
          <option key={region.id} value={region.code}>
            {region.name}
          </option>
        ))}
      </select>
    </div>
  );
} 
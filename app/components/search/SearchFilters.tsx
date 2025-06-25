'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface SearchFiltersProps {
  searchParams: {
    q?: string;
    type?: string;
    year?: string;
    director?: string;
    tags?: string;
    language?: string;
    page?: string;
  };
}

interface FilterOptions {
  types: { value: string; label: string; count?: number }[];
  years: { value: string; label: string; count?: number }[];
  directors: { value: string; label: string; count?: number }[];
  tags: { value: string; label: string; count?: number }[];
  languages: { value: string; label: string }[];
}

export function SearchFilters({ searchParams }: SearchFiltersProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    types: [
      { value: 'movie', label: '电影' },
      { value: 'character', label: '角色' },
      { value: 'review', label: '评论' },
      { value: 'guide', label: '观影指南' },
      { value: 'media', label: '媒体内容' },
    ],
    years: [],
    directors: [],
    tags: [],
    languages: [
      { value: 'all', label: '全部语言' },
      { value: 'en', label: 'English' },
      { value: 'ja', label: '日本語' },
      { value: 'zh', label: '中文' },
    ],
  });

  // 获取筛选选项数据
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // 获取年份选项
        const yearsResponse = await fetch('/api/movies?select=year&distinct=true');
        if (yearsResponse.ok) {
          const yearsData = await yearsResponse.json();
          const years = yearsData.movies
            ?.map((m: any) => m.year)
            .filter((year: number) => year)
            .sort((a: number, b: number) => b - a)
            .map((year: number) => ({ value: year.toString(), label: `${year}年` }));
          
          setFilterOptions(prev => ({ ...prev, years: years || [] }));
        }

        // 获取导演选项
        const directorsResponse = await fetch('/api/movies?select=director&distinct=true');
        if (directorsResponse.ok) {
          const directorsData = await directorsResponse.json();
          const directors = directorsData.movies
            ?.map((m: any) => m.director)
            .filter((director: string) => director)
            .sort()
            .map((director: string) => ({ value: director, label: director }));
          
          setFilterOptions(prev => ({ ...prev, directors: directors || [] }));
        }

        // 获取标签选项
        const tagsResponse = await fetch('/api/tags');
        if (tagsResponse.ok) {
          const tagsData = await tagsResponse.json();
          const tags = tagsData.tags
            ?.map((tag: any) => ({ value: tag.name, label: tag.name }));
          
          setFilterOptions(prev => ({ ...prev, tags: tags || [] }));
        }
      } catch (error) {
        console.error('获取筛选选项失败:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams();
    
    // 保留现有参数
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v && k !== 'page') { // 重置页码
        params.set(k, v);
      }
    });

    // 更新或删除筛选参数
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`/search?${params.toString()}`);
  };

  const clearFilter = (key: string) => {
    updateFilter(key, '');
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    if (searchParams.q) {
      params.set('q', searchParams.q);
    }
    router.push(`/search?${params.toString()}`);
  };

  const hasActiveFilters = Object.entries(searchParams).some(
    ([key, value]) => key !== 'q' && key !== 'page' && value
  );

  return (
    <div className="bg-white rounded-lg shadow">
      {/* 筛选器标题 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-500" />
            <h3 className="font-medium text-gray-900">筛选器</h3>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? '收起' : '展开'}
          </button>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            清除所有筛选
          </button>
        )}
      </div>

      {/* 筛选器内容 */}
      <div className={`${isExpanded ? 'block' : 'hidden'} lg:block`}>
        <div className="p-4 space-y-6">
          {/* 内容类型筛选 */}
          <FilterSection
            title="内容类型"
            options={filterOptions.types}
            value={searchParams.type || ''}
            onChange={(value) => updateFilter('type', value)}
            onClear={() => clearFilter('type')}
          />

          {/* 年份筛选 */}
          {filterOptions.years.length > 0 && (
            <FilterSection
              title="年份"
              options={filterOptions.years}
              value={searchParams.year || ''}
              onChange={(value) => updateFilter('year', value)}
              onClear={() => clearFilter('year')}
            />
          )}

          {/* 导演筛选 */}
          {filterOptions.directors.length > 0 && (
            <FilterSection
              title="导演"
              options={filterOptions.directors}
              value={searchParams.director || ''}
              onChange={(value) => updateFilter('director', value)}
              onClear={() => clearFilter('director')}
            />
          )}

          {/* 标签筛选 */}
          {filterOptions.tags.length > 0 && (
            <FilterSection
              title="标签"
              options={filterOptions.tags}
              value={searchParams.tags || ''}
              onChange={(value) => updateFilter('tags', value)}
              onClear={() => clearFilter('tags')}
              multiple
            />
          )}

          {/* 语言筛选 */}
          <FilterSection
            title="语言"
            options={filterOptions.languages}
            value={searchParams.language || 'all'}
            onChange={(value) => updateFilter('language', value)}
            onClear={() => clearFilter('language')}
          />
        </div>
      </div>
    </div>
  );
}

// 筛选器部分组件
interface FilterSectionProps {
  title: string;
  options: { value: string; label: string; count?: number }[];
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  multiple?: boolean;
}

function FilterSection({ title, options, value, onChange, onClear, multiple = false }: FilterSectionProps) {
  const selectedValues = multiple ? value.split(',').filter(Boolean) : [value];
  const hasSelection = selectedValues.some(v => v);

  const handleChange = (optionValue: string) => {
    if (multiple) {
      const currentValues = value.split(',').filter(Boolean);
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue];
      onChange(newValues.join(','));
    } else {
      onChange(optionValue === value ? '' : optionValue);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900">{title}</h4>
        {hasSelection && (
          <button
            onClick={onClear}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1"
          >
            <XMarkIcon className="h-3 w-3" />
            <span>清除</span>
          </button>
        )}
      </div>

      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          
          return (
            <label
              key={option.value}
              className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
            >
              <input
                type={multiple ? 'checkbox' : 'radio'}
                name={title}
                value={option.value}
                checked={isSelected}
                onChange={() => handleChange(option.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700 flex-1">
                {option.label}
                {option.count !== undefined && (
                  <span className="text-gray-500 ml-1">({option.count})</span>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

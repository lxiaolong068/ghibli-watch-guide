'use client';

import { useState, useEffect } from 'react';
import { Tag } from '@/app/types';
import { TAG_CATEGORIES } from '@/data/tag-categories';
import TagBadge from '@/app/components/ui/TagBadge';

interface TagFilterProps {
  selectedTags: string[];
  onTagsChange: (tagIds: string[]) => void;
  onCategoriesChange?: (categories: string[]) => void;
  selectedCategories?: string[];
  matchAll?: boolean;
  onMatchAllChange?: (matchAll: boolean) => void;
  className?: string;
}

export default function TagFilter({
  selectedTags,
  onTagsChange,
  onCategoriesChange,
  selectedCategories = [],
  matchAll = false,
  onMatchAllChange,
  className = ''
}: TagFilterProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [_tagsByCategory, setTagsByCategory] = useState<Record<string, Tag[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showAllTags, setShowAllTags] = useState(false);

  // 获取标签数据
  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tags?withCount=true&limit=100');
      const data = await response.json();
      
      if (data.tags) {
        setTags(data.tags);
        
        // 按分类分组
        const grouped = data.tags.reduce((acc: Record<string, Tag[]>, tag: Tag) => {
          const category = tag.category || 'other';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(tag);
          return acc;
        }, {});
        
        setTagsByCategory(grouped);
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    } finally {
      setLoading(false);
    }
  };

  // 筛选标签
  const filteredTags = tags.filter(tag => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        tag.name.toLowerCase().includes(query) ||
        tag.nameJa?.toLowerCase().includes(query) ||
        tag.nameZh?.toLowerCase().includes(query) ||
        tag.description?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // 筛选后按分类分组
  const filteredTagsByCategory = filteredTags.reduce((acc: Record<string, Tag[]>, tag: Tag) => {
    const category = tag.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(tag);
    return acc;
  }, {});

  const handleTagClick = (tag: Tag) => {
    const newSelectedTags = selectedTags.includes(tag.id)
      ? selectedTags.filter(id => id !== tag.id)
      : [...selectedTags, tag.id];
    
    onTagsChange(newSelectedTags);
  };

  const handleTagRemove = (tag: Tag) => {
    const newSelectedTags = selectedTags.filter(id => id !== tag.id);
    onTagsChange(newSelectedTags);
  };

  const _handleCategoryToggle = (category: string) => {
    if (!onCategoriesChange) return;

    const newSelectedCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];

    onCategoriesChange(newSelectedCategories);
  };

  const toggleCategoryExpansion = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const clearAllTags = () => {
    onTagsChange([]);
    if (onCategoriesChange) {
      onCategoriesChange([]);
    }
  };

  const selectedTagObjects = tags.filter(tag => selectedTags.includes(tag.id));

  if (loading) {
    return (
      <div className={`animate-pulse space-y-4 ${className}`}>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 搜索框 */}
      <div className="relative">
        <input
          type="text"
          placeholder="搜索标签..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg
          className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* 已选标签 */}
      {selectedTagObjects.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              已选标签 ({selectedTagObjects.length})
            </h4>
            <button
              onClick={clearAllTags}
              className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              清除全部
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTagObjects.map((tag) => (
              <TagBadge
                key={tag.id}
                tag={tag}
                variant="solid"
                onRemove={handleTagRemove}
              />
            ))}
          </div>
        </div>
      )}

      {/* 匹配模式选择 */}
      {onMatchAllChange && selectedTags.length > 1 && (
        <div className="flex items-center space-x-4 text-sm">
          <span className="text-gray-700 dark:text-gray-300">匹配模式:</span>
          <label className="flex items-center">
            <input
              type="radio"
              checked={!matchAll}
              onChange={() => onMatchAllChange(false)}
              className="mr-2"
            />
            任意匹配
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={matchAll}
              onChange={() => onMatchAllChange(true)}
              className="mr-2"
            />
            全部匹配
          </label>
        </div>
      )}

      {/* 显示模式切换 */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          选择标签
        </h4>
        <button
          onClick={() => setShowAllTags(!showAllTags)}
          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {showAllTags ? '按分类显示' : '显示全部'}
        </button>
      </div>

      {/* 标签列表 */}
      {showAllTags ? (
        // 显示全部标签
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {filteredTags.map((tag) => (
              <TagBadge
                key={tag.id}
                tag={tag}
                clickable
                selected={selectedTags.includes(tag.id)}
                showCount
                onClick={handleTagClick}
              />
            ))}
          </div>
        </div>
      ) : (
        // 按分类显示
        <div className="space-y-4">
          {TAG_CATEGORIES.map((categoryConfig) => {
            const categoryTags = filteredTagsByCategory[categoryConfig.key] || [];
            if (categoryTags.length === 0) return null;

            const isExpanded = expandedCategories.has(categoryConfig.key);
            const displayTags = isExpanded ? categoryTags : categoryTags.slice(0, 6);
            const hasMore = categoryTags.length > 6;

            return (
              <div key={categoryConfig.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg" role="img" aria-label={categoryConfig.nameZh}>
                      {categoryConfig.icon}
                    </span>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {categoryConfig.nameZh}
                    </h5>
                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5">
                      {categoryTags.length}
                    </span>
                  </div>
                  {hasMore && (
                    <button
                      onClick={() => toggleCategoryExpansion(categoryConfig.key)}
                      className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {isExpanded ? '收起' : '展开'}
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {displayTags.map((tag) => (
                    <TagBadge
                      key={tag.id}
                      tag={tag}
                      clickable
                      selected={selectedTags.includes(tag.id)}
                      showCount
                      onClick={handleTagClick}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 无结果提示 */}
      {filteredTags.length === 0 && searchQuery && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p>未找到匹配的标签</p>
          <p className="text-sm mt-1">尝试使用其他关键词搜索</p>
        </div>
      )}
    </div>
  );
}

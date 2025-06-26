'use client';

import { Tag } from '@/app/types';
import { getTagCategoryConfig } from '@/data/tag-categories';
import { TagCategory } from '@/app/types';

interface TagBadgeProps {
  tag: Tag;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'solid';
  showCategory?: boolean;
  showCount?: boolean;
  clickable?: boolean;
  selected?: boolean;
  onClick?: (tag: Tag) => void;
  onRemove?: (tag: Tag) => void;
  className?: string;
}

export default function TagBadge({
  tag,
  size = 'md',
  variant = 'default',
  showCategory = false,
  showCount = false,
  clickable = false,
  selected = false,
  onClick,
  onRemove,
  className = ''
}: TagBadgeProps) {
  const categoryConfig = getTagCategoryConfig(tag.category as TagCategory);
  
  // 尺寸样式
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  // 变体样式
  const getVariantClasses = () => {
    switch (variant) {
      case 'outline':
        return `border-2 bg-transparent text-gray-700 dark:text-slate-200`;
      case 'solid':
        return `text-white dark:text-white`;
      case 'default':
      default:
        return `bg-opacity-10 dark:bg-opacity-20 text-gray-800 dark:text-slate-100`;
    }
  };

  // 交互样式
  const interactiveClasses = clickable
    ? 'cursor-pointer hover:bg-opacity-20 transition-all duration-200 hover:scale-105 hover:shadow-md'
    : '';

  // 选中样式
  const selectedClasses = selected
    ? 'ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-1 dark:ring-offset-slate-800 bg-blue-50 dark:bg-blue-900/30 shadow-md'
    : '';

  // 动画样式
  const animationClasses = 'transform transition-all duration-200 ease-in-out';

  const handleClick = () => {
    if (clickable && onClick) {
      onClick(tag);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(tag);
    }
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${sizeClasses[size]}
        ${getVariantClasses()}
        ${interactiveClasses}
        ${selectedClasses}
        ${animationClasses}
        ${className}
      `}
      style={{
        backgroundColor: variant === 'solid'
          ? (tag.color || '#6B7280')
          : variant === 'outline'
            ? 'transparent'
            : `${tag.color || '#6B7280'}20`,
        borderColor: variant === 'outline' ? (tag.color || '#6B7280') : 'transparent',
        color: variant === 'solid' ? 'white' : undefined
      }}
      onClick={handleClick}
      title={tag.description || tag.name}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      } : undefined}
    >
      {/* 分类图标 */}
      {showCategory && categoryConfig && (
        <span className="text-xs" role="img" aria-label={categoryConfig.nameZh}>
          {categoryConfig.icon}
        </span>
      )}

      {/* 标签名称 */}
      <span>
        {tag.name || tag.nameZh}
      </span>

      {/* 数量显示 */}
      {showCount && tag.count !== undefined && (
        <span className="text-xs opacity-75 bg-black dark:bg-white bg-opacity-10 dark:bg-opacity-20 rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
          {tag.count}
        </span>
      )}

      {/* 移除按钮 */}
      {onRemove && (
        <button
          onClick={handleRemove}
          className="ml-1 hover:bg-black dark:hover:bg-white hover:bg-opacity-10 dark:hover:bg-opacity-20 rounded-full p-0.5 transition-colors"
          aria-label={`Remove tag ${tag.name || tag.nameZh}`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}

// 标签组组件
interface TagGroupProps {
  tags: Tag[];
  title?: string;
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'solid';
  showCategory?: boolean;
  showCount?: boolean;
  clickable?: boolean;
  selectedTags?: string[];
  onTagClick?: (tag: Tag) => void;
  onTagRemove?: (tag: Tag) => void;
  className?: string;
}

export function TagGroup({
  tags,
  title,
  maxDisplay,
  size = 'md',
  variant = 'default',
  showCategory = false,
  showCount = false,
  clickable = false,
  selectedTags = [],
  onTagClick,
  onTagRemove,
  className = ''
}: TagGroupProps) {
  const displayTags = maxDisplay ? tags.slice(0, maxDisplay) : tags;
  const remainingCount = maxDisplay && tags.length > maxDisplay ? tags.length - maxDisplay : 0;

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {title && (
        <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300">
          {title}
        </h4>
      )}
      <div className="flex flex-wrap gap-2">
        {displayTags.map((tag) => (
          <TagBadge
            key={tag.id}
            tag={tag}
            size={size}
            variant={variant}
            showCategory={showCategory}
            showCount={showCount}
            clickable={clickable}
            selected={selectedTags.includes(tag.id)}
            onClick={onTagClick}
            onRemove={onTagRemove}
          />
        ))}
        {remainingCount > 0 && (
          <span className="inline-flex items-center px-3 py-1.5 text-sm text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 rounded-full">
            +{remainingCount} more
          </span>
        )}
      </div>
    </div>
  );
}

// 按分类分组的标签显示组件
interface TagsByCategoryProps {
  tagsByCategory: Record<string, Tag[]>;
  categoryConfigs?: Record<string, unknown>;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'solid';
  showCount?: boolean;
  clickable?: boolean;
  selectedTags?: string[];
  onTagClick?: (tag: Tag) => void;
  onTagRemove?: (tag: Tag) => void;
  className?: string;
}

export function TagsByCategory({
  tagsByCategory,
  size = 'md',
  variant = 'default',
  showCount = false,
  clickable = false,
  selectedTags = [],
  onTagClick,
  onTagRemove,
  className = ''
}: TagsByCategoryProps) {
  const categories = Object.keys(tagsByCategory).filter(
    category => tagsByCategory[category].length > 0
  );

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {categories.map((category) => {
        const categoryConfig = getTagCategoryConfig(category as TagCategory);
        const categoryTitle = categoryConfig 
          ? `${categoryConfig.icon} ${categoryConfig.nameZh}` 
          : category;

        return (
          <TagGroup
            key={category}
            tags={tagsByCategory[category]}
            title={categoryTitle}
            size={size}
            variant={variant}
            showCount={showCount}
            clickable={clickable}
            selectedTags={selectedTags}
            onTagClick={onTagClick}
            onTagRemove={onTagRemove}
          />
        );
      })}
    </div>
  );
}

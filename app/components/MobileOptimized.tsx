'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

// 移动端检测Hook
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
}

// 移动端优化的容器组件
interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileContainer({ children, className = '' }: MobileContainerProps) {
  return (
    <div className={`w-full px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

// 移动端优化的卡片组件
interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export function MobileCard({ 
  children, 
  className = '', 
  padding = 'md',
  hover = true 
}: MobileCardProps) {
  const paddingClasses = {
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  };

  return (
    <div className={`
      bg-white rounded-lg shadow-sm border border-gray-200
      ${paddingClasses[padding]}
      ${hover ? 'hover:shadow-md transition-shadow duration-200' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
}

// 移动端优化的按钮组件
interface MobileButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}

export function MobileButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = ''
}: MobileButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[40px]',
    md: 'px-4 py-3 text-base min-h-[44px]',
    lg: 'px-6 py-4 text-lg min-h-[48px]'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

// 移动端优化的网格组件
interface MobileGridProps {
  children: React.ReactNode;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: number;
  className?: string;
}

export function MobileGrid({ 
  children, 
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 4,
  className = '' 
}: MobileGridProps) {
  const gridClasses = [
    'grid',
    `gap-${gap}`,
    cols.mobile && `grid-cols-${cols.mobile}`,
    cols.tablet && `md:grid-cols-${cols.tablet}`,
    cols.desktop && `lg:grid-cols-${cols.desktop}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
}

// 移动端优化的文本组件
interface MobileTextProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'gray-600' | 'gray-700' | 'gray-900';
  className?: string;
}

export function MobileText({
  children,
  size = 'base',
  weight = 'normal',
  color = 'gray-700',
  className = ''
}: MobileTextProps) {
  const sizeClasses = {
    xs: 'text-xs sm:text-sm',
    sm: 'text-sm sm:text-base',
    base: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl'
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  return (
    <div className={`
      ${sizeClasses[size]}
      ${weightClasses[weight]}
      text-${color}
      leading-relaxed
      ${className}
    `}>
      {children}
    </div>
  );
}

// 移动端优化的间距组件
interface MobileSpacingProps {
  children: React.ReactNode;
  y?: number;
  className?: string;
}

export function MobileSpacing({ children, y = 6, className = '' }: MobileSpacingProps) {
  return (
    <div className={`space-y-${y} sm:space-y-${y + 2} ${className}`}>
      {children}
    </div>
  );
}

// 移动端优化的标题组件
interface MobileTitleProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4;
  className?: string;
}

export function MobileTitle({ children, level = 1, className = '' }: MobileTitleProps) {
  const levelClasses = {
    1: 'text-2xl sm:text-3xl lg:text-4xl font-bold',
    2: 'text-xl sm:text-2xl lg:text-3xl font-semibold',
    3: 'text-lg sm:text-xl lg:text-2xl font-semibold',
    4: 'text-base sm:text-lg lg:text-xl font-medium'
  };

  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Tag className={`${levelClasses[level]} text-gray-900 leading-tight ${className}`}>
      {children}
    </Tag>
  );
}

// 移动端优化的图片组件
interface MobileImageProps {
  src: string;
  alt: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape';
  className?: string;
}

export function MobileImage({ 
  src, 
  alt, 
  aspectRatio = 'landscape',
  className = '' 
}: MobileImageProps) {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]'
  };

  return (
    <div className={`relative overflow-hidden rounded-lg ${aspectClasses[aspectRatio]} ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        loading="lazy"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}

// 移动端优化的加载状态组件
export function MobileLoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className="flex justify-center items-center py-8">
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-primary-600 ${sizeClasses[size]}`}></div>
    </div>
  );
}

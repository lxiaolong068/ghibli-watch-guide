'use client';

import Image from 'next/image';
import { useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  fallbackSrc,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
      setIsLoading(true);
    }
    
    onError?.();
  };

  // Generate default blur placeholder
  const generateBlurDataURL = (w: number, h: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, w, h);
    }
    return canvas.toDataURL();
  };

  const defaultBlurDataURL = blurDataURL || 
    (typeof window !== 'undefined' ? generateBlurDataURL(width, height) : undefined);

  if (hasError && !fallbackSrc) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">Image not available</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
          <LoadingSpinner size="sm" color="gray" />
        </div>
      )}
      
      <Image
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={defaultBlurDataURL}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}

// Movie poster specific component
export function MoviePoster({
  src,
  title,
  className = '',
  size = 'md',
  priority = false,
}: {
  src?: string | null;
  title: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  priority?: boolean;
}) {
  const dimensions = {
    sm: { width: 120, height: 180 },
    md: { width: 200, height: 300 },
    lg: { width: 300, height: 450 },
  };

  const { width, height } = dimensions[size];

  if (!src) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center rounded-lg ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm text-center px-2">
          No poster available
        </span>
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={`${title} poster`}
      width={width}
      height={height}
      className={`rounded-lg shadow-md ${className}`}
      priority={priority}
      placeholder="blur"
      fallbackSrc="/images/movie-poster-placeholder.jpg"
    />
  );
}

// Background image component
export function BackdropImage({
  src,
  title,
  className = '',
  priority = false,
}: {
  src?: string | null;
  title: string;
  className?: string;
  priority?: boolean;
}) {
  if (!src) {
    return (
      <div className={`bg-gradient-to-r from-gray-400 to-gray-600 ${className}`}>
        <div className="flex items-center justify-center h-full">
          <span className="text-white text-lg">No backdrop available</span>
        </div>
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={`${title} backdrop`}
      width={1280}
      height={720}
      className={className}
      priority={priority}
      placeholder="blur"
    />
  );
}

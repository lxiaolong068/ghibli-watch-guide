# 技术实施指南

## 📋 概述

本文档提供了 Ghibli Watch Guide 项目改进的详细技术实施指南，包括具体的代码修改、配置更新和最佳实践。

## 🚨 第一阶段：修复构建和测试问题

### 1.1 修复 ESLint 问题

#### 当前问题
```bash
./app/api/movies/[id]/route.test.ts
4:23  Warning: 'NextResponse' is defined but never used
19:7  Warning: 'mockDisconnect' is assigned a value but never used

./app/movies/[id]/page.tsx
25:6  Warning: 'MovieWithTmdbId' is defined but never used

./app/regions/page.tsx
18:9  Error: Do not use an `<a>` element to navigate to `/`. Use `<Link />` from `next/link` instead

./lib/tmdb.ts
91:17  Warning: Unexpected any. Specify a different type
```

#### 解决方案

**修复未使用变量**：
```typescript
// 修改前
import { NextRequest, NextResponse } from 'next/server';
const mockDisconnect = prisma.$disconnect as Mock;

// 修改后
import { NextRequest } from 'next/server';
const _mockDisconnect = prisma.$disconnect as Mock; // 或直接删除
```

**修复 HTML 链接问题**：
```typescript
// 修改前
<a href="/">Home</a>

// 修改后
import Link from 'next/link';
<Link href="/">Home</Link>
```

**修复 any 类型**：
```typescript
// 修改前
function handleError(error: any): string {
  return error.message;
}

// 修改后
function handleError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error occurred';
}
```

### 1.2 修复构建配置

#### 更新 next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['image.tmdb.org'],
  },
  // 移除以下配置
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-darwin-arm64',
        'node_modules/@swc/core-darwin-x64',
        'node_modules/@esbuild/darwin-arm64',
        'node_modules/@esbuild/darwin-x64',
      ],
    },
  },
};

module.exports = nextConfig;
```

### 1.3 修复测试环境

#### 更新 Prisma 配置
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma/client"
}
```

#### 修复测试配置
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    env: {
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
    },
  },
});
```

#### 更新测试设置文件
```typescript
// vitest.setup.ts
import { beforeAll, afterAll, afterEach } from 'vitest';

// 模拟 Next.js 环境变量
process.env.NODE_ENV = 'test';
process.env.TMDB_API_KEY = 'test-api-key';

// 全局测试设置
beforeAll(async () => {
  // 测试前的全局设置
});

afterAll(async () => {
  // 测试后的清理工作
});

afterEach(() => {
  // 每个测试后的清理
});
```

## 🎯 第二阶段：实现核心功能

### 2.1 地区选择功能

#### 创建地区选择组件
```typescript
// app/components/RegionSelector.tsx
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
      >
        <span>{selectedRegion.flag}</span>
        <span>{selectedRegion.name}</span>
        <ChevronDownIcon className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
          {REGIONS.map((region) => (
            <button
              key={region.code}
              onClick={() => handleRegionChange(region)}
              className="w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-md last:rounded-b-md"
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
```

### 2.2 平台信息展示

#### 创建平台信息组件
```typescript
// app/components/PlatformInfo.tsx
import Image from 'next/image';
import Link from 'next/link';

interface Platform {
  id: string;
  name: string;
  logo: string;
  type: 'streaming' | 'rental' | 'purchase';
  price?: string;
  url?: string;
}

interface PlatformInfoProps {
  platforms: Platform[];
  region: string;
}

export function PlatformInfo({ platforms, region }: PlatformInfoProps) {
  const streamingPlatforms = platforms.filter(p => p.type === 'streaming');
  const rentalPlatforms = platforms.filter(p => p.type === 'rental');
  const purchasePlatforms = platforms.filter(p => p.type === 'purchase');

  const PlatformCard = ({ platform }: { platform: Platform }) => (
    <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      <Image
        src={platform.logo}
        alt={platform.name}
        width={40}
        height={40}
        className="rounded"
      />
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{platform.name}</h4>
        {platform.price && (
          <p className="text-sm text-gray-600">{platform.price}</p>
        )}
      </div>
      {platform.url && (
        <Link
          href={platform.url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700"
        >
          Watch
        </Link>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {streamingPlatforms.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Streaming Services
          </h3>
          <div className="grid gap-3">
            {streamingPlatforms.map(platform => (
              <PlatformCard key={platform.id} platform={platform} />
            ))}
          </div>
        </div>
      )}

      {rentalPlatforms.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Rental Options
          </h3>
          <div className="grid gap-3">
            {rentalPlatforms.map(platform => (
              <PlatformCard key={platform.id} platform={platform} />
            ))}
          </div>
        </div>
      )}

      {purchasePlatforms.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Purchase Options
          </h3>
          <div className="grid gap-3">
            {purchasePlatforms.map(platform => (
              <PlatformCard key={platform.id} platform={platform} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

### 2.3 搜索功能实现

#### 创建搜索组件
```typescript
// app/components/MovieSearch.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import type { Movie } from '@prisma/client';

interface MovieSearchProps {
  placeholder?: string;
}

export function MovieSearch({ placeholder = "Search movies..." }: MovieSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchMovies = async () => {
      if (query.length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/movies/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data.movies || []);
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchMovies, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleMovieSelect = (movie: Movie) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/movies/${movie.id}`);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          ) : results.length > 0 ? (
            results.map((movie) => (
              <button
                key={movie.id}
                onClick={() => handleMovieSelect(movie)}
                className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 text-left first:rounded-t-lg last:rounded-b-lg"
              >
                {movie.posterUrl && (
                  <img
                    src={movie.posterUrl}
                    alt={movie.titleEn}
                    className="w-12 h-16 object-cover rounded"
                  />
                )}
                <div>
                  <h4 className="font-medium text-gray-900">{movie.titleEn}</h4>
                  <p className="text-sm text-gray-600">{movie.year}</p>
                </div>
              </button>
            ))
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-gray-500">No movies found</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
```

## 🔧 第三阶段：代码质量改进

### 3.1 统一项目结构

#### 迁移组件
```bash
# 将 src/components 迁移到 app/components
mv src/components/* app/components/
rm -rf src/
```

#### 整合类型定义
```typescript
// app/types/index.ts
export interface Movie {
  id: string;
  tmdbId: number;
  titleEn: string;
  titleJa: string;
  titleZh?: string;
  year: number;
  director?: string;
  duration?: number;
  synopsis?: string;
  posterUrl?: string;
  backdropUrl?: string;
  voteAverage?: number;
}

export interface Region {
  id: string;
  code: string;
  name: string;
}

export interface Platform {
  id: string;
  name: string;
  website: string;
  type: PlatformType;
  logo?: string;
}

export interface Availability {
  id: string;
  url?: string;
  price?: number;
  currency?: string;
  type: AvailabilityType;
  lastChecked: Date;
  isAvailable: boolean;
  notes?: string;
  movieId: string;
  platformId: string;
  regionId: string;
}

export enum PlatformType {
  STREAMING = 'STREAMING',
  RENTAL = 'RENTAL',
  PURCHASE = 'PURCHASE',
  FREE = 'FREE',
  CINEMA = 'CINEMA',
  PHYSICAL = 'PHYSICAL',
}

export enum AvailabilityType {
  SUBSCRIPTION = 'SUBSCRIPTION',
  RENT = 'RENT',
  BUY = 'BUY',
  FREE = 'FREE',
  CINEMA = 'CINEMA',
  LIBRARY = 'LIBRARY',
  DVD = 'DVD',
}
```

### 3.2 错误处理改进

#### 创建全局错误边界
```typescript
// app/components/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              We're sorry, but something unexpected happened.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### API 错误处理工具
```typescript
// app/lib/api-utils.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown): Response {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }

  return Response.json(
    { error: 'Unknown error occurred' },
    { status: 500 }
  );
}

export async function withErrorHandling<T>(
  handler: () => Promise<T>
): Promise<T | Response> {
  try {
    return await handler();
  } catch (error) {
    return handleApiError(error);
  }
}
```

## 🧪 第四阶段：测试策略实施

### 4.1 单元测试示例

#### 组件测试
```typescript
// app/components/__tests__/MovieList.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MovieList } from '../MovieList';
import type { Movie } from '@prisma/client';

const mockMovies: Movie[] = [
  {
    id: 'test-1',
    tmdbId: 129,
    titleEn: 'Spirited Away',
    titleJa: '千と千尋の神隠し',
    year: 2001,
    director: 'Hayao Miyazaki',
    duration: 125,
    synopsis: 'A young girl enters a magical world...',
    posterUrl: '/test-poster.jpg',
    backdropUrl: '/test-backdrop.jpg',
    voteAverage: 8.6,
    createdAt: new Date(),
    updatedAt: new Date(),
    titleZh: null,
  },
];

describe('MovieList', () => {
  it('renders movie list correctly', () => {
    render(<MovieList movies={mockMovies} />);

    expect(screen.getByText('Spirited Away')).toBeInTheDocument();
    expect(screen.getByText('2001')).toBeInTheDocument();
    expect(screen.getByText('8.6')).toBeInTheDocument();
  });

  it('handles empty movie list', () => {
    render(<MovieList movies={[]} />);

    expect(screen.getByText('Movie List')).toBeInTheDocument();
    // Should not crash with empty array
  });
});
```

#### API 路由测试改进
```typescript
// app/api/movies/search/route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma');

describe('/api/movies/search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should search movies by title', async () => {
    const mockMovies = [
      { id: '1', titleEn: 'Spirited Away', year: 2001 },
    ];

    (prisma.movie.findMany as any).mockResolvedValue(mockMovies);

    const url = new URL('http://localhost/api/movies/search?q=spirited');
    const request = new NextRequest(url);

    const response = await GET(request);
    const data = await response.json();

    expect(data.movies).toEqual(mockMovies);
    expect(prisma.movie.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { titleEn: { contains: 'spirited', mode: 'insensitive' } },
          { titleJa: { contains: 'spirited', mode: 'insensitive' } },
          { titleZh: { contains: 'spirited', mode: 'insensitive' } },
        ],
      },
      take: 10,
    });
  });
});
```

### 4.2 集成测试设置

#### 测试数据库配置
```typescript
// tests/setup/database.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL,
    },
  },
});

export async function setupTestDatabase() {
  // 清理测试数据
  await prisma.availability.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.platform.deleteMany();
  await prisma.region.deleteMany();

  // 插入测试数据
  await prisma.region.createMany({
    data: [
      { code: 'US', name: 'United States' },
      { code: 'JP', name: 'Japan' },
    ],
  });

  await prisma.platform.createMany({
    data: [
      { name: 'Netflix', website: 'https://netflix.com', type: 'STREAMING' },
      { name: 'Max', website: 'https://max.com', type: 'STREAMING' },
    ],
  });
}

export async function cleanupTestDatabase() {
  await prisma.$disconnect();
}
```

### 4.3 端到端测试

#### Playwright 配置
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

#### E2E 测试示例
```typescript
// tests/e2e/movie-search.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Movie Search', () => {
  test('should search and navigate to movie', async ({ page }) => {
    await page.goto('/');

    // 查找搜索框
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();

    // 输入搜索词
    await searchInput.fill('Spirited Away');

    // 等待搜索结果
    await page.waitForSelector('[data-testid="search-results"]');

    // 点击第一个结果
    await page.click('[data-testid="search-result"]:first-child');

    // 验证导航到电影详情页
    await expect(page).toHaveURL(/\/movies\/[a-z0-9]+/);
    await expect(page.locator('h1')).toContainText('Spirited Away');
  });

  test('should handle empty search results', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('NonexistentMovie123');

    await expect(page.locator('text=No movies found')).toBeVisible();
  });
});
```

## 🎨 第五阶段：用户体验优化

### 5.1 加载状态组件

#### 通用加载组件
```typescript
// app/components/ui/Loading.tsx
interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function Loading({ size = 'md', text, className = '' }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <div
        className={`${sizeClasses[size]} border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin`}
      />
      {text && <span className="text-gray-600">{text}</span>}
    </div>
  );
}

// 骨架屏组件
export function MovieCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-h-3 aspect-w-2 bg-gray-300 rounded-lg mb-4" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-300 rounded w-3/4" />
        <div className="h-3 bg-gray-300 rounded w-1/2" />
        <div className="h-3 bg-gray-300 rounded w-1/4" />
      </div>
    </div>
  );
}
```

### 5.2 错误状态页面

#### 404 页面
```typescript
// app/not-found.tsx
import Link from 'next/link';
import { HomeIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-md">
          Sorry, we couldn't find the page you're looking for.
          The movie might have been moved or doesn't exist.
        </p>
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <HomeIcon className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          <div>
            <Link
              href="/movies"
              className="text-primary-600 hover:text-primary-700 underline"
            >
              Browse all movies
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### 全局错误页面
```typescript
// app/error.tsx
'use client';

import { useEffect } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md">
        <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Something went wrong!
        </h2>
        <p className="text-gray-600 mb-6">
          We encountered an unexpected error. Please try again or contact support if the problem persists.
        </p>
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Go to homepage
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 5.3 无障碍性改进

#### 键盘导航支持
```typescript
// app/components/ui/FocusManager.tsx
'use client';

import { useEffect, useRef } from 'react';

interface FocusManagerProps {
  children: React.ReactNode;
  autoFocus?: boolean;
}

export function FocusManager({ children, autoFocus = false }: FocusManagerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus && containerRef.current) {
      const firstFocusable = containerRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;

      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
  }, [autoFocus]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Tab' && containerRef.current) {
      const focusableElements = containerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };

  return (
    <div ref={containerRef} onKeyDown={handleKeyDown}>
      {children}
    </div>
  );
}
```

#### ARIA 标签改进
```typescript
// app/components/MovieList.tsx (改进版本)
export const MovieList = memo(function MovieList({ movies }: MovieListProps) {
  return (
    <section
      className="bg-white shadow sm:rounded-lg"
      role="region"
      aria-labelledby="movie-list-heading"
    >
      <div className="px-4 py-5 sm:p-6">
        <h2
          id="movie-list-heading"
          className="text-lg font-medium text-gray-900"
        >
          Movie List
        </h2>
        <div
          className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
          aria-label={`${movies.length} movies available`}
        >
          {movies.map((movie, index) => (
            <article
              key={movie.id}
              className="relative flex flex-col overflow-hidden rounded-lg border border-gray-200 transition-all duration-200 ease-in-out hover:border-primary-300 hover:shadow-md"
              role="listitem"
            >
              <Link
                href={`/movies/${movie.id}`}
                className="block"
                prefetch={false}
                aria-label={`View details for ${movie.titleEn} (${movie.year})`}
              >
                {movie.posterUrl && (
                  <div className="aspect-h-3 aspect-w-2 relative overflow-hidden">
                    <Image
                      src={movie.posterUrl}
                      alt={`Poster for ${movie.titleEn}`}
                      className="object-cover object-center transition-transform duration-200 ease-in-out group-hover:scale-105"
                      fill
                      sizes={IMAGE_SIZES}
                      priority={index < 3}
                      loading={index < 3 ? "eager" : "lazy"}
                      placeholder="blur"
                      blurDataURL={OPTIMIZED_BLUR_DATA_URL}
                      quality={75}
                      fetchPriority={index < 3 ? "high" : "auto"}
                      decoding="async"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600">
                    {movie.titleEn}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    <time dateTime={movie.year.toString()}>{movie.year}</time>
                  </p>
                  <p className="mt-2 text-sm text-gray-500 line-clamp-3">
                    {movie.synopsis || 'Synopsis not available.'}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2" role="list" aria-label="Movie details">
                    <span
                      className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
                      role="listitem"
                      aria-label={`Rating: ${movie.voteAverage ? movie.voteAverage.toFixed(1) : 'Not available'}`}
                    >
                      {movie.voteAverage && movie.voteAverage > 0
                        ? movie.voteAverage.toFixed(1)
                        : 'N/A'}
                    </span>
                    <span
                      className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                      role="listitem"
                      aria-label={`Duration: ${movie.duration ? `${movie.duration} minutes` : 'Not available'}`}
                    >
                      {movie.duration ? `${movie.duration} min` : 'N/A'}
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
});
```

---

*本文档提供了完整的技术实施指南。建议按阶段逐步实施，确保每个阶段的质量后再进入下一阶段。*

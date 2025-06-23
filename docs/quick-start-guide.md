# 快速开始指南

## 🚀 立即开始改进项目

本指南帮助你快速开始 Ghibli Watch Guide 项目的改进工作。按照以下步骤，你可以在最短时间内解决最关键的问题。

## ⚡ 5分钟快速修复

### 1. 修复构建问题
```bash
# 1. 确保依赖安装完整
pnpm install

# 2. 生成 Prisma 客户端
pnpm prisma generate

# 3. 检查构建状态
pnpm build
```

如果构建失败，继续下面的步骤。

### 2. 修复 ESLint 错误
```bash
# 自动修复可修复的问题
pnpm lint --fix

# 查看剩余问题
pnpm lint
```

**手动修复常见问题**：

```typescript
// ❌ 错误：未使用的变量
import { NextRequest, NextResponse } from 'next/server';
const mockDisconnect = prisma.$disconnect as Mock;

// ✅ 正确：使用下划线前缀或删除
import { NextRequest } from 'next/server';
const _mockDisconnect = prisma.$disconnect as Mock; // 或直接删除
```

```typescript
// ❌ 错误：使用 <a> 标签
<a href="/">Home</a>

// ✅ 正确：使用 Next.js Link
import Link from 'next/link';
<Link href="/">Home</Link>
```

### 3. 修复构建配置
编辑 `next.config.js`，移除错误忽略配置：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['image.tmdb.org'],
  },
  // 移除以下两个配置
  // typescript: { ignoreBuildErrors: true },
  // eslint: { ignoreDuringBuilds: true },
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

### 4. 验证修复
```bash
# 确保构建成功
pnpm build

# 确保 lint 通过
pnpm lint

# 尝试运行测试
pnpm test
```

## 🎯 30分钟核心功能实现

### 1. 创建地区选择组件

创建 `app/components/RegionSelector.tsx`：

```typescript
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
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
];

export function RegionSelector() {
  const [selectedRegion, setSelectedRegion] = useState<Region>(REGIONS[0]);
  const [isOpen, setIsOpen] = useState(false);

  const handleRegionChange = (region: Region) => {
    setSelectedRegion(region);
    localStorage.setItem('selectedRegion', region.code);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
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
              className="w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-gray-50"
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

### 2. 添加搜索功能

创建 `app/api/movies/search/route.ts`：

```typescript
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return Response.json({ movies: [] });
  }

  try {
    const movies = await prisma.movie.findMany({
      where: {
        OR: [
          { titleEn: { contains: query, mode: 'insensitive' } },
          { titleJa: { contains: query, mode: 'insensitive' } },
          { titleZh: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        titleEn: true,
        titleJa: true,
        year: true,
        posterUrl: true,
      },
      take: 10,
    });

    return Response.json({ movies });
  } catch (error) {
    console.error('Search error:', error);
    return Response.json({ error: 'Search failed' }, { status: 500 });
  }
}
```

创建 `app/components/MovieSearch.tsx`：

```typescript
'use client';

import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export function MovieSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const searchMovies = async () => {
      if (query.length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      try {
        const response = await fetch(`/api/movies/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data.movies || []);
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
      }
    };

    const debounceTimer = setTimeout(searchMovies, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          {results.map((movie: any) => (
            <button
              key={movie.id}
              onClick={() => {
                router.push(`/movies/${movie.id}`);
                setIsOpen(false);
                setQuery('');
              }}
              className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 text-left"
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
          ))}
        </div>
      )}
    </div>
  );
}
```

### 3. 集成到主布局

更新 `app/layout.tsx`，添加地区选择器和搜索：

```typescript
import { RegionSelector } from './components/RegionSelector';
import { MovieSearch } from './components/MovieSearch';

// 在导航栏中添加
<nav className="bg-white border-b">
  <div className="container mx-auto px-4 py-3 flex justify-between items-center">
    <Breadcrumb />
    <div className="flex items-center space-x-4">
      <MovieSearch />
      <RegionSelector />
      <div className="flex space-x-4">
        <Link href="/" className="text-gray-700 hover:text-primary-600">Home</Link>
        <Link href="/movies" className="text-gray-700 hover:text-primary-600">Movies</Link>
      </div>
    </div>
  </div>
</nav>
```

## 🧪 1小时测试设置

### 1. 修复测试环境

更新 `vitest.setup.ts`：

```typescript
import { beforeAll, afterAll } from 'vitest';

// 设置测试环境变量
process.env.NODE_ENV = 'test';
process.env.TMDB_API_KEY = 'test-api-key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';

beforeAll(async () => {
  // 测试前设置
});

afterAll(async () => {
  // 测试后清理
});
```

### 2. 创建基础测试

创建 `app/components/__tests__/RegionSelector.test.tsx`：

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RegionSelector } from '../RegionSelector';

describe('RegionSelector', () => {
  it('renders default region', () => {
    render(<RegionSelector />);
    expect(screen.getByText('United States')).toBeInTheDocument();
  });

  it('opens dropdown when clicked', () => {
    render(<RegionSelector />);
    fireEvent.click(screen.getByText('United States'));
    expect(screen.getByText('Canada')).toBeInTheDocument();
  });
});
```

### 3. 运行测试

```bash
# 安装测试依赖
pnpm add -D @testing-library/react @testing-library/jest-dom

# 运行测试
pnpm test
```

## 📋 每日检查清单

### 开发开始前
- [ ] `git pull` 获取最新代码
- [ ] `pnpm install` 确保依赖最新
- [ ] `pnpm build` 确保项目可构建
- [ ] `pnpm lint` 确保代码规范

### 开发过程中
- [ ] 遵循 TypeScript 严格模式
- [ ] 使用 ESLint 推荐规则
- [ ] 为新功能编写测试
- [ ] 确保响应式设计

### 提交代码前
- [ ] `pnpm lint` 通过
- [ ] `pnpm test` 通过
- [ ] `pnpm build` 成功
- [ ] 功能在浏览器中正常工作

## 🆘 常见问题解决

### 构建失败
```bash
# 清理缓存
rm -rf .next node_modules/.cache

# 重新安装依赖
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 重新生成 Prisma 客户端
pnpm prisma generate
```

### 测试失败
```bash
# 确保测试数据库可用
pnpm prisma generate

# 清理测试缓存
pnpm test --run --reporter=verbose
```

### 类型错误
```bash
# 重新生成类型
pnpm prisma generate

# 检查 TypeScript 配置
npx tsc --noEmit
```

## 📞 获取帮助

- **文档**：查看 `docs/` 目录下的详细文档
- **问题追踪**：使用 GitHub Issues
- **代码审查**：提交 Pull Request 前请求审查

---

*按照这个指南，你应该能在2小时内完成最关键的改进工作。更详细的实施指南请参考其他文档。*

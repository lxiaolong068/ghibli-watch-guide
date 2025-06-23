// 简单的内存缓存实现
class MemoryCache {
  private cache = new Map<string, { data: unknown; expiry: number }>();
  private defaultTTL = 5 * 60 * 1000; // 5分钟默认TTL

  set<T>(key: string, data: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { data, expiry });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // 清理过期的缓存项
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  // 获取缓存统计信息
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// 全局缓存实例
export const memoryCache = new MemoryCache();

// 定期清理过期缓存
if (typeof window === 'undefined') {
  // 只在服务器端运行
  setInterval(() => {
    memoryCache.cleanup();
  }, 10 * 60 * 1000); // 每10分钟清理一次
}

// 缓存装饰器函数
export function withCache<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  options: {
    keyGenerator?: (...args: T) => string;
    ttl?: number;
  } = {}
) {
  const { keyGenerator = (...args) => JSON.stringify(args), ttl } = options;

  return async (...args: T): Promise<R> => {
    const cacheKey = `${fn.name}:${keyGenerator(...args)}`;
    
    // 尝试从缓存获取
    const cached = memoryCache.get<R>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // 执行函数并缓存结果
    const result = await fn(...args);
    memoryCache.set(cacheKey, result, ttl);
    
    return result;
  };
}

// 客户端缓存工具（使用 localStorage）
export const clientCache = {
  set<T>(key: string, data: T, ttl?: number): void {
    if (typeof window === 'undefined') return;

    const item = {
      data,
      expiry: ttl ? Date.now() + ttl : null,
    };

    try {
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  },

  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;

    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      
      if (parsed.expiry && Date.now() > parsed.expiry) {
        localStorage.removeItem(key);
        return null;
      }

      return parsed.data as T;
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return null;
    }
  },

  delete(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  },
};

// React Hook for client-side caching (需要在组件中导入 useState)
// export function useClientCache<T>(key: string, defaultValue: T) {
//   const [value, setValue] = useState<T>(() => {
//     const cached = clientCache.get<T>(key);
//     return cached !== null ? cached : defaultValue;
//   });

//   const updateValue = (newValue: T, ttl?: number) => {
//     setValue(newValue);
//     clientCache.set(key, newValue, ttl);
//   };

//   return [value, updateValue] as const;
// }

// 缓存键生成工具
export const cacheKeys = {
  movie: (id: string) => `movie:${id}`,
  movieList: (page: number, filters?: Record<string, unknown>) => 
    `movies:${page}:${JSON.stringify(filters || {})}`,
  search: (query: string) => `search:${query}`,
  availability: (movieId: string, region: string) => 
    `availability:${movieId}:${region}`,
  tmdbMovie: (tmdbId: number) => `tmdb:movie:${tmdbId}`,
  tmdbProviders: (tmdbId: number) => `tmdb:providers:${tmdbId}`,
};

// 预加载缓存工具
export const preloadCache = {
  async movies(_movieIds: string[]) {
    // 预加载电影数据的逻辑
    // 这里可以批量获取电影数据并缓存
  },

  async searchResults(_queries: string[]) {
    // 预加载搜索结果的逻辑
  },
};

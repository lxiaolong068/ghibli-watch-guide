/**
 * 搜索缓存管理工具
 * 用于缓存搜索结果，提升搜索性能
 */

// 搜索结果数据类型
export interface SearchResultData {
  results: unknown[];
  total: number;
  query?: string;
  filters?: Record<string, unknown>;
  suggestions?: string[];
  facets?: Record<string, unknown>;
}

export interface CacheItem<T = SearchResultData | string> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  hits: number;
}

export interface SearchCacheOptions {
  ttl?: number; // 缓存生存时间（毫秒）
  maxSize?: number; // 最大缓存条目数
  enableCompression?: boolean; // 是否启用压缩
}

/**
 * 搜索缓存管理类
 */
export class SearchCache {
  private cache: Map<string, CacheItem> = new Map();
  private readonly defaultTTL: number;
  private readonly maxSize: number;
  private readonly enableCompression: boolean;

  constructor(options: SearchCacheOptions = {}) {
    this.defaultTTL = options.ttl || 5 * 60 * 1000; // 默认5分钟
    this.maxSize = options.maxSize || 100; // 默认最多100个缓存项
    this.enableCompression = options.enableCompression || false;
  }

  /**
   * 生成缓存键
   * @param query 搜索查询
   * @param filters 搜索筛选条件
   * @returns 缓存键
   */
  private generateKey(query: string, filters: Record<string, unknown> = {}): string {
    const normalizedQuery = query.toLowerCase().trim();
    const sortedFilters = Object.keys(filters)
      .sort()
      .reduce((result, key) => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          result[key] = filters[key];
        }
        return result;
      }, {} as Record<string, unknown>);

    return `search:${normalizedQuery}:${JSON.stringify(sortedFilters)}`;
  }

  /**
   * 压缩数据（简单的JSON字符串压缩）
   * @param data 要压缩的数据
   * @returns 压缩后的字符串
   */
  private compress(data: SearchResultData): string {
    if (!this.enableCompression) {
      return JSON.stringify(data);
    }
    
    // 简单的压缩：移除不必要的空格和换行
    return JSON.stringify(data).replace(/\s+/g, ' ').trim();
  }

  /**
   * 解压缩数据
   * @param compressedData 压缩的数据
   * @returns 解压缩后的数据
   */
  private decompress(compressedData: string): SearchResultData {
    return JSON.parse(compressedData);
  }

  /**
   * 检查缓存项是否过期
   * @param item 缓存项
   * @returns 是否过期
   */
  private isExpired(item: CacheItem): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  /**
   * 清理过期的缓存项
   */
  private cleanup(): void {
    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 确保缓存大小不超过限制
   */
  private ensureSize(): void {
    if (this.cache.size <= this.maxSize) return;

    // 按照最少使用和最旧的顺序删除缓存项
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => {
      // 首先按命中次数排序（升序）
      const hitsDiff = a[1].hits - b[1].hits;
      if (hitsDiff !== 0) return hitsDiff;
      
      // 然后按时间戳排序（升序，最旧的在前）
      return a[1].timestamp - b[1].timestamp;
    });

    // 删除最少使用和最旧的缓存项
    const itemsToDelete = entries.slice(0, this.cache.size - this.maxSize + 1);
    itemsToDelete.forEach(([key]) => this.cache.delete(key));
  }

  /**
   * 设置缓存
   * @param query 搜索查询
   * @param data 要缓存的数据
   * @param filters 搜索筛选条件
   * @param ttl 自定义TTL（可选）
   */
  set(query: string, data: SearchResultData, filters: Record<string, unknown> = {}, ttl?: number): void {
    if (!query || query.length < 2) return;

    try {
      this.cleanup(); // 清理过期项
      this.ensureSize(); // 确保大小限制

      const key = this.generateKey(query, filters);
      const item: CacheItem = {
        data: this.enableCompression ? this.compress(data) : data,
        timestamp: Date.now(),
        ttl: ttl || this.defaultTTL,
        hits: 0
      };

      this.cache.set(key, item);
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }

  /**
   * 获取缓存
   * @param query 搜索查询
   * @param filters 搜索筛选条件
   * @returns 缓存的数据或null
   */
  get(query: string, filters: Record<string, unknown> = {}): SearchResultData | null {
    if (!query || query.length < 2) return null;

    try {
      const key = this.generateKey(query, filters);
      const item = this.cache.get(key);

      if (!item) return null;

      if (this.isExpired(item)) {
        this.cache.delete(key);
        return null;
      }

      // 增加命中次数
      item.hits++;

      // 返回数据
      return this.enableCompression ? this.decompress(item.data as string) : (item.data as SearchResultData);
    } catch (error) {
      console.error('Error getting cache:', error);
      return null;
    }
  }

  /**
   * 检查是否有缓存
   * @param query 搜索查询
   * @param filters 搜索筛选条件
   * @returns 是否有有效缓存
   */
  has(query: string, filters: Record<string, unknown> = {}): boolean {
    if (!query || query.length < 2) return false;

    const key = this.generateKey(query, filters);
    const item = this.cache.get(key);

    if (!item) return false;

    if (this.isExpired(item)) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 删除特定缓存
   * @param query 搜索查询
   * @param filters 搜索筛选条件
   */
  delete(query: string, filters: Record<string, unknown> = {}): void {
    const key = this.generateKey(query, filters);
    this.cache.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存统计信息
   * @returns 缓存统计
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    totalHits: number;
    averageAge: number;
    oldestItem: number;
    newestItem: number;
  } {
    this.cleanup(); // 先清理过期项

    const now = Date.now();
    let totalHits = 0;
    let totalAge = 0;
    let oldestTimestamp = now;
    let newestTimestamp = 0;

    for (const item of this.cache.values()) {
      totalHits += item.hits;
      totalAge += now - item.timestamp;
      oldestTimestamp = Math.min(oldestTimestamp, item.timestamp);
      newestTimestamp = Math.max(newestTimestamp, item.timestamp);
    }

    const size = this.cache.size;
    const hitRate = size > 0 ? totalHits / size : 0;
    const averageAge = size > 0 ? totalAge / size : 0;

    return {
      size,
      maxSize: this.maxSize,
      hitRate,
      totalHits,
      averageAge,
      oldestItem: size > 0 ? now - oldestTimestamp : 0,
      newestItem: size > 0 ? now - newestTimestamp : 0
    };
  }

  /**
   * 预热缓存（预加载常用搜索）
   * @param commonQueries 常用查询列表
   * @param searchFunction 搜索函数
   */
  async warmup(
    commonQueries: string[], 
    searchFunction: (query: string, filters?: Record<string, unknown>) => Promise<SearchResultData>
  ): Promise<void> {
    const promises = commonQueries.map(async (query) => {
      try {
        if (!this.has(query)) {
          const result = await searchFunction(query);
          this.set(query, result);
        }
      } catch (error) {
        console.error(`Error warming up cache for query "${query}":`, error);
      }
    });

    await Promise.all(promises);
  }
}

// 创建全局搜索缓存实例
export const searchCache = new SearchCache({
  ttl: 10 * 60 * 1000, // 10分钟
  maxSize: 200,
  enableCompression: true
});

// 创建快速搜索缓存实例（更短的TTL）
export const quickSearchCache = new SearchCache({
  ttl: 5 * 60 * 1000, // 5分钟
  maxSize: 100,
  enableCompression: true
});

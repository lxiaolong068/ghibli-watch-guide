/**
 * 搜索历史管理工具
 * 用于管理用户的搜索历史记录和热门搜索统计
 */

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
  resultCount?: number;
  category?: string;
}

export interface PopularSearchItem {
  query: string;
  count: number;
  lastSearched: number;
  category?: string;
}

const SEARCH_HISTORY_KEY = 'ghibli_search_history';
const POPULAR_SEARCHES_KEY = 'ghibli_popular_searches';
const MAX_HISTORY_ITEMS = 20;
const MAX_POPULAR_ITEMS = 50;

/**
 * 搜索历史管理类
 */
export class SearchHistoryManager {
  /**
   * 添加搜索记录到历史
   * @param query 搜索查询
   * @param resultCount 搜索结果数量
   * @param category 搜索类别
   */
  static addToHistory(query: string, resultCount?: number, category?: string): void {
    if (typeof window === 'undefined' || !query || query.length < 2) return;

    try {
      const history = this.getHistory();
      const timestamp = Date.now();

      // 移除重复的查询
      const filteredHistory = history.filter(item => 
        item.query.toLowerCase() !== query.toLowerCase()
      );

      // 添加新的搜索记录到开头
      const newItem: SearchHistoryItem = {
        query: query.trim(),
        timestamp,
        resultCount,
        category
      };

      filteredHistory.unshift(newItem);

      // 限制历史记录数量
      const limitedHistory = filteredHistory.slice(0, MAX_HISTORY_ITEMS);

      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(limitedHistory));

      // 同时更新热门搜索统计
      this.updatePopularSearches(query, category);
    } catch (error) {
      console.error('Error adding to search history:', error);
    }
  }

  /**
   * 获取搜索历史
   * @param limit 返回的最大数量
   * @returns 搜索历史列表
   */
  static getHistory(limit?: number): SearchHistoryItem[] {
    if (typeof window === 'undefined') return [];

    try {
      const historyJson = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (!historyJson) return [];

      const history: SearchHistoryItem[] = JSON.parse(historyJson);
      
      // 过滤过期的记录（超过30天）
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const validHistory = history.filter(item => item.timestamp > thirtyDaysAgo);

      // 如果过滤后的历史与原始历史不同，更新存储
      if (validHistory.length !== history.length) {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(validHistory));
      }

      return limit ? validHistory.slice(0, limit) : validHistory;
    } catch (error) {
      console.error('Error getting search history:', error);
      return [];
    }
  }

  /**
   * 清除搜索历史
   */
  static clearHistory(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  }

  /**
   * 从历史中移除特定查询
   * @param query 要移除的查询
   */
  static removeFromHistory(query: string): void {
    if (typeof window === 'undefined') return;

    try {
      const history = this.getHistory();
      const filteredHistory = history.filter(item => 
        item.query.toLowerCase() !== query.toLowerCase()
      );
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(filteredHistory));
    } catch (error) {
      console.error('Error removing from search history:', error);
    }
  }

  /**
   * 更新热门搜索统计
   * @param query 搜索查询
   * @param category 搜索类别
   */
  private static updatePopularSearches(query: string, category?: string): void {
    try {
      const popular = this.getPopularSearches();
      const queryLower = query.toLowerCase();
      const timestamp = Date.now();

      // 查找现有记录
      const existingIndex = popular.findIndex(item => 
        item.query.toLowerCase() === queryLower
      );

      if (existingIndex >= 0) {
        // 更新现有记录
        popular[existingIndex].count++;
        popular[existingIndex].lastSearched = timestamp;
        if (category) {
          popular[existingIndex].category = category;
        }
      } else {
        // 添加新记录
        popular.push({
          query: query.trim(),
          count: 1,
          lastSearched: timestamp,
          category
        });
      }

      // 按搜索次数和最近搜索时间排序
      popular.sort((a, b) => {
        const countDiff = b.count - a.count;
        if (countDiff !== 0) return countDiff;
        return b.lastSearched - a.lastSearched;
      });

      // 限制数量
      const limitedPopular = popular.slice(0, MAX_POPULAR_ITEMS);

      localStorage.setItem(POPULAR_SEARCHES_KEY, JSON.stringify(limitedPopular));
    } catch (error) {
      console.error('Error updating popular searches:', error);
    }
  }

  /**
   * 获取热门搜索
   * @param limit 返回的最大数量
   * @param minCount 最小搜索次数
   * @returns 热门搜索列表
   */
  static getPopularSearches(limit: number = 10, minCount: number = 2): PopularSearchItem[] {
    if (typeof window === 'undefined') return [];

    try {
      const popularJson = localStorage.getItem(POPULAR_SEARCHES_KEY);
      if (!popularJson) return [];

      const popular: PopularSearchItem[] = JSON.parse(popularJson);
      
      // 过滤过期的记录（超过90天）和搜索次数不足的记录
      const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
      const validPopular = popular.filter(item => 
        item.lastSearched > ninetyDaysAgo && item.count >= minCount
      );

      // 如果过滤后的数据与原始数据不同，更新存储
      if (validPopular.length !== popular.length) {
        localStorage.setItem(POPULAR_SEARCHES_KEY, JSON.stringify(validPopular));
      }

      return validPopular.slice(0, limit);
    } catch (error) {
      console.error('Error getting popular searches:', error);
      return [];
    }
  }

  /**
   * 清除热门搜索统计
   */
  static clearPopularSearches(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(POPULAR_SEARCHES_KEY);
    } catch (error) {
      console.error('Error clearing popular searches:', error);
    }
  }

  /**
   * 获取搜索建议（结合历史和热门搜索）
   * @param query 当前查询
   * @param limit 返回的最大数量
   * @returns 搜索建议列表
   */
  static getSearchSuggestions(query: string, limit: number = 5): string[] {
    if (typeof window === 'undefined' || !query) return [];

    const queryLower = query.toLowerCase();
    const suggestions: Set<string> = new Set();

    try {
      // 从历史记录中获取匹配的建议
      const history = this.getHistory();
      history.forEach(item => {
        if (item.query.toLowerCase().includes(queryLower) && 
            item.query.toLowerCase() !== queryLower) {
          suggestions.add(item.query);
        }
      });

      // 从热门搜索中获取匹配的建议
      const popular = this.getPopularSearches(20, 1);
      popular.forEach(item => {
        if (item.query.toLowerCase().includes(queryLower) && 
            item.query.toLowerCase() !== queryLower) {
          suggestions.add(item.query);
        }
      });

      return Array.from(suggestions).slice(0, limit);
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }

  /**
   * 获取搜索统计信息
   * @returns 搜索统计信息
   */
  static getSearchStats(): {
    totalSearches: number;
    uniqueQueries: number;
    averageSearchesPerDay: number;
    topCategories: { category: string; count: number }[];
  } {
    if (typeof window === 'undefined') {
      return {
        totalSearches: 0,
        uniqueQueries: 0,
        averageSearchesPerDay: 0,
        topCategories: []
      };
    }

    try {
      const history = this.getHistory();
      const popular = this.getPopularSearches(100, 1);

      const totalSearches = popular.reduce((sum, item) => sum + item.count, 0);
      const uniqueQueries = popular.length;

      // 计算平均每日搜索次数（基于最近30天）
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const recentSearches = history.filter(item => item.timestamp > thirtyDaysAgo);
      const averageSearchesPerDay = recentSearches.length / 30;

      // 统计热门类别
      const categoryCount: { [key: string]: number } = {};
      popular.forEach(item => {
        if (item.category) {
          categoryCount[item.category] = (categoryCount[item.category] || 0) + item.count;
        }
      });

      const topCategories = Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalSearches,
        uniqueQueries,
        averageSearchesPerDay: Math.round(averageSearchesPerDay * 10) / 10,
        topCategories
      };
    } catch (error) {
      console.error('Error getting search stats:', error);
      return {
        totalSearches: 0,
        uniqueQueries: 0,
        averageSearchesPerDay: 0,
        topCategories: []
      };
    }
  }
}

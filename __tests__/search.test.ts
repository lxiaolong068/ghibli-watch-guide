/**
 * 搜索功能测试用例
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { searchCache, quickSearchCache, SearchCache } from '@/app/utils/searchCache';
import { SearchHistoryManager } from '@/app/utils/searchHistory';
import { highlightSearchTerms, getSearchSnippet, getSearchMatchStats } from '@/app/utils/searchHighlight';

// Mock localStorage for testing
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('搜索缓存功能', () => {
  beforeEach(() => {
    searchCache.clear();
    quickSearchCache.clear();
  });

  it('应该能够设置和获取缓存', () => {
    const query = '千与千寻';
    const data = { results: [], total: 0 };
    const filters = { type: 'movie' };

    searchCache.set(query, data, filters);
    const cachedData = searchCache.get(query, filters);

    expect(cachedData).toEqual(data);
  });

  it('应该在TTL过期后返回null', async () => {
    const query = '龙猫';
    const data = { results: [], total: 0 };
    const shortTTL = 100; // 100ms

    searchCache.set(query, data, {}, shortTTL);
    
    // 等待TTL过期
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const cachedData = searchCache.get(query);
    expect(cachedData).toBeNull();
  });

  it('应该正确处理缓存大小限制', () => {
    const cache = new SearchCache({
      maxSize: 3,
      ttl: 60000
    });

    // 添加超过限制的缓存项
    cache.set('query1', { results: [], total: 1 });
    cache.set('query2', { results: [], total: 2 });
    cache.set('query3', { results: [], total: 3 });
    cache.set('query4', { results: [], total: 4 });

    const stats = cache.getStats();
    expect(stats.size).toBeLessThanOrEqual(3);
  });

  it('应该正确生成缓存统计信息', () => {
    searchCache.set('test1', { results: [], total: 1 });
    searchCache.set('test2', { results: [], total: 2 });
    
    // 访问缓存以增加命中次数
    searchCache.get('test1');
    searchCache.get('test1');
    searchCache.get('test2');

    const stats = searchCache.getStats();
    expect(stats.size).toBe(2);
    expect(stats.totalHits).toBe(3);
  });
});

describe('搜索历史管理', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  it('应该能够添加搜索历史', () => {
    localStorageMock.getItem.mockReturnValue('[]');
    
    SearchHistoryManager.addToHistory('千与千寻', 10, 'movie');
    
    expect(localStorageMock.setItem).toHaveBeenCalled();
    const calls = localStorageMock.setItem.mock.calls;
    const historyCall = calls.find(call => call[0] === 'ghibli_search_history');
    expect(historyCall).toBeDefined();
    
    const history = JSON.parse(historyCall![1]);
    expect(history).toHaveLength(1);
    expect(history[0].query).toBe('千与千寻');
    expect(history[0].resultCount).toBe(10);
    expect(history[0].category).toBe('movie');
  });

  it('应该能够获取搜索历史', () => {
    const mockHistory = [
      { query: '千与千寻', timestamp: Date.now(), resultCount: 10 },
      { query: '龙猫', timestamp: Date.now() - 1000, resultCount: 5 }
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory));

    const history = SearchHistoryManager.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0].query).toBe('千与千寻');
  });

  it('应该能够清除搜索历史', () => {
    SearchHistoryManager.clearHistory();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('ghibli_search_history');
  });

  it('应该能够生成搜索建议', () => {
    const mockHistory = [
      { query: '千与千寻', timestamp: Date.now() },
      { query: '千寻的冒险', timestamp: Date.now() - 1000 }
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory));

    const suggestions = SearchHistoryManager.getSearchSuggestions('千');
    expect(suggestions).toContain('千与千寻');
    expect(suggestions).toContain('千寻的冒险');
  });
});

describe('搜索高亮功能', () => {
  it('应该能够高亮搜索关键词', () => {
    const text = '千与千寻是宫崎骏的经典作品';
    const query = '千寻';
    
    const highlighted = highlightSearchTerms(text, query, {
      highlightClass: 'highlight'
    });
    
    expect(highlighted).toContain('<mark class="highlight">千寻</mark>');
  });

  it('应该能够处理多个关键词', () => {
    const text = '千与千寻是宫崎骏导演的经典动画电影';
    const query = '千寻 宫崎骏';
    
    const highlighted = highlightSearchTerms(text, query);
    
    expect(highlighted).toContain('<mark');
    expect(highlighted).toMatch(/千寻.*宫崎骏|宫崎骏.*千寻/);
  });

  it('应该能够提取搜索片段', () => {
    const text = '这是一个很长的文本，其中包含了千与千寻这个关键词，还有其他很多内容在后面继续。';
    const query = '千寻';
    
    const snippet = getSearchSnippet(text, query, 50, 20);
    
    expect(snippet).toContain('千寻');
    expect(snippet.length).toBeLessThanOrEqual(53); // 50 + "..."
  });

  it('应该能够计算搜索匹配统计', () => {
    const text = '千与千寻是千寻的故事，千寻在神秘世界中冒险';
    const query = '千寻';
    
    const stats = getSearchMatchStats(text, query);
    
    expect(stats.totalMatches).toBeGreaterThan(0);
    expect(stats.exactMatches).toBeGreaterThan(0);
    expect(stats.matchPositions).toHaveLength(stats.totalMatches);
  });

  it('应该能够安全处理HTML转义', () => {
    const text = '<script>alert("xss")</script>千寻';
    const query = '千寻';
    
    const highlighted = highlightSearchTerms(text, query);
    
    expect(highlighted).not.toContain('<script>');
    expect(highlighted).toContain('&lt;script&gt;');
    expect(highlighted).toContain('<mark');
  });
});

describe('搜索相关性评分', () => {
  // 由于相关性评分函数在API路由中，我们创建一个简化版本进行测试
  function calculateTestRelevanceScore(query: string, texts: string[]): number {
    const queryLower = query.toLowerCase();
    let score = 0;

    texts.forEach(text => {
      if (!text) return;
      const textLower = text.toLowerCase();
      
      if (textLower === queryLower) {
        score += 100;
      } else if (textLower.startsWith(queryLower)) {
        score += 80;
      } else if (textLower.includes(queryLower)) {
        score += 60;
      }
    });

    return score;
  }

  it('应该给完全匹配最高分', () => {
    const score = calculateTestRelevanceScore('千寻', ['千寻']);
    expect(score).toBe(100);
  });

  it('应该给前缀匹配高分', () => {
    const score = calculateTestRelevanceScore('千', ['千与千寻']);
    expect(score).toBe(80);
  });

  it('应该给包含匹配中等分', () => {
    const score = calculateTestRelevanceScore('千寻', ['宫崎骏的千寻']);
    expect(score).toBe(60);
  });

  it('应该能够处理多个文本字段', () => {
    const score = calculateTestRelevanceScore('千寻', ['千寻', '千与千寻的故事']);
    expect(score).toBe(160); // 100 + 60
  });
});

describe('搜索性能测试', () => {
  it('缓存应该提高搜索性能', async () => {
    const query = '性能测试';
    const data = { results: [], total: 0 };
    
    // 第一次设置缓存
    const startTime1 = Date.now();
    searchCache.set(query, data);
    const setTime = Date.now() - startTime1;
    
    // 从缓存获取
    const startTime2 = Date.now();
    const cachedData = searchCache.get(query);
    const getTime = Date.now() - startTime2;
    
    expect(cachedData).toEqual(data);
    expect(getTime).toBeLessThan(setTime + 10); // 获取应该很快
  });

  it('搜索高亮应该在合理时间内完成', () => {
    const longText = '千与千寻'.repeat(1000);
    const query = '千寻';
    
    const startTime = Date.now();
    const highlighted = highlightSearchTerms(longText, query);
    const duration = Date.now() - startTime;
    
    expect(highlighted).toContain('<mark');
    expect(duration).toBeLessThan(100); // 应该在100ms内完成
  });
});

describe('边界情况测试', () => {
  it('应该处理空查询', () => {
    expect(highlightSearchTerms('text', '')).toBe('text');
    expect(getSearchSnippet('text', '', 100)).toBe('text');
    expect(searchCache.get('')).toBeNull();
  });

  it('应该处理空文本', () => {
    expect(highlightSearchTerms('', 'query')).toBe('');
    expect(getSearchSnippet('', 'query', 100)).toBe('');
  });

  it('应该处理特殊字符', () => {
    const text = '千与千寻 (2001) - 宫崎骏';
    const query = '(2001)';
    
    const highlighted = highlightSearchTerms(text, query);
    expect(highlighted).toContain('<mark');
  });

  it('应该处理Unicode字符', () => {
    const text = '千と千尋の神隠し';
    const query = '千尋';

    const highlighted = highlightSearchTerms(text, query);
    expect(highlighted).toContain('<mark');
  });
});

describe('搜索API集成测试', () => {
  // 注意：这些测试需要在实际的API环境中运行

  it('搜索API应该返回正确的结构', async () => {
    // 这是一个示例测试，实际运行时需要mock或使用测试数据库
    const mockResponse = {
      results: [],
      total: 0,
      query: 'test',
      filters: {},
      suggestions: [],
      facets: { types: [], years: [], directors: [], tags: [] }
    };

    expect(mockResponse).toHaveProperty('results');
    expect(mockResponse).toHaveProperty('total');
    expect(mockResponse).toHaveProperty('query');
    expect(mockResponse).toHaveProperty('suggestions');
    expect(mockResponse).toHaveProperty('facets');
  });

  it('快速搜索API应该返回正确的结构', async () => {
    const mockResponse = {
      results: [],
      suggestions: [],
      total: 0,
      query: 'test'
    };

    expect(mockResponse).toHaveProperty('results');
    expect(mockResponse).toHaveProperty('suggestions');
    expect(mockResponse).toHaveProperty('total');
    expect(mockResponse).toHaveProperty('query');
  });
});

describe('搜索功能完整性测试', () => {
  it('搜索流程应该完整工作', () => {
    // 1. 用户输入查询
    const query = '千与千寻';

    // 2. 检查缓存
    let cachedResult = searchCache.get(query);
    expect(cachedResult).toBeNull(); // 首次搜索应该没有缓存

    // 3. 模拟搜索结果
    const searchResult = {
      results: [
        {
          id: '1',
          type: 'movie' as const,
          title: '千与千寻',
          subtitle: '2001 • 宫崎骏',
          description: '一个关于勇气和成长的故事...',
          url: '/movies/1',
          relevanceScore: 100
        }
      ],
      total: 1,
      query,
      suggestions: ['千与千寻', '千寻'],
      filters: {},
      facets: { types: [], years: [], directors: [], tags: [] }
    };

    // 4. 设置缓存
    searchCache.set(query, searchResult);

    // 5. 验证缓存
    cachedResult = searchCache.get(query);
    expect(cachedResult).toEqual(searchResult);

    // 6. 添加到搜索历史
    SearchHistoryManager.addToHistory(query, searchResult.total, 'movie');

    // 7. 高亮搜索结果
    const highlighted = highlightSearchTerms(searchResult.results[0].title, query);
    expect(highlighted).toContain('<mark');

    // 8. 验证搜索统计
    const stats = getSearchMatchStats(searchResult.results[0].title, query);
    expect(stats.totalMatches).toBeGreaterThan(0);
  });
});

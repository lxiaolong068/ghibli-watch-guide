/**
 * 搜索高亮显示工具函数
 * 用于在搜索结果中高亮显示匹配的关键词
 */

export interface HighlightOptions {
  caseSensitive?: boolean;
  highlightClass?: string;
  maxHighlights?: number;
  wholeWords?: boolean;
}

/**
 * 在文本中高亮显示搜索关键词（客户端版本）
 * @param text 要处理的文本
 * @param query 搜索查询
 * @param options 高亮选项
 * @returns 包含高亮标记的HTML字符串
 */
export function highlightSearchTerms(
  text: string,
  query: string,
  options: HighlightOptions = {}
): string {
  if (!text || !query || query.length < 2) {
    return typeof window !== 'undefined' ? escapeHtml(text) : escapeHtmlServer(text);
  }

  const {
    caseSensitive = false,
    highlightClass = 'search-highlight',
    maxHighlights = 10,
    wholeWords = false
  } = options;

  // 转义HTML以防止XSS攻击
  const escapedText = typeof window !== 'undefined' ? escapeHtml(text) : escapeHtmlServer(text);

  // 分割查询词
  const queryWords = query.trim().split(/\s+/).filter(word => word.length > 0);

  let highlightedText = escapedText;
  let highlightCount = 0;

  // 为每个查询词添加高亮
  queryWords.forEach(word => {
    if (highlightCount >= maxHighlights) return;

    const flags = caseSensitive ? 'g' : 'gi';
    const pattern = wholeWords
      ? new RegExp(`\\b${escapeRegExp(word)}\\b`, flags)
      : new RegExp(escapeRegExp(word), flags);

    highlightedText = highlightedText.replace(pattern, (match) => {
      if (highlightCount >= maxHighlights) return match;
      highlightCount++;
      return `<mark class="${highlightClass}">${match}</mark>`;
    });
  });

  return highlightedText;
}

/**
 * 获取包含搜索关键词的文本片段
 * @param text 完整文本
 * @param query 搜索查询
 * @param maxLength 片段最大长度
 * @param contextLength 关键词前后的上下文长度
 * @returns 包含关键词的文本片段
 */
export function getSearchSnippet(
  text: string,
  query: string,
  maxLength: number = 200,
  contextLength: number = 50
): string {
  if (!text || !query || query.length < 2) {
    return text.substring(0, maxLength);
  }

  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // 查找第一个匹配位置
  let matchIndex = textLower.indexOf(queryLower);
  
  // 如果没有完整匹配，尝试查找单词匹配
  if (matchIndex === -1) {
    const queryWords = queryLower.split(/\s+/);
    for (const word of queryWords) {
      const wordIndex = textLower.indexOf(word);
      if (wordIndex !== -1) {
        matchIndex = wordIndex;
        break;
      }
    }
  }

  // 如果仍然没有匹配，返回开头部分
  if (matchIndex === -1) {
    return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');
  }

  // 计算片段的开始和结束位置
  const start = Math.max(0, matchIndex - contextLength);
  const end = Math.min(text.length, matchIndex + query.length + contextLength);
  
  let snippet = text.substring(start, end);
  
  // 添加省略号
  if (start > 0) {
    snippet = '...' + snippet;
  }
  if (end < text.length) {
    snippet = snippet + '...';
  }

  // 如果片段太长，截断它
  if (snippet.length > maxLength) {
    snippet = snippet.substring(0, maxLength - 3) + '...';
  }

  return snippet;
}

/**
 * 转义HTML特殊字符（客户端版本）
 * @param text 要转义的文本
 * @returns 转义后的文本
 */
function escapeHtml(text: string): string {
  if (typeof window === 'undefined') {
    return escapeHtmlServer(text);
  }
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 转义正则表达式特殊字符
 * @param string 要转义的字符串
 * @returns 转义后的字符串
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 服务器端安全的HTML转义函数
 * @param text 要转义的文本
 * @returns 转义后的文本
 */
export function escapeHtmlServer(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * 服务器端搜索高亮函数
 * @param text 要处理的文本
 * @param query 搜索查询
 * @param options 高亮选项
 * @returns 包含高亮标记的HTML字符串
 */
export function highlightSearchTermsServer(
  text: string,
  query: string,
  options: HighlightOptions = {}
): string {
  if (!text || !query || query.length < 2) {
    return escapeHtmlServer(text);
  }

  const {
    caseSensitive = false,
    highlightClass = 'search-highlight',
    maxHighlights = 10,
    wholeWords = false
  } = options;

  // 转义HTML以防止XSS攻击
  const escapedText = escapeHtmlServer(text);
  
  // 分割查询词
  const queryWords = query.trim().split(/\s+/).filter(word => word.length > 0);
  
  let highlightedText = escapedText;
  let highlightCount = 0;

  // 为每个查询词添加高亮
  queryWords.forEach(word => {
    if (highlightCount >= maxHighlights) return;
    
    const flags = caseSensitive ? 'g' : 'gi';
    const pattern = wholeWords 
      ? new RegExp(`\\b${escapeRegExp(word)}\\b`, flags)
      : new RegExp(escapeRegExp(word), flags);
    
    highlightedText = highlightedText.replace(pattern, (match) => {
      if (highlightCount >= maxHighlights) return match;
      highlightCount++;
      return `<mark class="${highlightClass}">${match}</mark>`;
    });
  });

  return highlightedText;
}

/**
 * 计算搜索匹配的统计信息
 * @param text 文本内容
 * @param query 搜索查询
 * @returns 匹配统计信息
 */
export function getSearchMatchStats(text: string, query: string): {
  totalMatches: number;
  exactMatches: number;
  partialMatches: number;
  matchPositions: number[];
} {
  if (!text || !query) {
    return { totalMatches: 0, exactMatches: 0, partialMatches: 0, matchPositions: [] };
  }

  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(word => word.length > 0);
  
  let totalMatches = 0;
  let exactMatches = 0;
  let partialMatches = 0;
  const matchPositions: number[] = [];

  // 检查完整查询匹配
  let index = 0;
  while ((index = textLower.indexOf(queryLower, index)) !== -1) {
    exactMatches++;
    totalMatches++;
    matchPositions.push(index);
    index += queryLower.length;
  }

  // 检查单词匹配
  queryWords.forEach(word => {
    let wordIndex = 0;
    while ((wordIndex = textLower.indexOf(word, wordIndex)) !== -1) {
      // 检查这个匹配是否已经被完整匹配包含
      const isPartOfExactMatch = matchPositions.some(pos => 
        wordIndex >= pos && wordIndex < pos + queryLower.length
      );
      
      if (!isPartOfExactMatch) {
        partialMatches++;
        totalMatches++;
        matchPositions.push(wordIndex);
      }
      
      wordIndex += word.length;
    }
  });

  return {
    totalMatches,
    exactMatches,
    partialMatches,
    matchPositions: matchPositions.sort((a, b) => a - b)
  };
}

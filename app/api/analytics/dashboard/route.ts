import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/app/lib/error-handler';

// 将此路由标记为动态路由
export const dynamic = 'force-dynamic';

// 模拟数据存储（生产环境中应使用数据库）
interface PageView {
  path: string;
  timestamp: number;
  userId: string;
  sessionId: string;
  userAgent: string;
  referrer: string;
  duration: number;
}

interface SearchEvent {
  query: string;
  timestamp: number;
  userId: string;
  resultCount: number;
  success: boolean;
}

// 内存存储（生产环境中应使用数据库）
const pageViews: PageView[] = [];
const searchEvents: SearchEvent[] = [];

// 生成模拟数据
function generateMockData() {
  const now = Date.now();
  const daysAgo = 30 * 24 * 60 * 60 * 1000; // 30天

  // 生成页面浏览数据
  const pages = ['/', '/movies', '/characters', '/guides', '/search', '/about'];
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
    'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0'
  ];
  const referrers = ['https://google.com', 'https://bing.com', 'direct', 'https://twitter.com'];

  for (let i = 0; i < 1000; i++) {
    const timestamp = now - Math.random() * daysAgo;
    pageViews.push({
      path: pages[Math.floor(Math.random() * pages.length)],
      timestamp,
      userId: `user_${Math.floor(Math.random() * 500)}`,
      sessionId: `session_${Math.floor(Math.random() * 800)}`,
      userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
      referrer: referrers[Math.floor(Math.random() * referrers.length)],
      duration: Math.random() * 300000 // 0-5分钟
    });
  }

  // 生成搜索数据
  const queries = ['千与千寻', '龙猫', '天空之城', '魔女宅急便', '风之谷', '红猪', '幽灵公主'];
  for (let i = 0; i < 200; i++) {
    const timestamp = now - Math.random() * daysAgo;
    const query = queries[Math.floor(Math.random() * queries.length)];
    searchEvents.push({
      query,
      timestamp,
      userId: `user_${Math.floor(Math.random() * 500)}`,
      resultCount: Math.floor(Math.random() * 20),
      success: Math.random() > 0.1 // 90% 成功率
    });
  }
}

// 初始化模拟数据
if (pageViews.length === 0) {
  generateMockData();
}

/**
 * 获取分析仪表板数据
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    // 计算时间范围
    const now = Date.now();
    const timeRangeMs = days * 24 * 60 * 60 * 1000;
    const startTime = now - timeRangeMs;

    // 过滤数据
    const filteredPageViews = pageViews.filter(pv => pv.timestamp >= startTime);
    const filteredSearchEvents = searchEvents.filter(se => se.timestamp >= startTime);

    // 计算概览指标
    const uniqueUsers = new Set(filteredPageViews.map(pv => pv.userId)).size;
    const uniqueSessions = new Set(filteredPageViews.map(pv => pv.sessionId)).size;
    const totalPageViews = filteredPageViews.length;
    const averageSessionDuration = filteredPageViews.reduce((sum, pv) => sum + pv.duration, 0) / uniqueSessions;
    
    // 计算跳出率（只有一个页面浏览的会话）
    const sessionPageCounts = filteredPageViews.reduce((acc, pv) => {
      acc[pv.sessionId] = (acc[pv.sessionId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const bouncedSessions = Object.values(sessionPageCounts).filter(count => count === 1).length;
    const bounceRate = bouncedSessions / uniqueSessions;

    // 计算热门页面
    const pageStats = filteredPageViews.reduce((acc, pv) => {
      if (!acc[pv.path]) {
        acc[pv.path] = {
          views: 0,
          uniqueUsers: new Set(),
          totalTime: 0
        };
      }
      acc[pv.path].views++;
      acc[pv.path].uniqueUsers.add(pv.userId);
      acc[pv.path].totalTime += pv.duration;
      return acc;
    }, {} as Record<string, { views: number; uniqueUsers: Set<string>; totalTime: number }>);

    const topPages = Object.entries(pageStats)
      .map(([path, stats]) => ({
        path,
        views: stats.views,
        uniqueUsers: stats.uniqueUsers.size,
        averageTime: stats.totalTime / stats.views
      }))
      .sort((a, b) => b.views - a.views);

    // 计算搜索分析
    const totalSearches = filteredSearchEvents.length;
    const successfulSearches = filteredSearchEvents.filter(se => se.success).length;
    const searchSuccessRate = totalSearches > 0 ? successfulSearches / totalSearches : 0;

    const queryStats = filteredSearchEvents.reduce((acc, se) => {
      if (!acc[se.query]) {
        acc[se.query] = { count: 0, totalResults: 0 };
      }
      acc[se.query].count++;
      acc[se.query].totalResults += se.resultCount;
      return acc;
    }, {} as Record<string, { count: number; totalResults: number }>);

    const topQueries = Object.entries(queryStats)
      .map(([query, stats]) => ({
        query,
        count: stats.count,
        resultCount: Math.round(stats.totalResults / stats.count)
      }))
      .sort((a, b) => b.count - a.count);

    // 计算用户行为
    const deviceTypes = filteredPageViews.reduce((acc, pv) => {
      let deviceType = 'desktop';
      if (pv.userAgent.includes('Mobile')) deviceType = 'mobile';
      else if (pv.userAgent.includes('Tablet')) deviceType = 'tablet';
      
      acc[deviceType] = (acc[deviceType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const browsers = filteredPageViews.reduce((acc, pv) => {
      let browser = 'Other';
      if (pv.userAgent.includes('Chrome')) browser = 'Chrome';
      else if (pv.userAgent.includes('Firefox')) browser = 'Firefox';
      else if (pv.userAgent.includes('Safari')) browser = 'Safari';
      else if (pv.userAgent.includes('Edge')) browser = 'Edge';
      
      acc[browser] = (acc[browser] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const referrers = filteredPageViews.reduce((acc, pv) => {
      acc[pv.referrer] = (acc[pv.referrer] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 模拟性能数据
    const performance = {
      averageLoadTime: 1.2 + Math.random() * 0.8, // 1.2-2.0秒
      coreWebVitals: {
        lcp: 2000 + Math.random() * 1000, // 2000-3000ms
        cls: 0.05 + Math.random() * 0.1, // 0.05-0.15
        inp: 150 + Math.random() * 100 // 150-250ms
      }
    };

    const analyticsData = {
      overview: {
        totalUsers: uniqueUsers,
        totalSessions: uniqueSessions,
        totalPageViews,
        averageSessionDuration,
        bounceRate
      },
      topPages,
      searchAnalytics: {
        totalSearches,
        topQueries,
        searchSuccessRate
      },
      userBehavior: {
        deviceTypes,
        browsers,
        referrers
      },
      performance
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Error fetching analytics dashboard data:', error);
    return handleApiError(error);
  }
}

/**
 * 记录页面浏览事件
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 验证数据
    if (!data.path || !data.userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 添加页面浏览记录
    pageViews.push({
      path: data.path,
      timestamp: Date.now(),
      userId: data.userId,
      sessionId: data.sessionId || `session_${Date.now()}`,
      userAgent: data.userAgent || '',
      referrer: data.referrer || 'direct',
      duration: data.duration || 0
    });

    // 保持数据量在限制内
    if (pageViews.length > 10000) {
      pageViews.splice(0, pageViews.length - 10000);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording page view:', error);
    return handleApiError(error);
  }
}

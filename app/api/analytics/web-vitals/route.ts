import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/app/lib/error-handler';

// 将此路由标记为动态路由
export const dynamic = 'force-dynamic';

// Web Vitals 数据类型
interface WebVitalData {
  name: 'CLS' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: 'navigate' | 'reload' | 'back-forward' | 'prerender' | 'back-forward-cache' | 'restore';
  url: string;
  userAgent: string;
  timestamp: number;
}

// 内存存储（生产环境中应使用数据库）
const webVitalsData: WebVitalData[] = [];
const MAX_RECORDS = 10000; // 最大记录数

/**
 * 接收Web Vitals数据
 */
export async function POST(request: NextRequest) {
  try {
    const data: WebVitalData = await request.json();

    // 验证数据
    if (!data.name || !data.value || !data.rating) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 验证指标名称
    const validMetrics = ['CLS', 'FCP', 'LCP', 'TTFB', 'INP'];
    if (!validMetrics.includes(data.name)) {
      return NextResponse.json(
        { error: 'Invalid metric name' },
        { status: 400 }
      );
    }

    // 验证评级
    const validRatings = ['good', 'needs-improvement', 'poor'];
    if (!validRatings.includes(data.rating)) {
      return NextResponse.json(
        { error: 'Invalid rating' },
        { status: 400 }
      );
    }

    // 添加时间戳（如果没有提供）
    if (!data.timestamp) {
      data.timestamp = Date.now();
    }

    // 存储数据
    webVitalsData.push(data);

    // 保持数据量在限制内
    if (webVitalsData.length > MAX_RECORDS) {
      webVitalsData.splice(0, webVitalsData.length - MAX_RECORDS);
    }

    // 在开发环境中记录
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vitals API] Received ${data.name}: ${data.value} (${data.rating})`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing web vitals data:', error);
    return handleApiError(error);
  }
}

/**
 * 获取Web Vitals统计数据
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric');
    const timeRange = parseInt(searchParams.get('timeRange') || '24'); // 默认24小时
    const url = searchParams.get('url');

    // 计算时间范围
    const now = Date.now();
    const timeRangeMs = timeRange * 60 * 60 * 1000; // 转换为毫秒
    const startTime = now - timeRangeMs;

    // 过滤数据
    let filteredData = webVitalsData.filter(item => item.timestamp >= startTime);

    if (metric) {
      filteredData = filteredData.filter(item => item.name === metric);
    }

    if (url) {
      filteredData = filteredData.filter(item => item.url.includes(url));
    }

    // 计算统计信息
    const stats = calculateWebVitalsStats(filteredData);

    return NextResponse.json({
      stats,
      totalRecords: filteredData.length,
      timeRange: timeRange,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching web vitals stats:', error);
    return handleApiError(error);
  }
}

/**
 * 计算Web Vitals统计信息
 */
function calculateWebVitalsStats(data: WebVitalData[]) {
  if (data.length === 0) {
    return {
      byMetric: {},
      byRating: { good: 0, 'needs-improvement': 0, poor: 0 },
      byPage: {},
      trends: {}
    };
  }

  // 按指标分组统计
  const byMetric: Record<string, {
    count: number;
    average: number;
    median: number;
    p75: number;
    p95: number;
    min: number;
    max: number;
    ratings: Record<string, number>;
  }> = {};

  // 按评级统计
  const byRating = { good: 0, 'needs-improvement': 0, poor: 0 };

  // 按页面统计
  const byPage: Record<string, {
    count: number;
    averageScore: number;
    ratings: Record<string, number>;
  }> = {};

  // 按指标分组数据
  const metricGroups: Record<string, number[]> = {};

  data.forEach(item => {
    // 按指标统计
    if (!metricGroups[item.name]) {
      metricGroups[item.name] = [];
    }
    metricGroups[item.name].push(item.value);

    // 按评级统计
    byRating[item.rating]++;

    // 按页面统计
    const pageUrl = new URL(item.url).pathname;
    if (!byPage[pageUrl]) {
      byPage[pageUrl] = {
        count: 0,
        averageScore: 0,
        ratings: { good: 0, 'needs-improvement': 0, poor: 0 }
      };
    }
    byPage[pageUrl].count++;
    byPage[pageUrl].ratings[item.rating]++;
  });

  // 计算每个指标的统计信息
  Object.entries(metricGroups).forEach(([metric, values]) => {
    const sorted = values.sort((a, b) => a - b);
    const count = values.length;

    byMetric[metric] = {
      count,
      average: values.reduce((sum, val) => sum + val, 0) / count,
      median: sorted[Math.floor(count / 2)],
      p75: sorted[Math.floor(count * 0.75)],
      p95: sorted[Math.floor(count * 0.95)],
      min: sorted[0],
      max: sorted[count - 1],
      ratings: { good: 0, 'needs-improvement': 0, poor: 0 }
    };

    // 计算每个指标的评级分布
    data.filter(item => item.name === metric).forEach(item => {
      byMetric[metric].ratings[item.rating]++;
    });
  });

  // 计算每个页面的平均分数
  Object.keys(byPage).forEach(pageUrl => {
    const pageData = byPage[pageUrl];
    const totalRatings = pageData.ratings.good + pageData.ratings['needs-improvement'] + pageData.ratings.poor;
    
    if (totalRatings > 0) {
      pageData.averageScore = Math.round(
        (pageData.ratings.good * 100 + pageData.ratings['needs-improvement'] * 50) / totalRatings
      );
    }
  });

  // 计算趋势（简化版本）
  const trends = calculateTrends(data);

  return {
    byMetric,
    byRating,
    byPage,
    trends
  };
}

/**
 * 计算趋势数据
 */
function calculateTrends(data: WebVitalData[]) {
  // 按小时分组
  const hourlyData: Record<string, WebVitalData[]> = {};
  
  data.forEach(item => {
    const hour = new Date(item.timestamp).toISOString().slice(0, 13); // YYYY-MM-DDTHH
    if (!hourlyData[hour]) {
      hourlyData[hour] = [];
    }
    hourlyData[hour].push(item);
  });

  // 计算每小时的平均性能分数
  const hourlyScores: Array<{ hour: string; score: number; count: number }> = [];

  Object.entries(hourlyData).forEach(([hour, hourData]) => {
    const goodCount = hourData.filter(item => item.rating === 'good').length;
    const needsImprovementCount = hourData.filter(item => item.rating === 'needs-improvement').length;
    const _poorCount = hourData.filter(item => item.rating === 'poor').length;
    const total = hourData.length;

    const score = total > 0 ? Math.round((goodCount * 100 + needsImprovementCount * 50) / total) : 0;

    hourlyScores.push({
      hour,
      score,
      count: total
    });
  });

  return {
    hourly: hourlyScores.sort((a, b) => a.hour.localeCompare(b.hour))
  };
}

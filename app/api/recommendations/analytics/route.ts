/**
 * 推荐系统分析API
 * 提供推荐效果指标和优化建议
 */

import { NextRequest, NextResponse } from 'next/server';
import { RecommendationAnalytics } from '@/app/utils/recommendation-analytics';
import { handleApiError } from '@/app/lib/error-handler';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const includeOptimization = searchParams.get('optimization') === 'true';

    const analytics = new RecommendationAnalytics();
    
    // 设置时间范围
    const timeRange = {
      start: Date.now() - days * 24 * 60 * 60 * 1000,
      end: Date.now(),
    };

    // 分析推荐效果
    const metrics = await analytics.analyzeRecommendationPerformance(timeRange);
    
    // 生成优化建议（如果需要）
    let optimizationSuggestions = null;
    if (includeOptimization) {
      optimizationSuggestions = analytics.generateOptimizationSuggestions(metrics);
    }

    // 获取历史数据趋势
    const historicalMetrics = analytics.getHistoricalMetrics(days);
    
    // 计算趋势指标
    const trends = calculateTrends(historicalMetrics);

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        trends,
        optimizationSuggestions,
        timeRange,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Recommendation analytics error:', error);
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    const analytics = new RecommendationAnalytics();

    switch (action) {
      case 'record_metrics':
        // 记录推荐效果数据
        analytics.recordRecommendationMetrics(data.metrics);
        return NextResponse.json({
          success: true,
          message: 'Metrics recorded successfully',
        });

      case 'analyze_performance':
        // 分析特定时间段的推荐效果
        const timeRange = data.timeRange || {
          start: Date.now() - 7 * 24 * 60 * 60 * 1000,
          end: Date.now(),
        };
        
        const metrics = await analytics.analyzeRecommendationPerformance(timeRange);
        const suggestions = analytics.generateOptimizationSuggestions(metrics);

        return NextResponse.json({
          success: true,
          data: {
            metrics,
            suggestions,
            timeRange,
          },
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Recommendation analytics POST error:', error);
    return handleApiError(error);
  }
}

/**
 * 计算趋势指标
 */
function calculateTrends(historicalMetrics: any[]) {
  if (historicalMetrics.length < 2) {
    return {
      clickThroughRate: { trend: 'stable', change: 0 },
      engagementRate: { trend: 'stable', change: 0 },
      userSatisfaction: { trend: 'stable', change: 0 },
    };
  }

  const recent = historicalMetrics.slice(-7); // 最近7天
  const previous = historicalMetrics.slice(-14, -7); // 前7天

  const recentAvg = {
    clickThroughRate: recent.reduce((sum, m) => sum + m.clickThroughRate, 0) / recent.length,
    engagementRate: recent.reduce((sum, m) => sum + m.engagementRate, 0) / recent.length,
    userSatisfaction: recent.reduce((sum, m) => sum + (m.userSatisfaction?.diversityScore || 0), 0) / recent.length,
  };

  const previousAvg = {
    clickThroughRate: previous.reduce((sum, m) => sum + m.clickThroughRate, 0) / previous.length,
    engagementRate: previous.reduce((sum, m) => sum + m.engagementRate, 0) / previous.length,
    userSatisfaction: previous.reduce((sum, m) => sum + (m.userSatisfaction?.diversityScore || 0), 0) / previous.length,
  };

  const calculateTrend = (recent: number, previous: number) => {
    const change = ((recent - previous) / Math.max(previous, 0.001)) * 100;
    let trend = 'stable';
    
    if (change > 5) trend = 'improving';
    else if (change < -5) trend = 'declining';
    
    return { trend, change: Math.round(change * 100) / 100 };
  };

  return {
    clickThroughRate: calculateTrend(recentAvg.clickThroughRate, previousAvg.clickThroughRate),
    engagementRate: calculateTrend(recentAvg.engagementRate, previousAvg.engagementRate),
    userSatisfaction: calculateTrend(recentAvg.userSatisfaction, previousAvg.userSatisfaction),
  };
}

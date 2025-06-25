'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RecommendationMetrics, OptimizationSuggestion } from '@/app/utils/recommendation-analytics';

interface DashboardData {
  metrics: RecommendationMetrics;
  trends: {
    clickThroughRate: { trend: string; change: number };
    engagementRate: { trend: string; change: number };
    userSatisfaction: { trend: string; change: number };
  };
  optimizationSuggestions: OptimizationSuggestion[];
  timeRange: { start: number; end: number };
  generatedAt: string;
}

export function RecommendationDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState(30); // 默认30天

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/recommendations/analytics?days=${timeRange}&optimization=true`
      );

      if (!response.ok) {
        throw new Error('获取推荐分析数据失败');
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);



  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600';
      case 'declining': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <p className="text-gray-500 text-center">暂无数据</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 标题和时间范围选择 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">推荐系统分析仪表板</h1>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value={7}>最近7天</option>
            <option value={30}>最近30天</option>
            <option value={90}>最近90天</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            刷新
          </button>
        </div>
      </div>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">点击率</p>
              <p className="text-2xl font-bold text-gray-900">
                {(data.metrics.clickThroughRate * 100).toFixed(1)}%
              </p>
            </div>
            <div className={`flex items-center ${getTrendColor(data.trends.clickThroughRate.trend)}`}>
              <span className="mr-1">{getTrendIcon(data.trends.clickThroughRate.trend)}</span>
              <span className="text-sm font-medium">
                {data.trends.clickThroughRate.change > 0 ? '+' : ''}{data.trends.clickThroughRate.change}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">参与率</p>
              <p className="text-2xl font-bold text-gray-900">
                {(data.metrics.engagementRate * 100).toFixed(1)}%
              </p>
            </div>
            <div className={`flex items-center ${getTrendColor(data.trends.engagementRate.trend)}`}>
              <span className="mr-1">{getTrendIcon(data.trends.engagementRate.trend)}</span>
              <span className="text-sm font-medium">
                {data.trends.engagementRate.change > 0 ? '+' : ''}{data.trends.engagementRate.change}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">用户满意度</p>
              <p className="text-2xl font-bold text-gray-900">
                {(data.metrics.userSatisfaction.diversityScore * 100).toFixed(0)}
              </p>
            </div>
            <div className={`flex items-center ${getTrendColor(data.trends.userSatisfaction.trend)}`}>
              <span className="mr-1">{getTrendIcon(data.trends.userSatisfaction.trend)}</span>
              <span className="text-sm font-medium">
                {data.trends.userSatisfaction.change > 0 ? '+' : ''}{data.trends.userSatisfaction.change}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 详细统计 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 算法效果对比 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">算法效果对比</h3>
          <div className="space-y-3">
            {data.metrics.algorithmPerformance.map((algo) => (
              <div key={algo.algorithm} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                  <span className="font-medium capitalize">{algo.algorithm}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {(algo.clickThroughRate * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {algo.totalRecommendations} 推荐
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 内容类型效果 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">内容类型效果</h3>
          <div className="space-y-3">
            {data.metrics.contentTypeAnalysis.map((content) => (
              <div key={content.contentType} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                  <span className="font-medium capitalize">{content.contentType}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {(content.clickThroughRate * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {content.totalRecommendations} 推荐
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 优化建议 */}
      {data.optimizationSuggestions && data.optimizationSuggestions.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">优化建议</h3>
          <div className="space-y-4">
            {data.optimizationSuggestions.map((suggestion, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(suggestion.priority)}`}>
                      {suggestion.priority}
                    </span>
                    <span className="ml-3 font-medium text-gray-900">
                      预期改善: +{suggestion.expectedImprovement}%
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 mb-2">{suggestion.description}</p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>实施方案:</strong> {suggestion.implementation}
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestion.metrics.map((metric) => (
                    <span
                      key={metric}
                      className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                    >
                      {metric}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 数据更新时间 */}
      <div className="text-center text-sm text-gray-500">
        数据更新时间: {new Date(data.generatedAt).toLocaleString('zh-CN')}
      </div>
    </div>
  );
}

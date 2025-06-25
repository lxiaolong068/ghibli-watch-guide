'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';
import { ErrorMessage } from '@/app/components/ErrorMessage';

// 性能数据类型
interface PerformanceStats {
  byMetric: Record<string, {
    count: number;
    average: number;
    median: number;
    p75: number;
    p95: number;
    min: number;
    max: number;
    ratings: Record<string, number>;
  }>;
  byRating: {
    good: number;
    'needs-improvement': number;
    poor: number;
  };
  byPage: Record<string, {
    count: number;
    averageScore: number;
    ratings: Record<string, number>;
  }>;
  trends: {
    hourly: Array<{
      hour: string;
      score: number;
      count: number;
    }>;
  };
}

interface PerformanceData {
  stats: PerformanceStats;
  totalRecords: number;
  timeRange: number;
  generatedAt: string;
}

/**
 * 性能监控仪表板页面
 */
export default function PerformanceDashboard() {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState(24); // 默认24小时
  const [selectedMetric, setSelectedMetric] = useState<string>('');

  const fetchPerformanceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        timeRange: timeRange.toString(),
      });

      if (selectedMetric) {
        params.append('metric', selectedMetric);
      }

      const response = await fetch(`/api/analytics/web-vitals?${params}`);
      
      if (!response.ok) {
        throw new Error('获取性能数据失败');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  }, [timeRange, selectedMetric]);

  useEffect(() => {
    fetchPerformanceData();
  }, [fetchPerformanceData]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage
          message={error}
          action={{
            label: '重试',
            onClick: fetchPerformanceData
          }}
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-500">
          暂无性能数据
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          性能监控仪表板
        </h1>
        
        {/* 控制面板 */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              时间范围
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(parseInt(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value={1}>过去1小时</option>
              <option value={6}>过去6小时</option>
              <option value={24}>过去24小时</option>
              <option value={168}>过去7天</option>
              <option value={720}>过去30天</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              指标筛选
            </label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">所有指标</option>
              <option value="LCP">LCP (最大内容绘制)</option>
              <option value="CLS">CLS (累积布局偏移)</option>
              <option value="FCP">FCP (首次内容绘制)</option>
              <option value="TTFB">TTFB (首字节时间)</option>
              <option value="INP">INP (交互到下次绘制)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchPerformanceData}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              刷新数据
            </button>
          </div>
        </div>

        {/* 数据概览 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">总记录数</h3>
            <p className="text-3xl font-bold text-blue-600">{data.totalRecords}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">良好评级</h3>
            <p className="text-3xl font-bold text-green-600">
              {data.stats.byRating.good}
            </p>
            <p className="text-sm text-gray-500">
              {data.totalRecords > 0 
                ? `${Math.round((data.stats.byRating.good / data.totalRecords) * 100)}%`
                : '0%'
              }
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">需要改进</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {data.stats.byRating['needs-improvement']}
            </p>
            <p className="text-sm text-gray-500">
              {data.totalRecords > 0 
                ? `${Math.round((data.stats.byRating['needs-improvement'] / data.totalRecords) * 100)}%`
                : '0%'
              }
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">较差评级</h3>
            <p className="text-3xl font-bold text-red-600">
              {data.stats.byRating.poor}
            </p>
            <p className="text-sm text-gray-500">
              {data.totalRecords > 0 
                ? `${Math.round((data.stats.byRating.poor / data.totalRecords) * 100)}%`
                : '0%'
              }
            </p>
          </div>
        </div>

        {/* 按指标统计 */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">按指标统计</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    指标
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    记录数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    平均值
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    中位数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    P75
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    P95
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(data.stats.byMetric).map(([metric, stats]) => (
                  <tr key={metric}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {metric}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stats.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stats.average.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stats.median.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stats.p75.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stats.p95.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 按页面统计 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">按页面统计</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    页面
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    记录数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    平均分数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    良好
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    需要改进
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    较差
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(data.stats.byPage).map(([page, stats]) => (
                  <tr key={page}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {page}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stats.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        stats.averageScore >= 80 
                          ? 'bg-green-100 text-green-800'
                          : stats.averageScore >= 50
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {stats.averageScore}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stats.ratings.good}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stats.ratings['needs-improvement']}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stats.ratings.poor}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 数据生成时间 */}
        <div className="text-sm text-gray-500 mt-4">
          数据生成时间: {new Date(data.generatedAt).toLocaleString('zh-CN')}
        </div>
      </div>
    </div>
  );
}

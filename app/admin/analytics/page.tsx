'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';
import { ErrorMessage } from '@/app/components/ErrorMessage';

// 分析数据类型
interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalSessions: number;
    totalPageViews: number;
    averageSessionDuration: number;
    bounceRate: number;
  };
  topPages: Array<{
    path: string;
    views: number;
    uniqueUsers: number;
    averageTime: number;
  }>;
  searchAnalytics: {
    totalSearches: number;
    topQueries: Array<{
      query: string;
      count: number;
      resultCount: number;
    }>;
    searchSuccessRate: number;
  };
  userBehavior: {
    deviceTypes: Record<string, number>;
    browsers: Record<string, number>;
    referrers: Record<string, number>;
  };
  performance: {
    averageLoadTime: number;
    coreWebVitals: {
      lcp: number;
      cls: number;
      inp: number;
    };
  };
}

/**
 * 内部分析仪表板页面
 */
export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState(7); // 默认7天
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/analytics/dashboard?days=${timeRange}`);
      
      if (!response.ok) {
        throw new Error('获取分析数据失败');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // 自动刷新功能
  useEffect(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }

    const interval = setInterval(() => {
      fetchAnalyticsData();
    }, 5 * 60 * 1000); // 每5分钟刷新一次

    setRefreshInterval(interval);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [fetchAnalyticsData]);

  if (loading && !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage 
          message={error}
          action={{
            label: '重试',
            onClick: fetchAnalyticsData
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          分析仪表板
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
              <option value={1}>今天</option>
              <option value={7}>过去7天</option>
              <option value={30}>过去30天</option>
              <option value={90}>过去90天</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchAnalyticsData}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '刷新中...' : '刷新数据'}
            </button>
          </div>
        </div>

        {data && (
          <>
            {/* 概览指标 */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">总用户数</h3>
                <p className="text-3xl font-bold text-blue-600">{data.overview.totalUsers.toLocaleString()}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">总会话数</h3>
                <p className="text-3xl font-bold text-green-600">{data.overview.totalSessions.toLocaleString()}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">页面浏览量</h3>
                <p className="text-3xl font-bold text-purple-600">{data.overview.totalPageViews.toLocaleString()}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">平均会话时长</h3>
                <p className="text-3xl font-bold text-orange-600">
                  {Math.round(data.overview.averageSessionDuration / 60)}分钟
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">跳出率</h3>
                <p className="text-3xl font-bold text-red-600">
                  {(data.overview.bounceRate * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* 热门页面 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">热门页面</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          页面
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          浏览量
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          独立用户
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          平均时长
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.topPages.slice(0, 10).map((page, index) => (
                        <tr key={index}>
                          <td className="px-4 py-4 text-sm text-gray-900 truncate max-w-xs">
                            {page.path}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            {page.views.toLocaleString()}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            {page.uniqueUsers.toLocaleString()}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            {Math.round(page.averageTime / 60)}分钟
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 搜索分析 */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">搜索分析</h2>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">总搜索次数</span>
                    <span className="text-lg font-bold text-blue-600">
                      {data.searchAnalytics.totalSearches.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium text-gray-700">搜索成功率</span>
                    <span className="text-lg font-bold text-green-600">
                      {(data.searchAnalytics.searchSuccessRate * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 mb-3">热门搜索词</h3>
                <div className="space-y-2">
                  {data.searchAnalytics.topQueries.slice(0, 8).map((query, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-900 truncate flex-1 mr-2">
                        {query.query}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {query.count}次
                        </span>
                        <span className="text-xs text-gray-400">
                          ({query.resultCount}结果)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 用户行为和性能 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 用户行为 */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">用户行为</h2>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">设备类型</h3>
                  <div className="space-y-2">
                    {Object.entries(data.userBehavior.deviceTypes).map(([device, count]) => (
                      <div key={device} className="flex justify-between items-center">
                        <span className="text-sm text-gray-900 capitalize">{device}</span>
                        <span className="text-sm text-gray-500">{count.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">浏览器</h3>
                  <div className="space-y-2">
                    {Object.entries(data.userBehavior.browsers).slice(0, 5).map(([browser, count]) => (
                      <div key={browser} className="flex justify-between items-center">
                        <span className="text-sm text-gray-900">{browser}</span>
                        <span className="text-sm text-gray-500">{count.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">流量来源</h3>
                  <div className="space-y-2">
                    {Object.entries(data.userBehavior.referrers).slice(0, 5).map(([referrer, count]) => (
                      <div key={referrer} className="flex justify-between items-center">
                        <span className="text-sm text-gray-900 truncate flex-1 mr-2">{referrer}</span>
                        <span className="text-sm text-gray-500">{count.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 性能指标 */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">性能指标</h2>
                
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">平均加载时间</span>
                    <span className="text-lg font-bold text-blue-600">
                      {data.performance.averageLoadTime.toFixed(2)}秒
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Core Web Vitals</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">LCP (最大内容绘制)</span>
                      <span className={`text-sm font-medium ${
                        data.performance.coreWebVitals.lcp <= 2500 
                          ? 'text-green-600' 
                          : data.performance.coreWebVitals.lcp <= 4000 
                          ? 'text-yellow-600' 
                          : 'text-red-600'
                      }`}>
                        {data.performance.coreWebVitals.lcp.toFixed(0)}ms
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">CLS (累积布局偏移)</span>
                      <span className={`text-sm font-medium ${
                        data.performance.coreWebVitals.cls <= 0.1 
                          ? 'text-green-600' 
                          : data.performance.coreWebVitals.cls <= 0.25 
                          ? 'text-yellow-600' 
                          : 'text-red-600'
                      }`}>
                        {data.performance.coreWebVitals.cls.toFixed(3)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">INP (交互到下次绘制)</span>
                      <span className={`text-sm font-medium ${
                        data.performance.coreWebVitals.inp <= 200 
                          ? 'text-green-600' 
                          : data.performance.coreWebVitals.inp <= 500 
                          ? 'text-yellow-600' 
                          : 'text-red-600'
                      }`}>
                        {data.performance.coreWebVitals.inp.toFixed(0)}ms
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 最后更新时间 */}
            <div className="text-sm text-gray-500 mt-6 text-center">
              最后更新: {new Date().toLocaleString('zh-CN')}
              {refreshInterval && ' • 自动刷新: 每5分钟'}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

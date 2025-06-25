'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';
import { ErrorMessage } from '@/app/components/ErrorMessage';

// 告警类型定义
interface Alert {
  id: string;
  type: 'performance' | 'error' | 'availability';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: number;
  resolved: boolean;
  metadata?: Record<string, unknown>;
}

interface AlertStats {
  total: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  resolved: number;
  active: number;
}

interface AlertsData {
  alerts: Alert[];
  stats: AlertStats;
  total: number;
}

/**
 * 告警管理页面
 */
export default function AlertsPage() {
  const [data, setData] = useState<AlertsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    activeOnly: true,
    timeRange: 24,
    type: '',
    severity: ''
  });

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        active: filters.activeOnly.toString(),
        timeRange: filters.timeRange.toString(),
      });

      if (filters.type) params.append('type', filters.type);
      if (filters.severity) params.append('severity', filters.severity);

      const response = await fetch(`/api/alerts?${params}`);
      
      if (!response.ok) {
        throw new Error('获取告警数据失败');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // 自动刷新
  useEffect(() => {
    const interval = setInterval(fetchAlerts, 30000); // 每30秒刷新
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const handleBatchAction = async (action: 'resolve' | 'delete') => {
    if (selectedAlerts.length === 0) return;

    try {
      const response = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          alertIds: selectedAlerts
        })
      });

      if (!response.ok) {
        throw new Error(`${action === 'resolve' ? '解决' : '删除'}告警失败`);
      }

      setSelectedAlerts([]);
      fetchAlerts();
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance': return '⚡';
      case 'error': return '❌';
      case 'availability': return '🔴';
      default: return '⚠️';
    }
  };

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
            onClick: fetchAlerts
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          告警管理
        </h1>
        
        {/* 统计概览 */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-700">总告警数</h3>
              <p className="text-2xl font-bold text-gray-900">{data.stats.total}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-700">活跃告警</h3>
              <p className="text-2xl font-bold text-red-600">{data.stats.active}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-700">已解决</h3>
              <p className="text-2xl font-bold text-green-600">{data.stats.resolved}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-700">严重告警</h3>
              <p className="text-2xl font-bold text-red-600">
                {data.stats.bySeverity.critical || 0}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-700">性能告警</h3>
              <p className="text-2xl font-bold text-orange-600">
                {data.stats.byType.performance || 0}
              </p>
            </div>
          </div>
        )}

        {/* 过滤器和操作 */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  状态
                </label>
                <select
                  value={filters.activeOnly ? 'active' : 'all'}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    activeOnly: e.target.value === 'active' 
                  }))}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="active">仅活跃</option>
                  <option value="all">全部</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  时间范围
                </label>
                <select
                  value={filters.timeRange}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    timeRange: parseInt(e.target.value) 
                  }))}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value={1}>过去1小时</option>
                  <option value={6}>过去6小时</option>
                  <option value={24}>过去24小时</option>
                  <option value={168}>过去7天</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  类型
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    type: e.target.value 
                  }))}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">全部类型</option>
                  <option value="performance">性能</option>
                  <option value="error">错误</option>
                  <option value="availability">可用性</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  严重程度
                </label>
                <select
                  value={filters.severity}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    severity: e.target.value 
                  }))}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">全部级别</option>
                  <option value="critical">严重</option>
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              {selectedAlerts.length > 0 && (
                <>
                  <button
                    onClick={() => handleBatchAction('resolve')}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                  >
                    解决选中 ({selectedAlerts.length})
                  </button>
                  <button
                    onClick={() => handleBatchAction('delete')}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
                  >
                    删除选中
                  </button>
                </>
              )}
              <button
                onClick={fetchAlerts}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
              >
                {loading ? '刷新中...' : '刷新'}
              </button>
            </div>
          </div>
        </div>

        {/* 告警列表 */}
        {data && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {data.alerts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                没有找到符合条件的告警
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedAlerts.length === data.alerts.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAlerts(data.alerts.map(alert => alert.id));
                            } else {
                              setSelectedAlerts([]);
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        告警
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        类型
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        严重程度
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        时间
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        状态
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.alerts.map((alert) => (
                      <tr key={alert.id} className={alert.resolved ? 'opacity-60' : ''}>
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedAlerts.includes(alert.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAlerts(prev => [...prev, alert.id]);
                              } else {
                                setSelectedAlerts(prev => prev.filter(id => id !== alert.id));
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {alert.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {alert.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="mr-2">{getTypeIcon(alert.type)}</span>
                            <span className="text-sm text-gray-900 capitalize">
                              {alert.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(alert.severity)}`}>
                            {alert.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(alert.timestamp).toLocaleString('zh-CN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            alert.resolved 
                              ? 'text-green-800 bg-green-100' 
                              : 'text-red-800 bg-red-100'
                          }`}>
                            {alert.resolved ? '已解决' : '活跃'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 最后更新时间 */}
        <div className="text-sm text-gray-500 mt-4 text-center">
          最后更新: {new Date().toLocaleString('zh-CN')} • 自动刷新: 每30秒
        </div>
      </div>
    </div>
  );
}

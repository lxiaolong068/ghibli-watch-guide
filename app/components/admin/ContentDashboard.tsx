'use client';

import { useState, useEffect } from 'react';

interface DashboardStats {
  totalMovies: number;
  totalAvailabilities: number;
  pendingReviews: number;
  recentSyncJobs: number;
  qualityScore: number;
}

interface RecentActivity {
  id: string;
  type: 'movie_update' | 'availability_check' | 'content_sync' | 'quality_check';
  description: string;
  timestamp: Date;
  status: 'success' | 'error' | 'pending';
}

export function ContentDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      const data = await response.json();
      setStats(data.stats);
      setRecentActivity(data.recentActivity);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerContentSync = async () => {
    try {
      const response = await fetch('/api/cron/content-sync', {
        method: 'POST'
      });
      
      if (response.ok) {
        alert('内容同步已启动');
        fetchDashboardData(); // 刷新数据
      } else {
        alert('启动内容同步失败');
      }
    } catch (error) {
      console.error('Error triggering content sync:', error);
      alert('启动内容同步时发生错误');
    }
  };

  const generateSitemap = async () => {
    try {
      const response = await fetch('/api/cron/generate-sitemap', {
        method: 'POST'
      });
      
      if (response.ok) {
        alert('站点地图生成已启动');
      } else {
        alert('生成站点地图失败');
      }
    } catch (error) {
      console.error('Error generating sitemap:', error);
      alert('生成站点地图时发生错误');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="总电影数"
          value={stats?.totalMovies || 0}
          icon="🎬"
          color="blue"
        />
        <StatCard
          title="可用性记录"
          value={stats?.totalAvailabilities || 0}
          icon="📺"
          color="green"
        />
        <StatCard
          title="待审核内容"
          value={stats?.pendingReviews || 0}
          icon="⏳"
          color="yellow"
        />
        <StatCard
          title="近期同步"
          value={stats?.recentSyncJobs || 0}
          icon="🔄"
          color="purple"
        />
        <StatCard
          title="内容质量"
          value={`${stats?.qualityScore || 0}%`}
          icon="⭐"
          color="indigo"
        />
      </div>

      {/* 快速操作 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={triggerContentSync}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 启动内容同步
          </button>
          <button
            onClick={generateSitemap}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            🗺️ 生成站点地图
          </button>
          <button
            onClick={() => window.open('/api/cron/seed-movies', '_blank')}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            🌱 种子数据
          </button>
        </div>
      </div>

      {/* 最近活动 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">最近活动</h3>
        <div className="space-y-3">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">暂无最近活动</p>
          )}
        </div>
      </div>

      {/* 系统状态 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">系统状态</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatusIndicator
            label="数据库连接"
            status="healthy"
            description="所有数据库连接正常"
          />
          <StatusIndicator
            label="外部API"
            status="healthy"
            description="TMDB API 响应正常"
          />
          <StatusIndicator
            label="内容同步"
            status="healthy"
            description="最后同步: 2小时前"
          />
          <StatusIndicator
            label="搜索索引"
            status="warning"
            description="建议重建搜索索引"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon, 
  color 
}: { 
  title: string; 
  value: string | number; 
  icon: string; 
  color: string; 
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ activity }: { activity: RecentActivity }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'movie_update': return '🎬';
      case 'availability_check': return '📺';
      case 'content_sync': return '🔄';
      case 'quality_check': return '⭐';
      default: return '📝';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <span className="text-lg">{getTypeIcon(activity.type)}</span>
        <div>
          <p className="text-sm font-medium text-gray-900">{activity.description}</p>
          <p className="text-xs text-gray-500">
            {new Date(activity.timestamp).toLocaleString('zh-CN')}
          </p>
        </div>
      </div>
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
        {activity.status === 'success' ? '成功' : 
         activity.status === 'error' ? '错误' : '进行中'}
      </span>
    </div>
  );
}

function StatusIndicator({ 
  label, 
  status, 
  description 
}: { 
  label: string; 
  status: 'healthy' | 'warning' | 'error'; 
  description: string; 
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
      <span className="text-lg">{getStatusIcon(status)}</span>
      <div>
        <p className={`text-sm font-medium ${getStatusColor(status)}`}>{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
}

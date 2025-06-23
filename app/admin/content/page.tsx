import { Suspense } from 'react';
import { Metadata } from 'next';
import Script from 'next/script';
import { ContentManagementDashboard } from '@/app/components/admin/ContentManagementDashboard';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';

export const metadata: Metadata = {
  title: '内容管理系统 | 吉卜力观影指南',
  description: '管理吉卜力电影相关内容，包括评论、角色、观影指南等',
  robots: 'noindex, nofollow', // 管理页面不被搜索引擎索引
};

export default function ContentManagementPage() {
  return (
    <>
      {/* Google AdSense */}
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6958408841088360"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">内容管理系统</h1>
            <p className="mt-2 text-gray-600">
              管理和维护吉卜力观影指南的所有内容
            </p>
          </div>

          <Suspense fallback={<LoadingSpinner />}>
            <ContentManagementDashboard />
          </Suspense>
        </div>
      </div>
    </>
  );
}

// 内容管理仪表板组件
export function ContentManagementDashboard() {
  return (
    <div className="space-y-8">
      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="电影总数"
          value="23"
          change="+2"
          changeType="positive"
          icon="🎬"
        />
        <StatCard
          title="评论文章"
          value="45"
          change="+5"
          changeType="positive"
          icon="📝"
        />
        <StatCard
          title="角色档案"
          value="156"
          change="+12"
          changeType="positive"
          icon="👥"
        />
        <StatCard
          title="观影指南"
          value="8"
          change="+1"
          changeType="positive"
          icon="📚"
        />
      </div>

      {/* 快速操作 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">快速操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionButton
            title="添加电影评论"
            description="为电影添加深度分析和评论"
            icon="✍️"
            href="/admin/content/reviews/new"
          />
          <QuickActionButton
            title="创建观影指南"
            description="制作新的观影顺序推荐"
            icon="🗺️"
            href="/admin/content/guides/new"
          />
          <QuickActionButton
            title="管理角色档案"
            description="添加或编辑电影角色信息"
            icon="🎭"
            href="/admin/content/characters"
          />
          <QuickActionButton
            title="更新可用性信息"
            description="检查和更新观看平台信息"
            icon="🔄"
            href="/admin/content/availability"
          />
          <QuickActionButton
            title="内容质量检查"
            description="审核和优化现有内容"
            icon="🔍"
            href="/admin/content/quality"
          />
          <QuickActionButton
            title="SEO优化"
            description="优化搜索引擎表现"
            icon="📈"
            href="/admin/content/seo"
          />
        </div>
      </div>

      {/* 最近活动 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">最近活动</h2>
        <div className="space-y-4">
          <ActivityItem
            action="更新了电影信息"
            target="《千与千寻》"
            time="2小时前"
            user="系统自动"
            type="update"
          />
          <ActivityItem
            action="发布了新评论"
            target="《龙猫》深度解析"
            time="1天前"
            user="内容编辑"
            type="create"
          />
          <ActivityItem
            action="更新了观影指南"
            target="新手入门指南"
            time="2天前"
            user="内容编辑"
            type="update"
          />
        </div>
      </div>

      {/* 内容状态监控 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">内容质量分布</h2>
          <div className="space-y-3">
            <QualityBar label="优秀 (90-100分)" percentage={35} color="green" />
            <QualityBar label="良好 (80-89分)" percentage={45} color="blue" />
            <QualityBar label="一般 (70-79分)" percentage={15} color="yellow" />
            <QualityBar label="需改进 (<70分)" percentage={5} color="red" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">待处理任务</h2>
          <div className="space-y-3">
            <TaskItem
              title="更新《风之谷》观看信息"
              priority="high"
              dueDate="今天"
            />
            <TaskItem
              title="完善《魔女宅急便》角色档案"
              priority="medium"
              dueDate="明天"
            />
            <TaskItem
              title="优化SEO关键词"
              priority="low"
              dueDate="本周"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// 统计卡片组件
function StatCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon 
}: {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
      <div className="mt-2">
        <span className={`text-sm font-medium ${
          changeType === 'positive' ? 'text-green-600' : 'text-red-600'
        }`}>
          {change}
        </span>
        <span className="text-sm text-gray-500 ml-1">vs 上月</span>
      </div>
    </div>
  );
}

// 快速操作按钮组件
function QuickActionButton({
  title,
  description,
  icon,
  href
}: {
  title: string;
  description: string;
  icon: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start space-x-3">
        <div className="text-2xl">{icon}</div>
        <div>
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </a>
  );
}

// 活动项目组件
function ActivityItem({
  action,
  target,
  time,
  user,
  type
}: {
  action: string;
  target: string;
  time: string;
  user: string;
  type: 'create' | 'update' | 'delete';
}) {
  const typeColors = {
    create: 'text-green-600 bg-green-100',
    update: 'text-blue-600 bg-blue-100',
    delete: 'text-red-600 bg-red-100'
  };

  const typeIcons = {
    create: '➕',
    update: '✏️',
    delete: '🗑️'
  };

  return (
    <div className="flex items-center space-x-3 p-3 border border-gray-100 rounded-lg">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${typeColors[type]}`}>
        {typeIcons[type]}
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-900">
          <span className="font-medium">{user}</span> {action} <span className="font-medium">{target}</span>
        </p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  );
}

// 质量条组件
function QualityBar({
  label,
  percentage,
  color
}: {
  label: string;
  percentage: number;
  color: 'green' | 'blue' | 'yellow' | 'red';
}) {
  const colorClasses = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  };

  return (
    <div>
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>{label}</span>
        <span>{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// 任务项目组件
function TaskItem({
  title,
  priority,
  dueDate
}: {
  title: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
}) {
  const priorityColors = {
    high: 'text-red-600 bg-red-100',
    medium: 'text-yellow-600 bg-yellow-100',
    low: 'text-green-600 bg-green-100'
  };

  const priorityLabels = {
    high: '高',
    medium: '中',
    low: '低'
  };

  return (
    <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
      <div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">截止：{dueDate}</p>
      </div>
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColors[priority]}`}>
        {priorityLabels[priority]}
      </span>
    </div>
  );
}

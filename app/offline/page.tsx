'use client';

import { WifiIcon, ArrowPathIcon, HomeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 text-center">
        {/* 离线图标 */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
            <WifiIcon className="w-8 h-8 text-gray-400 dark:text-slate-400" />
          </div>
        </div>

        {/* 标题 */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          您当前处于离线状态
        </h1>

        {/* 描述 */}
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          无法连接到互联网。请检查您的网络连接，然后重试。
        </p>

        {/* 离线功能说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <h2 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
            离线可用功能
          </h2>
          <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
            <li>• 浏览已缓存的电影信息</li>
            <li>• 查看离线保存的内容</li>
            <li>• 使用基本搜索功能</li>
            <li>• 访问帮助和关于页面</li>
          </ul>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            重新连接
          </button>

          <Link
            href="/"
            className="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            <HomeIcon className="w-4 h-4 mr-2" />
            返回首页
          </Link>
        </div>

        {/* 网络状态检测 */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-600">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            网络连接恢复后，页面将自动更新
          </p>
          <div className="mt-2">
            <div className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
              离线状态
            </div>
          </div>
        </div>
      </div>

      {/* 网络状态监听脚本 */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // 监听网络状态变化
            function updateNetworkStatus() {
              const statusElement = document.querySelector('.inline-flex.items-center.text-xs');
              const dotElement = statusElement?.querySelector('.w-2.h-2');
              
              if (navigator.onLine) {
                if (statusElement) {
                  statusElement.innerHTML = '<div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>已连接';
                }
                // 延迟重新加载，给用户时间看到状态变化
                setTimeout(() => {
                  window.location.href = '/';
                }, 1000);
              } else {
                if (statusElement) {
                  statusElement.innerHTML = '<div class="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>离线状态';
                }
              }
            }

            // 监听网络事件
            window.addEventListener('online', updateNetworkStatus);
            window.addEventListener('offline', updateNetworkStatus);

            // 初始检查
            updateNetworkStatus();

            // 定期检查网络连接
            setInterval(() => {
              fetch('/api/health', { 
                method: 'HEAD',
                cache: 'no-cache'
              })
              .then(() => {
                if (!navigator.onLine) {
                  // 手动触发在线事件
                  window.dispatchEvent(new Event('online'));
                }
              })
              .catch(() => {
                if (navigator.onLine) {
                  // 手动触发离线事件
                  window.dispatchEvent(new Event('offline'));
                }
              });
            }, 5000);
          `
        }}
      />
    </div>
  );
}

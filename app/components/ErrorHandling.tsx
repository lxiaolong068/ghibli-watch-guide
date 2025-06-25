'use client';

import { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon, HomeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface ErrorHandlingProps {
  error?: Error;
  reset?: () => void;
  title?: string;
  description?: string;
  showRetry?: boolean;
  showHome?: boolean;
  className?: string;
}

export function ErrorHandling({
  error,
  reset,
  title = "出现了一些问题",
  description = "很抱歉，发生了意外错误。请稍后重试。",
  showRetry = true,
  showHome = true,
  className = ""
}: ErrorHandlingProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = async () => {
    if (!reset) return;
    
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    // 添加延迟以提供视觉反馈
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      reset();
    } catch (retryError) {
      console.error('Retry failed:', retryError);
    } finally {
      setIsRetrying(false);
    }
  };

  // 自动重试逻辑（最多3次）
  useEffect(() => {
    if (error && retryCount < 3 && reset) {
      const timer = setTimeout(() => {
        handleRetry();
      }, 2000 * (retryCount + 1)); // 递增延迟

      return () => clearTimeout(timer);
    }
  }, [error, retryCount, reset]);

  return (
    <div className={`min-h-[400px] flex items-center justify-center p-6 ${className}`}>
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 text-center">
        {/* 错误图标 */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* 错误标题 */}
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
          {title}
        </h2>

        {/* 错误描述 */}
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {description}
        </p>

        {/* 开发环境错误详情 */}
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mb-6 p-4 bg-gray-100 dark:bg-slate-700 rounded-lg text-left">
            <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300 mb-2">
              错误详情 (仅开发环境显示)
            </summary>
            <pre className="text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap overflow-auto max-h-32">
              {error.toString()}
              {error.stack && '\n\n' + error.stack}
            </pre>
          </details>
        )}

        {/* 重试计数显示 */}
        {retryCount > 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            已重试 {retryCount} 次
          </p>
        )}

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {showRetry && reset && (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isRetrying ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                  重试中...
                </>
              ) : (
                <>
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  重试
                </>
              )}
            </button>
          )}

          {showHome && (
            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              <HomeIcon className="w-4 h-4 mr-2" />
              返回首页
            </Link>
          )}
        </div>

        {/* 帮助信息 */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-600">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            如果问题持续存在，请尝试：
          </p>
          <ul className="text-sm text-gray-500 dark:text-gray-400 mt-2 space-y-1">
            <li>• 刷新页面</li>
            <li>• 清除浏览器缓存</li>
            <li>• 检查网络连接</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// 网络错误处理组件
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorHandling
      title="网络连接问题"
      description="无法连接到服务器，请检查您的网络连接。"
      reset={onRetry}
      showRetry={!!onRetry}
    />
  );
}

// 404错误处理组件
export function NotFoundError() {
  return (
    <ErrorHandling
      title="页面未找到"
      description="您访问的页面不存在或已被移动。"
      showRetry={false}
    />
  );
}

// 权限错误处理组件
export function PermissionError() {
  return (
    <ErrorHandling
      title="访问被拒绝"
      description="您没有权限访问此内容。"
      showRetry={false}
    />
  );
}

// 通用API错误处理组件
export function ApiError({ 
  statusCode, 
  message, 
  onRetry 
}: { 
  statusCode?: number; 
  message?: string; 
  onRetry?: () => void; 
}) {
  const getErrorMessage = (code?: number) => {
    switch (code) {
      case 400:
        return "请求参数错误";
      case 401:
        return "需要登录验证";
      case 403:
        return "访问被禁止";
      case 404:
        return "请求的资源不存在";
      case 429:
        return "请求过于频繁，请稍后重试";
      case 500:
        return "服务器内部错误";
      case 502:
        return "网关错误";
      case 503:
        return "服务暂时不可用";
      default:
        return message || "API请求失败";
    }
  };

  return (
    <ErrorHandling
      title={`错误 ${statusCode || ''}`}
      description={getErrorMessage(statusCode)}
      reset={onRetry}
      showRetry={!!onRetry && statusCode !== 404}
    />
  );
}

// 加载超时错误组件
export function TimeoutError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorHandling
      title="加载超时"
      description="请求处理时间过长，请稍后重试。"
      reset={onRetry}
      showRetry={!!onRetry}
    />
  );
}

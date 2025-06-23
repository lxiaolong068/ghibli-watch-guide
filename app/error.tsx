'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ExclamationTriangleIcon, ArrowPathIcon, HomeIcon } from '@heroicons/react/24/outline';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 记录错误到控制台（在生产环境中可以发送到错误监控服务）
    console.error('Application error:', error);
  }, [error]);

  const isNetworkError = error.message.includes('fetch') || error.message.includes('network');
  const isDatabaseError = error.message.includes('database') || error.message.includes('prisma');

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* 错误图标 */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Something went wrong
          </h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            {isNetworkError ? 'Network Error' : 
             isDatabaseError ? 'Service Unavailable' : 
             'Unexpected Error'}
          </h2>
        </div>

        {/* 错误描述 */}
        <div className="mb-8">
          {isNetworkError ? (
            <div>
              <p className="text-gray-600 text-lg mb-4">
                Unable to connect to our servers. Please check your internet connection.
              </p>
              <p className="text-gray-500">
                The spirits seem to have disrupted the connection. Try again in a moment.
              </p>
            </div>
          ) : isDatabaseError ? (
            <div>
              <p className="text-gray-600 text-lg mb-4">
                Our service is temporarily unavailable. We&apos;re working to fix this.
              </p>
              <p className="text-gray-500">
                Even the most magical places need maintenance sometimes.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 text-lg mb-4">
                An unexpected error occurred while loading this page.
              </p>
              <p className="text-gray-500">
                Don&apos;t worry, even the best magic sometimes goes awry.
              </p>
            </div>
          )}
        </div>

        {/* 错误详情（仅开发环境） */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mb-8 p-4 bg-white rounded-lg shadow-sm border text-left">
            <summary className="cursor-pointer font-medium text-gray-700 mb-2">
              Error Details (Development Only)
            </summary>
            <pre className="text-xs text-red-600 whitespace-pre-wrap overflow-auto max-h-32">
              {error.message}
              {error.stack && '\n\nStack trace:\n' + error.stack}
            </pre>
            {error.digest && (
              <p className="text-xs text-gray-500 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </details>
        )}

        {/* 操作按钮 */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <ArrowPathIcon className="w-5 h-5 mr-2" />
              Try Again
            </button>
            
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary-600 font-medium rounded-lg border border-primary-600 hover:bg-primary-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <HomeIcon className="w-5 h-5 mr-2" />
              Go Home
            </Link>
          </div>

          {/* 刷新页面选项 */}
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Or refresh the page
          </button>
        </div>

        {/* 帮助信息 */}
        <div className="mt-8 p-4 bg-white rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Need help?
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            If this problem persists, you can:
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Try refreshing the page</li>
            <li>• Check your internet connection</li>
            <li>• Clear your browser cache</li>
            <li>• Contact support if the issue continues</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

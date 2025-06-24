import { Suspense } from 'react';
import { Metadata } from 'next';
import Script from 'next/script';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';
import { ContentDashboard } from '@/app/components/admin/ContentDashboard';

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
            <ContentDashboard />
          </Suspense>
        </div>
      </div>
    </>
  );
}





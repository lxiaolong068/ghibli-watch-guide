import { Metadata } from 'next';
import { GuideList } from '@/app/components/guides/GuideList';

export const metadata: Metadata = {
  title: '观影指南 - 吉卜力观影指南',
  description: '发现最适合你的吉卜力电影观影顺序，包括时间线指南、新手入门、主题分类和家庭观影推荐。',
  keywords: '吉卜力, 观影指南, 宫崎骏, 电影推荐, 观影顺序',
  openGraph: {
    title: '观影指南 - 吉卜力观影指南',
    description: '发现最适合你的吉卜力电影观影顺序，包括时间线指南、新手入门、主题分类和家庭观影推荐。',
    type: 'website',
  },
};

export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              吉卜力观影指南
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              无论你是初次接触吉卜力作品，还是想要重新体验这些经典，我们为你准备了不同类型的观影指南，
              帮助你找到最适合的观影顺序和方式。
            </p>
          </div>
        </div>
      </div>

      {/* 指南介绍 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">时间线指南</h3>
            <p className="text-sm text-gray-600">
              按照制作时间顺序观看，感受吉卜力工作室的艺术演变历程
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">新手入门</h3>
            <p className="text-sm text-gray-600">
              专为初次接触吉卜力作品的观众设计，循序渐进的观影体验
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">主题分类</h3>
            <p className="text-sm text-gray-600">
              按照不同主题分类观看，深入理解吉卜力的创作理念
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">家庭观影</h3>
            <p className="text-sm text-gray-600">
              适合全家一起观看的作品推荐，考虑不同年龄段的接受能力
            </p>
          </div>
        </div>

        {/* 观影指南列表 */}
        <GuideList showFilters={true} />
      </div>

      {/* 底部提示 */}
      <div className="bg-blue-50 border-t border-blue-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-blue-900 mb-4">
              找到适合你的观影方式
            </h2>
            <p className="text-blue-700 mb-6 max-w-2xl mx-auto">
              每个人的观影偏好都不同，我们的指南旨在帮助你发现最适合自己的吉卜力电影体验。
              无论你喜欢按时间顺序了解历史，还是想要主题化的深度体验，都能在这里找到答案。
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center text-blue-700">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>专业推荐</span>
              </div>
              <div className="flex items-center text-blue-700">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>详细说明</span>
              </div>
              <div className="flex items-center text-blue-700">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>持续更新</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

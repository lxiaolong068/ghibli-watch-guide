import { Metadata } from 'next';
import { GuideList } from '@/app/components/guides/GuideList';

export const metadata: Metadata = {
  title: 'Studio Ghibli Watch Guides | Viewing Order & Tips',
  description: 'Find the perfect Studio Ghibli viewing order with our comprehensive guides: chronological timeline, beginner-friendly recommendations, thematic categories, and family-friendly suggestions for all ages.',
  keywords: 'studio ghibli, watch guide, miyazaki, movie recommendations, viewing order, anime guide',
  openGraph: {
    title: 'Studio Ghibli Watch Guides | Viewing Order & Tips',
    description: 'Find the perfect Studio Ghibli viewing order with our comprehensive guides: chronological timeline, beginner-friendly recommendations, thematic categories, and family-friendly suggestions for all ages.',
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
              Studio Ghibli Watch Guides
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're new to Studio Ghibli films or want to revisit these classics, we've prepared different types of watch guides
              to help you find the perfect viewing order and approach.
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Timeline Guide</h3>
            <p className="text-sm text-gray-600">
              Watch in chronological order to experience Studio Ghibli's artistic evolution
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Beginner's Guide</h3>
            <p className="text-sm text-gray-600">
              Designed for first-time viewers, providing a gradual introduction to Ghibli films
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Thematic Categories</h3>
            <p className="text-sm text-gray-600">
              Watch by themes to deeply understand Studio Ghibli's creative philosophy
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Family Viewing</h3>
            <p className="text-sm text-gray-600">
              Family-friendly recommendations considering different age groups
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
              Find Your Perfect Viewing Experience
            </h2>
            <p className="text-blue-700 mb-6 max-w-2xl mx-auto">
              Everyone has different viewing preferences. Our guides are designed to help you discover the Studio Ghibli movie experience that's perfect for you.
              Whether you prefer chronological viewing to understand the history or thematic deep dives, you'll find the answer here.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center text-blue-700">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Expert Recommendations</span>
              </div>
              <div className="flex items-center text-blue-700">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Detailed Explanations</span>
              </div>
              <div className="flex items-center text-blue-700">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Regular Updates</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

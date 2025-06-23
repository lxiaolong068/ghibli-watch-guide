import Link from 'next/link';
import { FilmIcon, HomeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* 404 图标 */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <FilmIcon className="w-12 h-12 text-primary-600" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Page Not Found
          </h2>
        </div>

        {/* 错误描述 */}
        <div className="mb-8">
          <p className="text-gray-600 text-lg mb-4">
            Oops! The page you&apos;re looking for seems to have wandered off into the spirit world.
          </p>
          <p className="text-gray-500">
            Don&apos;t worry, even Chihiro got lost sometimes. Let&apos;s help you find your way back.
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <HomeIcon className="w-5 h-5 mr-2" />
              Go Home
            </Link>
            
            <Link
              href="/movies"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary-600 font-medium rounded-lg border border-primary-600 hover:bg-primary-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <FilmIcon className="w-5 h-5 mr-2" />
              Browse Movies
            </Link>
          </div>

          {/* 搜索建议 */}
          <div className="mt-8 p-4 bg-white rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
              <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
              Looking for something specific?
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Try searching for your favorite Studio Ghibli movie:
            </p>
            <div className="flex flex-wrap gap-2">
              {['Spirited Away', 'My Neighbor Totoro', 'Princess Mononoke', 'Howl\'s Moving Castle'].map((movie) => (
                <Link
                  key={movie}
                  href={`/movies?search=${encodeURIComponent(movie)}`}
                  className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                >
                  {movie}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* 帮助信息 */}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            If you believe this is an error, please{' '}
            <Link href="/contact" className="text-primary-600 hover:text-primary-700 underline">
              contact us
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

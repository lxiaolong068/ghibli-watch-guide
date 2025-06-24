import Link from 'next/link';
import Image from 'next/image';
import { WatchGuide } from '@/app/types';
import { LazyImage } from '../MobilePerformance';
import { GuideType } from '../../../prisma/generated/client';

interface GuideCardProps {
  guide: WatchGuide;
}

const guideTypeLabels: Record<GuideType, string> = {
  [GuideType.CHRONOLOGICAL]: '时间线',
  [GuideType.BEGINNER]: '新手入门',
  [GuideType.THEMATIC]: '主题分类',
  [GuideType.FAMILY]: '家庭观影',
  [GuideType.ADVANCED]: '进阶指南',
  [GuideType.SEASONAL]: '季节推荐'
};

const guideTypeColors: Record<GuideType, string> = {
  [GuideType.CHRONOLOGICAL]: 'bg-blue-100 text-blue-800',
  [GuideType.BEGINNER]: 'bg-green-100 text-green-800',
  [GuideType.THEMATIC]: 'bg-purple-100 text-purple-800',
  [GuideType.FAMILY]: 'bg-pink-100 text-pink-800',
  [GuideType.ADVANCED]: 'bg-orange-100 text-orange-800',
  [GuideType.SEASONAL]: 'bg-teal-100 text-teal-800'
};

export function GuideCard({ guide }: GuideCardProps) {
  // 获取指南的封面图片（使用第一部电影的海报）
  const coverImage = guide.movies?.[0]?.movie?.posterUrl;
  
  return (
    <Link href={`/guides/${guide.id}`} className="group">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 mobile-card">
        {/* 封面图片区域 */}
        <div className="aspect-[16/9] relative overflow-hidden bg-gray-100">
          {coverImage ? (
            <LazyImage
              src={coverImage}
              alt={`${guide.title} 封面`}
              className="group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="text-center">
                <svg className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-xs sm:text-sm text-gray-500">观影指南</p>
              </div>
            </div>
          )}
          
          {/* 指南类型标签 */}
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${guideTypeColors[guide.guideType as GuideType]}`}>
              {guideTypeLabels[guide.guideType as GuideType]}
            </span>
          </div>
          
          {/* 电影数量标签 */}
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-black bg-opacity-60 text-white">
              {guide.movieCount || guide.movies?.length || 0} 部电影
            </span>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {guide.title}
          </h3>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-3">
            {guide.description}
          </p>
          
          {/* 电影预览 */}
          {guide.movies && guide.movies.length > 0 && (
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-xs text-gray-500">包含电影:</span>
              <div className="flex -space-x-1">
                {guide.movies.slice(0, 3).map((guideMovie, index) => (
                  <div
                    key={index}
                    className="w-6 h-8 rounded-sm overflow-hidden border border-white shadow-sm"
                  >
                    {guideMovie.movie.posterUrl ? (
                      <Image
                        src={guideMovie.movie.posterUrl}
                        alt={guideMovie.movie.titleZh || guideMovie.movie.titleEn}
                        width={24}
                        height={32}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200"></div>
                    )}
                  </div>
                ))}
                {guide.movies.length > 3 && (
                  <div className="w-6 h-8 rounded-sm bg-gray-100 border border-white shadow-sm flex items-center justify-center">
                    <span className="text-xs text-gray-500">+{guide.movies.length - 3}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* 创建时间 */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {new Date(guide.createdAt).toLocaleDateString('zh-CN')}
            </span>
            <span className="flex items-center">
              查看详情
              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

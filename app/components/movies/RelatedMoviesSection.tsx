import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PrismaClient } from '@prisma/client';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';

const prisma = new PrismaClient();

interface RelatedMoviesSectionProps {
  currentMovieId: string;
}

export function RelatedMoviesSection({ currentMovieId }: RelatedMoviesSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">相关推荐</h2>
      
      <Suspense fallback={<LoadingSpinner />}>
        <RelatedMoviesContent currentMovieId={currentMovieId} />
      </Suspense>
    </div>
  );
}

async function RelatedMoviesContent({ currentMovieId }: { currentMovieId: string }) {
  const relatedMovies = await getRelatedMovies(currentMovieId);
  
  if (relatedMovies.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">暂无相关推荐</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {relatedMovies.map((movie) => (
        <RelatedMovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}

function RelatedMovieCard({ movie }: { movie: any }) {
  return (
    <Link href={`/movies/${movie.id}`} className="group">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
        {/* 电影海报 */}
        <div className="aspect-[2/3] relative overflow-hidden">
          {movie.posterUrl ? (
            <Image
              src={movie.posterUrl}
              alt={`${movie.titleEn} poster`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7a1 1 0 01-1-1V5a1 1 0 011-1h4zM9 3v1h6V3H9zM5 7v9h14V7H5z" />
              </svg>
            </div>
          )}
          
          {/* 评分标签 */}
          {movie.voteAverage && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
              ★ {movie.voteAverage.toFixed(1)}
            </div>
          )}
        </div>

        {/* 电影信息 */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {movie.titleZh || movie.titleEn}
          </h3>
          
          {movie.titleEn !== (movie.titleZh || movie.titleEn) && (
            <p className="text-sm text-gray-600 mb-2">{movie.titleEn}</p>
          )}
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{movie.year}年</span>
            {movie.duration && (
              <span>{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span>
            )}
          </div>
          
          {movie.synopsis && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {movie.synopsis}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

// 获取相关电影的函数
async function getRelatedMovies(currentMovieId: string, limit: number = 6) {
  try {
    // 获取当前电影信息
    const currentMovie = await prisma.movie.findUnique({
      where: { id: currentMovieId }
    });

    if (!currentMovie) return [];

    // 基于年份和导演推荐相似电影
    const relatedMovies = await prisma.movie.findMany({
      where: {
        AND: [
          { id: { not: currentMovieId } }, // 排除当前电影
          {
            OR: [
              // 同一导演的其他作品
              currentMovie.director ? { director: currentMovie.director } : {},
              // 相近年份的作品（前后5年）
              {
                year: {
                  gte: currentMovie.year - 5,
                  lte: currentMovie.year + 5
                }
              }
            ]
          }
        ]
      },
      orderBy: [
        // 优先推荐同一导演的作品
        { director: currentMovie.director ? 'asc' : 'desc' },
        // 然后按评分排序
        { voteAverage: 'desc' },
        // 最后按年份排序
        { year: 'desc' }
      ],
      take: limit
    });

    // 如果相关电影不足，补充其他高评分电影
    if (relatedMovies.length < limit) {
      const additionalMovies = await prisma.movie.findMany({
        where: {
          id: { 
            notIn: [currentMovieId, ...relatedMovies.map(m => m.id)]
          }
        },
        orderBy: [
          { voteAverage: 'desc' },
          { year: 'desc' }
        ],
        take: limit - relatedMovies.length
      });

      relatedMovies.push(...additionalMovies);
    }

    return relatedMovies;
  } catch (error) {
    console.error('Error fetching related movies:', error);
    
    // 返回示例数据
    return [
      {
        id: 'sample-1',
        titleEn: 'My Neighbor Totoro',
        titleJa: 'となりのトトロ',
        titleZh: '龙猫',
        year: 1988,
        director: '宫崎骏',
        duration: 86,
        synopsis: '两个小女孩搬到乡下后，在森林中遇到了神奇的龙猫...',
        posterUrl: null,
        voteAverage: 8.2
      },
      {
        id: 'sample-2',
        titleEn: 'Kiki\'s Delivery Service',
        titleJa: '魔女の宅急便',
        titleZh: '魔女宅急便',
        year: 1989,
        director: '宫崎骏',
        duration: 103,
        synopsis: '13岁的小魔女琪琪离开家乡，开始独立生活的成长故事...',
        posterUrl: null,
        voteAverage: 7.9
      },
      {
        id: 'sample-3',
        titleEn: 'Princess Mononoke',
        titleJa: 'もののけ姫',
        titleZh: '幽灵公主',
        year: 1997,
        director: '宫崎骏',
        duration: 134,
        synopsis: '在人类与森林神灵的冲突中，少年阿席达卡寻求和平的故事...',
        posterUrl: null,
        voteAverage: 8.4
      }
    ];
  }
}

// 推荐算法组件（为未来功能预留）
export function RecommendationEngine({ userId: _userId, movieId: _movieId }: { userId?: string; movieId: string }) {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mt-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">个性化推荐</h3>
      <div className="text-center py-6">
        <div className="text-purple-400 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <p className="text-gray-600 mb-2">智能推荐系统开发中</p>
        <p className="text-sm text-gray-500">基于观影历史和偏好的个性化推荐即将上线</p>
      </div>
    </div>
  );
}

// 观影指南链接组件
export function WatchGuideLinks({ movieId: _movieId }: { movieId: string }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
      <h3 className="text-lg font-semibold text-blue-900 mb-4">📚 相关观影指南</h3>
      <div className="space-y-3">
        <Link 
          href="/guides/chronological" 
          className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900">时间线观影指南</h4>
              <p className="text-sm text-blue-700">按制作顺序了解吉卜力发展历程</p>
            </div>
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
        
        <Link 
          href="/guides/beginner" 
          className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900">新手入门指南</h4>
              <p className="text-sm text-blue-700">适合初次接触吉卜力作品的观众</p>
            </div>
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </div>
    </div>
  );
}

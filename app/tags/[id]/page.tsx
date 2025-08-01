import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { MovieGrid } from '@/app/components/MovieCard';
import TagBadge from '@/app/components/ui/TagBadge';
import { getTagCategoryConfig } from '@/data/tag-categories';
import { TagCategory } from '@/app/types';

interface TagPageProps {
  params: {
    id: string;
  };
}

// 获取标签详情和相关电影
async function getTagWithMovies(tagId: string) {
  try {
    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
      include: {
        movieTags: {
          include: {
            movie: {
              include: {
                movieTags: {
                  include: {
                    tag: true
                  },
                  orderBy: {
                    tag: {
                      category: 'asc'
                    }
                  }
                }
              }
            }
          },
          orderBy: {
            movie: {
              year: 'desc'
            }
          }
        }
      }
    });

    if (!tag) {
      return null;
    }

    // 格式化电影数据，包含标签信息
    const movies = tag.movieTags.map(movieTag => {
      const movie = movieTag.movie;
      return {
        ...movie,
        tags: movie.movieTags.map(mt => mt.tag),
        tagsByCategory: movie.movieTags.reduce((acc, mt) => {
          const category = mt.tag.category || 'other';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(mt.tag);
          return acc;
        }, {} as Record<string, any[]>)
      };
    });

    return {
      tag,
      movies,
      movieCount: movies.length
    };
  } catch (error) {
    console.error('Error fetching tag with movies:', error);
    return null;
  }
}

// 生成页面元数据
export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const data = await getTagWithMovies(params.id);
  
  if (!data) {
    return {
      title: 'Tag Not Found',
    };
  }

  const { tag, movieCount } = data;
  const tagName = tag.name || tag.nameZh;
  const categoryConfig = getTagCategoryConfig(tag.category as TagCategory);

  return {
    title: `${tagName} - Tag | Studio Ghibli Watch Guide`,
    description: `Browse all Studio Ghibli movies tagged with "${tagName}". ${tag.description || ''} Found ${movieCount} related movies.`,
    keywords: [
      tagName,
      'studio ghibli',
      'movie tags',
      'movie categories',
      categoryConfig?.name || 'movies'
    ],
    openGraph: {
      title: `${tagName} - Studio Ghibli Movie Tag`,
      description: `Explore all Studio Ghibli movies tagged with "${tagName}"`,
      type: 'website',
    },
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const data = await getTagWithMovies(params.id);

  if (!data) {
    notFound();
  }

  const { tag, movies, movieCount } = data;
  const categoryConfig = getTagCategoryConfig(tag.category as TagCategory);

  return (
    <main className="container mx-auto px-4 py-8">
      {/* 标签信息头部 */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <TagBadge 
            tag={tag} 
            size="lg" 
            variant="solid" 
            showCategory={true}
          />
          {categoryConfig && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">{categoryConfig.nameZh}</span> 分类
            </div>
          )}
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {tag.nameZh || tag.name}
        </h1>

        {tag.nameJa && (
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
            {tag.nameJa}
          </p>
        )}

        {tag.description && (
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {tag.description}
          </p>
        )}

        <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7a1 1 0 01-1-1V5a1 1 0 011-1h4z" />
            </svg>
            <span>{movieCount} 部电影</span>
          </div>
          
          {categoryConfig && (
            <div className="flex items-center space-x-2">
              <span role="img" aria-label={categoryConfig.nameZh}>
                {categoryConfig.icon}
              </span>
              <span>{categoryConfig.nameZh}</span>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded-full border border-gray-300"
              style={{ backgroundColor: tag.color || '#6B7280' }}
            />
            <span>{tag.color || '#6B7280'}</span>
          </div>
        </div>
      </div>

      {/* 面包屑导航 */}
      <nav className="mb-6 text-sm">
        <ol className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
          <li>
            <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-300">
              首页
            </Link>
          </li>
          <li>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </li>
          <li>
            <Link href="/movies" className="hover:text-gray-700 dark:hover:text-gray-300">
              电影
            </Link>
          </li>
          <li>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </li>
          <li>
            <span className="text-gray-700 dark:text-gray-300">
              {tag.nameZh || tag.name}
            </span>
          </li>
        </ol>
      </nav>

      {/* 电影列表 */}
      {movies.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              相关电影 ({movieCount})
            </h2>
            
            {/* 排序选项 */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-700 dark:text-gray-300">排序:</label>
              <select className="text-sm border border-gray-300 dark:border-gray-600 rounded px-3 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <option value="year-desc">年份 (新到旧)</option>
                <option value="year-asc">年份 (旧到新)</option>
                <option value="title-asc">标题 (A-Z)</option>
                <option value="rating-desc">评分 (高到低)</option>
              </select>
            </div>
          </div>

          <MovieGrid 
            movies={movies} 
            showTags={true}
          />
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7a1 1 0 01-1-1V5a1 1 0 011-1h4z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            暂无相关电影
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            该标签还没有关联任何电影
          </p>
          <Link
            href="/movies"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            浏览所有电影
          </Link>
        </div>
      )}

      {/* 相关标签推荐 */}
      {categoryConfig && (
        <div className="mt-12 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            相关标签
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            探索更多 {categoryConfig.nameZh} 类别的标签
          </p>
          <a
            href={`/movies?categories=${tag.category}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            查看所有 {categoryConfig.nameZh} 标签
            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      )}
    </main>
  );
}

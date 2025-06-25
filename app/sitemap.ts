import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.whereghibli.cc';
  
  // 静态页面
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/movies`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/characters`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/reviews`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/regions`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  try {
    // 获取所有电影
    const movies = await prisma.movie.findMany({
      select: {
        id: true,
        updatedAt: true,
      },
    });

    const moviePages = movies.map(movie => ({
      url: `${baseUrl}/movies/${movie.id}`,
      lastModified: movie.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    // 获取所有角色
    const characters = await prisma.character.findMany({
      select: {
        id: true,
        updatedAt: true,
      },
    });

    const characterPages = characters.map(character => ({
      url: `${baseUrl}/characters/${character.id}`,
      lastModified: character.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

    // 获取所有观影指南
    const guides = await prisma.watchGuide.findMany({
      select: {
        id: true,
        updatedAt: true,
      },
    });

    const guidePages = guides.map(guide => ({
      url: `${baseUrl}/guides/${guide.id}`,
      lastModified: guide.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

    // 获取所有标签
    const tags = await prisma.tag.findMany({
      select: {
        id: true,
      },
    });

    const tagPages = tags.map(tag => ({
      url: `${baseUrl}/tags/${tag.id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));

    // 获取所有电影评论
    const reviews = await prisma.movieReview.findMany({
      select: {
        movieId: true,
        updatedAt: true,
      },
    });

    const reviewPages = reviews.map(review => ({
      url: `${baseUrl}/movies/${review.movieId}/reviews`,
      lastModified: review.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

    return [
      ...staticPages,
      ...moviePages,
      ...characterPages,
      ...guidePages,
      ...tagPages,
      ...reviewPages,
    ];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // 如果数据库查询失败，至少返回静态页面
    return staticPages;
  }
}

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, createError } from '@/app/lib/error-handler';

// 将此路由标记为动态路由，防止在构建时静态生成
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      throw createError.badRequest('Search query is required');
    }

    if (query.length < 2) {
      return Response.json({ movies: [] });
    }

    const movies = await prisma.movie.findMany({
      where: {
        OR: [
          { titleEn: { contains: query, mode: 'insensitive' } },
          { titleJa: { contains: query, mode: 'insensitive' } },
          { titleZh: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        titleEn: true,
        titleJa: true,
        year: true,
        posterUrl: true,
      },
      take: 10,
    });

    return Response.json({ movies });
  } catch (error) {
    return handleApiError(error);
  }
}

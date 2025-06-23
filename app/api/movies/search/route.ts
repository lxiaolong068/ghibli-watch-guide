import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return Response.json({ movies: [] });
  }

  try {
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
    console.error('Search error:', error);
    return Response.json({ error: 'Search failed' }, { status: 500 });
  }
}

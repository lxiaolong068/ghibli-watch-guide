import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../../prisma/generated/client';
import type { Prisma } from '../../../../prisma/generated/client';

// 注意：环境变量在 Vercel Serverless Functions 中是自动可用的

const prisma = new PrismaClient();

const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const STUDIO_GHIBLI_ID = 10342;
const CRON_SECRET = process.env.CRON_SECRET; // 读取 Cron Secret

// --- 从原脚本复制的 TMDB API 调用逻辑 --- 
// (包括 fetchTmdbApi, getFullMovieDetails, 以及相关类型定义)

interface TmdbErrorResponse {
  success?: boolean;
  status_code?: number;
  status_message?: string;
}

async function fetchTmdbApi<T>(endpoint: string, params: Record<string, string | number | boolean> = {}): Promise<T> {
  if (!TMDB_API_KEY) {
    throw new Error('[Cron Seed] Missing TMDB_API_KEY environment variable');
  }
  const url = new URL(`${TMDB_API_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  url.searchParams.append('language', 'en-US');
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      let _errorData: TmdbErrorResponse | null = null;
      try {
        _errorData = await response.json() as TmdbErrorResponse;
      } catch (_error) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      }
      throw new Error(`[Cron Seed] TMDB API request failed with status ${response.status}: ${response.statusText}`);
    }
    return await response.json() as T;
  } catch (_error) {
    console.error("[Cron Seed] Error fetching TMDB API:", _error);
    throw _error;
  }
}

interface TmdbMovieResult { id: number; title: string; /* ...其他属性 */ }
interface DiscoverMovieResponse { page: number; results: TmdbMovieResult[]; total_pages: number; total_results: number; }
interface CrewMember { job: string; name: string; }
interface Credits { crew: CrewMember[]; }
interface MovieDetails { id: number; title: string; original_title: string; overview: string | null; poster_path: string | null; backdrop_path: string | null; release_date: string; runtime: number | null; vote_average: number; credits: Credits; /* ...其他属性 */ }

async function getFullMovieDetails(movieId: number): Promise<MovieDetails | null> {
  try {
    console.log(`[Cron Seed] Fetching full details for movie ID: ${movieId}`);
    const details = await fetchTmdbApi<MovieDetails>(`/movie/${movieId}`, { append_to_response: 'credits' });
    return details;
  } catch (_error) {
    console.error(`[Cron Seed] Failed to fetch full details for movie ID ${movieId}:`, _error);
    return null;
  }
}
// --- 结束复制的 TMDB API 调用逻辑 ---

// 主函数：API 路由处理器
export async function GET(request: Request) {
  console.log('[Cron Seed] Starting movie seeding process via API...');

  // 安全检查：验证 Cron Secret
  const authHeader = request.headers.get('authorization');
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    console.warn('[Cron Seed] Unauthorized attempt to run cron job.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!TMDB_API_KEY) {
    console.error('[Cron Seed] Error: TMDB_API_KEY environment variable is not set.');
    return NextResponse.json({ error: 'Internal server configuration error: TMDB_API_KEY not set' }, { status: 500 });
  }

  let allMovies: TmdbMovieResult[] = [];
  let currentPage = 1;
  let totalPages = 1;
  let upsertedCount = 0;
  let failedCount = 0;

  try {
    // 1. 从 TMDB 获取所有吉卜力电影
    console.log(`[Cron Seed] Fetching movies from Studio Ghibli (ID: ${STUDIO_GHIBLI_ID})...`);
    do {
      const response = await fetchTmdbApi<DiscoverMovieResponse>('/discover/movie', {
        with_companies: STUDIO_GHIBLI_ID,
        page: currentPage,
        sort_by: 'release_date.asc'
      });
      allMovies = allMovies.concat(response.results);
      totalPages = response.total_pages;
      console.log(`[Cron Seed] Fetched page ${currentPage} of ${totalPages}. Total movies: ${allMovies.length}`);
      currentPage++;
      if (currentPage <= totalPages) {
         await new Promise(resolve => setTimeout(resolve, 250)); 
      }
    } while (currentPage <= totalPages);
    console.log(`[Cron Seed] Finished fetching. Found ${allMovies.length} movies.`);

    // 2. Upsert 电影到数据库
    console.log('[Cron Seed] Upserting movies into the database...');
    for (const movie of allMovies) {
        const details = await getFullMovieDetails(movie.id);
        if (!details) {
            console.warn(`[Cron Seed] Skipping movie ID ${movie.id} due to missing details.`);
            failedCount++;
            await new Promise(resolve => setTimeout(resolve, 100));
            continue;
        }

        const year = details.release_date ? parseInt(details.release_date.substring(0, 4), 10) : 0;
        const director = details.credits?.crew?.find(member => member.job === 'Director')?.name ?? null;
        const posterUrl = details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null;
        const backdropUrl = details.backdrop_path ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}` : null;

        try {
            const updateData: Prisma.MovieUpdateInput = {
              titleEn: details.title, titleJa: details.original_title, year: year,
              ...(director !== null && { director: director }),
              ...(details.runtime !== null && { duration: details.runtime }),
              ...(details.overview !== null && { synopsis: details.overview }),
              ...(posterUrl !== null && { posterUrl: posterUrl }),
              ...(backdropUrl !== null && { backdropUrl: backdropUrl }),
              ...(details.vote_average !== null && { voteAverage: details.vote_average }),
            };

            // 重新构建 createData 对象，只包含必需字段和非 null 的可选字段
            const baseCreateData = {
              tmdbId: details.id,
              titleEn: details.title,
              titleJa: details.original_title,
              year: year,
            } as const;

            // 使用 Object.assign 来构建完整的对象，只添加有值的可选字段
            const createData = Object.assign({}, baseCreateData,
              director !== null ? { director } : {},
              details.runtime !== null ? { duration: details.runtime } : {},
              details.overview !== null ? { synopsis: details.overview } : {},
              posterUrl !== null ? { posterUrl } : {},
              backdropUrl !== null ? { backdropUrl } : {},
              details.vote_average !== null ? { voteAverage: details.vote_average } : {}
            ) as Prisma.MovieCreateInput; // 显式类型断言

            await prisma.movie.upsert({
                where: { tmdbId: details.id },
                update: updateData,
                create: createData,
            });
            upsertedCount++;
        } catch (dbError) {
            console.error(`[Cron Seed] Failed to upsert movie ID ${details.id} (${details.title}):`, dbError);
            failedCount++;
        }
        await new Promise(resolve => setTimeout(resolve, 100)); 
    }
    console.log(`[Cron Seed] Seeding finished. ${upsertedCount} movies upserted, ${failedCount} failed.`);
    
    // 断开 Prisma 连接
    await prisma.$disconnect();
    console.log('[Cron Seed] Prisma connection closed.');
    return NextResponse.json({ message: `Movie seeding complete. Upserted: ${upsertedCount}, Failed: ${failedCount}` });

  } catch (_error: unknown) { 
    console.error('[Cron Seed] Error during movie seeding process:', _error instanceof Error ? _error.message : _error);
    // 确保即使出错也尝试断开连接
    await prisma.$disconnect().catch(disconnectError => {
        console.error('[Cron Seed] Error disconnecting Prisma after failure:', disconnectError);
    });
    console.log('[Cron Seed] Prisma connection closed after error.');
    const errorMessage = _error instanceof Error ? _error.message : 'Unknown error'; 
    return NextResponse.json({ error: `Failed to seed movies: ${errorMessage}` }, { status: 500 });
  }
}

// Vercel Edge Runtime 配置
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; 
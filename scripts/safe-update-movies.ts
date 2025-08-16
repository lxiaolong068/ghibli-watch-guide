#!/usr/bin/env tsx
/**
 * 安全的电影数据更新脚本（使用 TMDB 同步）
 * - 仅通过 tmdbId 唯一键进行 upsert，确保不产生重复
 * - 提供详尽的进度与统计日志
 * - 提供 DRY-RUN（试运行）与显式确认机制，保护生产数据
 * - 执行前后进行数据完整性校验
 */

import { PrismaClient } from '../prisma/generated/client';
import type { Prisma } from '../prisma/generated/client';
import dotenv from 'dotenv';
import path from 'path';

// 从根目录加载环境变量（若脚本在本地运行）
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const STUDIO_GHIBLI_ID = 10342; // Studio Ghibli 的 TMDB 公司 ID

// 运行控制
const argv = process.argv.slice(2);
const ARG = Object.fromEntries(
  argv.map((a) => {
    const [k, v = 'true'] = a.startsWith('--') ? a.substring(2).split('=') : [a, 'true'];
    return [k, v];
  })
);
const DRY_RUN = ARG['dry-run'] === 'true' || process.env.DRY_RUN === '1';
const CONFIRM_TOKEN = (ARG['confirm'] as string) || process.env.CONFIRM || '';
const REQUIRED_CONFIRM_TOKEN = 'UPDATE_MOVIES';

if (!TMDB_API_KEY) {
  // 在构建/运行时抛错，提示缺少 API 密钥
  throw new Error('Missing TMDB_API_KEY environment variable');
}

// ---- 类型定义 ----
interface TmdbErrorResponse {
  success?: boolean;
  status_code?: number;
  status_message?: string;
}

interface TmdbMovieResult {
  id: number;
  title: string;
  original_title: string;
  overview: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string; // YYYY-MM-DD
}

interface DiscoverMovieResponse {
  page: number;
  results: TmdbMovieResult[];
  total_pages: number;
  total_results: number;
}

interface CrewMember { job: string; name: string }
interface Credits { crew: CrewMember[] }

interface MovieDetails {
  id: number;
  title: string;
  original_title: string;
  overview: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number | null;
  vote_average: number | null;
  credits: Credits;
}

// ---- 工具函数 ----
async function fetchTmdbApi<T>(endpoint: string, params: Record<string, string | number | boolean> = {}): Promise<T> {
  const url = new URL(`${TMDB_API_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY!);
  url.searchParams.append('language', 'en-US');
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, String(value)));

  const response = await fetch(url.toString());
  if (!response.ok) {
    let err: TmdbErrorResponse | null = null;
    try { err = (await response.json()) as TmdbErrorResponse } catch {}
    const code = err?.status_code || response.status;
    const msg = err?.status_message || response.statusText;
    throw new Error(`TMDB API Error (${code}): ${msg}`);
  }
  return (await response.json()) as T;
}

async function getFullMovieDetails(movieId: number): Promise<MovieDetails | null> {
  try {
    return await fetchTmdbApi<MovieDetails>(`/movie/${movieId}`, { append_to_response: 'credits' });
  } catch (e) {
    console.error(`⚠️ 获取详情失败: movieId=${movieId}`, e);
    return null;
  }
}

// ---- 安全检查 & 统计 ----
async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ 数据库连接正常');
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    return false;
  }
}

async function getMovieStats() {
  const count = await prisma.movie.count();
  const examples = await prisma.movie.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: { id: true, tmdbId: true, titleEn: true, year: true }
  });
  return { count, examples };
}

async function displayCurrentMovieState() {
  const { count, examples } = await getMovieStats();
  console.log('\n📊 现有电影数据:');
  console.log(`  - 数量: ${count}`);
  if (examples.length) {
    console.log('  - 最近记录示例:');
    for (const m of examples) {
      console.log(`    • ${m.titleEn} (year=${m.year}) [tmdbId=${m.tmdbId}]`);
    }
  }
}

function ensureConfirmed() {
  if (DRY_RUN) {
    console.log('🧪 试运行模式(DRY-RUN)：不会写入数据库');
    return;
  }
  if (CONFIRM_TOKEN !== REQUIRED_CONFIRM_TOKEN) {
    console.error('⚠️ 需要显式确认方可写入数据库。');
    console.error(`   请添加参数 --confirm=${REQUIRED_CONFIRM_TOKEN} 或设置环境变量 CONFIRM=${REQUIRED_CONFIRM_TOKEN}`);
    process.exit(2);
  }
}

// ---- 同步主流程 ----
async function syncMoviesFromTmdb() {
  console.log('\n🔎 从 TMDB 拉取吉卜力电影清单...');
  let allMovies: TmdbMovieResult[] = [];
  let currentPage = 1;
  let totalPages = 1;

  do {
    const resp = await fetchTmdbApi<DiscoverMovieResponse>('/discover/movie', {
      with_companies: STUDIO_GHIBLI_ID,
      page: currentPage,
      sort_by: 'release_date.asc',
      include_adult: false,
    });
    allMovies = allMovies.concat(resp.results);
    totalPages = resp.total_pages;
    console.log(`  - 已获取第 ${currentPage}/${totalPages} 页，累计 ${allMovies.length} 部`);
    currentPage++;
    if (currentPage <= totalPages) await new Promise((r) => setTimeout(r, 250));
  } while (currentPage <= totalPages);

  console.log(`✅ 拉取完成：共 ${allMovies.length} 部电影`);

  console.log('\n🚀 开始 upsert 到数据库...');
  let upserted = 0;
  let failed = 0;
  const tmdbIdsProcessed: number[] = [];

  for (const m of allMovies) {
    const details = await getFullMovieDetails(m.id);
    if (!details) {
      failed++;
      await new Promise((r) => setTimeout(r, 80));
      continue;
    }

    const year = details.release_date ? parseInt(details.release_date.substring(0, 4), 10) : 0;
    const director = details.credits?.crew?.find((x) => x.job === 'Director')?.name ?? null;
    const posterUrl = details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null;
    const backdropUrl = details.backdrop_path ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}` : null;

    // 构建更新/创建数据（排除 null，避免覆盖已有数据为 null）
    const updateData: Prisma.MovieUpdateInput = {
      titleEn: details.title,
      titleJa: details.original_title,
      year,
      ...(director !== null && { director }),
      ...(details.runtime !== null && { duration: details.runtime }),
      ...(details.overview !== null && { synopsis: details.overview }),
      ...(posterUrl !== null && { posterUrl }),
      ...(backdropUrl !== null && { backdropUrl }),
      ...(details.vote_average !== null && { voteAverage: details.vote_average! }),
    };

    const createData: Prisma.MovieCreateInput = {
      tmdbId: details.id,
      titleEn: details.title,
      titleJa: details.original_title,
      year,
      director: director ?? undefined,
      duration: details.runtime ?? undefined,
      synopsis: details.overview ?? undefined,
      posterUrl: posterUrl ?? undefined,
      backdropUrl: backdropUrl ?? undefined,
      voteAverage: details.vote_average ?? undefined,
    };

    try {
      if (DRY_RUN) {
        console.log(`🧪 [DRY-RUN] 将 upsert: ${details.title} (tmdbId=${details.id})`);
      } else {
        await prisma.movie.upsert({ where: { tmdbId: details.id }, update: updateData, create: createData });
      }
      console.log(`✅ Upsert 成功: ${details.title} (ID=${details.id}) 导演=${director || 'N/A'} 评分=${details.vote_average ?? 'N/A'}`);
      upserted++;
      tmdbIdsProcessed.push(details.id);
    } catch (e) {
      console.error(`❌ Upsert 失败: ${details.title} (ID=${details.id})`, e);
      failed++;
    }

    await new Promise((r) => setTimeout(r, 80)); // 节流，降低 TMDB/DB 压力
  }

  console.log(`\n📦 Upsert 完成：成功 ${upserted}，失败 ${failed}`);
  return { upserted, failed, tmdbIdsProcessed };
}

// ---- 完整性校验 ----
async function validateIntegrity(expectedTmdbIds: number[]) {
  console.log('\n🧪 校验数据完整性...');

  // 1) 所有 TMDB 返回的影片是否都存在
  const missing: number[] = [];
  for (const id of expectedTmdbIds) {
    const exists = await prisma.movie.findUnique({ where: { tmdbId: id }, select: { id: true } });
    if (!exists) missing.push(id);
  }

  // 2) 必填字段非空检查
  const invalid = await prisma.movie.findMany({
    where: {
      OR: [
        { titleEn: { equals: '' } },
        { titleJa: { equals: '' } },
        { year: { lt: 1900 } },
      ],
    },
    select: { id: true, tmdbId: true, titleEn: true, titleJa: true, year: true },
  });

  // 3) 统计
  const total = await prisma.movie.count();

  console.log(`  - 电影总数: ${total}`);
  console.log(`  - 缺失 TMDB 返回记录: ${missing.length}`);
  if (missing.length) console.log(`    • 缺失 tmdbId: ${missing.join(', ')}`);
  console.log(`  - 可疑记录(必填字段异常): ${invalid.length}`);
  if (invalid.length) {
    for (const m of invalid.slice(0, 10)) {
      console.log(`    • tmdbId=${m.tmdbId}, titleEn="${m.titleEn}", titleJa="${m.titleJa}", year=${m.year}`);
    }
    if (invalid.length > 10) console.log('    ... 其余省略');
  }

  const ok = missing.length === 0 && invalid.length === 0;
  console.log(ok ? '✅ 完整性校验通过' : '⚠️ 完整性存在问题，请复查日志');
  return { ok, missing, invalidCount: invalid.length };
}

async function main() {
  console.log('🛡️ 安全电影更新脚本启动');
  console.log('📅 执行时间:', new Date().toLocaleString('zh-CN'));
  console.log(`🔧 模式: ${DRY_RUN ? 'DRY-RUN' : 'WRITE'}`);

  // 1. 连接检查
  const connected = await checkDatabaseConnection();
  if (!connected) throw new Error('数据库连接失败');

  // 2. 显示当前状态
  await displayCurrentMovieState();

  // 3. 确认开关
  ensureConfirmed();

  const before = await getMovieStats();

  // 4. 执行同步
  const { upserted, failed, tmdbIdsProcessed } = await syncMoviesFromTmdb();

  // 5. 执行后状态
  const after = await getMovieStats();
  console.log('\n📈 数据变化:');
  console.log(`  - 电影数量: ${before.count} → ${after.count} (+${after.count - before.count})`);
  console.log(`  - Upsert 成功: ${upserted}, 失败: ${failed}`);

  // 6. 完整性验证
  const integrity = await validateIntegrity(tmdbIdsProcessed);

  console.log('\n🎉 任务完成');
  if (!DRY_RUN) console.log('✅ 已写入数据库 (已显式确认)');
  else console.log('ℹ️ 未写入数据库 (DRY-RUN)');

  if (!integrity.ok) process.exitCode = 3;
}

main()
  .catch((e) => {
    console.error('❌ 执行失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


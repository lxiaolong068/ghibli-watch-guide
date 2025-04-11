import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { PrismaClient } from '@prisma/client';

// 注意：环境变量在 Vercel Serverless Functions 中是自动可用的
// 不需要显式调用 dotenv.config()

const prisma = new PrismaClient();

const SITE_URL = process.env.DOMAIN;

// 从数据库获取电影 ID (与原脚本相同)
const fetchMovieDatabaseIds = async (): Promise<string[]> => {
  try {
    const movies = await prisma.movie.findMany({
      select: {
        id: true,
      },
    });
    return movies.map((movie) => movie.id);
  } catch (error) {
    console.error('[Cron Sitemap] Error fetching movie IDs:', error);
    // 在 API 路由中，抛出错误或返回错误响应更合适
    throw new Error('Failed to fetch movie IDs from database');
  }
};

// 主函数，现在是 API 路由处理器
export async function GET(request: Request) {
  console.log('[Cron Sitemap] Starting sitemap generation...');

  if (!SITE_URL) {
    console.error('[Cron Sitemap] Error: DOMAIN environment variable is not set.');
    return NextResponse.json({ error: 'Internal server configuration error: DOMAIN not set' }, { status: 500 });
  }

  // API 路由在项目的根目录运行，调整路径
  const pagesDir = path.resolve(process.cwd(), 'app'); 
  const publicDir = path.resolve(process.cwd(), 'public');
  const sitemapPath = path.join(publicDir, 'sitemap.xml');

  try {
    // 1. 获取静态页面路由
    const pageFiles = await glob('**/page.{js,jsx,ts,tsx}', {
      cwd: pagesDir,
      ignore: ['**/api/**', '**/_.*/**', '**/\\(.*\\)/**', '**/\\[.*\\]/**'],
    });

    const staticUrls = pageFiles.map((file) => {
      let route = file.replace(/page\.(js|jsx|ts|tsx)$/, '');
      if (route.endsWith('/')) {
        route = route.slice(0, -1);
      }
      return route === '' ? '/' : `/${route}`;
    });

    // 2. 获取电影动态路由
    const movieIds = await fetchMovieDatabaseIds();
    const movieUrls = movieIds.map(id => `/movies/${id}`);

    // 3. 组合所有 URL
    const allUrls = [...staticUrls, ...movieUrls];

    // 4. 生成 sitemap.xml 内容
    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `
  <url>
    <loc>${SITE_URL}${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${url === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
</urlset>`;

    // 5. 写入 sitemap.xml 文件
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(sitemapPath, sitemapContent.trim());
    console.log(`[Cron Sitemap] ✅ Sitemap generated successfully at ${sitemapPath}`);

    // 断开 Prisma 连接
    await prisma.$disconnect();
    console.log('[Cron Sitemap] Prisma connection closed.');

    return NextResponse.json({ message: 'Sitemap generated successfully' });

  } catch (error: any) {
    console.error('[Cron Sitemap] Error generating sitemap:', error);
    // 确保即使出错也尝试断开连接
    await prisma.$disconnect().catch(disconnectError => {
        console.error('[Cron Sitemap] Error disconnecting Prisma after failure:', disconnectError);
    });
    console.log('[Cron Sitemap] Prisma connection closed after error.');
    return NextResponse.json({ error: `Failed to generate sitemap: ${error.message || 'Unknown error'}` }, { status: 500 });
  }
}

// 添加 Vercel Edge Runtime 配置 (可选，但推荐用于 Cron Jobs)
export const runtime = 'nodejs'; // 或者可以是 'edge' 如果依赖兼容
export const dynamic = 'force-dynamic'; // 确保每次请求都运行 
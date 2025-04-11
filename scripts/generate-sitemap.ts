import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// 加载 .env 文件中的环境变量
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

const SITE_URL = process.env.DOMAIN;

if (!SITE_URL) {
  console.error('Error: DOMAIN environment variable is not set.');
  process.exit(1);
}

const fetchMovieDatabaseIds = async (): Promise<string[]> => {
  try {
    const movies = await prisma.movie.findMany({
      select: {
        id: true,
      },
    });
    return movies.map((movie) => movie.id);
  } catch (error) {
    console.error('Error fetching movie IDs from database:', error);
    return [];
  }
};

const generateSitemap = async () => {
  const pagesDir = path.resolve(__dirname, '../app');
  const publicDir = path.resolve(__dirname, '../public');
  const sitemapPath = path.join(publicDir, 'sitemap.xml');

  try {
    // 1. 获取 app 目录下的静态页面路由
    const pageFiles = await glob('**/page.{js,jsx,ts,tsx}', {
      cwd: pagesDir,
      ignore: ['**/api/**', '**/_.*/**', '**/\\(.*\\)/**', '**/\\[.*\\]/**'],
    });

    const staticUrls = pageFiles.map((file) => {
      let route = file.replace(/page\.(js|jsx|ts|tsx)$/, '');
      if (route.endsWith('/')) {
        route = route.slice(0, -1);
      }
      if (route === '') {
        return '/';
      }
      return `/${route}`;
    });

    // 2. 获取电影详情页的动态路由（使用数据库 ID）
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
    console.log(`✅ Sitemap generated successfully at ${sitemapPath}`);

  } catch (error) {
    console.error('Error generating sitemap:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Prisma connection closed.');
  }
};

generateSitemap(); 
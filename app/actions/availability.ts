'use server';

import { cache } from 'react';
import { prisma } from '@/lib/prisma';

// 临时定义可用性类型，以解决TypeScript错误
// 一旦Prisma代码生成完成，就可以直接从@prisma/client导入这些类型
interface Platform {
  id: string;
  name: string;
  website: string;
  type: string;
  logo: string | null;
}

interface Region {
  id: string;
  code: string;
  name: string;
}

interface Availability {
  id: string;
  url: string | null;
  price: number | null;
  currency: string | null;
  type: string;
  lastChecked: Date;
  isAvailable: boolean;
  notes: string | null;
  platformId: string;
  regionId: string;
  movieId: string;
  platform: Platform;
  region: Region;
}

// 缓存函数，获取特定电影在特定地区的观看可用性信息
export const getMovieAvailability = cache(async (movieId: string, regionCode?: string) => {
  try {
    // 检查Availability表是否存在
    try {
      await prisma.$queryRaw`SELECT 1 FROM "Availability" LIMIT 1`;
    } catch (e) {
      // 表不存在，返回空数组
      console.log('Availability表尚未创建，返回空数据');
      return { availabilities: [], lastUpdated: null };
    }
    
    // 构建基础查询条件
    const where: any = {
      movieId: movieId
    };
    
    // 如果指定了地区，添加地区过滤
    if (regionCode) {
      where.region = {
        code: regionCode
      };
    }
    
    // 查询可用性数据
    // 使用any类型绕过TypeScript检查，因为在运行时Prisma客户端会动态生成这些模型
    const availabilities = await (prisma as any).availability.findMany({
      where,
      include: {
        platform: true,
        region: true
      },
      orderBy: [
        { region: { name: 'asc' } },
        { platform: { name: 'asc' } }
      ]
    }) as Availability[];
    
    // 获取最后更新时间
    const lastUpdated = availabilities.length > 0 
      ? availabilities.reduce((latest: Date, current: Availability) => 
          current.lastChecked > latest ? current.lastChecked : latest, 
          availabilities[0].lastChecked)
      : null;
    
    return {
      availabilities,
      lastUpdated
    };
  } catch (error) {
    console.error('获取电影观看可用性信息失败:', error);
    return { availabilities: [], lastUpdated: null };
  }
});

// 获取所有支持的地区列表
export const getAllRegions = cache(async () => {
  try {
    // 检查Region表是否存在
    try {
      await prisma.$queryRaw`SELECT 1 FROM "Region" LIMIT 1`;
    } catch (e) {
      // 表不存在，返回空数组
      console.log('Region表尚未创建，返回空数据');
      return [];
    }
    
    // 使用any类型绕过TypeScript检查
    const regions = await (prisma as any).region.findMany({
      orderBy: { name: 'asc' }
    }) as Region[];
    
    return regions;
  } catch (error) {
    console.error('获取地区列表失败:', error);
    return [];
  }
});

// 获取所有支持的平台列表
export const getAllPlatforms = cache(async () => {
  try {
    // 检查Platform表是否存在
    try {
      await prisma.$queryRaw`SELECT 1 FROM "Platform" LIMIT 1`;
    } catch (e) {
      // 表不存在，返回空数组
      console.log('Platform表尚未创建，返回空数据');
      return [];
    }
    
    // 使用any类型绕过TypeScript检查
    const platforms = await (prisma as any).platform.findMany({
      orderBy: { name: 'asc' }
    }) as Platform[];
    
    return platforms;
  } catch (error) {
    console.error('获取平台列表失败:', error);
    return [];
  }
}); 
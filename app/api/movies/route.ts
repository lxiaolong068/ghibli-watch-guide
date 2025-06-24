import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '../../../prisma/generated/client';

// 将此路由标记为动态路由，防止在构建时静态生成
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeAvailability = searchParams.get('includeAvailability') === 'true';
  const regionCode = searchParams.get('region');

  try {
    // 基础查询，指定正确的SortOrder类型
    const baseQuery = {
      orderBy: {
        year: 'desc' as Prisma.SortOrder,
      }
    };

    // 确认是否需要包含可用性数据
    let movies;
    try {
      // 使用try-catch而不是$transaction，更简单地处理类型问题
      const queryOptions: Prisma.MovieFindManyArgs = { ...baseQuery };
      
      // 检查是否需要包含可用性数据
      if (includeAvailability) {
        try {
          // 尝试访问一个可用性记录，如果成功，说明模型已存在
          await prisma.$queryRaw`SELECT 1 FROM "Availability" LIMIT 1`;
          
          const availabilityFilter: Prisma.AvailabilityWhereInput = {};
          
          // 添加地区过滤
          if (regionCode) {
            availabilityFilter.region = { code: regionCode };
          }
          
          // 添加include选项
          queryOptions.include = {
            availabilities: {
              include: {
                platform: true,
                region: true
              },
              where: availabilityFilter
            }
          };
        } catch (_e: unknown) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          // 可用性表不存在，忽略错误并继续不包含availabilities
          console.log('Availability表尚未创建，跳过关联查询');
        }
      }

      // 执行查询
      movies = await prisma.movie.findMany(queryOptions);
    } catch (error) {
      // 如果出错，回退到基本查询
      console.error('高级查询失败，回退到基本查询:', error);
      movies = await prisma.movie.findMany(baseQuery);
    }

    return NextResponse.json(movies);
  } catch (error) {
    console.error('获取Movie List失败：', error);
    return NextResponse.json(
      { error: '获取Movie List失败' },
      { status: 500 }
    );
  }
} 
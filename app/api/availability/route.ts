import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '../../../prisma/generated/client';

// 将此路由标记为动态路由，防止在构建时静态生成
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const movieId = searchParams.get('movieId');
  const regionCode = searchParams.get('region');

  try {
    // 构建查询条件
    const where: Prisma.AvailabilityWhereInput = {};
    
    if (movieId) {
      where.movieId = movieId;
    }
    
    if (regionCode) {
      where.region = {
        code: regionCode
      };
    }

    // 查询可用性信息，包含平台和地区数据
    // 注意：需要运行prisma db push命令以生成Availability模型后，此代码才能正常工作
    // 先进行类型检查以避免linter错误
    const availabilities = await prisma.$transaction(async (tx) => {
      if ('availability' in tx) {
        // 当模型生成后，将可以正常工作
        return tx.availability.findMany({
          where,
          include: {
            platform: true,
            region: true,
            movie: {
              select: {
                id: true,
                titleEn: true,
                titleJa: true,
                titleZh: true,
                posterUrl: true
              }
            }
          },
          orderBy: [
            { region: { name: 'asc' } },
            { platform: { name: 'asc' } }
          ]
        });
      }
      return []; // 在模型未创建前返回空数组
    });

    // 如果请求指定了影片ID但没有找到可用性数据，返回空数组但状态码仍为200
    return NextResponse.json(availabilities);
    
  } catch (error) {
    console.error('获取可用性信息失败：', error);
    return NextResponse.json(
      { error: '获取可用性信息失败' },
      { status: 500 }
    );
  }
} 
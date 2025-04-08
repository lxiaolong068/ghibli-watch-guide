import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const regions = await prisma.region.findMany({
      orderBy: {
        code: 'asc',
      },
    });

    return NextResponse.json(regions);
  } catch (error) {
    console.error('获取地区列表失败：', error);
    return NextResponse.json(
      { error: '获取地区列表失败' },
      { status: 500 }
    );
  }
} 
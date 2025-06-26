import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 健康检查端点
export async function GET(_request: NextRequest) {
  try {
    // 检查数据库连接
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        api: 'operational'
      }
    }, { status: 200 });
  } catch (_error) {
    console.error('Health check failed:', _error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'disconnected',
        api: 'operational'
      },
      error: 'Database connection failed'
    }, { status: 503 });
  }
}

// HEAD请求用于快速连接检查
export async function HEAD(_request: NextRequest) {
  try {
    // 简单的连接检查，不查询数据库
    return new NextResponse(null, { status: 200 });
  } catch (_error) {
    return new NextResponse(null, { status: 503 });
  }
}

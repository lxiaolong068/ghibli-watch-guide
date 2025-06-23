import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getMovieDetails, getMovieWatchProviders } from '@/lib/tmdb';

const prisma = new PrismaClient();
const CRON_SECRET = process.env.CRON_SECRET;

// 内容同步管理器
class ContentSyncManager {
  private syncLogId: string | null = null;

  async startSync(source: string, syncType: string) {
    const syncLog = await prisma.contentSyncLog.create({
      data: {
        source,
        syncType: syncType as any,
        status: 'STARTED',
        startedAt: new Date(),
      }
    });
    this.syncLogId = syncLog.id;
    return syncLog;
  }

  async updateSyncProgress(stats: {
    recordsProcessed: number;
    recordsUpdated: number;
    recordsCreated: number;
    recordsFailed: number;
  }) {
    if (!this.syncLogId) return;
    
    await prisma.contentSyncLog.update({
      where: { id: this.syncLogId },
      data: {
        ...stats,
        status: 'IN_PROGRESS',
      }
    });
  }

  async completeSyncWithError(errorDetails: any) {
    if (!this.syncLogId) return;
    
    await prisma.contentSyncLog.update({
      where: { id: this.syncLogId },
      data: {
        status: 'FAILED',
        errorDetails,
        completedAt: new Date(),
      }
    });
  }

  async completeSync(finalStats: any) {
    if (!this.syncLogId) return;
    
    await prisma.contentSyncLog.update({
      where: { id: this.syncLogId },
      data: {
        ...finalStats,
        status: 'COMPLETED',
        completedAt: new Date(),
      }
    });
  }
}

// 内容质量检查器
class ContentQualityChecker {
  async checkMovieQuality(movie: any) {
    const metrics = {
      completeness: this.calculateCompleteness(movie),
      accuracy: await this.checkAccuracy(movie),
      freshness: this.calculateFreshness(movie),
    };

    // 保存质量指标
    for (const [metricType, score] of Object.entries(metrics)) {
      await prisma.contentQualityMetric.create({
        data: {
          entityType: 'Movie',
          entityId: movie.id,
          metricType,
          score: score as number,
          measuredAt: new Date(),
        }
      });
    }

    return metrics;
  }

  private calculateCompleteness(movie: any): number {
    const requiredFields = ['titleEn', 'titleJa', 'year', 'synopsis', 'posterUrl'];
    const optionalFields = ['director', 'duration', 'backdropUrl', 'voteAverage'];
    
    let score = 0;
    let totalWeight = 0;

    // 必需字段权重更高
    requiredFields.forEach(field => {
      totalWeight += 3;
      if (movie[field]) score += 3;
    });

    // 可选字段权重较低
    optionalFields.forEach(field => {
      totalWeight += 1;
      if (movie[field]) score += 1;
    });

    return (score / totalWeight) * 100;
  }

  private async checkAccuracy(movie: any): Promise<number> {
    // 这里可以实现与外部数据源的对比验证
    // 暂时返回基础分数
    return 85;
  }

  private calculateFreshness(movie: any): number {
    const lastUpdated = new Date(movie.updatedAt);
    const now = new Date();
    const daysSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
    
    // 30天内更新的内容得满分，之后逐渐递减
    if (daysSinceUpdate <= 30) return 100;
    if (daysSinceUpdate <= 90) return 80;
    if (daysSinceUpdate <= 180) return 60;
    return 40;
  }
}

// 智能更新调度器
class UpdateScheduler {
  async scheduleUpdates() {
    // 获取需要更新的电影（基于质量指标和最后更新时间）
    const moviesNeedingUpdate = await prisma.$queryRaw`
      SELECT m.*, 
             AVG(cqm.score) as avg_quality_score,
             MAX(cqm.measuredAt) as last_quality_check
      FROM "Movie" m
      LEFT JOIN "ContentQualityMetric" cqm ON m.id = cqm."entityId" AND cqm."entityType" = 'Movie'
      WHERE m."updatedAt" < NOW() - INTERVAL '7 days'
         OR cqm.score < 70
         OR cqm."measuredAt" < NOW() - INTERVAL '30 days'
      GROUP BY m.id
      ORDER BY avg_quality_score ASC, m."updatedAt" ASC
      LIMIT 50
    `;

    // 创建更新任务
    for (const movie of moviesNeedingUpdate as any[]) {
      await prisma.contentUpdateTask.create({
        data: {
          taskType: 'MOVIE_UPDATE',
          entityType: 'Movie',
          entityId: movie.id,
          priority: this.calculatePriority(movie),
          status: 'PENDING',
          scheduledAt: new Date(),
          metadata: {
            reason: 'Quality score below threshold or outdated',
            currentScore: movie.avg_quality_score,
          }
        }
      });
    }
  }

  private calculatePriority(movie: any): string {
    const qualityScore = movie.avg_quality_score || 0;
    const daysSinceUpdate = (Date.now() - new Date(movie.updatedAt).getTime()) / (1000 * 60 * 60 * 24);

    if (qualityScore < 50 || daysSinceUpdate > 180) return 'HIGH';
    if (qualityScore < 70 || daysSinceUpdate > 90) return 'MEDIUM';
    return 'LOW';
  }
}

export async function GET(request: Request) {
  console.log('[Content Sync] Starting enhanced content synchronization...');

  // 验证授权
  const authHeader = request.headers.get('authorization');
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    console.warn('[Content Sync] Unauthorized attempt to run cron job.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const syncManager = new ContentSyncManager();
  const qualityChecker = new ContentQualityChecker();
  const scheduler = new UpdateScheduler();

  try {
    // 开始同步
    await syncManager.startSync('TMDB', 'SCHEDULED_SYNC');

    let stats = {
      recordsProcessed: 0,
      recordsUpdated: 0,
      recordsCreated: 0,
      recordsFailed: 0,
    };

    // 1. 处理待处理的更新任务
    const pendingTasks = await prisma.contentUpdateTask.findMany({
      where: {
        status: 'PENDING',
        scheduledAt: { lte: new Date() }
      },
      orderBy: [
        { priority: 'desc' },
        { scheduledAt: 'asc' }
      ],
      take: 20 // 限制每次处理的任务数量
    });

    for (const task of pendingTasks) {
      try {
        await prisma.contentUpdateTask.update({
          where: { id: task.id },
          data: { status: 'RUNNING', startedAt: new Date() }
        });

        if (task.taskType === 'MOVIE_UPDATE' && task.entityId) {
          const movie = await prisma.movie.findUnique({
            where: { id: task.entityId }
          });

          if (movie) {
            // 获取最新的TMDB数据
            const tmdbDetails = await getMovieDetails(movie.tmdbId);
            const watchProviders = await getMovieWatchProviders(movie.tmdbId);

            // 更新电影信息
            await prisma.movie.update({
              where: { id: movie.id },
              data: {
                synopsis: tmdbDetails.overview || movie.synopsis,
                voteAverage: tmdbDetails.vote_average || movie.voteAverage,
                posterUrl: tmdbDetails.poster_path 
                  ? `https://image.tmdb.org/t/p/w500${tmdbDetails.poster_path}`
                  : movie.posterUrl,
                backdropUrl: tmdbDetails.backdrop_path
                  ? `https://image.tmdb.org/t/p/w1280${tmdbDetails.backdrop_path}`
                  : movie.backdropUrl,
              }
            });

            // 检查内容质量
            await qualityChecker.checkMovieQuality(movie);

            stats.recordsUpdated++;
          }
        }

        await prisma.contentUpdateTask.update({
          where: { id: task.id },
          data: { 
            status: 'COMPLETED', 
            completedAt: new Date() 
          }
        });

        stats.recordsProcessed++;
      } catch (error) {
        console.error(`[Content Sync] Task ${task.id} failed:`, error);
        
        await prisma.contentUpdateTask.update({
          where: { id: task.id },
          data: { 
            status: 'FAILED', 
            completedAt: new Date(),
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          }
        });

        stats.recordsFailed++;
      }

      // 更新进度
      await syncManager.updateSyncProgress(stats);
    }

    // 2. 调度新的更新任务
    await scheduler.scheduleUpdates();

    // 3. 清理旧的日志和任务
    await this.cleanupOldRecords();

    await syncManager.completeSync(stats);

    return NextResponse.json({
      message: 'Content synchronization completed successfully',
      stats
    });

  } catch (error) {
    console.error('[Content Sync] Error during synchronization:', error);
    await syncManager.completeSyncWithError(error);
    
    return NextResponse.json({
      error: 'Content synchronization failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// 清理旧记录
async function cleanupOldRecords() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  // 清理旧的同步日志
  await prisma.contentSyncLog.deleteMany({
    where: {
      startedAt: { lt: thirtyDaysAgo },
      status: { in: ['COMPLETED', 'FAILED'] }
    }
  });

  // 清理已完成的任务
  await prisma.contentUpdateTask.deleteMany({
    where: {
      completedAt: { lt: thirtyDaysAgo },
      status: { in: ['COMPLETED', 'FAILED'] }
    }
  });

  // 清理旧的质量指标（保留最新的）
  await prisma.$executeRaw`
    DELETE FROM "ContentQualityMetric" 
    WHERE id NOT IN (
      SELECT DISTINCT ON ("entityType", "entityId", "metricType") id
      FROM "ContentQualityMetric"
      ORDER BY "entityType", "entityId", "metricType", "measuredAt" DESC
    )
  `;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

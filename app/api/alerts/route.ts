import { NextRequest, NextResponse } from 'next/server';
import { performanceMonitor } from '@/app/utils/performance-monitor';
import { handleApiError } from '@/app/lib/error-handler';

// 将此路由标记为动态路由
export const dynamic = 'force-dynamic';

/**
 * 获取告警列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const timeRange = parseInt(searchParams.get('timeRange') || '24'); // 默认24小时
    const type = searchParams.get('type');
    const severity = searchParams.get('severity');

    let alerts = activeOnly 
      ? performanceMonitor.getActiveAlerts()
      : performanceMonitor.getAllAlerts();

    // 时间范围过滤
    const cutoff = Date.now() - (timeRange * 60 * 60 * 1000);
    alerts = alerts.filter(alert => alert.timestamp > cutoff);

    // 类型过滤
    if (type) {
      alerts = alerts.filter(alert => alert.type === type);
    }

    // 严重程度过滤
    if (severity) {
      alerts = alerts.filter(alert => alert.severity === severity);
    }

    // 按时间倒序排列
    alerts.sort((a, b) => b.timestamp - a.timestamp);

    // 获取统计信息
    const stats = performanceMonitor.getAlertStats(timeRange * 60 * 60 * 1000);

    return NextResponse.json({
      alerts,
      stats,
      total: alerts.length
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return handleApiError(error);
  }
}

/**
 * 创建新告警（用于测试或外部系统集成）
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // 验证必需字段
    if (!data.type || !data.severity || !data.title || !data.description) {
      return NextResponse.json(
        { error: 'Missing required fields: type, severity, title, description' },
        { status: 400 }
      );
    }

    // 验证类型和严重程度
    const validTypes = ['performance', 'error', 'availability'];
    const validSeverities = ['low', 'medium', 'high', 'critical'];

    if (!validTypes.includes(data.type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be one of: ' + validTypes.join(', ') },
        { status: 400 }
      );
    }

    if (!validSeverities.includes(data.severity)) {
      return NextResponse.json(
        { error: 'Invalid severity. Must be one of: ' + validSeverities.join(', ') },
        { status: 400 }
      );
    }

    // 创建告警
    const alert = {
      id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: data.type,
      severity: data.severity,
      title: data.title,
      description: data.description,
      timestamp: Date.now(),
      resolved: false,
      metadata: data.metadata || {}
    };

    // 手动触发告警（通过直接添加到监控器）
    performanceMonitor['alerts'].push(alert);
    performanceMonitor['alertCallbacks'].forEach((callback: (alert: any) => void) => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Error in alert callback:', error);
      }
    });

    return NextResponse.json({
      success: true,
      alert
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    return handleApiError(error);
  }
}

/**
 * 批量操作告警
 */
export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    const { action, alertIds } = data;

    if (!action || !alertIds || !Array.isArray(alertIds)) {
      return NextResponse.json(
        { error: 'Missing required fields: action, alertIds' },
        { status: 400 }
      );
    }

    let updatedCount = 0;

    switch (action) {
      case 'resolve':
        alertIds.forEach((alertId: string) => {
          performanceMonitor.resolveAlert(alertId);
          updatedCount++;
        });
        break;

      case 'delete':
        // 从告警列表中删除指定的告警
        const alerts = performanceMonitor['alerts'];
        const initialLength = alerts.length;
        performanceMonitor['alerts'] = alerts.filter(alert => !alertIds.includes(alert.id));
        updatedCount = initialLength - performanceMonitor['alerts'].length;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: resolve, delete' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action,
      updatedCount
    });
  } catch (error) {
    console.error('Error updating alerts:', error);
    return handleApiError(error);
  }
}

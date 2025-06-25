// 性能监控和告警系统

interface PerformanceAlert {
  id: string;
  type: 'performance' | 'error' | 'availability';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: number;
  resolved: boolean;
  metadata?: Record<string, unknown>;
}

interface PerformanceThresholds {
  // Core Web Vitals 阈值
  lcp: { warning: number; critical: number };
  cls: { warning: number; critical: number };
  inp: { warning: number; critical: number };
  fcp: { warning: number; critical: number };
  ttfb: { warning: number; critical: number };
  
  // 其他性能指标
  errorRate: { warning: number; critical: number };
  responseTime: { warning: number; critical: number };
  memoryUsage: { warning: number; critical: number };
  cpuUsage: { warning: number; critical: number };
}

// 默认性能阈值
const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  lcp: { warning: 2500, critical: 4000 },
  cls: { warning: 0.1, critical: 0.25 },
  inp: { warning: 200, critical: 500 },
  fcp: { warning: 1800, critical: 3000 },
  ttfb: { warning: 800, critical: 1800 },
  errorRate: { warning: 0.05, critical: 0.1 }, // 5% 和 10%
  responseTime: { warning: 2000, critical: 5000 }, // 2秒和5秒
  memoryUsage: { warning: 0.8, critical: 0.9 }, // 80% 和 90%
  cpuUsage: { warning: 0.7, critical: 0.85 } // 70% 和 85%
};

class PerformanceMonitor {
  private alerts: PerformanceAlert[] = [];
  private thresholds: PerformanceThresholds;
  private alertCallbacks: Array<(alert: PerformanceAlert) => void> = [];

  constructor(thresholds: Partial<PerformanceThresholds> = {}) {
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
  }

  /**
   * 注册告警回调函数
   */
  onAlert(callback: (alert: PerformanceAlert) => void): void {
    this.alertCallbacks.push(callback);
  }

  /**
   * 触发告警
   */
  private triggerAlert(alert: PerformanceAlert): void {
    this.alerts.push(alert);
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Error in alert callback:', error);
      }
    });
  }

  /**
   * 检查Web Vitals指标
   */
  checkWebVitals(metrics: {
    lcp?: number;
    cls?: number;
    inp?: number;
    fcp?: number;
    ttfb?: number;
  }): void {
    Object.entries(metrics).forEach(([metric, value]) => {
      if (value === undefined) return;

      const threshold = this.thresholds[metric as keyof PerformanceThresholds];
      if (!threshold) return;

      let severity: PerformanceAlert['severity'] | null = null;
      
      if (value >= threshold.critical) {
        severity = 'critical';
      } else if (value >= threshold.warning) {
        severity = 'high';
      }

      if (severity) {
        this.triggerAlert({
          id: `web-vital-${metric}-${Date.now()}`,
          type: 'performance',
          severity,
          title: `${metric.toUpperCase()} 性能告警`,
          description: `${metric.toUpperCase()} 指标 (${value}) 超过了${severity === 'critical' ? '严重' : '警告'}阈值 (${severity === 'critical' ? threshold.critical : threshold.warning})`,
          timestamp: Date.now(),
          resolved: false,
          metadata: {
            metric,
            value,
            threshold: severity === 'critical' ? threshold.critical : threshold.warning
          }
        });
      }
    });
  }

  /**
   * 检查错误率
   */
  checkErrorRate(errorCount: number, totalRequests: number): void {
    if (totalRequests === 0) return;

    const errorRate = errorCount / totalRequests;
    let severity: PerformanceAlert['severity'] | null = null;

    if (errorRate >= this.thresholds.errorRate.critical) {
      severity = 'critical';
    } else if (errorRate >= this.thresholds.errorRate.warning) {
      severity = 'high';
    }

    if (severity) {
      this.triggerAlert({
        id: `error-rate-${Date.now()}`,
        type: 'error',
        severity,
        title: '错误率告警',
        description: `错误率 (${(errorRate * 100).toFixed(2)}%) 超过了${severity === 'critical' ? '严重' : '警告'}阈值 (${(severity === 'critical' ? this.thresholds.errorRate.critical : this.thresholds.errorRate.warning) * 100}%)`,
        timestamp: Date.now(),
        resolved: false,
        metadata: {
          errorRate,
          errorCount,
          totalRequests,
          threshold: severity === 'critical' ? this.thresholds.errorRate.critical : this.thresholds.errorRate.warning
        }
      });
    }
  }

  /**
   * 检查响应时间
   */
  checkResponseTime(responseTime: number, endpoint?: string): void {
    let severity: PerformanceAlert['severity'] | null = null;

    if (responseTime >= this.thresholds.responseTime.critical) {
      severity = 'critical';
    } else if (responseTime >= this.thresholds.responseTime.warning) {
      severity = 'high';
    }

    if (severity) {
      this.triggerAlert({
        id: `response-time-${Date.now()}`,
        type: 'performance',
        severity,
        title: '响应时间告警',
        description: `${endpoint ? `端点 ${endpoint} 的` : ''}响应时间 (${responseTime}ms) 超过了${severity === 'critical' ? '严重' : '警告'}阈值 (${severity === 'critical' ? this.thresholds.responseTime.critical : this.thresholds.responseTime.warning}ms)`,
        timestamp: Date.now(),
        resolved: false,
        metadata: {
          responseTime,
          endpoint,
          threshold: severity === 'critical' ? this.thresholds.responseTime.critical : this.thresholds.responseTime.warning
        }
      });
    }
  }

  /**
   * 检查内存使用率
   */
  checkMemoryUsage(usageRatio: number): void {
    let severity: PerformanceAlert['severity'] | null = null;

    if (usageRatio >= this.thresholds.memoryUsage.critical) {
      severity = 'critical';
    } else if (usageRatio >= this.thresholds.memoryUsage.warning) {
      severity = 'high';
    }

    if (severity) {
      this.triggerAlert({
        id: `memory-usage-${Date.now()}`,
        type: 'performance',
        severity,
        title: '内存使用率告警',
        description: `内存使用率 (${(usageRatio * 100).toFixed(1)}%) 超过了${severity === 'critical' ? '严重' : '警告'}阈值 (${(severity === 'critical' ? this.thresholds.memoryUsage.critical : this.thresholds.memoryUsage.warning) * 100}%)`,
        timestamp: Date.now(),
        resolved: false,
        metadata: {
          usageRatio,
          threshold: severity === 'critical' ? this.thresholds.memoryUsage.critical : this.thresholds.memoryUsage.warning
        }
      });
    }
  }

  /**
   * 检查可用性
   */
  checkAvailability(isDown: boolean, service?: string): void {
    if (isDown) {
      this.triggerAlert({
        id: `availability-${service || 'service'}-${Date.now()}`,
        type: 'availability',
        severity: 'critical',
        title: '服务不可用告警',
        description: `${service || '服务'}当前不可用`,
        timestamp: Date.now(),
        resolved: false,
        metadata: {
          service
        }
      });
    }
  }

  /**
   * 解决告警
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  /**
   * 获取活跃告警
   */
  getActiveAlerts(): PerformanceAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * 获取所有告警
   */
  getAllAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  /**
   * 清理旧告警
   */
  cleanupOldAlerts(maxAge: number = 7 * 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - maxAge;
    this.alerts = this.alerts.filter(alert => alert.timestamp > cutoff);
  }

  /**
   * 获取告警统计
   */
  getAlertStats(timeRange: number = 24 * 60 * 60 * 1000): {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    resolved: number;
    active: number;
  } {
    const cutoff = Date.now() - timeRange;
    const recentAlerts = this.alerts.filter(alert => alert.timestamp > cutoff);

    const byType = recentAlerts.reduce((acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bySeverity = recentAlerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const resolved = recentAlerts.filter(alert => alert.resolved).length;
    const active = recentAlerts.filter(alert => !alert.resolved).length;

    return {
      total: recentAlerts.length,
      byType,
      bySeverity,
      resolved,
      active
    };
  }
}

// 全局性能监控实例
export const performanceMonitor = new PerformanceMonitor();

// 设置默认告警处理
performanceMonitor.onAlert((alert) => {
  console.warn(`[Performance Alert] ${alert.title}: ${alert.description}`);
  
  // 在生产环境中，这里可以发送到日志系统、通知服务等
  if (process.env.NODE_ENV === 'production') {
    // 发送到监控服务
    // sendToMonitoringService(alert);
    
    // 发送邮件或Slack通知
    // sendNotification(alert);
  }
});

// 定期清理旧告警
setInterval(() => {
  performanceMonitor.cleanupOldAlerts();
}, 60 * 60 * 1000); // 每小时清理一次

export type { PerformanceAlert, PerformanceThresholds };
export { PerformanceMonitor };

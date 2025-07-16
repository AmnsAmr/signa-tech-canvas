// API Performance Monitor
class ApiMonitor {
  private static instance: ApiMonitor;
  private metrics: Map<string, { count: number; totalTime: number; errors: number }> = new Map();

  static getInstance(): ApiMonitor {
    if (!ApiMonitor.instance) {
      ApiMonitor.instance = new ApiMonitor();
    }
    return ApiMonitor.instance;
  }

  startRequest(endpoint: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      const current = this.metrics.get(endpoint) || { count: 0, totalTime: 0, errors: 0 };
      this.metrics.set(endpoint, {
        count: current.count + 1,
        totalTime: current.totalTime + duration,
        errors: current.errors
      });
    };
  }

  recordError(endpoint: string): void {
    const current = this.metrics.get(endpoint) || { count: 0, totalTime: 0, errors: 0 };
    this.metrics.set(endpoint, {
      ...current,
      errors: current.errors + 1
    });
  }

  getMetrics(): Record<string, { avgTime: number; count: number; errorRate: number }> {
    const result: Record<string, { avgTime: number; count: number; errorRate: number }> = {};
    
    for (const [endpoint, metrics] of this.metrics.entries()) {
      result[endpoint] = {
        avgTime: metrics.count > 0 ? metrics.totalTime / metrics.count : 0,
        count: metrics.count,
        errorRate: metrics.count > 0 ? (metrics.errors / metrics.count) * 100 : 0
      };
    }
    
    return result;
  }

  logMetrics(): void {
    const metrics = this.getMetrics();
    console.table(metrics);
  }
}

export const apiMonitor = ApiMonitor.getInstance();

// Auto-log metrics every 5 minutes in development
if (import.meta.env.DEV) {
  setInterval(() => {
    apiMonitor.logMetrics();
  }, 5 * 60 * 1000);
}
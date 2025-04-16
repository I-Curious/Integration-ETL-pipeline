type MetricsData = {
    successCount: number;
    failureCount: number;
    retries: Record<string, number>;
    totalSubmissions: number;
    submissionTimes: number[];
  };
  
  const metrics: MetricsData = {
    successCount: 0,
    failureCount: 0,
    retries: {},
    totalSubmissions: 0,
    submissionTimes: [],
  };
  
  export const Metrics = {
    startTimer(): number {
      return Date.now();
    },
  
    endTimer(start: number): number {
      const duration = Date.now() - start;
      metrics.submissionTimes.push(duration);
      return duration;
    },
  
    recordSuccess() {
      metrics.successCount++;
      metrics.totalSubmissions++;
    },
  
    recordFailure() {
      metrics.failureCount++;
      metrics.totalSubmissions++;
    },
  
    incrementRetry(endpointName: string) {
      if (!metrics.retries[endpointName]) {
        metrics.retries[endpointName] = 0;
      }
      metrics.retries[endpointName]++;
    },
  
    getMetrics(): MetricsData {
      return metrics;
    },
  
    logSummary() {
      const avgTime =
        metrics.submissionTimes.reduce((a, b) => a + b, 0) /
        (metrics.submissionTimes.length || 1);
      console.log("📊 Submission Metrics:");
      console.log(` - ✅ Successes: ${metrics.successCount}`);
      console.log(` - ❌ Failures: ${metrics.failureCount}`);
      console.log(` - 🔁 Retries:`, metrics.retries);
      console.log(` - ⏱️ Average Submission Time: ${avgTime.toFixed(2)} ms`);
    },
  };
  
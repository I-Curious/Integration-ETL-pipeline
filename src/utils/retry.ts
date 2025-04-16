import { Logger } from "./logger";

type RetryContext = {
  label: string;
  customerID?: string;
  onRetry?: () => void; // ✅ Optional hook to track retry attempts (e.g. metrics)
};

export async function retry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delayMs: number = 500,
  backoffFactor: number = 2,
  context: RetryContext = { label: "operation" }
): Promise<T> {
  let attempt = 0;
  let currentDelay = delayMs;

  while (attempt <= retries) {
    try {
      if (attempt > 0) {
        Logger.info(`🔁 Retry attempt ${attempt} for ${context.label}`, {
          attempt,
          customerID: context.customerID
        });

        // ✅ Fire onRetry callback for metrics or custom logic
        context.onRetry?.();
      }

      return await fn();
    } catch (error) {
      attempt++;

      if (attempt > retries) {
        Logger.error(`❌ ${context.label} failed after ${retries} retries`, {
          error: (error as Error).message,
          customerID: context.customerID
        });
        throw error;
      }

      Logger.warn(`⚠️ ${context.label} attempt ${attempt} failed. Retrying in ${currentDelay}ms`, {
        error: (error as Error).message,
        customerID: context.customerID
      });

      await new Promise(res => setTimeout(res, currentDelay));
      currentDelay *= backoffFactor;
    }
  }

  throw new Error("Unexpected retry loop exit");
}
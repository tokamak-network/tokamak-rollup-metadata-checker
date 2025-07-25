import { logger } from './logger';

export interface RetryOptions {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryCondition?: (error: any) => boolean;
}

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryCondition: (error) => {
    // 네트워크 오류나 타임아웃 등에 대해서만 재시도
    return error.code === 'ENOTFOUND' ||
           error.code === 'ECONNREFUSED' ||
           error.code === 'ETIMEDOUT' ||
           error.message?.includes('timeout') ||
           error.message?.includes('network') ||
           error.message?.includes('connection');
  }
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: any;
  let delay = opts.initialDelay;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      const result = await fn();
      if (attempt > 1) {
        logger.info(`Operation succeeded on attempt ${attempt}`);
      }
      return result;
    } catch (error) {
      lastError = error;

      if (attempt === opts.maxAttempts) {
        logger.error(`Operation failed after ${opts.maxAttempts} attempts`, {
          error: error instanceof Error ? error.message : String(error)
        });
        break;
      }

      if (opts.retryCondition && !opts.retryCondition(error)) {
        logger.error(`Operation failed with non-retryable error: ${
          error instanceof Error ? error.message : String(error)
        }`);
        break;
      }

      logger.warn(`Attempt ${attempt} failed: ${
        error instanceof Error ? error.message : String(error)
      }. Retrying in ${delay}ms...`);
      await sleep(delay);
      delay = Math.min(delay * opts.backoffFactor, opts.maxDelay);
    }
  }

  throw lastError;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage?: string
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(timeoutMessage || `Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

export class RateLimiter {
  private queue: Array<{ resolve: Function; reject: Function; fn: () => Promise<any> }> = [];
  private running = 0;
  private lastCall = 0;

  constructor(
    private maxConcurrent: number = 5,
    private minInterval: number = 100
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ resolve, reject, fn });
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const { resolve, reject, fn } = this.queue.shift()!;
    this.running++;

    // Rate limiting
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCall;
    if (timeSinceLastCall < this.minInterval) {
      await sleep(this.minInterval - timeSinceLastCall);
    }
    this.lastCall = Date.now();

    try {
      const result = await fn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.processQueue();
    }
  }
}
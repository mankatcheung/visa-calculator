export interface CacheOptions {
  ttlMs: number;
  staleTtlMs?: number;
  jitter?: number;
  lockTimeoutMs?: number;
  /**
   * XFetch beta parameter (default 1). Higher values trigger early
   * recomputation more aggressively, reducing stampede risk at the cost of
   * slightly more background fetches. Set to 0 to disable XFetch entirely.
   */
  beta?: number;
}

export interface ICacheManager {
  get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions
  ): Promise<T>;
  invalidate(key: string): Promise<void>;
  invalidateByPrefix(prefix: string): Promise<void>;
}

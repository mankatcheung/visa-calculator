export interface CacheOptions {
  ttlMs: number;
  staleTtlMs?: number;
  jitter?: number;
  lockTimeoutMs?: number;
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

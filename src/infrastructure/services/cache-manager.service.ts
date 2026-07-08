import {
  CacheOptions,
  ICacheManager,
} from '@/src/application/services/cache-manager.service.interface';
import { ICacheInvalidationRelay } from '@/src/application/services/cache-invalidation-relay.service.interface';
import { ICacheStore } from '@/src/application/services/cache-store.service.interface';
import { IDistributedLockService } from '@/src/application/services/distributed-lock.service.interface';
import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';

interface CachedEntry<T> {
  data: T;
  freshUntil: number;
  staleUntil: number;
}

class CircuitBreaker {
  private failures = 0;
  private openedAt = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private probing = false;

  constructor(
    private readonly failureThreshold = 5,
    private readonly recoveryTimeMs = 30_000
  ) {}

  // Returns true if the circuit is blocking traffic to the store.
  isOpen(): boolean {
    this.tryRecover();

    if (this.state === 'CLOSED') return false;
    if (this.state === 'OPEN') return true;

    // HALF_OPEN: let exactly one probe through to test if the store recovered.
    if (this.probing) return true;
    this.probing = true;
    return false;
  }

  // Lazily advances OPEN → HALF_OPEN once the recovery window elapses.
  // Called on every isOpen() so no background timer is needed.
  private tryRecover(): void {
    if (this.state === 'OPEN' && Date.now() - this.openedAt >= this.recoveryTimeMs) {
      this.state = 'HALF_OPEN';
      this.probing = false;
    }
  }

  recordSuccess(): void {
    this.failures = 0;
    this.probing = false;
    this.state = 'CLOSED';
  }

  recordFailure(): void {
    this.probing = false;
    if (this.state === 'HALF_OPEN') {
      // probe failed — re-open immediately without waiting for threshold
      this.state = 'OPEN';
      this.openedAt = Date.now();
      return;
    }
    this.failures++;
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.openedAt = Date.now();
    }
  }
}

export class CacheManager implements ICacheManager {
  private readonly inFlight = new Map<string, Promise<unknown>>();
  private readonly l2Breaker = new CircuitBreaker();

  constructor(
    private readonly l1: ICacheStore,
    private readonly l2?: ICacheStore,
    private readonly relay?: ICacheInvalidationRelay,
    private readonly lockService?: IDistributedLockService,
    private readonly instrumentation?: IInstrumentationService
  ) {}

  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions
  ): Promise<T> {
    const l1Entry = await this.l1.get<CachedEntry<T>>(key);
    if (l1Entry) {
      const now = Date.now();
      if (now < l1Entry.freshUntil) {
        this.instrumentation?.recordMetric('cache.hit', { store: 'l1', type: 'fresh' });
        return l1Entry.data;
      }
      if (now < l1Entry.staleUntil) {
        this.instrumentation?.recordMetric('cache.hit', { store: 'l1', type: 'stale' });
        this.triggerRevalidation(key, fetcher, options);
        return l1Entry.data;
      }
    }

    if (this.l2 && !this.l2Breaker.isOpen()) {
      try {
        const entry = await this.l2.get<CachedEntry<T>>(key);
        this.l2Breaker.recordSuccess();
        if (entry) {
          const now = Date.now();
          if (now < entry.staleUntil) {
            void this.setInStore(this.l1, key, entry, entry.staleUntil - now);
            if (now < entry.freshUntil) {
              this.instrumentation?.recordMetric('cache.hit', { store: 'l2', type: 'fresh' });
              return entry.data;
            }
            this.instrumentation?.recordMetric('cache.hit', { store: 'l2', type: 'stale' });
            this.triggerRevalidation(key, fetcher, options);
            return entry.data;
          }
        }
      } catch {
        this.l2Breaker.recordFailure();
        this.instrumentation?.recordMetric('cache.error', { store: 'l2' });
      }
    }

    this.instrumentation?.recordMetric('cache.miss');
    return this.fetchWithCoalescing(key, fetcher, options);
  }

  private async fetchWithCoalescing<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions
  ): Promise<T> {
    const existing = this.inFlight.get(key) as Promise<T> | undefined;
    if (existing) {
      const lockTimeoutMs = options.lockTimeoutMs ?? 100;
      return Promise.race([
        existing,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('lock timeout')), lockTimeoutMs)
        ),
      ]).catch(() => this.startFetch(key, fetcher, options));
    }

    if (this.lockService) {
      const lockKey = `dlock:${key}`;
      // TTL is generous — covers fetch + write with headroom
      const lockTtlMs = options.ttlMs + 5_000;
      const token = await this.lockService.tryAcquire(lockKey, lockTtlMs);

      if (!token) {
        // Another instance holds the lock — wait, then try reading the cache
        const waitMs = options.lockTimeoutMs ?? 100;
        await new Promise<void>((r) => setTimeout(r, waitMs));
        const cached = await this.readFromCacheOnly<T>(key);
        if (cached !== undefined) return cached;
        // Cache still empty after wait — do a local fetch without coordination
      } else {
        // We hold the distributed lock; release it once the write completes
        const result = this.startFetch(key, fetcher, options);
        result
          .then(() => this.lockService!.release(lockKey, token))
          .catch(() => {});
        return result;
      }
    }

    return this.startFetch(key, fetcher, options);
  }

  private async readFromCacheOnly<T>(key: string): Promise<T | undefined> {
    const l1Entry = await this.l1.get<CachedEntry<T>>(key);
    if (l1Entry && Date.now() < l1Entry.staleUntil) return l1Entry.data;
    if (this.l2 && !this.l2Breaker.isOpen()) {
      try {
        const entry = await this.l2.get<CachedEntry<T>>(key);
        this.l2Breaker.recordSuccess();
        if (entry && Date.now() < entry.staleUntil) return entry.data;
      } catch {
        this.l2Breaker.recordFailure();
      }
    }
    return undefined;
  }

  private startFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions
  ): Promise<T> {
    const tracked = fetcher()
      .then(async (data) => {
        await this.writeToStores(key, data, options);
        return data;
      })
      .finally(() => {
        if (this.inFlight.get(key) === tracked) {
          this.inFlight.delete(key);
        }
      });

    this.inFlight.set(key, tracked);
    return tracked;
  }

  private triggerRevalidation<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions
  ): void {
    if (this.inFlight.has(key)) return;
    void this.startFetch(key, fetcher, options).catch(() => {});
  }

  private async writeToStores<T>(
    key: string,
    data: T,
    options: CacheOptions
  ): Promise<void> {
    const now = Date.now();
    const freshMs = this.applyJitter(options.ttlMs, options.jitter ?? 0);
    const staleMs = this.applyJitter(options.staleTtlMs ?? 0, options.jitter ?? 0);

    const entry: CachedEntry<T> = {
      data,
      freshUntil: now + freshMs,
      staleUntil: now + freshMs + staleMs,
    };

    await Promise.allSettled([
      this.setInStore(this.l1, key, entry, freshMs + staleMs),
      this.l2
        ? this.setInStore(this.l2, key, entry, freshMs + staleMs)
        : Promise.resolve(),
    ]);
  }

  private async setInStore(
    store: ICacheStore,
    key: string,
    entry: CachedEntry<unknown>,
    ttlMs: number
  ): Promise<void> {
    try {
      await store.set(key, entry, ttlMs);
    } catch {
      // silently ignore write failures — cache is best-effort
    }
  }

  private applyJitter(valueMs: number, jitter: number): number {
    if (jitter === 0 || valueMs === 0) return valueMs;
    const delta = valueMs * jitter;
    return Math.max(0, valueMs + (Math.random() * 2 - 1) * delta);
  }

  async invalidate(key: string): Promise<void> {
    await Promise.allSettled([
      this.l1.delete(key),
      this.l2 && !this.l2Breaker.isOpen() ? this.l2.delete(key) : Promise.resolve(),
      this.relay ? this.relay.publish({ type: 'key', key }) : Promise.resolve(),
    ]);
  }

  async invalidateByPrefix(prefix: string): Promise<void> {
    await Promise.allSettled([
      this.l1.deleteByPrefix(prefix),
      this.l2 && !this.l2Breaker.isOpen() ? this.l2.deleteByPrefix(prefix) : Promise.resolve(),
      this.relay
        ? this.relay.publish({ type: 'prefix', prefix })
        : Promise.resolve(),
    ]);
  }
}

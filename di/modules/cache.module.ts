import { Redis } from '@upstash/redis';
import { createModule } from '@evyweb/ioctopus';

import { DI_SYMBOLS } from '@/di/types';
import { ICacheStore } from '@/src/application/services/cache-store.service.interface';
import { UpstashInvalidationRelay } from '@/src/infrastructure/services/cache-invalidation-relay.service';
import { CacheManager } from '@/src/infrastructure/services/cache-manager.service';
import { UpstashRedisCacheStore } from '@/src/infrastructure/services/cache-store.upstash-redis.service';
import { InMemoryCacheStore } from '@/src/infrastructure/services/cache-store.service';

const L1_CACHE_STORE = Symbol('L1CacheStore');

export function createCacheModule() {
  const cacheModule = createModule();

  const l1Max = process.env.L1_CACHE_MAX ? parseInt(process.env.L1_CACHE_MAX, 10) : 500;
  const l1Sweep = process.env.L1_CACHE_SWEEP_MS ? parseInt(process.env.L1_CACHE_SWEEP_MS, 10) : 60_000;
  cacheModule.bind(L1_CACHE_STORE).toFactory(() => new InMemoryCacheStore(l1Max, l1Sweep));

  cacheModule
    .bind(DI_SYMBOLS.ICacheManager)
    .toFactory((resolve: (key: symbol | string) => unknown) => {
      const l1 = resolve(L1_CACHE_STORE) as InMemoryCacheStore;
      const url = process.env.UPSTASH_REDIS_REST_URL;
      const token = process.env.UPSTASH_REDIS_REST_TOKEN;
      const l2 =
        url && token ? new UpstashRedisCacheStore(url, token) : undefined;

      const pollMs = process.env.L1_INVALIDATION_POLL_MS
        ? parseInt(process.env.L1_INVALIDATION_POLL_MS, 10)
        : 5_000;
      const relay =
        url && token
          ? new UpstashInvalidationRelay(new Redis({ url, token }))
          : undefined;

      if (relay) {
        relay.subscribe((event) => {
          if (event.type === 'key') void l1.delete(event.key);
          if (event.type === 'prefix') void l1.deleteByPrefix(event.prefix);
        }, pollMs);
      }

      return new CacheManager(l1, l2, relay);
    });

  return cacheModule;
}

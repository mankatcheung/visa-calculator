import { createModule } from '@evyweb/ioctopus';

import { DI_SYMBOLS } from '@/di/types';
import { ICacheStore } from '@/src/application/services/cache-store.service.interface';
import { CacheManager } from '@/src/infrastructure/services/cache-manager.service';
import { UpstashRedisCacheStore } from '@/src/infrastructure/services/cache-store.upstash-redis.service';
import { InMemoryCacheStore } from '@/src/infrastructure/services/cache-store.service';

const L1_CACHE_STORE = Symbol('L1CacheStore');

export function createCacheModule() {
  const cacheModule = createModule();

  cacheModule.bind(L1_CACHE_STORE).toClass(InMemoryCacheStore, []);

  cacheModule
    .bind(DI_SYMBOLS.ICacheManager)
    .toFactory((resolve: (key: symbol | string) => unknown) => {
      const l1 = resolve(L1_CACHE_STORE) as ICacheStore;
      const url = process.env.UPSTASH_REDIS_REST_URL;
      const token = process.env.UPSTASH_REDIS_REST_TOKEN;
      const l2 =
        url && token ? new UpstashRedisCacheStore(url, token) : undefined;
      return new CacheManager(l1, l2);
    });

  return cacheModule;
}

import { createModule } from '@evyweb/ioctopus';

import { DI_SYMBOLS } from '@/di/types';
import { CacheManager } from '@/src/infrastructure/services/cache-manager.service';
import { InMemoryCacheStore } from '@/src/infrastructure/services/cache-store.service';

const L1_CACHE_STORE = Symbol('L1CacheStore');

export function createCacheModule() {
  const cacheModule = createModule();

  cacheModule.bind(L1_CACHE_STORE).toClass(InMemoryCacheStore, []);

  cacheModule
    .bind(DI_SYMBOLS.ICacheManager)
    .toClass(CacheManager, [L1_CACHE_STORE]);

  return cacheModule;
}

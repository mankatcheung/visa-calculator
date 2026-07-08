import { describe, expect, it, vi } from 'vitest';

import { ICacheStore } from '@/src/application/services/cache-store.service.interface';
import { CacheManager } from '@/src/infrastructure/services/cache-manager.service';
import { InMemoryCacheStore } from '@/src/infrastructure/services/cache-store.service';

describe('CacheManager – L1 only', () => {
  it('calls the fetcher on a miss and returns the value', async () => {
    const manager = new CacheManager(new InMemoryCacheStore());
    const fetcher = vi.fn().mockResolvedValue('hello');

    await expect(manager.get('k', fetcher, { ttlMs: 60_000 })).resolves.toBe(
      'hello'
    );
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('returns the cached value on a hit without calling the fetcher again', async () => {
    const manager = new CacheManager(new InMemoryCacheStore());
    const fetcher = vi.fn().mockResolvedValue('cached');

    await manager.get('k', fetcher, { ttlMs: 60_000 });
    await manager.get('k', fetcher, { ttlMs: 60_000 });

    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('returns the stale value immediately and triggers background revalidation', async () => {
    const manager = new CacheManager(new InMemoryCacheStore());

    // prime with 1 ms TTL so it goes stale quickly
    await manager.get('k', vi.fn().mockResolvedValue('stale'), {
      ttlMs: 1,
      staleTtlMs: 60_000,
    });

    await new Promise((r) => setTimeout(r, 10)); // advance past freshUntil

    const revalidate = vi.fn().mockResolvedValue('fresh');
    const result = await manager.get('k', revalidate, {
      ttlMs: 1,
      staleTtlMs: 60_000,
    });

    expect(result).toBe('stale'); // stale value returned
    expect(revalidate).toHaveBeenCalledTimes(1); // background revalidation triggered
  });

  it('calls the fetcher again after a fully expired entry', async () => {
    const manager = new CacheManager(new InMemoryCacheStore());
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce('v1')
      .mockResolvedValueOnce('v2');

    await manager.get('k', fetcher, { ttlMs: 1 }); // no staleTtlMs

    await new Promise((r) => setTimeout(r, 10));

    await expect(manager.get('k', fetcher, { ttlMs: 1 })).resolves.toBe('v2');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('coalesces concurrent requests to a single fetcher call', async () => {
    const manager = new CacheManager(new InMemoryCacheStore());
    let callCount = 0;
    const slowFetcher = () => {
      callCount++;
      return new Promise<string>((r) => setTimeout(() => r('value'), 50));
    };

    const results = await Promise.all([
      manager.get('k', slowFetcher, { ttlMs: 60_000 }),
      manager.get('k', slowFetcher, { ttlMs: 60_000 }),
      manager.get('k', slowFetcher, { ttlMs: 60_000 }),
    ]);

    expect(callCount).toBe(1);
    expect(results).toEqual(['value', 'value', 'value']);
  });

  it('invalidate causes the next get to call the fetcher again', async () => {
    const manager = new CacheManager(new InMemoryCacheStore());
    const fetcher = vi.fn().mockResolvedValue('v');

    await manager.get('k', fetcher, { ttlMs: 60_000 });
    await manager.invalidate('k');
    await manager.get('k', fetcher, { ttlMs: 60_000 });

    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('invalidateByPrefix evicts matching keys but leaves others cached', async () => {
    const manager = new CacheManager(new InMemoryCacheStore());
    const fetcher = vi.fn().mockResolvedValue('v');

    await manager.get('user:1', fetcher, { ttlMs: 60_000 });
    await manager.get('user:2', fetcher, { ttlMs: 60_000 });
    await manager.get('session:1', fetcher, { ttlMs: 60_000 });
    expect(fetcher).toHaveBeenCalledTimes(3);

    await manager.invalidateByPrefix('user:');

    await manager.get('user:1', fetcher, { ttlMs: 60_000 });
    await manager.get('user:2', fetcher, { ttlMs: 60_000 });
    expect(fetcher).toHaveBeenCalledTimes(5); // both user keys re-fetched

    await manager.get('session:1', fetcher, { ttlMs: 60_000 });
    expect(fetcher).toHaveBeenCalledTimes(5); // session still cached
  });

});

describe('CacheManager – L1 + L2', () => {
  it('returns the L2 value on an L1 miss and backfills L1', async () => {
    const l1 = new InMemoryCacheStore();
    const l2 = new InMemoryCacheStore();
    const manager = new CacheManager(l1, l2);
    const fetcher = vi.fn();

    // seed L2 with a valid CachedEntry (the internal format CacheManager stores)
    const now = Date.now();
    await l2.set(
      'k',
      { data: 'from-l2', freshUntil: now + 60_000, staleUntil: now + 120_000 },
      120_000
    );

    const l2Spy = vi.spyOn(l2, 'get');

    const result = await manager.get('k', fetcher, { ttlMs: 60_000 });
    expect(result).toBe('from-l2');
    expect(fetcher).not.toHaveBeenCalled();
    expect(l2Spy).toHaveBeenCalledTimes(1);

    // wait for the void L1 backfill to settle
    await new Promise((r) => setTimeout(r, 0));

    // second call should be served from L1 without consulting L2
    const result2 = await manager.get('k', fetcher, { ttlMs: 60_000 });
    expect(result2).toBe('from-l2');
    expect(fetcher).not.toHaveBeenCalled();
    expect(l2Spy).toHaveBeenCalledTimes(1); // L2 not consulted again
  });

  it('writes to both L1 and L2 on a fetcher call', async () => {
    const l1 = new InMemoryCacheStore();
    const l2 = new InMemoryCacheStore();
    const manager = new CacheManager(l1, l2);

    const l1SetSpy = vi.spyOn(l1, 'set');
    const l2SetSpy = vi.spyOn(l2, 'set');

    await manager.get('k', vi.fn().mockResolvedValue('v'), { ttlMs: 60_000 });

    expect(l1SetSpy).toHaveBeenCalledTimes(1);
    expect(l2SetSpy).toHaveBeenCalledTimes(1);
  });

  it('invalidate removes the key from both L1 and L2', async () => {
    const l1 = new InMemoryCacheStore();
    const l2 = new InMemoryCacheStore();
    const manager = new CacheManager(l1, l2);
    const fetcher = vi.fn().mockResolvedValue('v');

    await manager.get('k', fetcher, { ttlMs: 60_000 });
    expect(fetcher).toHaveBeenCalledTimes(1);

    await manager.invalidate('k');
    await manager.get('k', fetcher, { ttlMs: 60_000 });
    expect(fetcher).toHaveBeenCalledTimes(2); // re-fetched from scratch
  });
});

describe('CacheManager – relay', () => {
  function makeRelay() {
    return {
      publish: vi.fn().mockResolvedValue(undefined),
      subscribe: vi.fn(),
      close: vi.fn(),
    };
  }

  it('publishes a key event when invalidate is called', async () => {
    const relay = makeRelay();
    const manager = new CacheManager(new InMemoryCacheStore(), undefined, relay);

    await manager.invalidate('user:1');

    expect(relay.publish).toHaveBeenCalledWith({ type: 'key', key: 'user:1' });
  });

  it('publishes a prefix event when invalidateByPrefix is called', async () => {
    const relay = makeRelay();
    const manager = new CacheManager(new InMemoryCacheStore(), undefined, relay);

    await manager.invalidateByPrefix('user:');

    expect(relay.publish).toHaveBeenCalledWith({ type: 'prefix', prefix: 'user:' });
  });

  it('does not publish when no relay is configured', async () => {
    // just verify no error thrown — relay is undefined
    const manager = new CacheManager(new InMemoryCacheStore());
    await expect(manager.invalidate('k')).resolves.toBeUndefined();
    await expect(manager.invalidateByPrefix('k:')).resolves.toBeUndefined();
  });
});

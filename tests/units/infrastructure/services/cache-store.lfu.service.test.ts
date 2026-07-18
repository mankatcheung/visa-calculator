import { describe, expect, it } from 'vitest';

import { LfuCacheStore } from '@/src/infrastructure/services/cache-store.lfu.service';

describe('LfuCacheStore', () => {
  it('getName returns "lfu"', () => {
    expect(new LfuCacheStore().getName()).toBe('lfu');
  });

  it('get returns undefined for a missing key', async () => {
    const store = new LfuCacheStore();
    await expect(store.get('missing')).resolves.toBeUndefined();
  });

  it('get returns the stored value within TTL', async () => {
    const store = new LfuCacheStore();
    await store.set('k', { hello: 'world' }, 60_000);
    await expect(store.get('k')).resolves.toEqual({ hello: 'world' });
  });

  it('get returns undefined after TTL expires', async () => {
    const store = new LfuCacheStore();
    await store.set('k', 'value', 1);
    await new Promise((r) => setTimeout(r, 10));
    await expect(store.get('k')).resolves.toBeUndefined();
  });

  it('set overwrites an existing key without evicting another entry', async () => {
    const store = new LfuCacheStore(3);
    await store.set('a', 1, 60_000);
    await store.set('b', 2, 60_000);
    await store.set('c', 3, 60_000);

    await store.set('b', 99, 60_000);

    await expect(store.get('a')).resolves.toBe(1);
    await expect(store.get('b')).resolves.toBe(99);
    await expect(store.get('c')).resolves.toBe(3);
  });

  it('delete removes the key', async () => {
    const store = new LfuCacheStore();
    await store.set('k', 'v', 60_000);
    await store.delete('k');
    await expect(store.get('k')).resolves.toBeUndefined();
  });

  it('delete is a no-op for a missing key', async () => {
    const store = new LfuCacheStore();
    await expect(store.delete('missing')).resolves.toBeUndefined();
  });

  it('deleteByPrefix removes all keys with the given prefix', async () => {
    const store = new LfuCacheStore();
    await store.set('user:1', 'a', 60_000);
    await store.set('user:2', 'b', 60_000);
    await store.set('session:1', 'c', 60_000);

    await store.deleteByPrefix('user:');

    await expect(store.get('user:1')).resolves.toBeUndefined();
    await expect(store.get('user:2')).resolves.toBeUndefined();
    await expect(store.get('session:1')).resolves.toBe('c');
  });

  it('deleteByPrefix is a no-op when no keys match', async () => {
    const store = new LfuCacheStore();
    await store.set('session:1', 'c', 60_000);
    await store.deleteByPrefix('user:');
    await expect(store.get('session:1')).resolves.toBe('c');
  });
});

describe('LfuCacheStore – LFU eviction', () => {
  it('evicts the least-frequently-used entry when the cap is reached', async () => {
    const store = new LfuCacheStore(3);
    await store.set('a', 1, 60_000); // freq 1
    await store.set('b', 2, 60_000); // freq 1
    await store.set('c', 3, 60_000); // freq 1

    // bump 'b' and 'c' so 'a' is the LFU
    await store.get('b'); // b → freq 2
    await store.get('c'); // c → freq 2

    // adding 'd' should evict 'a' (only freq-1 entry)
    await store.set('d', 4, 60_000);

    await expect(store.get('a')).resolves.toBeUndefined();
    await expect(store.get('b')).resolves.toBe(2);
    await expect(store.get('c')).resolves.toBe(3);
    await expect(store.get('d')).resolves.toBe(4);
  });

  it('among equal-frequency entries, evicts the least-recently-used one', async () => {
    const store = new LfuCacheStore(3);
    await store.set('a', 1, 60_000); // freq 1, inserted first
    await store.set('b', 2, 60_000); // freq 1, inserted second
    await store.set('c', 3, 60_000); // freq 1, inserted third

    // all at freq 1 — adding 'd' evicts 'a' (LRU among freq-1)
    await store.set('d', 4, 60_000);

    await expect(store.get('a')).resolves.toBeUndefined();
    await expect(store.get('b')).resolves.toBe(2);
    await expect(store.get('c')).resolves.toBe(3);
    await expect(store.get('d')).resolves.toBe(4);
  });

  it('a get increases frequency so the key survives eviction', async () => {
    const store = new LfuCacheStore(3);
    await store.set('a', 1, 60_000); // freq 1
    await store.set('b', 2, 60_000); // freq 1
    await store.set('c', 3, 60_000); // freq 1

    await store.get('a'); // a → freq 2; LFU is now 'b' (oldest at freq 1)

    await store.set('d', 4, 60_000); // evicts 'b'

    await expect(store.get('b')).resolves.toBeUndefined();
    await expect(store.get('a')).resolves.toBe(1);
    await expect(store.get('c')).resolves.toBe(3);
    await expect(store.get('d')).resolves.toBe(4);
  });

  it('eviction does not fire when overwriting an existing key', async () => {
    const store = new LfuCacheStore(2);
    await store.set('a', 1, 60_000);
    await store.set('b', 2, 60_000);

    // overwrite 'a' — no new key, so no eviction
    await store.set('a', 99, 60_000);

    await expect(store.get('a')).resolves.toBe(99);
    await expect(store.get('b')).resolves.toBe(2);
  });

  it('minFreq resets to 1 after each new insert', async () => {
    const store = new LfuCacheStore(2);
    await store.set('a', 1, 60_000); // freq 1
    await store.get('a'); // a → freq 2
    await store.get('a'); // a → freq 3

    await store.set('b', 2, 60_000); // freq 1; minFreq should be 1
    // cap reached — adding 'c' evicts the LFU which is 'b' (freq 1), not 'a' (freq 3)
    await store.set('c', 3, 60_000);

    await expect(store.get('b')).resolves.toBeUndefined();
    await expect(store.get('a')).resolves.toBe(1);
    await expect(store.get('c')).resolves.toBe(3);
  });
});

describe('LfuCacheStore – proactive expiry sweep', () => {
  it('purgeExpired removes expired entries without touching live ones', async () => {
    const store = new LfuCacheStore(500, 0);
    await store.set('live', 'keep', 60_000);
    await store.set('dead', 'gone', 1);

    await new Promise((r) => setTimeout(r, 10));
    store.purgeExpired();

    await expect(store.get('dead')).resolves.toBeUndefined();
    await expect(store.get('live')).resolves.toBe('keep');
  });

  it('purgeExpired is a no-op on an empty store', () => {
    const store = new LfuCacheStore(500, 0);
    expect(() => store.purgeExpired()).not.toThrow();
  });

  it('purgeExpired frees capacity so new entries can be added without LFU eviction', async () => {
    const store = new LfuCacheStore(2, 0);
    await store.set('a', 1, 1); // expires immediately
    await store.set('b', 2, 60_000);

    await new Promise((r) => setTimeout(r, 10));
    store.purgeExpired();

    // 'c' fits without evicting 'b'
    await store.set('c', 3, 60_000);

    await expect(store.get('b')).resolves.toBe(2);
    await expect(store.get('c')).resolves.toBe(3);
  });
});

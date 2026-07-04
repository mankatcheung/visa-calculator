import { describe, expect, it } from 'vitest';

import { InMemoryCacheStore } from '@/src/infrastructure/services/cache-store.service';

describe('InMemoryCacheStore', () => {
  it('getName returns "in-memory"', () => {
    expect(new InMemoryCacheStore().getName()).toBe('in-memory');
  });

  it('get returns undefined for a missing key', async () => {
    const store = new InMemoryCacheStore();
    await expect(store.get('missing')).resolves.toBeUndefined();
  });

  it('get returns the stored value within TTL', async () => {
    const store = new InMemoryCacheStore();
    await store.set('k', { hello: 'world' }, 60_000);
    await expect(store.get('k')).resolves.toEqual({ hello: 'world' });
  });

  it('get returns undefined after TTL expires', async () => {
    const store = new InMemoryCacheStore();
    await store.set('k', 'value', 1); // 1 ms TTL
    await new Promise((r) => setTimeout(r, 10));
    await expect(store.get('k')).resolves.toBeUndefined();
  });

  it('set overwrites an existing key', async () => {
    const store = new InMemoryCacheStore();
    await store.set('k', 'first', 60_000);
    await store.set('k', 'second', 60_000);
    await expect(store.get('k')).resolves.toBe('second');
  });

  it('delete removes the key', async () => {
    const store = new InMemoryCacheStore();
    await store.set('k', 'v', 60_000);
    await store.delete('k');
    await expect(store.get('k')).resolves.toBeUndefined();
  });

  it('delete is a no-op for a missing key', async () => {
    const store = new InMemoryCacheStore();
    await expect(store.delete('missing')).resolves.toBeUndefined();
  });

  it('deleteByPrefix removes all keys with the given prefix', async () => {
    const store = new InMemoryCacheStore();
    await store.set('user:1', 'a', 60_000);
    await store.set('user:2', 'b', 60_000);
    await store.set('session:1', 'c', 60_000);

    await store.deleteByPrefix('user:');

    await expect(store.get('user:1')).resolves.toBeUndefined();
    await expect(store.get('user:2')).resolves.toBeUndefined();
    await expect(store.get('session:1')).resolves.toBe('c');
  });

  it('deleteByPrefix is a no-op when no keys match', async () => {
    const store = new InMemoryCacheStore();
    await store.set('session:1', 'c', 60_000);
    await store.deleteByPrefix('user:');
    await expect(store.get('session:1')).resolves.toBe('c');
  });
});

describe('InMemoryCacheStore – proactive expiry sweep', () => {
  it('purgeExpired removes expired entries without touching live ones', async () => {
    const store = new InMemoryCacheStore(500, 0); // sweep disabled — call manually
    await store.set('live', 'keep', 60_000);
    await store.set('dead', 'gone', 1);

    await new Promise((r) => setTimeout(r, 10)); // let 'dead' expire

    store.purgeExpired();

    await expect(store.get('dead')).resolves.toBeUndefined();
    await expect(store.get('live')).resolves.toBe('keep');
  });

  it('purgeExpired is a no-op on an empty store', () => {
    const store = new InMemoryCacheStore(500, 0);
    expect(() => store.purgeExpired()).not.toThrow();
  });

  it('purgeExpired frees capacity so new entries can be added without LRU eviction', async () => {
    const store = new InMemoryCacheStore(2, 0); // cap of 2
    await store.set('a', 1, 1); // expires immediately
    await store.set('b', 2, 60_000);

    await new Promise((r) => setTimeout(r, 10)); // 'a' expires

    store.purgeExpired(); // should free one slot

    // 'c' can now be added without evicting 'b'
    await store.set('c', 3, 60_000);

    await expect(store.get('b')).resolves.toBe(2);
    await expect(store.get('c')).resolves.toBe(3);
  });
});

describe('InMemoryCacheStore – LRU eviction', () => {
  it('evicts the least-recently-used entry when the cap is reached', async () => {
    const store = new InMemoryCacheStore(3);
    await store.set('a', 1, 60_000);
    await store.set('b', 2, 60_000);
    await store.set('c', 3, 60_000);

    // adding a 4th entry evicts 'a' (oldest / LRU)
    await store.set('d', 4, 60_000);

    await expect(store.get('a')).resolves.toBeUndefined();
    await expect(store.get('b')).resolves.toBe(2);
    await expect(store.get('c')).resolves.toBe(3);
    await expect(store.get('d')).resolves.toBe(4);
  });

  it('a get promotes the entry so it is not the next eviction target', async () => {
    const store = new InMemoryCacheStore(3);
    await store.set('a', 1, 60_000);
    await store.set('b', 2, 60_000);
    await store.set('c', 3, 60_000);

    // touch 'a' — now 'b' is the LRU
    await store.get('a');
    await store.set('d', 4, 60_000);

    await expect(store.get('b')).resolves.toBeUndefined(); // 'b' evicted
    await expect(store.get('a')).resolves.toBe(1);
    await expect(store.get('c')).resolves.toBe(3);
    await expect(store.get('d')).resolves.toBe(4);
  });

  it('overwriting an existing key does not evict another entry', async () => {
    const store = new InMemoryCacheStore(3);
    await store.set('a', 1, 60_000);
    await store.set('b', 2, 60_000);
    await store.set('c', 3, 60_000);

    // overwriting 'a' does not evict because the store is not growing
    await store.set('a', 99, 60_000);

    await expect(store.get('a')).resolves.toBe(99);
    await expect(store.get('b')).resolves.toBe(2);
    await expect(store.get('c')).resolves.toBe(3);
  });
});

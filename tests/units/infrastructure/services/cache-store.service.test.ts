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

import { beforeEach, describe, expect, it, vi } from 'vitest';

// vi.hoisted ensures these are initialised before vi.mock() runs
const { mockRedis, mockScript } = vi.hoisted(() => {
  const mockScript = { eval: vi.fn() };
  return {
    mockScript,
    mockRedis: {
      get: vi.fn(),
      set: vi.fn(),
      del: vi.fn(),
      scan: vi.fn(),
      createScript: vi.fn().mockReturnValue(mockScript),
    },
  };
});

vi.mock('@upstash/redis', () => ({
  // Class-style mock so `new Redis(...)` is valid and instances carry the mock methods
  Redis: class {
    get = mockRedis.get;
    set = mockRedis.set;
    del = mockRedis.del;
    scan = mockRedis.scan;
    createScript = mockRedis.createScript;
  },
}));

import { UpstashRedisCacheStore } from '@/src/infrastructure/services/cache-store.upstash-redis.service';

const store = new UpstashRedisCacheStore('https://example.upstash.io', 'token');

describe('UpstashRedisCacheStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getName returns "upstash-redis"', () => {
    expect(store.getName()).toBe('upstash-redis');
  });

  it('get returns undefined when Redis returns null', async () => {
    mockRedis.get.mockResolvedValue(null);
    await expect(store.get('k')).resolves.toBeUndefined();
    expect(mockRedis.get).toHaveBeenCalledWith('k');
  });

  it('get returns the deserialized value', async () => {
    const cached = { data: 'hello', freshUntil: 9999, staleUntil: 99999 };
    mockRedis.get.mockResolvedValue(cached);
    await expect(store.get('k')).resolves.toEqual(cached);
  });

  it('set calls redis.set with a millisecond TTL', async () => {
    mockRedis.set.mockResolvedValue('OK');
    await store.set('k', { data: 'v' }, 5_000);
    expect(mockRedis.set).toHaveBeenCalledWith('k', { data: 'v' }, { px: 5_000 });
  });

  it('delete calls redis.del with the key', async () => {
    mockRedis.del.mockResolvedValue(1);
    await store.delete('k');
    expect(mockRedis.del).toHaveBeenCalledWith('k');
  });

  it('deleteByPrefix calls the Lua script with the glob pattern', async () => {
    mockScript.eval.mockResolvedValue(1);
    await store.deleteByPrefix('user:');
    expect(mockScript.eval).toHaveBeenCalledWith([], ['user:*']);
  });

  it('deleteByPrefix passes the correct glob for any prefix', async () => {
    mockScript.eval.mockResolvedValue(1);
    await store.deleteByPrefix('leaves:user:42:');
    expect(mockScript.eval).toHaveBeenCalledWith([], ['leaves:user:42:*']);
  });
});

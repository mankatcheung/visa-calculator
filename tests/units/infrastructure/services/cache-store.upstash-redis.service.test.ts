import { beforeEach, describe, expect, it, vi } from 'vitest';

// vi.hoisted ensures these are initialised before vi.mock() runs
const mockRedis = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  scan: vi.fn(),
}));

vi.mock('@upstash/redis', () => ({
  // Class-style mock so `new Redis(...)` is valid and instances carry the mock methods
  Redis: class {
    get = mockRedis.get;
    set = mockRedis.set;
    del = mockRedis.del;
    scan = mockRedis.scan;
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

  it('deleteByPrefix scans all pages and deletes every matching key', async () => {
    mockRedis.scan
      .mockResolvedValueOnce(['42', ['user:1', 'user:2']])
      .mockResolvedValueOnce(['0', ['user:3']]);
    mockRedis.del.mockResolvedValue(3);

    await store.deleteByPrefix('user:');

    expect(mockRedis.scan).toHaveBeenCalledTimes(2);
    expect(mockRedis.scan).toHaveBeenNthCalledWith(1, '0', {
      match: 'user:*',
      count: 100,
    });
    expect(mockRedis.scan).toHaveBeenNthCalledWith(2, '42', {
      match: 'user:*',
      count: 100,
    });
    expect(mockRedis.del).toHaveBeenCalledWith('user:1', 'user:2');
    expect(mockRedis.del).toHaveBeenCalledWith('user:3');
  });

  it('deleteByPrefix skips del when the scan returns no keys', async () => {
    mockRedis.scan.mockResolvedValueOnce(['0', []]);
    await store.deleteByPrefix('empty:');
    expect(mockRedis.del).not.toHaveBeenCalled();
  });
});

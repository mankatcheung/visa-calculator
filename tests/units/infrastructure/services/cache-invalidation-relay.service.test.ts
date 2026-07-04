import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockRedis = vi.hoisted(() => ({
  zadd: vi.fn(),
  zremrangebyscore: vi.fn(),
  zrange: vi.fn(),
}));

vi.mock('@upstash/redis', () => ({
  Redis: class {
    zadd = mockRedis.zadd;
    zremrangebyscore = mockRedis.zremrangebyscore;
    zrange = mockRedis.zrange;
  },
}));

import { InvalidationEvent } from '@/src/application/services/cache-invalidation-relay.service.interface';
import { UpstashInvalidationRelay } from '@/src/infrastructure/services/cache-invalidation-relay.service';
import { Redis } from '@upstash/redis';

function makeRelay() {
  return new UpstashInvalidationRelay(new Redis({ url: 'http://x', token: 't' }));
}

describe('UpstashInvalidationRelay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedis.zadd.mockResolvedValue(1);
    mockRedis.zremrangebyscore.mockResolvedValue(0);
    mockRedis.zrange.mockResolvedValue([]);
  });

  describe('publish', () => {
    it('adds the event to the sorted set with a timestamp score', async () => {
      const relay = makeRelay();
      await relay.publish({ type: 'key', key: 'user:1' });

      expect(mockRedis.zadd).toHaveBeenCalledOnce();
      const [key, { score, member }] = mockRedis.zadd.mock.calls[0];
      expect(key).toBe('l1:invalidation-events');
      expect(typeof score).toBe('number');
      expect(member).toContain(JSON.stringify({ type: 'key', key: 'user:1' }));
    });

    it('trims events older than the retention window on each publish', async () => {
      const relay = makeRelay();
      await relay.publish({ type: 'prefix', prefix: 'user:' });
      expect(mockRedis.zremrangebyscore).toHaveBeenCalledOnce();
      const [key, min] = mockRedis.zremrangebyscore.mock.calls[0];
      expect(key).toBe('l1:invalidation-events');
      expect(min).toBe('-inf');
    });
  });

  describe('subscribe / poll', () => {
    it('calls the handler for each event returned by zrange', async () => {
      vi.useFakeTimers();
      const relay = makeRelay();

      const event: InvalidationEvent = { type: 'key', key: 'session:abc' };
      const rawMember = `1234567890-abc:${JSON.stringify(event)}`;
      mockRedis.zrange.mockResolvedValue([rawMember]);

      const handler = vi.fn();
      relay.subscribe(handler, 100);

      await vi.advanceTimersByTimeAsync(100);
      expect(handler).toHaveBeenCalledWith(event);

      relay.close();
      vi.useRealTimers();
    });

    it('skips malformed members without throwing', async () => {
      vi.useFakeTimers();
      const relay = makeRelay();
      mockRedis.zrange.mockResolvedValue(['no-colon-here', 'also-bad']);

      const handler = vi.fn();
      relay.subscribe(handler, 100);

      await vi.advanceTimersByTimeAsync(100);
      expect(handler).not.toHaveBeenCalled();

      relay.close();
      vi.useRealTimers();
    });

    it('silently ignores poll failures', async () => {
      vi.useFakeTimers();
      const relay = makeRelay();
      mockRedis.zrange.mockRejectedValue(new Error('network error'));

      const handler = vi.fn();
      relay.subscribe(handler, 100);

      await expect(vi.advanceTimersByTimeAsync(100)).resolves.not.toThrow();

      relay.close();
      vi.useRealTimers();
    });
  });

  describe('close', () => {
    it('stops the poll interval', async () => {
      vi.useFakeTimers();
      const relay = makeRelay();
      const handler = vi.fn();
      relay.subscribe(handler, 100);

      relay.close();
      await vi.advanceTimersByTimeAsync(500);
      expect(mockRedis.zrange).not.toHaveBeenCalled();

      vi.useRealTimers();
    });
  });
});

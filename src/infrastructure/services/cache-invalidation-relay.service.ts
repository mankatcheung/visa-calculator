import { Redis } from '@upstash/redis';

import {
  ICacheInvalidationRelay,
  InvalidationEvent,
} from '@/src/application/services/cache-invalidation-relay.service.interface';

const RELAY_KEY = 'l1:invalidation-events';
// Keep events for 5 minutes — long enough for any poll cycle to catch them
const RETENTION_MS = 5 * 60 * 1000;

export class UpstashInvalidationRelay implements ICacheInvalidationRelay {
  private lastPollMs = Date.now();
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly redis: Redis) {}

  async publish(event: InvalidationEvent): Promise<void> {
    const now = Date.now();
    // Unique member: timestamp prefix guarantees ordering; random suffix avoids
    // collisions when multiple instances publish at the same millisecond
    const member = `${now}-${Math.random().toString(36).slice(2)}:${JSON.stringify(event)}`;

    await Promise.allSettled([
      this.redis.zadd(RELAY_KEY, { score: now, member }),
      this.redis.zremrangebyscore(RELAY_KEY, '-inf', now - RETENTION_MS),
    ]);
  }

  subscribe(
    handler: (event: InvalidationEvent) => void,
    pollIntervalMs = 5_000
  ): void {
    const poll = async () => {
      const since = this.lastPollMs;
      this.lastPollMs = Date.now();
      try {
        const members = await this.redis.zrange<string[]>(
          RELAY_KEY,
          since,
          '+inf',
          { byScore: true }
        );
        for (const member of members) {
          const colonIdx = member.indexOf(':');
          if (colonIdx === -1) continue;
          try {
            handler(JSON.parse(member.slice(colonIdx + 1)) as InvalidationEvent);
          } catch {
            // ignore malformed events
          }
        }
      } catch {
        // ignore transient poll failures — next tick will retry
      }
    };

    this.pollTimer = setInterval(() => void poll(), pollIntervalMs);
    if (this.pollTimer && typeof this.pollTimer === 'object' && 'unref' in this.pollTimer) {
      (this.pollTimer as NodeJS.Timeout).unref();
    }
  }

  close(): void {
    if (this.pollTimer !== null) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }
}

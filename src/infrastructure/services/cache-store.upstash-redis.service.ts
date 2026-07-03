import { Redis } from '@upstash/redis';

import { ICacheStore } from '@/src/application/services/cache-store.service.interface';

export class UpstashRedisCacheStore implements ICacheStore {
  private readonly client: Redis;

  constructor(url: string, token: string) {
    this.client = new Redis({ url, token });
  }

  getName(): string {
    return 'upstash-redis';
  }

  async get<T>(key: string): Promise<T | undefined> {
    const value = await this.client.get<T>(key);
    return value ?? undefined;
  }

  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    await this.client.set(key, value, { px: ttlMs });
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async deleteByPrefix(prefix: string): Promise<void> {
    let cursor = '0';
    do {
      const [nextCursor, keys] = await this.client.scan(cursor, {
        match: `${prefix}*`,
        count: 100,
      });
      cursor = nextCursor;
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } while (cursor !== '0');
  }
}

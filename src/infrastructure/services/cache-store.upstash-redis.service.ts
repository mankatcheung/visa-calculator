import { Redis } from '@upstash/redis';

import { ICacheStore } from '@/src/application/services/cache-store.service.interface';

// Scan and delete all keys matching a glob pattern atomically.
// Lua runs atomically in Redis — no other commands execute between SCAN and DEL,
// so keys written concurrently cannot slip through between the two operations.
const DELETE_BY_PATTERN_SCRIPT = `
  local cursor = "0"
  repeat
    local result = redis.call("SCAN", cursor, "MATCH", ARGV[1], "COUNT", 100)
    cursor = result[1]
    local keys = result[2]
    if #keys > 0 then
      redis.call("DEL", unpack(keys))
    end
  until cursor == "0"
  return 1
`;

export class UpstashRedisCacheStore implements ICacheStore {
  private readonly client: Redis;
  private readonly deleteByPatternScript;

  constructor(url: string, token: string) {
    this.client = new Redis({ url, token });
    this.deleteByPatternScript = this.client.createScript<number>(DELETE_BY_PATTERN_SCRIPT);
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
    await this.deleteByPatternScript.eval([], [`${prefix}*`]);
  }
}

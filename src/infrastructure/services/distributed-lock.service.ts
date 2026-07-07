import { Redis } from '@upstash/redis';

import { IDistributedLockService } from '@/src/application/services/distributed-lock.service.interface';

// Atomic check-and-delete: only releases the lock if the stored token matches.
const RELEASE_SCRIPT = `
  if redis.call('get', KEYS[1]) == ARGV[1] then
    return redis.call('del', KEYS[1])
  else
    return 0
  end
`;

export class UpstashDistributedLockService implements IDistributedLockService {
  private readonly releaseScript;

  constructor(private readonly redis: Redis) {
    this.releaseScript = redis.createScript<number>(RELEASE_SCRIPT);
  }

  async tryAcquire(key: string, ttlMs: number): Promise<string | null> {
    const token = crypto.randomUUID();
    const result = await this.redis.set(key, token, { nx: true, px: ttlMs });
    return result === 'OK' ? token : null;
  }

  async release(key: string, token: string): Promise<void> {
    await this.releaseScript.eval([key], [token]);
  }
}

export interface IDistributedLockService {
  /** Returns a token if the lock was acquired, null if already held. */
  tryAcquire(key: string, ttlMs: number): Promise<string | null>;
  /** Releases the lock only if the token matches (atomic check-and-delete). */
  release(key: string, token: string): Promise<void>;
}

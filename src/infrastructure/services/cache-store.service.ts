import { ICacheStore } from '@/src/application/services/cache-store.service.interface';

interface StoreEntry {
  value: unknown;
  expiresAt: number;
}

export class InMemoryCacheStore implements ICacheStore {
  private readonly store = new Map<string, StoreEntry>();
  private readonly max: number;

  constructor(max = 500) {
    this.max = max;
  }

  getName(): string {
    return 'in-memory';
  }

  async get<T>(key: string): Promise<T | undefined> {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    // move to end = most-recently-used
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    if (this.store.size >= this.max && !this.store.has(key)) {
      // evict least-recently-used (first key in insertion order)
      const lruKey = this.store.keys().next().value;
      if (lruKey !== undefined) {
        this.store.delete(lruKey);
      }
    }
    // delete then re-insert to update insertion position
    this.store.delete(key);
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async deleteByPrefix(prefix: string): Promise<void> {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }
}

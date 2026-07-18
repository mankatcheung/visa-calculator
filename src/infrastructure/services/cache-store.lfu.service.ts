import { ICacheStore } from '@/src/application/services/cache-store.service.interface';

interface LfuEntry {
  value: unknown;
  expiresAt: number;
  frequency: number;
}

/**
 * O(1) LFU cache store.
 *
 * Eviction policy: least-frequently-used entry. Among entries sharing the
 * minimum frequency, the least-recently-used one is chosen (insertion order
 * within each frequency bucket).
 */
export class LfuCacheStore implements ICacheStore {
  private readonly keyMap = new Map<string, LfuEntry>();
  // Each Set preserves insertion order → first item = LRU among ties.
  private readonly freqMap = new Map<number, Set<string>>();
  private minFreq = 0;
  private readonly max: number;

  constructor(max = 500, sweepIntervalMs = 60_000) {
    this.max = max;
    if (sweepIntervalMs > 0) {
      const timer = setInterval(() => this.purgeExpired(), sweepIntervalMs);
      if (typeof timer === 'object' && timer !== null && 'unref' in timer) {
        (timer as NodeJS.Timeout).unref();
      }
    }
  }

  getName(): string {
    return 'lfu';
  }

  purgeExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.keyMap) {
      if (now > entry.expiresAt) {
        this.removeKey(key, entry.frequency);
      }
    }
  }

  async get<T>(key: string): Promise<T | undefined> {
    const entry = this.keyMap.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.removeKey(key, entry.frequency);
      return undefined;
    }
    this.incrementFrequency(key, entry);
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    if (this.max <= 0) return;

    const expiresAt = Date.now() + ttlMs;

    const existing = this.keyMap.get(key);
    if (existing) {
      existing.value = value;
      existing.expiresAt = expiresAt;
      this.incrementFrequency(key, existing);
      return;
    }

    if (this.keyMap.size >= this.max) {
      this.evict();
    }

    const entry: LfuEntry = { value, expiresAt, frequency: 1 };
    this.keyMap.set(key, entry);
    this.addToFreqBucket(1, key);
    this.minFreq = 1;
  }

  async delete(key: string): Promise<void> {
    const entry = this.keyMap.get(key);
    if (entry) {
      this.removeKey(key, entry.frequency);
    }
  }

  async deleteByPrefix(prefix: string): Promise<void> {
    for (const [key, entry] of this.keyMap) {
      if (key.startsWith(prefix)) {
        this.removeKey(key, entry.frequency);
      }
    }
  }

  private incrementFrequency(key: string, entry: LfuEntry): void {
    const oldFreq = entry.frequency;
    const newFreq = oldFreq + 1;

    const bucket = this.freqMap.get(oldFreq);
    if (bucket) {
      bucket.delete(key);
      if (bucket.size === 0) {
        this.freqMap.delete(oldFreq);
        if (this.minFreq === oldFreq) {
          this.minFreq = newFreq;
        }
      }
    }

    entry.frequency = newFreq;
    this.addToFreqBucket(newFreq, key);
  }

  private addToFreqBucket(freq: number, key: string): void {
    let bucket = this.freqMap.get(freq);
    if (!bucket) {
      bucket = new Set<string>();
      this.freqMap.set(freq, bucket);
    }
    bucket.add(key);
  }

  private removeKey(key: string, frequency: number): void {
    this.keyMap.delete(key);
    const bucket = this.freqMap.get(frequency);
    if (bucket) {
      bucket.delete(key);
      if (bucket.size === 0) {
        this.freqMap.delete(frequency);
      }
    }
  }

  private evict(): void {
    const bucket = this.freqMap.get(this.minFreq);
    if (!bucket || bucket.size === 0) return;
    // First entry in the Set is the LRU among minimum-frequency entries.
    const victim = bucket.keys().next().value as string;
    this.removeKey(victim, this.minFreq);
  }
}

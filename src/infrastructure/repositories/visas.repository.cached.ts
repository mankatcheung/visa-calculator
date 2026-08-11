import { ICacheManager } from '@/src/application/services/cache-manager.service.interface';
import { IVisasRepository } from '@/src/application/repositories/visas.repository.interface';
import type { CreateVisa, UpdateVisa, Visa } from '@/src/entities/models/visa';

const TTL_MS = 5 * 60 * 1_000;
const STALE_TTL_MS = 2 * 60 * 1_000;
const JITTER = 0.1;

export class CachedVisasRepository implements IVisasRepository {
  constructor(
    private readonly cacheManager: ICacheManager,
    private readonly inner: IVisasRepository
  ) {}

  async createVisa(data: CreateVisa, userId: string, tx?: any): Promise<Visa> {
    const result = await this.inner.createVisa(data, userId, tx);
    await this.cacheManager.invalidateByPrefix(`visas:user:${userId}:`);
    return result;
  }

  async getVisa(id: number, userId: string): Promise<Visa | undefined> {
    return this.cacheManager.get(
      `visas:id:${id}`,
      () => this.inner.getVisa(id, userId),
      { ttlMs: TTL_MS, staleTtlMs: STALE_TTL_MS, jitter: JITTER }
    );
  }

  async getVisasForUser(userId: string): Promise<Visa[]> {
    return this.cacheManager.get(
      `visas:user:${userId}:all`,
      () => this.inner.getVisasForUser(userId),
      { ttlMs: TTL_MS, staleTtlMs: STALE_TTL_MS, jitter: JITTER }
    );
  }

  async updateVisa(
    id: number,
    userId: string,
    data: Partial<UpdateVisa>,
    tx?: any
  ): Promise<Visa> {
    const result = await this.inner.updateVisa(id, userId, data, tx);
    await Promise.all([
      this.cacheManager.invalidate(`visas:id:${id}`),
      this.cacheManager.invalidateByPrefix(`visas:user:${userId}:`),
    ]);
    return result;
  }

  async deleteVisa(id: number, userId: string, tx?: any): Promise<void> {
    await this.inner.deleteVisa(id, userId, tx);
    await Promise.all([
      this.cacheManager.invalidate(`visas:id:${id}`),
      this.cacheManager.invalidateByPrefix(`visas:user:${userId}:`),
    ]);
  }

  async deleteVisasForUser(userId: string, tx?: any): Promise<void> {
    await this.inner.deleteVisasForUser(userId, tx);
    await this.cacheManager.invalidateByPrefix(`visas:user:${userId}:`);
  }
}

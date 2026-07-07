import { ICacheManager } from '@/src/application/services/cache-manager.service.interface';
import { ILeavesRepository } from '@/src/application/repositories/leaves.repository.interface';
import type { Leave, LeaveInsert, LeaveUpdate, PaginatedLeaves } from '@/src/entities/models/leave';

const TTL_MS = 5 * 60 * 1_000;
const STALE_TTL_MS = 2 * 60 * 1_000;
const JITTER = 0.1;

export class CachedLeavesRepository implements ILeavesRepository {
  constructor(
    private readonly cacheManager: ICacheManager,
    private readonly inner: ILeavesRepository
  ) {}

  async createLeave(leave: LeaveInsert, tx?: any): Promise<Leave> {
    const result = await this.inner.createLeave(leave, tx);
    await this.cacheManager.invalidateByPrefix(`leaves:user:${leave.userId}:`);
    return result;
  }

  async getLeave(id: number): Promise<Leave | undefined> {
    return this.cacheManager.get(
      `leaves:id:${id}`,
      () => this.inner.getLeave(id),
      { ttlMs: TTL_MS, staleTtlMs: STALE_TTL_MS, jitter: JITTER }
    );
  }

  async getLeavesForUser(userId: string): Promise<Leave[]> {
    return this.cacheManager.get(
      `leaves:user:${userId}:all`,
      () => this.inner.getLeavesForUser(userId),
      { ttlMs: TTL_MS, staleTtlMs: STALE_TTL_MS, jitter: JITTER }
    );
  }

  async getPaginatedLeavesForUser(
    userId: string,
    page: number,
    limit: number
  ): Promise<PaginatedLeaves> {
    return this.cacheManager.get(
      `leaves:user:${userId}:page:${page}:limit:${limit}`,
      () => this.inner.getPaginatedLeavesForUser(userId, page, limit),
      { ttlMs: TTL_MS, staleTtlMs: STALE_TTL_MS, jitter: JITTER }
    );
  }

  async updateLeave(
    id: number,
    input: Partial<LeaveUpdate>,
    tx?: any
  ): Promise<Leave> {
    const result = await this.inner.updateLeave(id, input, tx);
    await Promise.all([
      this.cacheManager.invalidate(`leaves:id:${id}`),
      this.cacheManager.invalidateByPrefix(`leaves:user:${result.userId}:`),
    ]);
    return result;
  }

  async deleteLeave(id: number, userId: string, tx?: any): Promise<void> {
    await this.inner.deleteLeave(id, userId, tx);
    await Promise.all([
      this.cacheManager.invalidate(`leaves:id:${id}`),
      this.cacheManager.invalidateByPrefix(`leaves:user:${userId}:`),
    ]);
  }

  async deleteLeavesForUser(userId: string, tx?: any): Promise<void> {
    await this.inner.deleteLeavesForUser(userId, tx);
    await this.cacheManager.invalidateByPrefix(`leaves:user:${userId}:`);
  }
}

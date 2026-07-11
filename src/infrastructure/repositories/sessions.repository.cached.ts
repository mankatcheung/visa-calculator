import { ICacheManager } from '@/src/application/services/cache-manager.service.interface';
import { ISessionsRepository } from '@/src/application/repositories/sessions.repository.interface';
import { Session } from '@/src/entities/models/session';
import { User } from '@/src/entities/models/user';

const TTL_MS = 2 * 60 * 1_000;
const STALE_TTL_MS = 60 * 1_000;
const JITTER = 0.1;

export class CachedSessionsRepository implements ISessionsRepository {
  constructor(
    private readonly cacheManager: ICacheManager,
    private readonly inner: ISessionsRepository
  ) {}

  async createSession(session: Session, tx?: any): Promise<Session> {
    return this.inner.createSession(session, tx);
  }

  async getSession(
    sessionId: string
  ): Promise<Partial<{ session: Session; user: User }>> {
    return this.cacheManager.get(
      `sessions:id:${sessionId}`,
      () => this.inner.getSession(sessionId),
      { ttlMs: TTL_MS, staleTtlMs: STALE_TTL_MS, jitter: JITTER }
    );
  }

  async getUserSession(
    userId: string
  ): Promise<{ session: Session; user: User }> {
    return this.cacheManager.get(
      `sessions:user:${userId}`,
      () => this.inner.getUserSession(userId),
      { ttlMs: TTL_MS, staleTtlMs: STALE_TTL_MS, jitter: JITTER }
    );
  }

  async updateSessionExpiresAt(
    sessionId: string,
    newExpiresAt: Date
  ): Promise<Session> {
    const result = await this.inner.updateSessionExpiresAt(
      sessionId,
      newExpiresAt
    );
    await this.cacheManager.invalidate(`sessions:id:${sessionId}`);
    return result;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.inner.deleteSession(sessionId);
    await this.cacheManager.invalidate(`sessions:id:${sessionId}`);
  }

  async deleteOtherSessionsByUserId(
    userId: string,
    currentSessionId: string
  ): Promise<void> {
    await this.inner.deleteOtherSessionsByUserId(userId, currentSessionId);
    await this.cacheManager.invalidateByPrefix(`sessions:user:${userId}`);
  }

  async deleteUserSession(userId: string, tx?: any): Promise<void> {
    await this.inner.deleteUserSession(userId, tx);
    await this.cacheManager.invalidateByPrefix(`sessions:user:${userId}`);
  }
}

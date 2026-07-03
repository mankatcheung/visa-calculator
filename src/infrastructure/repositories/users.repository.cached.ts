import { ICacheManager } from '@/src/application/services/cache-manager.service.interface';
import { IUsersRepository } from '@/src/application/repositories/users.repository.interface';
import type { ITransaction } from '@/src/entities/models/transaction.interface';
import type { CreateUser, UpdateUser, User } from '@/src/entities/models/user';

const TTL_MS = 5 * 60 * 1_000;
const STALE_TTL_MS = 2 * 60 * 1_000;
const JITTER = 0.1;

export class CachedUsersRepository implements IUsersRepository {
  constructor(
    private readonly cacheManager: ICacheManager,
    private readonly inner: IUsersRepository
  ) {}

  async getUser(id: string): Promise<User | undefined> {
    return this.cacheManager.get(
      `users:id:${id}`,
      () => this.inner.getUser(id),
      { ttlMs: TTL_MS, staleTtlMs: STALE_TTL_MS, jitter: JITTER }
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.cacheManager.get(
      `users:email:${email}`,
      () => this.inner.getUserByEmail(email),
      { ttlMs: TTL_MS, staleTtlMs: STALE_TTL_MS, jitter: JITTER }
    );
  }

  async getAllEmails(): Promise<string[]> {
    return this.inner.getAllEmails();
  }

  async createUser(input: CreateUser, tx?: ITransaction): Promise<User> {
    const user = await this.inner.createUser(input, tx);
    await Promise.all([
      this.cacheManager.invalidate(`users:id:${user.id}`),
      this.cacheManager.invalidate(`users:email:${user.email}`),
    ]);
    return user;
  }

  async updateUser(
    id: string,
    input: Partial<UpdateUser>,
    tx?: ITransaction
  ): Promise<User> {
    const user = await this.inner.updateUser(id, input, tx);
    await Promise.all([
      this.cacheManager.invalidate(`users:id:${id}`),
      this.cacheManager.invalidate(`users:email:${user.email}`),
    ]);
    return user;
  }

  async verifyUserEmail(id: string): Promise<User> {
    const user = await this.inner.verifyUserEmail(id);
    await this.cacheManager.invalidate(`users:id:${id}`);
    return user;
  }

  async applyEmailChange(userId: string, newEmail: string): Promise<User> {
    const user = await this.inner.applyEmailChange(userId, newEmail);
    await Promise.all([
      this.cacheManager.invalidate(`users:id:${userId}`),
      this.cacheManager.invalidate(`users:email:${newEmail}`),
    ]);
    return user;
  }

  async deleteUser(id: string, tx?: ITransaction): Promise<void> {
    const existing = await this.cacheManager.get<User | undefined>(
      `users:id:${id}`,
      () => this.inner.getUser(id),
      { ttlMs: TTL_MS, staleTtlMs: STALE_TTL_MS, jitter: JITTER }
    );
    await this.inner.deleteUser(id, tx);
    await this.cacheManager.invalidate(`users:id:${id}`);
    if (existing?.email) {
      await this.cacheManager.invalidate(`users:email:${existing.email}`);
    }
  }
}

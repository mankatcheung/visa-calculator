import { ICacheManager } from '@/src/application/services/cache-manager.service.interface';
import { IUserSettingsRepository } from '@/src/application/repositories/user-settings.repository.interface';
import {
  UserSetting,
  UserSettingUpdate,
} from '@/src/entities/models/userSettings';

const TTL_MS = 10 * 60 * 1_000;
const STALE_TTL_MS = 5 * 60 * 1_000;
const JITTER = 0.1;

export class CachedUserSettingsRepository implements IUserSettingsRepository {
  constructor(
    private readonly cacheManager: ICacheManager,
    private readonly inner: IUserSettingsRepository
  ) {}

  async getUserSettingsForUser(
    userId: string
  ): Promise<UserSetting | undefined> {
    return this.cacheManager.get(
      `user-settings:user:${userId}`,
      () => this.inner.getUserSettingsForUser(userId),
      { ttlMs: TTL_MS, staleTtlMs: STALE_TTL_MS, jitter: JITTER }
    );
  }

  async createUserSettings(userId: string, tx?: any): Promise<UserSetting> {
    const result = await this.inner.createUserSettings(userId, tx);
    await this.cacheManager.invalidate(`user-settings:user:${userId}`);
    return result;
  }

  async updateUserSettings(
    userId: string,
    input: Partial<UserSettingUpdate>,
    tx?: any
  ): Promise<UserSetting> {
    const result = await this.inner.updateUserSettings(userId, input, tx);
    await this.cacheManager.invalidate(`user-settings:user:${userId}`);
    return result;
  }

  async deleteUserSettingsForUser(userId: string, tx?: any): Promise<void> {
    await this.inner.deleteUserSettingsForUser(userId, tx);
    await this.cacheManager.invalidate(`user-settings:user:${userId}`);
  }
}

import {
  UserSetting,
  UserSettingUpdate,
} from '@/src/entities/models/userSettings';

export interface IUserSettingsRepository {
  getUserSettingsForUser(userId: string): Promise<UserSetting | undefined>;
  createUserSettings(userId: string, tx?: any): Promise<UserSetting>;
  updateUserSettings(
    userId: string,
    input: Partial<UserSettingUpdate>,
    tx?: any
  ): Promise<UserSetting>;
}

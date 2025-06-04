import { IUserSettingsRepository } from '@/src/application/repositories/user-settings.repository.interface';
import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { UserSetting } from '@/src/entities/models/userSettings';

export type IGetUserSettingsForUserUseCase = ReturnType<
  typeof getUserSettingsForUserUseCase
>;

export const getUserSettingsForUserUseCase =
  (
    instrumentationService: IInstrumentationService,
    userSettingsRepository: IUserSettingsRepository
  ) =>
  (userId: string): Promise<UserSetting | undefined> => {
    return instrumentationService.startSpan(
      { name: 'getUserSettingsForUser UseCase', op: 'function' },
      async () => {
        return await userSettingsRepository.getUserSettingsForUser(userId);
      }
    );
  };

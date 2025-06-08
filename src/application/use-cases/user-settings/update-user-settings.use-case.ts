import { IUserSettingsRepository } from '@/src/application/repositories/user-settings.repository.interface';
import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { UserSetting } from '@/src/entities/models/userSettings';

export type IUpdateUserSettingsUseCase = ReturnType<
  typeof updateUserSettingsUseCase
>;

export const updateUserSettingsUseCase =
  (
    instrumentationService: IInstrumentationService,
    userSettingsRepository: IUserSettingsRepository
  ) =>
  (
    input: {
      visaStartDate?: Date;
      visaExpiryDate?: Date;
      arrivalDate?: Date;
    },
    userId: string,
    tx?: any
  ): Promise<UserSetting> => {
    return instrumentationService.startSpan(
      { name: 'updateUserSettings Use Case', op: 'function' },
      async () => {
        // HINT: this is where you'd do authorization checks - is this user authorized to create a leave
        // for example: free users are allowed only 5 leaves, throw an UnauthorizedError if more than 5

        const newSettings = await userSettingsRepository.updateUserSettings(
          userId,
          input,
          tx
        );

        return newSettings;
      }
    );
  };

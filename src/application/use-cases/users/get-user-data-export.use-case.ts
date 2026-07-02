import type { ILeavesRepository } from '@/src/application/repositories/leaves.repository.interface';
import type { IUserSettingsRepository } from '@/src/application/repositories/user-settings.repository.interface';
import type { IUsersRepository } from '@/src/application/repositories/users.repository.interface';
import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { NotFoundError } from '@/src/entities/errors/common';
import type { Leave } from '@/src/entities/models/leave';
import type { User } from '@/src/entities/models/user';
import type { UserSetting } from '@/src/entities/models/userSettings';

export type IGetUserDataExportUseCase = ReturnType<
  typeof getUserDataExportUseCase
>;

export const getUserDataExportUseCase =
  (
    instrumentationService: IInstrumentationService,
    usersRepository: IUsersRepository,
    userSettingsRepository: IUserSettingsRepository,
    leavesRepository: ILeavesRepository
  ) =>
  (
    userId: string
  ): Promise<{
    user: User;
    settings: UserSetting | undefined;
    leaves: Leave[];
  }> => {
    return instrumentationService.startSpan(
      { name: 'getUserDataExport UseCase', op: 'function' },
      async () => {
        const [user, settings, leaves] = await Promise.all([
          usersRepository.getUser(userId),
          userSettingsRepository.getUserSettingsForUser(userId),
          leavesRepository.getLeavesForUser(userId),
        ]);

        if (!user) {
          throw new NotFoundError('User does not exist');
        }

        return { user, settings, leaves };
      }
    );
  };

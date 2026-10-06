import type { ILeavesRepository } from '@/src/application/repositories/leaves.repository.interface';
import type { IVisasRepository } from '@/src/application/repositories/visas.repository.interface';
import type { IUsersRepository } from '@/src/application/repositories/users.repository.interface';
import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { NotFoundError } from '@/src/entities/errors/common';
import type { Leave } from '@/src/entities/models/leave';
import type { User } from '@/src/entities/models/user';
import type { Visa } from '@/src/entities/models/visa';

export type IGetUserDataExportUseCase = ReturnType<
  typeof getUserDataExportUseCase
>;

export const getUserDataExportUseCase =
  (
    instrumentationService: IInstrumentationService,
    usersRepository: IUsersRepository,
    visasRepository: IVisasRepository,
    leavesRepository: ILeavesRepository
  ) =>
  (
    userId: string
  ): Promise<{
    user: User;
    visas: Visa[];
    leaves: Leave[];
  }> => {
    return instrumentationService.startSpan(
      { name: 'getUserDataExport UseCase', op: 'function' },
      async () => {
        const [user, visas, leaves] = await Promise.all([
          usersRepository.getUser(userId),
          visasRepository.getVisasForUser(userId),
          leavesRepository.getLeavesForUser(userId),
        ]);

        if (!user) {
          throw new NotFoundError('User does not exist');
        }

        return { user, visas, leaves };
      }
    );
  };

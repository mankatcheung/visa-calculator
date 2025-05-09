import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { NotFoundError } from '@/src/entities/errors/common';
import { IUsersRepository } from '@/src/application/repositories/users.repository.interface';
import { User } from '@/src/entities/models/user';

export type IGetUserUseCase = ReturnType<typeof getUserUseCase>;

export const getUserUseCase =
  (
    instrumentationService: IInstrumentationService,
    usersRepository: IUsersRepository
  ) =>
  (userId: string): Promise<User> => {
    return instrumentationService.startSpan(
      { name: 'getLeave UseCase', op: 'function' },
      async () => {
        const user = await usersRepository.getUser(userId);

        if (!user) {
          throw new NotFoundError('User does not exist');
        }

        return user;
      }
    );
  };

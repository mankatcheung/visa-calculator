import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { User } from '@/src/entities/models/user';
import { AuthenticationError } from '@/src/entities/errors/auth';
import { IUsersRepository } from '@/src/application/repositories/users.repository.interface';
import { IAuthenticationService } from '@/src/application/services/authentication.service.interface';

export type IUpdateUserPasswordUseCase = ReturnType<
  typeof updateUserPasswordUseCase
>;

export const updateUserPasswordUseCase =
  (
    instrumentationService: IInstrumentationService,
    authenticationService: IAuthenticationService,
    usersRepository: IUsersRepository
  ) =>
  (
    input: {
      currentPassword: string;
      newPassword: string;
      currentPasswordHash: string;
    },
    userId: string,
    tx?: any
  ): Promise<User> => {
    return instrumentationService.startSpan(
      { name: 'updateUserPassword Use Case', op: 'function' },
      async () => {
        const matched = await authenticationService.validatePasswords(
          input.currentPassword,
          input.currentPasswordHash
        );

        if (!matched) {
          throw new AuthenticationError('Current password is incorrect');
        }
        const newUser = await usersRepository.updateUser(
          userId,
          {
            password: input.newPassword,
          },
          tx
        );

        return newUser;
      }
    );
  };

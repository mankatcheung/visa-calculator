import { IEmailChangeTokensRepository } from '@/src/application/repositories/email-change-tokens.repository.interface';
import { IEmailVerificationTokensRepository } from '@/src/application/repositories/email-verification-tokens.repository.interface';
import { ILeavesRepository } from '@/src/application/repositories/leaves.repository.interface';
import { IPasswordResetTokensRepository } from '@/src/application/repositories/password-reset-tokens.repository.interface';
import { ISessionsRepository } from '@/src/application/repositories/sessions.repository.interface';
import { IUserSettingsRepository } from '@/src/application/repositories/user-settings.repository.interface';
import { IUsersRepository } from '@/src/application/repositories/users.repository.interface';
import { IAuthenticationService } from '@/src/application/services/authentication.service.interface';
import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { AuthenticationError } from '@/src/entities/errors/auth';
import type { ITransaction } from '@/src/entities/models/transaction.interface';

export type IDeleteAccountUseCase = ReturnType<typeof deleteAccountUseCase>;

export const deleteAccountUseCase =
  (
    instrumentationService: IInstrumentationService,
    authenticationService: IAuthenticationService,
    usersRepository: IUsersRepository,
    leavesRepository: ILeavesRepository,
    userSettingsRepository: IUserSettingsRepository,
    passwordResetTokensRepository: IPasswordResetTokensRepository,
    emailVerificationTokensRepository: IEmailVerificationTokensRepository,
    emailChangeTokensRepository: IEmailChangeTokensRepository,
    sessionsRepository: ISessionsRepository
  ) =>
  (
    input: {
      currentPassword: string;
      currentPasswordHash: string;
      email: string;
    },
    userId: string,
    tx?: ITransaction
  ): Promise<void> => {
    return instrumentationService.startSpan(
      { name: 'deleteAccount Use Case', op: 'function' },
      async () => {
        const matched = await authenticationService.validatePasswords(
          input.currentPassword,
          input.currentPasswordHash
        );

        if (!matched) {
          throw new AuthenticationError('Current password is incorrect');
        }

        // GDPR/CCPA "right to erasure": remove every row referencing this
        // user, then the user row itself, atomically within a single
        // transaction. Deletes are explicit (rather than relying on
        // `ON DELETE CASCADE`) since FK enforcement isn't guaranteed to be
        // on for every connection/driver -- see drizzle/schema.ts.
        await leavesRepository.deleteLeavesForUser(userId, tx);
        await userSettingsRepository.deleteUserSettingsForUser(userId, tx);
        await passwordResetTokensRepository.deleteTokensByUserId(userId, tx);
        await emailVerificationTokensRepository.deleteTokensByUserId(
          userId,
          tx
        );
        await emailChangeTokensRepository.deleteTokensByUserId(userId, tx);
        await sessionsRepository.deleteUserSession(userId, tx);
        // The user row must be deleted last, after every table referencing
        // it has been cleared.
        await usersRepository.deleteUser(userId, input.email, tx);
      }
    );
  };

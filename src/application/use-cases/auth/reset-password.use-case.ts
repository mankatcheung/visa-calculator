import { sha256 } from '@oslojs/crypto/sha2';
import { encodeHexLowerCase } from '@oslojs/encoding';

import { IPasswordResetTokensRepository } from '@/src/application/repositories/password-reset-tokens.repository.interface';
import { ISessionsRepository } from '@/src/application/repositories/sessions.repository.interface';
import { IUsersRepository } from '@/src/application/repositories/users.repository.interface';
import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { AuthenticationError } from '@/src/entities/errors/auth';
import type { ITransaction } from '@/src/entities/models/transaction.interface';

export type IResetPasswordUseCase = ReturnType<typeof resetPasswordUseCase>;

export const resetPasswordUseCase =
  (
    instrumentationService: IInstrumentationService,
    passwordResetTokensRepository: IPasswordResetTokensRepository,
    usersRepository: IUsersRepository,
    sessionsRepository: ISessionsRepository
  ) =>
  async (
    token: string,
    newPassword: string,
    tx?: ITransaction
  ): Promise<void> => {
    return await instrumentationService.startSpan(
      { name: 'resetPassword Use Case' },
      async () => {
        const tokenHash = encodeHexLowerCase(
          sha256(new TextEncoder().encode(token))
        );

        const resetToken =
          await passwordResetTokensRepository.getToken(tokenHash);
        if (!resetToken) {
          throw new AuthenticationError(
            'Invalid or expired password reset token'
          );
        }

        if (Date.now() >= resetToken.expiresAt.getTime()) {
          await passwordResetTokensRepository.deleteToken(tokenHash, tx);
          throw new AuthenticationError(
            'Invalid or expired password reset token'
          );
        }

        // Password update, token invalidation, and session revocation are
        // all part of the same atomic write: a partial failure must never
        // leave the password changed without the token consumed (replay
        // risk) or without every session revoked (the whole point of this
        // flow -- see comment below).
        await usersRepository.updateUser(
          resetToken.userId,
          { password: newPassword },
          tx
        );
        await passwordResetTokensRepository.deleteToken(tokenHash, tx);

        // SECURITY: forgot-password reset is the account-recovery path used
        // when a user suspects their credentials were compromised. Revoke
        // every existing session (there is no "current" session to spare
        // here, unlike an in-app password change) so a stolen session
        // cookie can no longer be used after the owner regains control.
        await sessionsRepository.deleteUserSession(resetToken.userId, tx);
      }
    );
  };

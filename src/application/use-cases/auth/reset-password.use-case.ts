import { sha256 } from '@oslojs/crypto/sha2';
import { encodeHexLowerCase } from '@oslojs/encoding';

import { IPasswordResetTokensRepository } from '@/src/application/repositories/password-reset-tokens.repository.interface';
import { IUsersRepository } from '@/src/application/repositories/users.repository.interface';
import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { AuthenticationError } from '@/src/entities/errors/auth';

export type IResetPasswordUseCase = ReturnType<typeof resetPasswordUseCase>;

export const resetPasswordUseCase =
  (
    instrumentationService: IInstrumentationService,
    passwordResetTokensRepository: IPasswordResetTokensRepository,
    usersRepository: IUsersRepository
  ) =>
  async (token: string, newPassword: string): Promise<void> => {
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
          await passwordResetTokensRepository.deleteToken(tokenHash);
          throw new AuthenticationError(
            'Invalid or expired password reset token'
          );
        }

        await usersRepository.updateUser(resetToken.userId, {
          password: newPassword,
        });
        await passwordResetTokensRepository.deleteToken(tokenHash);
      }
    );
  };

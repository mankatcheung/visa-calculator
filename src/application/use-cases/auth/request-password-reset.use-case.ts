import { sha256 } from '@oslojs/crypto/sha2';
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from '@oslojs/encoding';

import { IPasswordResetTokensRepository } from '@/src/application/repositories/password-reset-tokens.repository.interface';
import { IUsersRepository } from '@/src/application/repositories/users.repository.interface';
import { IEmailService } from '@/src/application/services/email.service.interface';
import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';

export type IRequestPasswordResetUseCase = ReturnType<
  typeof requestPasswordResetUseCase
>;

export const requestPasswordResetUseCase =
  (
    instrumentationService: IInstrumentationService,
    usersRepository: IUsersRepository,
    passwordResetTokensRepository: IPasswordResetTokensRepository,
    emailService: IEmailService
  ) =>
  async (email: string, resetBaseUrl: string): Promise<void> => {
    return await instrumentationService.startSpan(
      { name: 'requestPasswordReset Use Case' },
      async () => {
        const user = await usersRepository.getUserByEmail(email);
        if (!user) {
          // Silently succeed to prevent user enumeration
          return;
        }

        await passwordResetTokensRepository.deleteTokensByUserId(user.id);

        const bytes = new Uint8Array(20);
        crypto.getRandomValues(bytes);
        const token = encodeBase32LowerCaseNoPadding(bytes);
        const tokenHash = encodeHexLowerCase(
          sha256(new TextEncoder().encode(token))
        );

        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        await passwordResetTokensRepository.createToken(
          tokenHash,
          user.id,
          expiresAt
        );

        const resetUrl = `${resetBaseUrl}?token=${token}`;
        await emailService.sendPasswordResetEmail(email, resetUrl);
      }
    );
  };

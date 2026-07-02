import { sha256 } from '@oslojs/crypto/sha2';
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from '@oslojs/encoding';

import { APP_URL, SupportedLocale } from '@/config';

import { IPasswordResetTokensRepository } from '@/src/application/repositories/password-reset-tokens.repository.interface';
import { IUsersRepository } from '@/src/application/repositories/users.repository.interface';
import { IEmailService } from '@/src/application/services/email.service.interface';
import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import type { ITransaction } from '@/src/entities/models/transaction.interface';

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
  async (
    email: string,
    locale: SupportedLocale,
    tx?: ITransaction
  ): Promise<void> => {
    return await instrumentationService.startSpan(
      { name: 'requestPasswordReset Use Case' },
      async () => {
        const user = await usersRepository.getUserByEmail(email);
        if (!user) {
          // Silently succeed to prevent user enumeration
          return;
        }

        // Old tokens are invalidated and the new one created atomically, so
        // a failure between the two never leaves the user without any valid
        // token and without the old one either.
        await passwordResetTokensRepository.deleteTokensByUserId(user.id, tx);

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
          expiresAt,
          tx
        );

        // SECURITY: the base URL is always built from the trusted, server-
        // configured APP_URL — never from client input or the `Host` header —
        // to prevent password-reset link poisoning (CWE-640).
        const resetUrl = `${APP_URL}/${locale}/reset-password?token=${token}`;
        await emailService.sendPasswordResetEmail(email, resetUrl);
      }
    );
  };

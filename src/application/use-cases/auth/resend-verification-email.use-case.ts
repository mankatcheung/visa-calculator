import { sha256 } from '@oslojs/crypto/sha2';
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from '@oslojs/encoding';

import { IEmailVerificationTokensRepository } from '@/src/application/repositories/email-verification-tokens.repository.interface';
import { IUsersRepository } from '@/src/application/repositories/users.repository.interface';
import { IEmailService } from '@/src/application/services/email.service.interface';
import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';

export type IResendVerificationEmailUseCase = ReturnType<
  typeof resendVerificationEmailUseCase
>;

export const resendVerificationEmailUseCase =
  (
    instrumentationService: IInstrumentationService,
    usersRepository: IUsersRepository,
    emailVerificationTokensRepository: IEmailVerificationTokensRepository,
    emailService: IEmailService
  ) =>
  async (userId: string, verifyBaseUrl: string): Promise<void> => {
    return await instrumentationService.startSpan(
      { name: 'resendVerificationEmail Use Case' },
      async () => {
        const user = await usersRepository.getUser(userId);
        if (!user || user.emailVerified) {
          return;
        }

        await emailVerificationTokensRepository.deleteTokensByUserId(userId);

        const bytes = new Uint8Array(20);
        crypto.getRandomValues(bytes);
        const token = encodeBase32LowerCaseNoPadding(bytes);
        const tokenHash = encodeHexLowerCase(
          sha256(new TextEncoder().encode(token))
        );

        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await emailVerificationTokensRepository.createToken(
          tokenHash,
          userId,
          expiresAt
        );

        const verifyUrl = `${verifyBaseUrl}?token=${token}`;
        await emailService.sendVerificationEmail(user.email, verifyUrl);
      }
    );
  };

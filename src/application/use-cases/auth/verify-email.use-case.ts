import { sha256 } from '@oslojs/crypto/sha2';
import { encodeHexLowerCase } from '@oslojs/encoding';

import { IEmailVerificationTokensRepository } from '@/src/application/repositories/email-verification-tokens.repository.interface';
import { IUsersRepository } from '@/src/application/repositories/users.repository.interface';
import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { AuthenticationError } from '@/src/entities/errors/auth';

export type IVerifyEmailUseCase = ReturnType<typeof verifyEmailUseCase>;

export const verifyEmailUseCase =
  (
    instrumentationService: IInstrumentationService,
    emailVerificationTokensRepository: IEmailVerificationTokensRepository,
    usersRepository: IUsersRepository
  ) =>
  async (token: string): Promise<void> => {
    return await instrumentationService.startSpan(
      { name: 'verifyEmail Use Case' },
      async () => {
        const tokenHash = encodeHexLowerCase(
          sha256(new TextEncoder().encode(token))
        );

        const verificationToken =
          await emailVerificationTokensRepository.getToken(tokenHash);
        if (!verificationToken) {
          throw new AuthenticationError('Invalid or expired verification link');
        }

        if (Date.now() >= verificationToken.expiresAt.getTime()) {
          await emailVerificationTokensRepository.deleteToken(tokenHash);
          throw new AuthenticationError('Invalid or expired verification link');
        }

        await usersRepository.verifyUserEmail(verificationToken.userId);
        await emailVerificationTokensRepository.deleteToken(tokenHash);
      }
    );
  };

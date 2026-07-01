import { sha256 } from '@oslojs/crypto/sha2';
import { encodeHexLowerCase } from '@oslojs/encoding';

import { IEmailChangeTokensRepository } from '@/src/application/repositories/email-change-tokens.repository.interface';
import { IUsersRepository } from '@/src/application/repositories/users.repository.interface';
import { IEmailService } from '@/src/application/services/email.service.interface';
import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { InputParseError } from '@/src/entities/errors/common';

export type IRequestEmailChangeUseCase = ReturnType<
  typeof requestEmailChangeUseCase
>;

export const requestEmailChangeUseCase =
  (
    instrumentationService: IInstrumentationService,
    usersRepository: IUsersRepository,
    emailChangeTokensRepository: IEmailChangeTokensRepository,
    emailService: IEmailService
  ) =>
  async (
    input: { email: string },
    userId: string
  ): Promise<{ pendingEmail: string }> => {
    return await instrumentationService.startSpan(
      { name: 'requestEmailChange Use Case', op: 'function' },
      async () => {
        const existing = await usersRepository.getUserByEmail(input.email);
        if (existing) {
          throw new InputParseError('Email has been taken');
        }

        const currentUser = await usersRepository.getUser(userId);

        await emailChangeTokensRepository.deleteTokensByUserId(userId);

        const otpArray = new Uint32Array(1);
        crypto.getRandomValues(otpArray);
        const otp = String(otpArray[0] % 1_000_000).padStart(6, '0');
        const tokenHash = encodeHexLowerCase(
          sha256(new TextEncoder().encode(otp))
        );
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await emailChangeTokensRepository.createToken(
          tokenHash,
          userId,
          input.email,
          expiresAt
        );

        try {
          await emailService.sendEmailChangeOtp(input.email, otp);
        } catch {
          // Email delivery failure is non-fatal: the token is stored and the
          // user can request a resend.
        }

        if (currentUser) {
          try {
            await emailService.sendEmailChangeAlert(currentUser.email, input.email);
          } catch {
            // Alert delivery failure is non-fatal.
          }
        }

        return { pendingEmail: input.email };
      }
    );
  };

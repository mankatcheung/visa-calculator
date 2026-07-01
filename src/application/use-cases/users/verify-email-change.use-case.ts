import { sha256 } from '@oslojs/crypto/sha2';
import { encodeHexLowerCase } from '@oslojs/encoding';

import { IEmailChangeTokensRepository } from '@/src/application/repositories/email-change-tokens.repository.interface';
import { IUsersRepository } from '@/src/application/repositories/users.repository.interface';
import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { AuthenticationError } from '@/src/entities/errors/auth';
import {
  ConflictError,
  InputParseError,
} from '@/src/entities/errors/common';
import { User } from '@/src/entities/models/user';

export type IVerifyEmailChangeUseCase = ReturnType<
  typeof verifyEmailChangeUseCase
>;

export const verifyEmailChangeUseCase =
  (
    instrumentationService: IInstrumentationService,
    emailChangeTokensRepository: IEmailChangeTokensRepository,
    usersRepository: IUsersRepository
  ) =>
  async (otp: string, userId: string): Promise<User> => {
    return await instrumentationService.startSpan(
      { name: 'verifyEmailChange Use Case', op: 'function' },
      async () => {
        const tokenHash = encodeHexLowerCase(
          sha256(new TextEncoder().encode(otp))
        );

        const token =
          await emailChangeTokensRepository.getToken(tokenHash);
        if (!token || token.userId !== userId) {
          await emailChangeTokensRepository.deleteTokensByUserId(userId);
          throw new AuthenticationError('Invalid or expired verification code');
        }

        if (Date.now() >= token.expiresAt.getTime()) {
          await emailChangeTokensRepository.deleteToken(tokenHash);
          throw new AuthenticationError('Invalid or expired verification code');
        }

        let updatedUser: User;
        try {
          updatedUser = await usersRepository.applyEmailChange(
            userId,
            token.pendingEmail
          );
        } catch (err) {
          if (err instanceof ConflictError) {
            throw new InputParseError('Email is already taken');
          }
          throw err;
        }
        await emailChangeTokensRepository.deleteToken(tokenHash);
        return updatedUser;
      }
    );
  };

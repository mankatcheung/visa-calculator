import { sha256 } from '@oslojs/crypto/sha2';
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from '@oslojs/encoding';

import { APP_URL, SupportedLocale } from '@/config';

import { IEmailVerificationTokensRepository } from '@/src/application/repositories/email-verification-tokens.repository.interface';
import { IUserSettingsRepository } from '@/src/application/repositories/user-settings.repository.interface';
import type { IUsersRepository } from '@/src/application/repositories/users.repository.interface';
import type { IAuthenticationService } from '@/src/application/services/authentication.service.interface';
import type { IEmailBloomFilterService } from '@/src/application/services/email-bloom-filter.service.interface';
import { IEmailService } from '@/src/application/services/email.service.interface';
import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { AuthenticationError } from '@/src/entities/errors/auth';
import { ConflictError } from '@/src/entities/errors/common';
import { Cookie } from '@/src/entities/models/cookie';
import { Session } from '@/src/entities/models/session';
import type { ITransaction } from '@/src/entities/models/transaction.interface';
import { User } from '@/src/entities/models/user';

export type ISignUpUseCase = ReturnType<typeof signUpUseCase>;

export const signUpUseCase =
  (
    instrumentationService: IInstrumentationService,
    authenticationService: IAuthenticationService,
    usersRepository: IUsersRepository,
    userSettingsRepository: IUserSettingsRepository,
    emailBloomFilterService: IEmailBloomFilterService,
    emailVerificationTokensRepository: IEmailVerificationTokensRepository,
    emailService: IEmailService
  ) =>
  (
    input: {
      email: string;
      password: string;
      locale: SupportedLocale;
    },
    tx?: ITransaction
  ): Promise<{
    session: Session;
    cookie: Cookie;
    user: User;
  }> => {
    return instrumentationService.startSpan(
      { name: 'signUp Use Case', op: 'function' },
      async () => {
        if (await emailBloomFilterService.mightContainEmail(input.email)) {
          const existingUser = await usersRepository.getUserByEmail(
            input.email
          );
          if (existingUser) {
            throw new AuthenticationError('Email taken');
          }
        }

        const userId = authenticationService.generateUserId();

        let newUser: User;
        try {
          newUser = await usersRepository.createUser(
            {
              id: userId,
              email: input.email,
              password: input.password,
            },
            tx
          );
        } catch (err) {
          if (err instanceof ConflictError) {
            throw new AuthenticationError('Email taken');
          }
          throw err;
        }

        await emailBloomFilterService.recordEmail(input.email);

        await userSettingsRepository.createUserSettings(userId, tx);

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
          expiresAt,
          tx
        );

        const { cookie, session } = await authenticationService.createSession(
          newUser,
          tx
        );

        try {
          // SECURITY: the base URL is always built from the trusted, server-
          // configured APP_URL — never from client input or the `Host`
          // header — to prevent verification-link poisoning (CWE-640).
          //
          // Sent after all writes for this transaction have been queued, but
          // note the actual COMMIT only happens once this whole callback
          // returns (SQLite/libsql transaction semantics) -- so this call is
          // still effectively "mid-transaction". If a later write in this
          // same use case were added and failed, causing a rollback, an
          // already-sent email could point at a token that no longer
          // exists. None of the current steps after this point can fail in
          // a way that should block sign-up, so this is an accepted
          // tradeoff; keep this the last side effect in the function if more
          // steps are ever added here.
          const verifyUrl = `${APP_URL}/${input.locale}/verify-email?token=${token}`;
          await emailService.sendVerificationEmail(input.email, verifyUrl);
        } catch {
          // Email delivery failure is non-fatal: the token is stored and the
          // user can request a resend from /verify-email.
        }

        return {
          cookie,
          session,
          user: newUser,
        };
      }
    );
  };

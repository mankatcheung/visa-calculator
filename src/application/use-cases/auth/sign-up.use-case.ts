import { IUserSettingsRepository } from '@/src/application/repositories/user-settings.repository.interface';
import type { IUsersRepository } from '@/src/application/repositories/users.repository.interface';
import type { IAuthenticationService } from '@/src/application/services/authentication.service.interface';
import type { IEmailBloomFilterService } from '@/src/application/services/email-bloom-filter.service.interface';
import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { AuthenticationError } from '@/src/entities/errors/auth';
import { ConflictError } from '@/src/entities/errors/common';
import { Cookie } from '@/src/entities/models/cookie';
import { Session } from '@/src/entities/models/session';
import { User } from '@/src/entities/models/user';

export type ISignUpUseCase = ReturnType<typeof signUpUseCase>;

export const signUpUseCase =
  (
    instrumentationService: IInstrumentationService,
    authenticationService: IAuthenticationService,
    usersRepository: IUsersRepository,
    userSettingsRepository: IUserSettingsRepository,
    emailBloomFilterService: IEmailBloomFilterService
  ) =>
  (input: {
    email: string;
    password: string;
  }): Promise<{
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
          newUser = await usersRepository.createUser({
            id: userId,
            email: input.email,
            password: input.password,
          });
        } catch (err) {
          if (err instanceof ConflictError) {
            throw new AuthenticationError('Email taken');
          }
          throw err;
        }

        await emailBloomFilterService.recordEmail(input.email);

        await userSettingsRepository.createUserSettings(userId);

        const { cookie, session } =
          await authenticationService.createSession(newUser);

        return {
          cookie,
          session,
          user: newUser,
        };
      }
    );
  };

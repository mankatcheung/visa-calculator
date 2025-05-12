import { IAuthenticationService } from '@/src/application/services/authentication.service.interface';
import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { ISignOutUseCase } from '@/src/application/use-cases/auth/sign-out.use-case';
import { InputParseError } from '@/src/entities/errors/common';
import { Cookie } from '@/src/entities/models/cookie';

export type ISignOutController = ReturnType<typeof signOutController>;

export const signOutController =
  (
    instrumentationService: IInstrumentationService,
    authenticationService: IAuthenticationService,
    signOutUseCase: ISignOutUseCase
  ) =>
  async (token: string | undefined): Promise<Cookie> => {
    return await instrumentationService.startSpan(
      { name: 'signOut Controller' },
      async () => {
        if (!token) {
          throw new InputParseError('Must provide a session ID');
        }

        const { blankCookie } = await signOutUseCase(token);
        return blankCookie;
      }
    );
  };

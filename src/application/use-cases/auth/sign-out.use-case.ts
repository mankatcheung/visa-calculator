import { IAuthenticationService } from '@/src/application/services/authentication.service.interface';
import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { Cookie } from '@/src/entities/models/cookie';

export type ISignOutUseCase = ReturnType<typeof signOutUseCase>;

export const signOutUseCase =
  (
    instrumentationService: IInstrumentationService,
    authenticationService: IAuthenticationService
  ) =>
  (token: string): Promise<{ blankCookie: Cookie }> => {
    return instrumentationService.startSpan(
      { name: 'signOut Use Case', op: 'function' },
      async () => {
        return await authenticationService.invalidateSession(token);
      }
    );
  };

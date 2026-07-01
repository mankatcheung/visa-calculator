import { IAuthenticationService } from '@/src/application/services/authentication.service.interface';
import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { IGetPendingEmailChangeUseCase } from '@/src/application/use-cases/users/get-pending-email-change.use-case';
import { UnauthenticatedError } from '@/src/entities/errors/auth';

export type IGetPendingEmailChangeController = ReturnType<
  typeof getPendingEmailChangeController
>;

export const getPendingEmailChangeController =
  (
    instrumentationService: IInstrumentationService,
    authenticationService: IAuthenticationService,
    getPendingEmailChangeUseCase: IGetPendingEmailChangeUseCase
  ) =>
  async (token: string | undefined): Promise<string | null> => {
    return await instrumentationService.startSpan(
      { name: 'getPendingEmailChange Controller' },
      async () => {
        if (!token) {
          throw new UnauthenticatedError(
            'Must be logged in to get pending email change'
          );
        }
        const { user } = await authenticationService.validateSession(token);
        return getPendingEmailChangeUseCase(user.id);
      }
    );
  };

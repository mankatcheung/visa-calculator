import { IAuthenticationService } from '@/src/application/services/authentication.service.interface';
import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { ICancelEmailChangeUseCase } from '@/src/application/use-cases/users/cancel-email-change.use-case';
import { UnauthenticatedError } from '@/src/entities/errors/auth';

export type ICancelEmailChangeController = ReturnType<
  typeof cancelEmailChangeController
>;

export const cancelEmailChangeController =
  (
    instrumentationService: IInstrumentationService,
    authenticationService: IAuthenticationService,
    cancelEmailChangeUseCase: ICancelEmailChangeUseCase
  ) =>
  async (token: string | undefined): Promise<void> => {
    return await instrumentationService.startSpan(
      { name: 'cancelEmailChange Controller' },
      async () => {
        if (!token) {
          throw new UnauthenticatedError('Must be logged in to cancel email change');
        }
        const { user } = await authenticationService.validateSession(token);
        await cancelEmailChangeUseCase(user.id);
      }
    );
  };

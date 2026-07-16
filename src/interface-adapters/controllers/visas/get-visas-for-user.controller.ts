import { IAuthenticationService } from '@/src/application/services/authentication.service.interface';
import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { IGetVisasForUserUseCase } from '@/src/application/use-cases/visas/get-visas-for-user.use-case';
import { UnauthenticatedError } from '@/src/entities/errors/auth';
import { visaPresenter } from '@/src/interface-adapters/presenters/visas/visa.presenter';

export type IGetVisasForUserController = ReturnType<typeof getVisasForUserController>;

export const getVisasForUserController =
  (
    instrumentationService: IInstrumentationService,
    authenticationService: IAuthenticationService,
    getVisasForUserUseCase: IGetVisasForUserUseCase
  ) =>
  async (token: string | undefined) => {
    return await instrumentationService.startSpan(
      { name: 'getVisasForUser Controller' },
      async () => {
        if (!token) {
          throw new UnauthenticatedError('Must be logged in to list visas');
        }
        const { user } = await authenticationService.validateSession(token);
        const visas = await getVisasForUserUseCase(user.id);
        return visas.map((v) => visaPresenter(v, instrumentationService));
      }
    );
  };

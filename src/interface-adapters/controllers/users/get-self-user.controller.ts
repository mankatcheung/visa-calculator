import { IAuthenticationService } from '@/src/application/services/authentication.service.interface';
import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { IGetUserUseCase } from '@/src/application/use-cases/users/get-user.use-case';
import { UnauthenticatedError } from '@/src/entities/errors/auth';
import {
  getSelfUserPresenter,
  GetSelfUserPresenterOutput,
} from '@/src/interface-adapters/presenters/users/get-self-user.presenter';

export type IGetSelfUserController = ReturnType<typeof getSelfUserController>;

export const getSelfUserController =
  (
    instrumentationService: IInstrumentationService,
    authenticationService: IAuthenticationService,
    getUserUseCase: IGetUserUseCase
  ) =>
  async (token: string | undefined): Promise<GetSelfUserPresenterOutput> => {
    return await instrumentationService.startSpan(
      { name: 'getSelfUser Controller' },
      async () => {
        if (!token) {
          throw new UnauthenticatedError('Must be logged in to create a leave');
        }

        const { session } = await authenticationService.validateSession(token);

        const user = await getUserUseCase(session.userId);

        return getSelfUserPresenter(user, instrumentationService);
      }
    );
  };

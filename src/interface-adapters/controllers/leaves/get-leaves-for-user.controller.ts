import { IAuthenticationService } from '@/src/application/services/authentication.service.interface';
import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { IGetLeavesForUserUseCase } from '@/src/application/use-cases/leaves/get-leaves-for-user.use-case';
import { UnauthenticatedError } from '@/src/entities/errors/auth';
import {
  getLeavesForUserPresenter,
  GetLeavesForUserPresenterOutput,
} from '@/src/interface-adapters/presenters/leaves/get-leaves-for-user.presenter';

export type IGetLeavesForUserController = ReturnType<
  typeof getLeavesForUserController
>;

export const getLeavesForUserController =
  (
    instrumentationService: IInstrumentationService,
    authenticationService: IAuthenticationService,
    getLeavesForUserUseCase: IGetLeavesForUserUseCase
  ) =>
  async (
    token: string | undefined
  ): Promise<GetLeavesForUserPresenterOutput> => {
    return await instrumentationService.startSpan(
      { name: 'getLeavesForUser Controller' },
      async () => {
        if (!token) {
          throw new UnauthenticatedError('Must be logged in to create a leave');
        }

        const { session } = await authenticationService.validateSession(token);

        const leaves = await getLeavesForUserUseCase(session.userId);

        return getLeavesForUserPresenter(leaves, instrumentationService);
      }
    );
  };

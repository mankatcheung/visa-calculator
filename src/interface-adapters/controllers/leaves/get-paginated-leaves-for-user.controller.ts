import { IAuthenticationService } from '@/src/application/services/authentication.service.interface';
import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { IGetPaginatedLeavesForUserUseCase } from '@/src/application/use-cases/leaves/get-paginated-leaves-for-user.use-case';
import { UnauthenticatedError } from '@/src/entities/errors/auth';
import {
  getPaginatedLeavesForUserPresenter,
  GetPaginatedLeavesForUserPresenterOutput,
} from '@/src/interface-adapters/presenters/leaves/get-paginated-leaves-for-user.presenter';

export type IGetPaginatedLeavesForUserController = ReturnType<
  typeof getPaginatedLeavesForUserController
>;

export const getPaginatedLeavesForUserController =
  (
    instrumentationService: IInstrumentationService,
    authenticationService: IAuthenticationService,
    getPaginatedLeavesForUserUseCase: IGetPaginatedLeavesForUserUseCase
  ) =>
  async (
    token: string | undefined,
    page: number,
    limit: number
  ): Promise<GetPaginatedLeavesForUserPresenterOutput> => {
    return await instrumentationService.startSpan(
      { name: 'getPaginatedLeavesForUser Controller' },
      async () => {
        if (!token) {
          throw new UnauthenticatedError('Must be logged in to get leaves');
        }

        const { session } = await authenticationService.validateSession(token);

        const result = await getPaginatedLeavesForUserUseCase(
          session.userId,
          page,
          limit
        );

        return getPaginatedLeavesForUserPresenter(result, instrumentationService);
      }
    );
  };

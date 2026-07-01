import { IAuthenticationService } from '@/src/application/services/authentication.service.interface';
import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { IGetLeaveUseCase } from '@/src/application/use-cases/leaves/get-leave.use-case';
import { UnauthenticatedError } from '@/src/entities/errors/auth';
import { InputParseError } from '@/src/entities/errors/common';
import {
  getLeavePresenter,
  GetLeavePresenterOutput,
} from '@/src/interface-adapters/presenters/leaves/get-leave.presenter';

export type IGetLeaveController = ReturnType<typeof getLeaveController>;

export const getLeaveController =
  (
    instrumentationService: IInstrumentationService,
    authenticationService: IAuthenticationService,
    getLeaveUseCase: IGetLeaveUseCase
  ) =>
  async (
    leaveId: number | undefined,
    token: string | undefined
  ): Promise<GetLeavePresenterOutput> => {
    return await instrumentationService.startSpan(
      { name: 'getLeavesForUser Controller' },
      async () => {
        if (!token) {
          throw new UnauthenticatedError('Must be logged in to create a leave');
        }

        if (!leaveId) {
          throw new InputParseError('Please provide the leave id');
        }

        const { session } = await authenticationService.validateSession(token);

        const leave = await getLeaveUseCase(leaveId, session.userId);

        return getLeavePresenter(leave, instrumentationService);
      }
    );
  };

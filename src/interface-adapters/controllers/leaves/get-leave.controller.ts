import { UnauthenticatedError } from '@/src/entities/errors/auth';
import { Leave } from '@/src/entities/models/leave';
import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { IAuthenticationService } from '@/src/application/services/authentication.service.interface';
import { IGetLeaveUseCase } from '@/src/application/use-cases/leaves/get-leave.use-case';
import { InputParseError } from '@/src/entities/errors/common';

function presenter(
  leave: Leave,
  instrumentationService: IInstrumentationService
) {
  return instrumentationService.startSpan(
    { name: 'getLeavesForUser Presenter', op: 'serialize' },
    () => ({
      id: leave.id,
      startDate: leave.startDate,
      endDate: leave.endDate,
      color: leave.color,
      remarks: leave.remarks,
      createdAt: leave.createdAt,
      userId: leave.userId,
    })
  );
}

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
  ): Promise<ReturnType<typeof presenter>> => {
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

        return presenter(leave, instrumentationService);
      }
    );
  };

import type { Leave } from '@/src/entities/models/leave';
import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import type { ILeavesRepository } from '@/src/application/repositories/leaves.repository.interface';
import { UnauthorizedError } from '@/src/entities/errors/auth';
import { NotFoundError } from '@/src/entities/errors/common';

export type IGetLeaveUseCase = ReturnType<typeof getLeaveUseCase>;

export const getLeaveUseCase =
  (
    instrumentationService: IInstrumentationService,
    leavesRepository: ILeavesRepository
  ) =>
  (leaveId: number, userId: string): Promise<Leave> => {
    return instrumentationService.startSpan(
      { name: 'getLeave UseCase', op: 'function' },
      async () => {
        const leave = await leavesRepository.getLeave(leaveId);

        if (!leave) {
          throw new NotFoundError('Leave does not exist');
        }

        if (leave.userId !== userId) {
          throw new UnauthorizedError('Cannot get leave. Reason: unauthorized');
        }
        return leave;
      }
    );
  };

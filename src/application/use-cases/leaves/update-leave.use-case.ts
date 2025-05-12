import type { ILeavesRepository } from '@/src/application/repositories/leaves.repository.interface';
import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { UnauthorizedError } from '@/src/entities/errors/auth';
import { NotFoundError } from '@/src/entities/errors/common';
import type { Leave } from '@/src/entities/models/leave';

export type IUpdateLeaveUseCase = ReturnType<typeof updateLeaveUseCase>;

export const updateLeaveUseCase =
  (
    instrumentationService: IInstrumentationService,
    leavesRepository: ILeavesRepository
  ) =>
  (
    input: {
      id: number;
      startDate: Date;
      endDate: Date;
      color?: string;
      remarks?: string;
    },
    userId: string,
    tx?: any
  ): Promise<Leave> => {
    return instrumentationService.startSpan(
      { name: 'updateLeave Use Case', op: 'function' },
      async () => {
        // HINT: this is where you'd do authorization checks - is this user authorized to create a leave
        // for example: free users are allowed only 5 leaves, throw an UnauthorizedError if more than 5
        const leave = await leavesRepository.getLeave(input.id);

        if (!leave) {
          throw new NotFoundError('Leave does not exist');
        }

        if (leave.userId !== userId) {
          throw new UnauthorizedError(
            'Cannot delete leave. Reason: unauthorized'
          );
        }

        const newLeave = await leavesRepository.updateLeave(
          input.id,
          {
            startDate: input.startDate,
            endDate: input.endDate,
            color: input.color,
            remarks: input.remarks,
          },
          tx
        );

        return newLeave;
      }
    );
  };

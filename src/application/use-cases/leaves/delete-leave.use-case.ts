import { UnauthorizedError } from '@/src/entities/errors/auth';
import { NotFoundError } from '@/src/entities/errors/common';
import type { Leave } from '@/src/entities/models/leave';
import type { ITransaction } from '@/src/entities/models/transaction.interface';
import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import type { ILeavesRepository } from '@/src/application/repositories/leaves.repository.interface';

export type IDeleteLeaveUseCase = ReturnType<typeof deleteLeaveUseCase>;

export const deleteLeaveUseCase =
  (
    instrumentationService: IInstrumentationService,
    leavesRepository: ILeavesRepository
  ) =>
  (
    input: {
      leaveId: number;
    },
    userId: string,
    tx?: ITransaction
  ): Promise<Leave> => {
    return instrumentationService.startSpan(
      { name: 'deleteLeave Use Case', op: 'function' },
      async () => {
        const leave = await leavesRepository.getLeave(input.leaveId);

        if (!leave) {
          throw new NotFoundError('Leave does not exist');
        }

        if (leave.userId !== userId) {
          throw new UnauthorizedError(
            'Cannot delete leave. Reason: unauthorized'
          );
        }

        await leavesRepository.deleteLeave(leave.id, tx);

        return leave;
      }
    );
  };

import type { ILeavesRepository } from '@/src/application/repositories/leaves.repository.interface';
import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import type { Leave } from '@/src/entities/models/leave';

export type ICreateLeaveUseCase = ReturnType<typeof createLeaveUseCase>;

export const createLeaveUseCase =
  (
    instrumentationService: IInstrumentationService,
    leavesRepository: ILeavesRepository
  ) =>
  (
    input: {
      startDate: Date;
      endDate: Date;
      color?: string;
      remarks?: string;
    },
    userId: string,
    tx?: any
  ): Promise<Leave> => {
    return instrumentationService.startSpan(
      { name: 'createLeave Use Case', op: 'function' },
      async () => {
        const newLeave = await leavesRepository.createLeave(
          {
            ...input,
            userId,
          },
          tx
        );

        return newLeave;
      }
    );
  };

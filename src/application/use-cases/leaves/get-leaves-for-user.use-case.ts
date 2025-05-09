import type { Leave } from '@/src/entities/models/leave';
import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import type { ILeavesRepository } from '@/src/application/repositories/leaves.repository.interface';

export type IGetLeavesForUserUseCase = ReturnType<
  typeof getLeavesForUserUseCase
>;

export const getLeavesForUserUseCase =
  (
    instrumentationService: IInstrumentationService,
    leavesRepository: ILeavesRepository
  ) =>
  (userId: string): Promise<Leave[]> => {
    return instrumentationService.startSpan(
      { name: 'getLeavesForUser UseCase', op: 'function' },
      async () => {
        return await leavesRepository.getLeavesForUser(userId);
      }
    );
  };

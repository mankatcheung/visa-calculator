import type { ILeavesRepository } from '@/src/application/repositories/leaves.repository.interface';
import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import type { PaginatedLeaves } from '@/src/entities/models/leave';

export type IGetPaginatedLeavesForUserUseCase = ReturnType<
  typeof getPaginatedLeavesForUserUseCase
>;

export const getPaginatedLeavesForUserUseCase =
  (
    instrumentationService: IInstrumentationService,
    leavesRepository: ILeavesRepository
  ) =>
  (userId: string, page: number, limit: number): Promise<PaginatedLeaves> => {
    return instrumentationService.startSpan(
      { name: 'getPaginatedLeavesForUser UseCase', op: 'function' },
      async () => {
        return await leavesRepository.getPaginatedLeavesForUser(userId, page, limit);
      }
    );
  };

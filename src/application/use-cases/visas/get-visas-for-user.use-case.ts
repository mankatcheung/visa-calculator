import type { IVisasRepository } from '@/src/application/repositories/visas.repository.interface';
import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import type { Visa } from '@/src/entities/models/visa';

export type IGetVisasForUserUseCase = ReturnType<typeof getVisasForUserUseCase>;

export const getVisasForUserUseCase =
  (
    instrumentationService: IInstrumentationService,
    visasRepository: IVisasRepository
  ) =>
  (userId: string): Promise<Visa[]> => {
    return instrumentationService.startSpan(
      { name: 'getVisasForUser Use Case', op: 'function' },
      () => visasRepository.getVisasForUser(userId)
    );
  };

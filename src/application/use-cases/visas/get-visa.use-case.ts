import type { IVisasRepository } from '@/src/application/repositories/visas.repository.interface';
import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import type { Visa } from '@/src/entities/models/visa';

export type IGetVisaUseCase = ReturnType<typeof getVisaUseCase>;

export const getVisaUseCase =
  (
    instrumentationService: IInstrumentationService,
    visasRepository: IVisasRepository
  ) =>
  (id: number, userId: string): Promise<Visa | undefined> => {
    return instrumentationService.startSpan(
      { name: 'getVisa Use Case', op: 'function' },
      () => visasRepository.getVisa(id, userId)
    );
  };

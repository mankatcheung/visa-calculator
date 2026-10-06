import type { IVisasRepository } from '@/src/application/repositories/visas.repository.interface';
import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import type { CreateVisa, Visa } from '@/src/entities/models/visa';

export type ICreateVisaUseCase = ReturnType<typeof createVisaUseCase>;

export const createVisaUseCase =
  (
    instrumentationService: IInstrumentationService,
    visasRepository: IVisasRepository
  ) =>
  (input: CreateVisa, userId: string, tx?: any): Promise<Visa> => {
    return instrumentationService.startSpan(
      { name: 'createVisa Use Case', op: 'function' },
      () => visasRepository.createVisa(input, userId, tx)
    );
  };

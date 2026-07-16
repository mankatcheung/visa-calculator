import type { IVisasRepository } from '@/src/application/repositories/visas.repository.interface';
import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import type { UpdateVisa, Visa } from '@/src/entities/models/visa';

export type IUpdateVisaUseCase = ReturnType<typeof updateVisaUseCase>;

export const updateVisaUseCase =
  (
    instrumentationService: IInstrumentationService,
    visasRepository: IVisasRepository
  ) =>
  (id: number, userId: string, data: Partial<UpdateVisa>, tx?: any): Promise<Visa> => {
    return instrumentationService.startSpan(
      { name: 'updateVisa Use Case', op: 'function' },
      () => visasRepository.updateVisa(id, userId, data, tx)
    );
  };

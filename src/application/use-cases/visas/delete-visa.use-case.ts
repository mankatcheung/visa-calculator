import type { IVisasRepository } from '@/src/application/repositories/visas.repository.interface';
import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';

export type IDeleteVisaUseCase = ReturnType<typeof deleteVisaUseCase>;

export const deleteVisaUseCase =
  (
    instrumentationService: IInstrumentationService,
    visasRepository: IVisasRepository
  ) =>
  (id: number, userId: string, tx?: any): Promise<void> => {
    return instrumentationService.startSpan(
      { name: 'deleteVisa Use Case', op: 'function' },
      () => visasRepository.deleteVisa(id, userId, tx)
    );
  };

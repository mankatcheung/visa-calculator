import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import type { Visa } from '@/src/entities/models/visa';

export function visaPresenter(visa: Visa, instrumentationService: IInstrumentationService) {
  return instrumentationService.startSpan({ name: 'visa Presenter', op: 'serialize' }, () => ({
    id: visa.id,
    userId: visa.userId,
    country: visa.country,
    name: visa.name,
    startDate: visa.startDate,
    expiryDate: visa.expiryDate,
    arrivalDate: visa.arrivalDate,
    maxStayDays: visa.maxStayDays,
    rollingWindowDays: visa.rollingWindowDays,
    qualifyingPeriodYears: visa.qualifyingPeriodYears,
    remarks: visa.remarks,
    createdAt: visa.createdAt,
  }));
}

export type VisaPresenterOutput = ReturnType<typeof visaPresenter>;

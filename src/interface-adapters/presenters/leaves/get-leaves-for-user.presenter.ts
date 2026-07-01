import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { Leave } from '@/src/entities/models/leave';

export function getLeavesForUserPresenter(
  leaves: Leave[],
  instrumentationService: IInstrumentationService
) {
  return instrumentationService.startSpan(
    { name: 'getLeavesForUser Presenter', op: 'serialize' },
    () =>
      leaves.map((t) => ({
        id: t.id,
        startDate: t.startDate,
        endDate: t.endDate,
        color: t.color,
        remarks: t.remarks,
        createdAt: t.createdAt,
        userId: t.userId,
      }))
  );
}

export type GetLeavesForUserPresenterOutput = ReturnType<
  typeof getLeavesForUserPresenter
>;

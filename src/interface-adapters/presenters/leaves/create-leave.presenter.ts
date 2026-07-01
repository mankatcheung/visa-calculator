import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { Leave } from '@/src/entities/models/leave';

export function createLeavePresenter(
  leave: Leave,
  instrumentationService: IInstrumentationService
) {
  return instrumentationService.startSpan(
    { name: 'createLeave Presenter', op: 'serialize' },
    () => ({
      id: leave.id,
      createdAt: leave.createdAt,
      startDate: leave.startDate,
      endDate: leave.endDate,
      color: leave.color,
      remarks: leave.remarks,
      userId: leave.userId,
    })
  );
}

export type CreateLeavePresenterOutput = ReturnType<typeof createLeavePresenter>;

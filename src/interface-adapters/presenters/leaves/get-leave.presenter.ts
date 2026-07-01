import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { Leave } from '@/src/entities/models/leave';

export function getLeavePresenter(
  leave: Leave,
  instrumentationService: IInstrumentationService
) {
  return instrumentationService.startSpan(
    { name: 'getLeavesForUser Presenter', op: 'serialize' },
    () => ({
      id: leave.id,
      startDate: leave.startDate,
      endDate: leave.endDate,
      color: leave.color,
      remarks: leave.remarks,
      createdAt: leave.createdAt,
      userId: leave.userId,
    })
  );
}

export type GetLeavePresenterOutput = ReturnType<typeof getLeavePresenter>;

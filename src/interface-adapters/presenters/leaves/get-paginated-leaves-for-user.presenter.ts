import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { PaginatedLeaves } from '@/src/entities/models/leave';

export function getPaginatedLeavesForUserPresenter(
  result: PaginatedLeaves,
  instrumentationService: IInstrumentationService
) {
  return instrumentationService.startSpan(
    { name: 'getPaginatedLeavesForUser Presenter', op: 'serialize' },
    () => ({
      data: result.data.map((t) => ({
        id: t.id,
        startDate: t.startDate,
        endDate: t.endDate,
        color: t.color,
        remarks: t.remarks,
        createdAt: t.createdAt,
        userId: t.userId,
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    })
  );
}

export type GetPaginatedLeavesForUserPresenterOutput = ReturnType<
  typeof getPaginatedLeavesForUserPresenter
>;

import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { Leave } from '@/src/entities/models/leave';
import { User } from '@/src/entities/models/user';
import { Visa } from '@/src/entities/models/visa';

export function getUserDataExportPresenter(
  data: {
    user: User;
    visas: Visa[];
    leaves: Leave[];
  },
  instrumentationService: IInstrumentationService
) {
  return instrumentationService.startSpan(
    { name: 'getUserDataExport Presenter', op: 'serialize' },
    () => ({
      exportedAt: new Date().toISOString(),
      // SECURITY: intentionally excludes passwordHash and any session/reset
      // token data -- those are security-sensitive implementation details,
      // not meaningful "your data" for a right-to-access export.
      account: {
        id: data.user.id,
        email: data.user.email,
        emailVerified: data.user.emailVerified,
      },
      visas: data.visas.map((visa) => ({
        id: visa.id,
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
      })),
      leaves: data.leaves.map((leave) => ({
        id: leave.id,
        startDate: leave.startDate,
        endDate: leave.endDate,
        color: leave.color,
        remarks: leave.remarks,
        createdAt: leave.createdAt,
      })),
    })
  );
}

export type GetUserDataExportPresenterOutput = ReturnType<
  typeof getUserDataExportPresenter
>;

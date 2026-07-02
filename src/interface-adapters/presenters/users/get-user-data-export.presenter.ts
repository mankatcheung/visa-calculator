import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { Leave } from '@/src/entities/models/leave';
import { User } from '@/src/entities/models/user';
import { UserSetting } from '@/src/entities/models/userSettings';

export function getUserDataExportPresenter(
  data: {
    user: User;
    settings: UserSetting | undefined;
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
      visaSettings: data.settings
        ? {
            visaStartDate: data.settings.visaStartDate,
            visaExpiryDate: data.settings.visaExpiryDate,
            arrivalDate: data.settings.arrivalDate,
          }
        : null,
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

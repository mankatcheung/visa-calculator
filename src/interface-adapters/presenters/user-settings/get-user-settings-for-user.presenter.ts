import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { UserSetting } from '@/src/entities/models/userSettings';

export function getUserSettingsForUserPresenter(
  setting: UserSetting | undefined,
  instrumentationService: IInstrumentationService
) {
  return instrumentationService.startSpan(
    { name: 'getUserSettingsForUser Presenter', op: 'serialize' },
    () => setting
  );
}

export type GetUserSettingsForUserPresenterOutput = ReturnType<
  typeof getUserSettingsForUserPresenter
>;

import { IAuthenticationService } from '@/src/application/services/authentication.service.interface';
import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { IGetUserSettingsForUserUseCase } from '@/src/application/use-cases/user-settings/get-user-settings-for-user.use-case';
import { UnauthenticatedError } from '@/src/entities/errors/auth';
import { UserSetting } from '@/src/entities/models/userSettings';

function presenter(
  setting: UserSetting | undefined,
  instrumentationService: IInstrumentationService
) {
  return instrumentationService.startSpan(
    { name: 'getUserSettingsForUser Presenter', op: 'serialize' },
    () => setting
  );
}

export type IGetUserSettingsForUserController = ReturnType<
  typeof getUserSettingsForUserController
>;

export const getUserSettingsForUserController =
  (
    instrumentationService: IInstrumentationService,
    authenticationService: IAuthenticationService,
    getUserSettingsForUserUseCase: IGetUserSettingsForUserUseCase
  ) =>
  async (token: string | undefined): Promise<ReturnType<typeof presenter>> => {
    return await instrumentationService.startSpan(
      { name: 'getUserSettingsForUser Controller' },
      async () => {
        if (!token) {
          throw new UnauthenticatedError(
            'Must be logged in to get user settings'
          );
        }

        const { session } = await authenticationService.validateSession(token);

        const setting = await getUserSettingsForUserUseCase(session.userId);

        return presenter(setting, instrumentationService);
      }
    );
  };

import { IAuthenticationService } from '@/src/application/services/authentication.service.interface';
import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { IGetUserSettingsForUserUseCase } from '@/src/application/use-cases/user-settings/get-user-settings-for-user.use-case';
import { UnauthenticatedError } from '@/src/entities/errors/auth';
import {
  getUserSettingsForUserPresenter,
  GetUserSettingsForUserPresenterOutput,
} from '@/src/interface-adapters/presenters/user-settings/get-user-settings-for-user.presenter';

export type IGetUserSettingsForUserController = ReturnType<
  typeof getUserSettingsForUserController
>;

export const getUserSettingsForUserController =
  (
    instrumentationService: IInstrumentationService,
    authenticationService: IAuthenticationService,
    getUserSettingsForUserUseCase: IGetUserSettingsForUserUseCase
  ) =>
  async (
    token: string | undefined
  ): Promise<GetUserSettingsForUserPresenterOutput> => {
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

        return getUserSettingsForUserPresenter(setting, instrumentationService);
      }
    );
  };

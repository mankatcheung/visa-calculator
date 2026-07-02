import { IAuthenticationService } from '@/src/application/services/authentication.service.interface';
import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { IGetUserDataExportUseCase } from '@/src/application/use-cases/users/get-user-data-export.use-case';
import { UnauthenticatedError } from '@/src/entities/errors/auth';
import {
  GetUserDataExportPresenterOutput,
  getUserDataExportPresenter,
} from '@/src/interface-adapters/presenters/users/get-user-data-export.presenter';

export type IGetUserDataExportController = ReturnType<
  typeof getUserDataExportController
>;

export const getUserDataExportController =
  (
    instrumentationService: IInstrumentationService,
    authenticationService: IAuthenticationService,
    getUserDataExportUseCase: IGetUserDataExportUseCase
  ) =>
  async (
    token: string | undefined
  ): Promise<GetUserDataExportPresenterOutput> => {
    return await instrumentationService.startSpan(
      { name: 'getUserDataExport Controller' },
      async () => {
        if (!token) {
          throw new UnauthenticatedError(
            'Must be logged in to export your data'
          );
        }

        const { session } = await authenticationService.validateSession(token);

        const data = await getUserDataExportUseCase(session.userId);

        return getUserDataExportPresenter(data, instrumentationService);
      }
    );
  };

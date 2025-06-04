import { z } from 'zod';

import { IAuthenticationService } from '@/src/application/services/authentication.service.interface';
import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { ITransactionManagerService } from '@/src/application/services/transaction-manager.service.interface';
import { IUpdateUserSettingsUseCase } from '@/src/application/use-cases/user-settings/update-user-settings.use-case';
import { UnauthenticatedError } from '@/src/entities/errors/auth';
import { InputParseError } from '@/src/entities/errors/common';
import { UserSetting } from '@/src/entities/models/userSettings';

function presenter(
  setting: UserSetting,
  instrumentationService: IInstrumentationService
) {
  return instrumentationService.startSpan(
    { name: 'updateUserSettings Presenter', op: 'serialize' },
    () => {
      return {
        id: setting.id,
        visaStartDate: setting.visaStartDate,
        userId: setting.userId,
      };
    }
  );
}

const inputSchema = z.object({
  visaStartDate: z.string(),
});

export type IUpdateUserSettingsController = ReturnType<
  typeof updateUserSettingsController
>;

export const updateUserSettingsController =
  (
    instrumentationService: IInstrumentationService,
    authenticationService: IAuthenticationService,
    transactionManagerService: ITransactionManagerService,
    updateUserSettingsUseCase: IUpdateUserSettingsUseCase
  ) =>
  async (
    input: Partial<z.infer<typeof inputSchema>>,
    token: string | undefined
  ): Promise<ReturnType<typeof presenter>> => {
    return await instrumentationService.startSpan(
      {
        name: 'updateUserSettings Controller',
      },
      async () => {
        if (!token) {
          throw new UnauthenticatedError(
            'Must be logged in to update user settings'
          );
        }
        const { user } = await authenticationService.validateSession(token);

        const { data, error: inputParseError } = inputSchema.safeParse(input);

        if (inputParseError) {
          throw new InputParseError('Invalid data', { cause: inputParseError });
        }

        const settings = await instrumentationService.startSpan(
          { name: 'Update User Settings Transaction' },
          async () =>
            transactionManagerService.startTransaction(async (tx) => {
              try {
                return await updateUserSettingsUseCase(
                  {
                    visaStartDate: new Date(data.visaStartDate),
                  },
                  user.id,
                  tx
                );
              } catch {
                console.error('Rolling back!');
                tx.rollback();
              }
            })
        );

        if (!settings) {
          throw new Error('Failed to update user settings');
        }
        return presenter(settings, instrumentationService);
      }
    );
  };

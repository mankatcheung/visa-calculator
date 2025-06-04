import { createModule } from '@evyweb/ioctopus';

import { DI_SYMBOLS } from '@/di/types';
import { getUserSettingsForUserUseCase } from '@/src/application/use-cases/user-settings/get-user-settings-for-user.use-case';
import { updateUserSettingsUseCase } from '@/src/application/use-cases/user-settings/update-user-settings.use-case';
import { UserSettingsRepository } from '@/src/infrastructure/repositories/user-settings.repository';
import { getUserSettingsForUserController } from '@/src/interface-adapters/controllers/user-settings/get-user-settings-for-user.controller';
import { updateUserSettingsController } from '@/src/interface-adapters/controllers/user-settings/update-user-settings.controller';

export function createUserSettingModule() {
  const userSettingsModule = createModule();

  userSettingsModule
    .bind(DI_SYMBOLS.IUserSettingsRepository)
    .toClass(UserSettingsRepository, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.ICrashReporterService,
    ]);

  userSettingsModule
    .bind(DI_SYMBOLS.IGetUserSettingsForUserUseCase)
    .toHigherOrderFunction(getUserSettingsForUserUseCase, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IUserSettingsRepository,
    ]);

  userSettingsModule
    .bind(DI_SYMBOLS.IUpdateUserSettingsUseCase)
    .toHigherOrderFunction(updateUserSettingsUseCase, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IUserSettingsRepository,
    ]);

  userSettingsModule
    .bind(DI_SYMBOLS.IGetUserSettingsForUserController)
    .toHigherOrderFunction(getUserSettingsForUserController, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IAuthenticationService,
      DI_SYMBOLS.IGetUserSettingsForUserUseCase,
    ]);

  userSettingsModule
    .bind(DI_SYMBOLS.IUpdateUserSettingsController)
    .toHigherOrderFunction(updateUserSettingsController, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IAuthenticationService,
      DI_SYMBOLS.ITransactionManagerService,
      DI_SYMBOLS.IUpdateUserSettingsUseCase,
    ]);

  return userSettingsModule;
}

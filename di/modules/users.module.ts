import { createModule } from '@evyweb/ioctopus';

import { DI_SYMBOLS } from '@/di/types';
import { deleteAccountUseCase } from '@/src/application/use-cases/users/delete-account.use-case';
import { getUserDataExportUseCase } from '@/src/application/use-cases/users/get-user-data-export.use-case';
import { getUserUseCase } from '@/src/application/use-cases/users/get-user.use-case';
import { updateUserPasswordUseCase } from '@/src/application/use-cases/users/update-user-password.use-case';
import { CachedUsersRepository } from '@/src/infrastructure/repositories/users.repository.cached';
import { UsersRepository } from '@/src/infrastructure/repositories/users.repository';
import { EmailBloomFilterService } from '@/src/infrastructure/services/email-bloom-filter.service';
import { deleteAccountController } from '@/src/interface-adapters/controllers/users/delete-account.controller';
import { getSelfUserController } from '@/src/interface-adapters/controllers/users/get-self-user.controller';
import { getUserDataExportController } from '@/src/interface-adapters/controllers/users/get-user-data-export.controller';
import { updateUserPasswordController } from '@/src/interface-adapters/controllers/users/update-user-password.controller';

const USERS_REPO_IMPL = Symbol('UsersRepositoryImpl');

export function createUsersModule() {
  const usersModule = createModule();

  usersModule
    .bind(USERS_REPO_IMPL)
    .toClass(UsersRepository, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.ICrashReporterService,
    ]);

  usersModule
    .bind(DI_SYMBOLS.IUsersRepository)
    .toClass(CachedUsersRepository, [
      DI_SYMBOLS.ICacheManager,
      USERS_REPO_IMPL,
    ]);

  usersModule
    .bind(DI_SYMBOLS.IEmailBloomFilterService)
    .toClass(EmailBloomFilterService, [
      DI_SYMBOLS.IUsersRepository,
      DI_SYMBOLS.IInstrumentationService,
    ]);

  usersModule
    .bind(DI_SYMBOLS.IGetUserUseCase)
    .toHigherOrderFunction(getUserUseCase, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IUsersRepository,
    ]);

  usersModule
    .bind(DI_SYMBOLS.IUpdateUserPasswordUseCase)
    .toHigherOrderFunction(updateUserPasswordUseCase, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IAuthenticationService,
      DI_SYMBOLS.IUsersRepository,
    ]);

  usersModule
    .bind(DI_SYMBOLS.IGetUserDataExportUseCase)
    .toHigherOrderFunction(getUserDataExportUseCase, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IUsersRepository,
      DI_SYMBOLS.IVisasRepository,
      DI_SYMBOLS.ILeavesRepository,
    ]);

  usersModule
    .bind(DI_SYMBOLS.IDeleteAccountUseCase)
    .toHigherOrderFunction(deleteAccountUseCase, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IAuthenticationService,
      DI_SYMBOLS.IUsersRepository,
      DI_SYMBOLS.ILeavesRepository,
      DI_SYMBOLS.IVisasRepository,
      DI_SYMBOLS.IPasswordResetTokensRepository,
      DI_SYMBOLS.IEmailVerificationTokensRepository,
      DI_SYMBOLS.IEmailChangeTokensRepository,
      DI_SYMBOLS.ISessionRepository,
    ]);

  usersModule
    .bind(DI_SYMBOLS.IGetSelfUserController)
    .toHigherOrderFunction(getSelfUserController, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IAuthenticationService,
      DI_SYMBOLS.IGetUserUseCase,
    ]);

  usersModule
    .bind(DI_SYMBOLS.IUpdateUserPasswordController)
    .toHigherOrderFunction(updateUserPasswordController, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IAuthenticationService,
      DI_SYMBOLS.ITransactionManagerService,
      DI_SYMBOLS.IUpdateUserPasswordUseCase,
      DI_SYMBOLS.ISessionRepository,
    ]);

  usersModule
    .bind(DI_SYMBOLS.IGetUserDataExportController)
    .toHigherOrderFunction(getUserDataExportController, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IAuthenticationService,
      DI_SYMBOLS.IGetUserDataExportUseCase,
    ]);

  usersModule
    .bind(DI_SYMBOLS.IDeleteAccountController)
    .toHigherOrderFunction(deleteAccountController, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IAuthenticationService,
      DI_SYMBOLS.ITransactionManagerService,
      DI_SYMBOLS.IDeleteAccountUseCase,
    ]);

  return usersModule;
}

import { createModule } from '@evyweb/ioctopus';

import { DI_SYMBOLS } from '@/di/types';
import { cancelEmailChangeUseCase } from '@/src/application/use-cases/users/cancel-email-change.use-case';
import { getPendingEmailChangeUseCase } from '@/src/application/use-cases/users/get-pending-email-change.use-case';
import { requestEmailChangeUseCase } from '@/src/application/use-cases/users/request-email-change.use-case';
import { verifyEmailChangeUseCase } from '@/src/application/use-cases/users/verify-email-change.use-case';
import { EmailChangeTokensRepository } from '@/src/infrastructure/repositories/email-change-tokens.repository';
import { cancelEmailChangeController } from '@/src/interface-adapters/controllers/users/cancel-email-change.controller';
import { getPendingEmailChangeController } from '@/src/interface-adapters/controllers/users/get-pending-email-change.controller';
import { requestEmailChangeController } from '@/src/interface-adapters/controllers/users/request-email-change.controller';
import { verifyEmailChangeController } from '@/src/interface-adapters/controllers/users/verify-email-change.controller';

export function createEmailChangeModule() {
  const emailChangeModule = createModule();

  emailChangeModule
    .bind(DI_SYMBOLS.IEmailChangeTokensRepository)
    .toClass(EmailChangeTokensRepository, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.ICrashReporterService,
    ]);

  emailChangeModule
    .bind(DI_SYMBOLS.IRequestEmailChangeUseCase)
    .toHigherOrderFunction(requestEmailChangeUseCase, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IUsersRepository,
      DI_SYMBOLS.IEmailChangeTokensRepository,
      DI_SYMBOLS.IEmailService,
    ]);

  emailChangeModule
    .bind(DI_SYMBOLS.IVerifyEmailChangeUseCase)
    .toHigherOrderFunction(verifyEmailChangeUseCase, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IEmailChangeTokensRepository,
      DI_SYMBOLS.IUsersRepository,
      DI_SYMBOLS.ISessionRepository,
    ]);

  emailChangeModule
    .bind(DI_SYMBOLS.ICancelEmailChangeUseCase)
    .toHigherOrderFunction(cancelEmailChangeUseCase, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IEmailChangeTokensRepository,
    ]);

  emailChangeModule
    .bind(DI_SYMBOLS.IGetPendingEmailChangeUseCase)
    .toHigherOrderFunction(getPendingEmailChangeUseCase, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IEmailChangeTokensRepository,
    ]);

  emailChangeModule
    .bind(DI_SYMBOLS.IRequestEmailChangeController)
    .toHigherOrderFunction(requestEmailChangeController, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IAuthenticationService,
      DI_SYMBOLS.IRequestEmailChangeUseCase,
    ]);

  emailChangeModule
    .bind(DI_SYMBOLS.IVerifyEmailChangeController)
    .toHigherOrderFunction(verifyEmailChangeController, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IAuthenticationService,
      DI_SYMBOLS.IVerifyEmailChangeUseCase,
    ]);

  emailChangeModule
    .bind(DI_SYMBOLS.ICancelEmailChangeController)
    .toHigherOrderFunction(cancelEmailChangeController, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IAuthenticationService,
      DI_SYMBOLS.ICancelEmailChangeUseCase,
    ]);

  emailChangeModule
    .bind(DI_SYMBOLS.IGetPendingEmailChangeController)
    .toHigherOrderFunction(getPendingEmailChangeController, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IAuthenticationService,
      DI_SYMBOLS.IGetPendingEmailChangeUseCase,
    ]);

  return emailChangeModule;
}

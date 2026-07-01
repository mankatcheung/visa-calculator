import { createModule } from '@evyweb/ioctopus';

import { DI_SYMBOLS } from '@/di/types';
import { requestPasswordResetUseCase } from '@/src/application/use-cases/auth/request-password-reset.use-case';
import { resetPasswordUseCase } from '@/src/application/use-cases/auth/reset-password.use-case';
import { PasswordResetTokensRepository } from '@/src/infrastructure/repositories/password-reset-tokens.repository';
import { BrevoEmailService } from '@/src/infrastructure/services/brevo-email.service';
import { requestPasswordResetController } from '@/src/interface-adapters/controllers/auth/request-password-reset.controller';
import { resetPasswordController } from '@/src/interface-adapters/controllers/auth/reset-password.controller';

export function createPasswordResetModule() {
  const passwordResetModule = createModule();

  passwordResetModule
    .bind(DI_SYMBOLS.IEmailService)
    .toClass(BrevoEmailService, []);

  passwordResetModule
    .bind(DI_SYMBOLS.IPasswordResetTokensRepository)
    .toClass(PasswordResetTokensRepository, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.ICrashReporterService,
    ]);

  passwordResetModule
    .bind(DI_SYMBOLS.IRequestPasswordResetUseCase)
    .toHigherOrderFunction(requestPasswordResetUseCase, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IUsersRepository,
      DI_SYMBOLS.IPasswordResetTokensRepository,
      DI_SYMBOLS.IEmailService,
    ]);

  passwordResetModule
    .bind(DI_SYMBOLS.IResetPasswordUseCase)
    .toHigherOrderFunction(resetPasswordUseCase, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IPasswordResetTokensRepository,
      DI_SYMBOLS.IUsersRepository,
    ]);

  passwordResetModule
    .bind(DI_SYMBOLS.IRequestPasswordResetController)
    .toHigherOrderFunction(requestPasswordResetController, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IRequestPasswordResetUseCase,
    ]);

  passwordResetModule
    .bind(DI_SYMBOLS.IResetPasswordController)
    .toHigherOrderFunction(resetPasswordController, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IResetPasswordUseCase,
    ]);

  return passwordResetModule;
}

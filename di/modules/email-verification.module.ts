import { createModule } from '@evyweb/ioctopus';

import { DI_SYMBOLS } from '@/di/types';
import { resendVerificationEmailUseCase } from '@/src/application/use-cases/auth/resend-verification-email.use-case';
import { verifyEmailUseCase } from '@/src/application/use-cases/auth/verify-email.use-case';
import { EmailVerificationTokensRepository } from '@/src/infrastructure/repositories/email-verification-tokens.repository';
import { resendVerificationEmailController } from '@/src/interface-adapters/controllers/auth/resend-verification-email.controller';
import { verifyEmailController } from '@/src/interface-adapters/controllers/auth/verify-email.controller';

export function createEmailVerificationModule() {
  const emailVerificationModule = createModule();

  emailVerificationModule
    .bind(DI_SYMBOLS.IEmailVerificationTokensRepository)
    .toClass(EmailVerificationTokensRepository, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.ICrashReporterService,
    ]);

  emailVerificationModule
    .bind(DI_SYMBOLS.IVerifyEmailUseCase)
    .toHigherOrderFunction(verifyEmailUseCase, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IEmailVerificationTokensRepository,
      DI_SYMBOLS.IUsersRepository,
    ]);

  emailVerificationModule
    .bind(DI_SYMBOLS.IResendVerificationEmailUseCase)
    .toHigherOrderFunction(resendVerificationEmailUseCase, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IUsersRepository,
      DI_SYMBOLS.IEmailVerificationTokensRepository,
      DI_SYMBOLS.IEmailService,
    ]);

  emailVerificationModule
    .bind(DI_SYMBOLS.IVerifyEmailController)
    .toHigherOrderFunction(verifyEmailController, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IVerifyEmailUseCase,
    ]);

  emailVerificationModule
    .bind(DI_SYMBOLS.IResendVerificationEmailController)
    .toHigherOrderFunction(resendVerificationEmailController, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IResendVerificationEmailUseCase,
    ]);

  return emailVerificationModule;
}

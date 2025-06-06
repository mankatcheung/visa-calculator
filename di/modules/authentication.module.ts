import { createModule } from '@evyweb/ioctopus';

import { DI_SYMBOLS } from '@/di/types';
import { signInUseCase } from '@/src/application/use-cases/auth/sign-in.use-case';
import { signOutUseCase } from '@/src/application/use-cases/auth/sign-out.use-case';
import { signUpUseCase } from '@/src/application/use-cases/auth/sign-up.use-case';
import { AuthenticationService } from '@/src/infrastructure/services/authentication.service';
import { signInController } from '@/src/interface-adapters/controllers/auth/sign-in.controller';
import { signOutController } from '@/src/interface-adapters/controllers/auth/sign-out.controller';
import { signUpController } from '@/src/interface-adapters/controllers/auth/sign-up.controller';

export function createAuthenticationModule() {
  const authenticationModule = createModule();

  authenticationModule
    .bind(DI_SYMBOLS.IAuthenticationService)
    .toClass(AuthenticationService, [
      DI_SYMBOLS.ISessionRepository,
      DI_SYMBOLS.IInstrumentationService,
    ]);

  authenticationModule
    .bind(DI_SYMBOLS.ISignInUseCase)
    .toHigherOrderFunction(signInUseCase, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IUsersRepository,
      DI_SYMBOLS.IAuthenticationService,
    ]);

  authenticationModule
    .bind(DI_SYMBOLS.ISignOutUseCase)
    .toHigherOrderFunction(signOutUseCase, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IAuthenticationService,
    ]);

  authenticationModule
    .bind(DI_SYMBOLS.ISignUpUseCase)
    .toHigherOrderFunction(signUpUseCase, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IAuthenticationService,
      DI_SYMBOLS.IUsersRepository,
      DI_SYMBOLS.IUserSettingsRepository,
    ]);

  authenticationModule
    .bind(DI_SYMBOLS.ISignInController)
    .toHigherOrderFunction(signInController, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.ISignInUseCase,
    ]);

  authenticationModule
    .bind(DI_SYMBOLS.ISignOutController)
    .toHigherOrderFunction(signOutController, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IAuthenticationService,
      DI_SYMBOLS.ISignOutUseCase,
    ]);

  authenticationModule
    .bind(DI_SYMBOLS.ISignUpController)
    .toHigherOrderFunction(signUpController, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.ISignUpUseCase,
    ]);

  return authenticationModule;
}

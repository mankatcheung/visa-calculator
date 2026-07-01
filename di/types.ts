import { IEmailVerificationTokensRepository } from '@/src/application/repositories/email-verification-tokens.repository.interface';
import { IPasswordResetTokensRepository } from '@/src/application/repositories/password-reset-tokens.repository.interface';
import { ILeavesRepository } from '@/src/application/repositories/leaves.repository.interface';
import { ISessionsRepository } from '@/src/application/repositories/sessions.repository.interface';
import { IUserSettingsRepository } from '@/src/application/repositories/user-settings.repository.interface';
import { IUsersRepository } from '@/src/application/repositories/users.repository.interface';
import { IAuthenticationService } from '@/src/application/services/authentication.service.interface';
import { ICrashReporterService } from '@/src/application/services/crash-reporter.service.interface';
import { IEmailBloomFilterService } from '@/src/application/services/email-bloom-filter.service.interface';
import { IEmailService } from '@/src/application/services/email.service.interface';
import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { ITransactionManagerService } from '@/src/application/services/transaction-manager.service.interface';
import { IResendVerificationEmailUseCase } from '@/src/application/use-cases/auth/resend-verification-email.use-case';
import { IVerifyEmailUseCase } from '@/src/application/use-cases/auth/verify-email.use-case';
import { IRequestPasswordResetUseCase } from '@/src/application/use-cases/auth/request-password-reset.use-case';
import { IResetPasswordUseCase } from '@/src/application/use-cases/auth/reset-password.use-case';
import { ISignInUseCase } from '@/src/application/use-cases/auth/sign-in.use-case';
import { ISignOutUseCase } from '@/src/application/use-cases/auth/sign-out.use-case';
import { ISignUpUseCase } from '@/src/application/use-cases/auth/sign-up.use-case';
import { ICreateLeaveUseCase } from '@/src/application/use-cases/leaves/create-leave.use-case';
import { IDeleteLeaveUseCase } from '@/src/application/use-cases/leaves/delete-leave.use-case';
import { IGetLeaveUseCase } from '@/src/application/use-cases/leaves/get-leave.use-case';
import { IGetLeavesForUserUseCase } from '@/src/application/use-cases/leaves/get-leaves-for-user.use-case';
import { IUpdateLeaveUseCase } from '@/src/application/use-cases/leaves/update-leave.use-case';
import { IGetUserSettingsForUserUseCase } from '@/src/application/use-cases/user-settings/get-user-settings-for-user.use-case';
import { IUpdateUserSettingsUseCase } from '@/src/application/use-cases/user-settings/update-user-settings.use-case';
import { IGetUserUseCase } from '@/src/application/use-cases/users/get-user.use-case';
import { IUpdateUserEmailUseCase } from '@/src/application/use-cases/users/update-user-email.use-case';
import { IUpdateUserPasswordUseCase } from '@/src/application/use-cases/users/update-user-password.use-case';
import { IResendVerificationEmailController } from '@/src/interface-adapters/controllers/auth/resend-verification-email.controller';
import { IVerifyEmailController } from '@/src/interface-adapters/controllers/auth/verify-email.controller';
import { IRequestPasswordResetController } from '@/src/interface-adapters/controllers/auth/request-password-reset.controller';
import { IResetPasswordController } from '@/src/interface-adapters/controllers/auth/reset-password.controller';
import { ISignInController } from '@/src/interface-adapters/controllers/auth/sign-in.controller';
import { ISignOutController } from '@/src/interface-adapters/controllers/auth/sign-out.controller';
import { ISignUpController } from '@/src/interface-adapters/controllers/auth/sign-up.controller';
import { ICreateLeaveController } from '@/src/interface-adapters/controllers/leaves/create-leave.controller';
import { IDeleteLeaveController } from '@/src/interface-adapters/controllers/leaves/delete-leave.controller';
import { IGetLeaveController } from '@/src/interface-adapters/controllers/leaves/get-leave.controller';
import { IGetLeavesForUserController } from '@/src/interface-adapters/controllers/leaves/get-leaves-for-user.controller';
import { IUpdateLeaveController } from '@/src/interface-adapters/controllers/leaves/update-leave.controller';
import { IGetUserSettingsForUserController } from '@/src/interface-adapters/controllers/user-settings/get-user-settings-for-user.controller';
import { IUpdateUserSettingsController } from '@/src/interface-adapters/controllers/user-settings/update-user-settings.controller';
import { IGetSelfUserController } from '@/src/interface-adapters/controllers/users/get-self-user.controller';
import { IUpdateUserEmailController } from '@/src/interface-adapters/controllers/users/update-user-email.controller';
import { IUpdateUserPasswordController } from '@/src/interface-adapters/controllers/users/update-user-password.controller';

export const DI_SYMBOLS = {
  // Services
  IAuthenticationService: Symbol.for('IAuthenticationService'),
  ITransactionManagerService: Symbol.for('ITransactionManagerService'),
  IInstrumentationService: Symbol.for('IInstrumentationService'),
  ICrashReporterService: Symbol.for('ICrashReporterService'),
  IEmailBloomFilterService: Symbol.for('IEmailBloomFilterService'),
  IEmailService: Symbol.for('IEmailService'),

  // Repositories
  ILeavesRepository: Symbol.for('ILeavesRepository'),
  IUsersRepository: Symbol.for('IUsersRepository'),
  ISessionRepository: Symbol.for('ISessionRepository'),
  IUserSettingsRepository: Symbol.for('IUserSettingsRepository'),
  IPasswordResetTokensRepository: Symbol.for('IPasswordResetTokensRepository'),
  IEmailVerificationTokensRepository: Symbol.for('IEmailVerificationTokensRepository'),

  // Use Cases
  ICreateLeaveUseCase: Symbol.for('ICreateLeaveUseCase'),
  IDeleteLeaveUseCase: Symbol.for('IDeleteLeaveUseCase'),
  IGetLeavesForUserUseCase: Symbol.for('IGetLeavesForUserUseCase'),
  IGetLeaveUseCase: Symbol.for('IGetLeaveUseCase'),
  IUpdateLeaveUseCase: Symbol.for('IUpdateLeaveUseCase'),
  ISignInUseCase: Symbol.for('ISignInUseCase'),
  ISignOutUseCase: Symbol.for('ISignOutUseCase'),
  ISignUpUseCase: Symbol.for('ISignUpUseCase'),
  IRequestPasswordResetUseCase: Symbol.for('IRequestPasswordResetUseCase'),
  IResetPasswordUseCase: Symbol.for('IResetPasswordUseCase'),
  IVerifyEmailUseCase: Symbol.for('IVerifyEmailUseCase'),
  IResendVerificationEmailUseCase: Symbol.for('IResendVerificationEmailUseCase'),
  IGetUserUseCase: Symbol.for('IGetUserUseCase'),
  IUpdateUserEmailUseCase: Symbol.for('IUpdateUserEmailUseCase'),
  IUpdateUserPasswordUseCase: Symbol.for('IUpdateUserPasswordUseCase'),
  IGetUserSettingsForUserUseCase: Symbol.for('IGetUserSettingsForUserUseCase'),
  IUpdateUserSettingsUseCase: Symbol.for('IUpdateUserSettingsUseCase'),

  // Controllers
  ISignInController: Symbol.for('ISignInController'),
  ISignOutController: Symbol.for('ISignOutController'),
  ISignUpController: Symbol.for('ISignUpController'),
  IRequestPasswordResetController: Symbol.for('IRequestPasswordResetController'),
  IResetPasswordController: Symbol.for('IResetPasswordController'),
  IVerifyEmailController: Symbol.for('IVerifyEmailController'),
  IResendVerificationEmailController: Symbol.for('IResendVerificationEmailController'),
  ICreateLeaveController: Symbol.for('ICreateLeaveController'),
  IDeleteLeaveController: Symbol.for('IDeleteLeaveController'),
  IGetLeavesForUserController: Symbol.for('IGetLeavesForUserController'),
  IGetLeaveController: Symbol.for('IGetLeaveController'),
  IUpdateLeaveController: Symbol.for('IUpdateLeaveController'),
  IGetSelfUserController: Symbol.for('IGetSelfUserController'),
  IUpdateUserEmailController: Symbol.for('IUpdateUserEmailController'),
  IUpdateUserPasswordController: Symbol.for('IUpdateUserPasswordController'),
  IGetUserSettingsForUserController: Symbol.for(
    'IGetUserSettingsForUserController'
  ),
  IUpdateUserSettingsController: Symbol.for('IUpdateUserSettingsController'),
};

export interface DI_RETURN_TYPES {
  // Services
  IAuthenticationService: IAuthenticationService;
  ITransactionManagerService: ITransactionManagerService;
  IInstrumentationService: IInstrumentationService;
  ICrashReporterService: ICrashReporterService;
  IEmailBloomFilterService: IEmailBloomFilterService;
  IEmailService: IEmailService;

  // Repositories
  ILeavesRepository: ILeavesRepository;
  IUsersRepository: IUsersRepository;
  ISessionRepository: ISessionsRepository;
  IUserSettingsRepository: IUserSettingsRepository;
  IPasswordResetTokensRepository: IPasswordResetTokensRepository;
  IEmailVerificationTokensRepository: IEmailVerificationTokensRepository;

  // Use Cases
  ICreateLeaveUseCase: ICreateLeaveUseCase;
  IDeleteLeaveUseCase: IDeleteLeaveUseCase;
  IGetLeavesForUserUseCase: IGetLeavesForUserUseCase;
  IGetLeaveUseCase: IGetLeaveUseCase;
  IUpdateLeaveUseCase: IUpdateLeaveUseCase;
  ISignInUseCase: ISignInUseCase;
  ISignOutUseCase: ISignOutUseCase;
  ISignUpUseCase: ISignUpUseCase;
  IRequestPasswordResetUseCase: IRequestPasswordResetUseCase;
  IResetPasswordUseCase: IResetPasswordUseCase;
  IVerifyEmailUseCase: IVerifyEmailUseCase;
  IResendVerificationEmailUseCase: IResendVerificationEmailUseCase;
  IGetUserUseCase: IGetUserUseCase;
  IUpdateUserEmailUseCase: IUpdateUserEmailUseCase;
  IUpdateUserPasswordUseCase: IUpdateUserPasswordUseCase;
  IGetUserSettingsForUserUseCase: IGetUserSettingsForUserUseCase;
  IUpdateUserSettingsUseCase: IUpdateUserSettingsUseCase;

  // Controllers
  ISignInController: ISignInController;
  ISignOutController: ISignOutController;
  ISignUpController: ISignUpController;
  IRequestPasswordResetController: IRequestPasswordResetController;
  IResetPasswordController: IResetPasswordController;
  IVerifyEmailController: IVerifyEmailController;
  IResendVerificationEmailController: IResendVerificationEmailController;
  ICreateLeaveController: ICreateLeaveController;
  IDeleteLeaveController: IDeleteLeaveController;
  IGetLeaveController: IGetLeaveController;
  IGetLeavesForUserController: IGetLeavesForUserController;
  IUpdateLeaveController: IUpdateLeaveController;
  IGetSelfUserController: IGetSelfUserController;
  IUpdateUserEmailController: IUpdateUserEmailController;
  IUpdateUserPasswordController: IUpdateUserPasswordController;
  IGetUserSettingsForUserController: IGetUserSettingsForUserController;
  IUpdateUserSettingsController: IUpdateUserSettingsController;
}

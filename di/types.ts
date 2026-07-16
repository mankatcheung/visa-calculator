import { IEmailChangeTokensRepository } from '@/src/application/repositories/email-change-tokens.repository.interface';
import { IEmailVerificationTokensRepository } from '@/src/application/repositories/email-verification-tokens.repository.interface';
import { ILeavesRepository } from '@/src/application/repositories/leaves.repository.interface';
import { IPasswordResetTokensRepository } from '@/src/application/repositories/password-reset-tokens.repository.interface';
import { ISessionsRepository } from '@/src/application/repositories/sessions.repository.interface';
import { IVisasRepository } from '@/src/application/repositories/visas.repository.interface';
import { IUsersRepository } from '@/src/application/repositories/users.repository.interface';
import { IAuthenticationService } from '@/src/application/services/authentication.service.interface';
import { ICacheManager } from '@/src/application/services/cache-manager.service.interface';
import { ICrashReporterService } from '@/src/application/services/crash-reporter.service.interface';
import { IEmailBloomFilterService } from '@/src/application/services/email-bloom-filter.service.interface';
import { IEmailService } from '@/src/application/services/email.service.interface';
import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { ILoggerService } from '@/src/application/services/logger.service.interface';
import { ITransactionManagerService } from '@/src/application/services/transaction-manager.service.interface';
import { IRequestPasswordResetUseCase } from '@/src/application/use-cases/auth/request-password-reset.use-case';
import { IResendVerificationEmailUseCase } from '@/src/application/use-cases/auth/resend-verification-email.use-case';
import { IResetPasswordUseCase } from '@/src/application/use-cases/auth/reset-password.use-case';
import { ISignInUseCase } from '@/src/application/use-cases/auth/sign-in.use-case';
import { ISignOutUseCase } from '@/src/application/use-cases/auth/sign-out.use-case';
import { ISignUpUseCase } from '@/src/application/use-cases/auth/sign-up.use-case';
import { IVerifyEmailUseCase } from '@/src/application/use-cases/auth/verify-email.use-case';
import { ICreateLeaveUseCase } from '@/src/application/use-cases/leaves/create-leave.use-case';
import { IDeleteLeaveUseCase } from '@/src/application/use-cases/leaves/delete-leave.use-case';
import { IGetLeaveUseCase } from '@/src/application/use-cases/leaves/get-leave.use-case';
import { IGetLeavesForUserUseCase } from '@/src/application/use-cases/leaves/get-leaves-for-user.use-case';
import { IGetPaginatedLeavesForUserUseCase } from '@/src/application/use-cases/leaves/get-paginated-leaves-for-user.use-case';
import { IUpdateLeaveUseCase } from '@/src/application/use-cases/leaves/update-leave.use-case';
import { ICreateVisaUseCase } from '@/src/application/use-cases/visas/create-visa.use-case';
import { IDeleteVisaUseCase } from '@/src/application/use-cases/visas/delete-visa.use-case';
import { IGetVisaUseCase } from '@/src/application/use-cases/visas/get-visa.use-case';
import { IGetVisasForUserUseCase } from '@/src/application/use-cases/visas/get-visas-for-user.use-case';
import { IUpdateVisaUseCase } from '@/src/application/use-cases/visas/update-visa.use-case';
import { ICancelEmailChangeUseCase } from '@/src/application/use-cases/users/cancel-email-change.use-case';
import { IDeleteAccountUseCase } from '@/src/application/use-cases/users/delete-account.use-case';
import { IGetPendingEmailChangeUseCase } from '@/src/application/use-cases/users/get-pending-email-change.use-case';
import { IGetUserDataExportUseCase } from '@/src/application/use-cases/users/get-user-data-export.use-case';
import { IGetUserUseCase } from '@/src/application/use-cases/users/get-user.use-case';
import { IRequestEmailChangeUseCase } from '@/src/application/use-cases/users/request-email-change.use-case';
import { IUpdateUserPasswordUseCase } from '@/src/application/use-cases/users/update-user-password.use-case';
import { IVerifyEmailChangeUseCase } from '@/src/application/use-cases/users/verify-email-change.use-case';
import { IRequestPasswordResetController } from '@/src/interface-adapters/controllers/auth/request-password-reset.controller';
import { IResendVerificationEmailController } from '@/src/interface-adapters/controllers/auth/resend-verification-email.controller';
import { IResetPasswordController } from '@/src/interface-adapters/controllers/auth/reset-password.controller';
import { ISignInController } from '@/src/interface-adapters/controllers/auth/sign-in.controller';
import { ISignOutController } from '@/src/interface-adapters/controllers/auth/sign-out.controller';
import { ISignUpController } from '@/src/interface-adapters/controllers/auth/sign-up.controller';
import { IVerifyEmailController } from '@/src/interface-adapters/controllers/auth/verify-email.controller';
import { ICreateLeaveController } from '@/src/interface-adapters/controllers/leaves/create-leave.controller';
import { IDeleteLeaveController } from '@/src/interface-adapters/controllers/leaves/delete-leave.controller';
import { IGetLeaveController } from '@/src/interface-adapters/controllers/leaves/get-leave.controller';
import { IGetLeavesForUserController } from '@/src/interface-adapters/controllers/leaves/get-leaves-for-user.controller';
import { IGetPaginatedLeavesForUserController } from '@/src/interface-adapters/controllers/leaves/get-paginated-leaves-for-user.controller';
import { IUpdateLeaveController } from '@/src/interface-adapters/controllers/leaves/update-leave.controller';
import { ICreateVisaController } from '@/src/interface-adapters/controllers/visas/create-visa.controller';
import { IDeleteVisaController } from '@/src/interface-adapters/controllers/visas/delete-visa.controller';
import { IGetVisaController } from '@/src/interface-adapters/controllers/visas/get-visa.controller';
import { IGetVisasForUserController } from '@/src/interface-adapters/controllers/visas/get-visas-for-user.controller';
import { IUpdateVisaController } from '@/src/interface-adapters/controllers/visas/update-visa.controller';
import { ICancelEmailChangeController } from '@/src/interface-adapters/controllers/users/cancel-email-change.controller';
import { IDeleteAccountController } from '@/src/interface-adapters/controllers/users/delete-account.controller';
import { IGetPendingEmailChangeController } from '@/src/interface-adapters/controllers/users/get-pending-email-change.controller';
import { IGetSelfUserController } from '@/src/interface-adapters/controllers/users/get-self-user.controller';
import { IGetUserDataExportController } from '@/src/interface-adapters/controllers/users/get-user-data-export.controller';
import { IRequestEmailChangeController } from '@/src/interface-adapters/controllers/users/request-email-change.controller';
import { IUpdateUserPasswordController } from '@/src/interface-adapters/controllers/users/update-user-password.controller';
import { IVerifyEmailChangeController } from '@/src/interface-adapters/controllers/users/verify-email-change.controller';

export const DI_SYMBOLS = {
  // Services
  ICacheManager: Symbol.for('ICacheManager'),
  IAuthenticationService: Symbol.for('IAuthenticationService'),
  ITransactionManagerService: Symbol.for('ITransactionManagerService'),
  IInstrumentationService: Symbol.for('IInstrumentationService'),
  ILoggerService: Symbol.for('ILoggerService'),
  ICrashReporterService: Symbol.for('ICrashReporterService'),
  IEmailBloomFilterService: Symbol.for('IEmailBloomFilterService'),
  IEmailService: Symbol.for('IEmailService'),

  // Repositories
  ILeavesRepository: Symbol.for('ILeavesRepository'),
  IUsersRepository: Symbol.for('IUsersRepository'),
  ISessionRepository: Symbol.for('ISessionRepository'),
  IVisasRepository: Symbol.for('IVisasRepository'),
  IPasswordResetTokensRepository: Symbol.for('IPasswordResetTokensRepository'),
  IEmailVerificationTokensRepository: Symbol.for(
    'IEmailVerificationTokensRepository'
  ),
  IEmailChangeTokensRepository: Symbol.for('IEmailChangeTokensRepository'),

  // Use Cases
  ICreateLeaveUseCase: Symbol.for('ICreateLeaveUseCase'),
  IDeleteLeaveUseCase: Symbol.for('IDeleteLeaveUseCase'),
  IGetLeavesForUserUseCase: Symbol.for('IGetLeavesForUserUseCase'),
  IGetPaginatedLeavesForUserUseCase: Symbol.for('IGetPaginatedLeavesForUserUseCase'),
  IGetLeaveUseCase: Symbol.for('IGetLeaveUseCase'),
  IUpdateLeaveUseCase: Symbol.for('IUpdateLeaveUseCase'),
  ICreateVisaUseCase: Symbol.for('ICreateVisaUseCase'),
  IDeleteVisaUseCase: Symbol.for('IDeleteVisaUseCase'),
  IGetVisaUseCase: Symbol.for('IGetVisaUseCase'),
  IGetVisasForUserUseCase: Symbol.for('IGetVisasForUserUseCase'),
  IUpdateVisaUseCase: Symbol.for('IUpdateVisaUseCase'),
  ISignInUseCase: Symbol.for('ISignInUseCase'),
  ISignOutUseCase: Symbol.for('ISignOutUseCase'),
  ISignUpUseCase: Symbol.for('ISignUpUseCase'),
  IRequestPasswordResetUseCase: Symbol.for('IRequestPasswordResetUseCase'),
  IResetPasswordUseCase: Symbol.for('IResetPasswordUseCase'),
  IVerifyEmailUseCase: Symbol.for('IVerifyEmailUseCase'),
  IResendVerificationEmailUseCase: Symbol.for(
    'IResendVerificationEmailUseCase'
  ),
  IGetUserUseCase: Symbol.for('IGetUserUseCase'),
  IRequestEmailChangeUseCase: Symbol.for('IRequestEmailChangeUseCase'),
  IVerifyEmailChangeUseCase: Symbol.for('IVerifyEmailChangeUseCase'),
  ICancelEmailChangeUseCase: Symbol.for('ICancelEmailChangeUseCase'),
  IGetPendingEmailChangeUseCase: Symbol.for('IGetPendingEmailChangeUseCase'),
  IUpdateUserPasswordUseCase: Symbol.for('IUpdateUserPasswordUseCase'),
  IGetUserDataExportUseCase: Symbol.for('IGetUserDataExportUseCase'),
  IDeleteAccountUseCase: Symbol.for('IDeleteAccountUseCase'),

  // Controllers
  ISignInController: Symbol.for('ISignInController'),
  ISignOutController: Symbol.for('ISignOutController'),
  ISignUpController: Symbol.for('ISignUpController'),
  IRequestPasswordResetController: Symbol.for(
    'IRequestPasswordResetController'
  ),
  IResetPasswordController: Symbol.for('IResetPasswordController'),
  IVerifyEmailController: Symbol.for('IVerifyEmailController'),
  IResendVerificationEmailController: Symbol.for(
    'IResendVerificationEmailController'
  ),
  ICreateLeaveController: Symbol.for('ICreateLeaveController'),
  IDeleteLeaveController: Symbol.for('IDeleteLeaveController'),
  IGetLeaveController: Symbol.for('IGetLeaveController'),
  IGetLeavesForUserController: Symbol.for('IGetLeavesForUserController'),
  IGetPaginatedLeavesForUserController: Symbol.for('IGetPaginatedLeavesForUserController'),
  IUpdateLeaveController: Symbol.for('IUpdateLeaveController'),
  ICreateVisaController: Symbol.for('ICreateVisaController'),
  IDeleteVisaController: Symbol.for('IDeleteVisaController'),
  IGetVisaController: Symbol.for('IGetVisaController'),
  IGetVisasForUserController: Symbol.for('IGetVisasForUserController'),
  IUpdateVisaController: Symbol.for('IUpdateVisaController'),
  IGetSelfUserController: Symbol.for('IGetSelfUserController'),
  IRequestEmailChangeController: Symbol.for('IRequestEmailChangeController'),
  IVerifyEmailChangeController: Symbol.for('IVerifyEmailChangeController'),
  ICancelEmailChangeController: Symbol.for('ICancelEmailChangeController'),
  IGetPendingEmailChangeController: Symbol.for(
    'IGetPendingEmailChangeController'
  ),
  IUpdateUserPasswordController: Symbol.for('IUpdateUserPasswordController'),
  IGetUserDataExportController: Symbol.for('IGetUserDataExportController'),
  IDeleteAccountController: Symbol.for('IDeleteAccountController'),
};

export interface DI_RETURN_TYPES {
  // Services
  ICacheManager: ICacheManager;
  IAuthenticationService: IAuthenticationService;
  ITransactionManagerService: ITransactionManagerService;
  IInstrumentationService: IInstrumentationService;
  ILoggerService: ILoggerService;
  ICrashReporterService: ICrashReporterService;
  IEmailBloomFilterService: IEmailBloomFilterService;
  IEmailService: IEmailService;

  // Repositories
  ILeavesRepository: ILeavesRepository;
  IUsersRepository: IUsersRepository;
  ISessionRepository: ISessionsRepository;
  IVisasRepository: IVisasRepository;
  IPasswordResetTokensRepository: IPasswordResetTokensRepository;
  IEmailVerificationTokensRepository: IEmailVerificationTokensRepository;
  IEmailChangeTokensRepository: IEmailChangeTokensRepository;

  // Use Cases
  ICreateLeaveUseCase: ICreateLeaveUseCase;
  IDeleteLeaveUseCase: IDeleteLeaveUseCase;
  IGetLeavesForUserUseCase: IGetLeavesForUserUseCase;
  IGetPaginatedLeavesForUserUseCase: IGetPaginatedLeavesForUserUseCase;
  IGetLeaveUseCase: IGetLeaveUseCase;
  IUpdateLeaveUseCase: IUpdateLeaveUseCase;
  ICreateVisaUseCase: ICreateVisaUseCase;
  IDeleteVisaUseCase: IDeleteVisaUseCase;
  IGetVisaUseCase: IGetVisaUseCase;
  IGetVisasForUserUseCase: IGetVisasForUserUseCase;
  IUpdateVisaUseCase: IUpdateVisaUseCase;
  ISignInUseCase: ISignInUseCase;
  ISignOutUseCase: ISignOutUseCase;
  ISignUpUseCase: ISignUpUseCase;
  IRequestPasswordResetUseCase: IRequestPasswordResetUseCase;
  IResetPasswordUseCase: IResetPasswordUseCase;
  IVerifyEmailUseCase: IVerifyEmailUseCase;
  IResendVerificationEmailUseCase: IResendVerificationEmailUseCase;
  IGetUserUseCase: IGetUserUseCase;
  IRequestEmailChangeUseCase: IRequestEmailChangeUseCase;
  IVerifyEmailChangeUseCase: IVerifyEmailChangeUseCase;
  ICancelEmailChangeUseCase: ICancelEmailChangeUseCase;
  IGetPendingEmailChangeUseCase: IGetPendingEmailChangeUseCase;
  IUpdateUserPasswordUseCase: IUpdateUserPasswordUseCase;
  IGetUserDataExportUseCase: IGetUserDataExportUseCase;
  IDeleteAccountUseCase: IDeleteAccountUseCase;

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
  IGetPaginatedLeavesForUserController: IGetPaginatedLeavesForUserController;
  IUpdateLeaveController: IUpdateLeaveController;
  ICreateVisaController: ICreateVisaController;
  IDeleteVisaController: IDeleteVisaController;
  IGetVisaController: IGetVisaController;
  IGetVisasForUserController: IGetVisasForUserController;
  IUpdateVisaController: IUpdateVisaController;
  IGetSelfUserController: IGetSelfUserController;
  IRequestEmailChangeController: IRequestEmailChangeController;
  IVerifyEmailChangeController: IVerifyEmailChangeController;
  ICancelEmailChangeController: ICancelEmailChangeController;
  IGetPendingEmailChangeController: IGetPendingEmailChangeController;
  IUpdateUserPasswordController: IUpdateUserPasswordController;
  IGetUserDataExportController: IGetUserDataExportController;
  IDeleteAccountController: IDeleteAccountController;
}

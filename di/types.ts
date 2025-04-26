import { ILeavesRepository } from "@/src/application/repositories/leaves.repository.interface";
import { ISessionsRepository } from "@/src/application/repositories/sessions.repository.interface";
import { IUsersRepository } from "@/src/application/repositories/users.repository.interface";
import { IAuthenticationService } from "@/src/application/services/authentication.service.interface";
import { ICrashReporterService } from "@/src/application/services/crash-reporter.service.interface";
import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import { ITransactionManagerService } from "@/src/application/services/transaction-manager.service.interface";
import { ISignInUseCase } from "@/src/application/use-cases/auth/sign-in.use-case";
import { ISignOutUseCase } from "@/src/application/use-cases/auth/sign-out.use-case";
import { ISignUpUseCase } from "@/src/application/use-cases/auth/sign-up.use-case";
import { ICreateLeaveUseCase } from "@/src/application/use-cases/leaves/create-leave.use-case";
import { IDeleteLeaveUseCase } from "@/src/application/use-cases/leaves/delete-leave.use-case";
import { IGetLeavesForUserUseCase } from "@/src/application/use-cases/leaves/get-leaves-for-user.use-case";
import { IUpdateLeaveUseCase } from "@/src/application/use-cases/leaves/update-leave.use-case";
import { ISignInController } from "@/src/interface-adapters/controllers/auth/sign-in.controller";
import { ISignOutController } from "@/src/interface-adapters/controllers/auth/sign-out.controller";
import { ISignUpController } from "@/src/interface-adapters/controllers/auth/sign-up.controller";
import { ICreateLeaveController } from "@/src/interface-adapters/controllers/leaves/create-leave.controller";
import { IDeleteLeaveController } from "@/src/interface-adapters/controllers/leaves/delete-leave.controller";
import { IGetLeavesForUserController } from "@/src/interface-adapters/controllers/leaves/get-leaves-for-user.controller";
import { IUpdateLeaveController } from "@/src/interface-adapters/controllers/leaves/update-leave.controller";

export const DI_SYMBOLS = {
  // Services
  IAuthenticationService: Symbol.for("IAuthenticationService"),
  ITransactionManagerService: Symbol.for("ITransactionManagerService"),
  IInstrumentationService: Symbol.for("IInstrumentationService"),
  ICrashReporterService: Symbol.for("ICrashReporterService"),

  // Repositories
  ILeavesRepository: Symbol.for("ILeavesRepository"),
  IUsersRepository: Symbol.for("IUsersRepository"),
  ISessionRepository: Symbol.for("ISessionRepository"),

  // Use Cases
  ICreateLeaveUseCase: Symbol.for("ICreateLeaveUseCase"),
  IDeleteLeaveUseCase: Symbol.for("IDeleteLeaveUseCase"),
  IGetLeavesForUserUseCase: Symbol.for("IGetLeavesForUserUseCase"),
  IUpdateLeaveUseCase: Symbol.for("IUpdateLeaveUseCase"),
  ISignInUseCase: Symbol.for("ISignInUseCase"),
  ISignOutUseCase: Symbol.for("ISignOutUseCase"),
  ISignUpUseCase: Symbol.for("ISignUpUseCase"),

  // Controllers
  ISignInController: Symbol.for("ISignInController"),
  ISignOutController: Symbol.for("ISignOutController"),
  ISignUpController: Symbol.for("ISignUpController"),
  ICreateLeaveController: Symbol.for("ICreateLeaveController"),
  IDeleteLeaveController: Symbol.for("IDeleteLeaveController"),
  IGetLeavesForUserController: Symbol.for("IGetLeavesForUserController"),
  IUpdateLeaveController: Symbol.for("IUpdateLeaveController"),
};

export interface DI_RETURN_TYPES {
  // Services
  IAuthenticationService: IAuthenticationService;
  ITransactionManagerService: ITransactionManagerService;
  IInstrumentationService: IInstrumentationService;
  ICrashReporterService: ICrashReporterService;

  // Repositories
  ILeavesRepository: ILeavesRepository;
  IUsersRepository: IUsersRepository;
  ISessionRepository: ISessionsRepository;

  // Use Cases
  ICreateLeaveUseCase: ICreateLeaveUseCase;
  IDeleteLeaveUseCase: IDeleteLeaveUseCase;
  IGetLeavesForUserUseCase: IGetLeavesForUserUseCase;
  IUpdateLeaveUseCase: IUpdateLeaveUseCase;
  ISignInUseCase: ISignInUseCase;
  ISignOutUseCase: ISignOutUseCase;
  ISignUpUseCase: ISignUpUseCase;

  // Controllers
  ISignInController: ISignInController;
  ISignOutController: ISignOutController;
  ISignUpController: ISignUpController;
  ICreateLeaveController: ICreateLeaveController;
  IDeleteLeaveController: IDeleteLeaveController;
  IGetLeavesForUserController: IGetLeavesForUserController;
  IUpdateLeaveController: IUpdateLeaveController;
}

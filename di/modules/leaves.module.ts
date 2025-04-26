import { createModule } from "@evyweb/ioctopus";

import { LeavesRepository } from "@/src/infrastructure/repositories/leaves.repository";

import { createLeaveUseCase } from "@/src/application/use-cases/leaves/create-leave.use-case";
import { deleteLeaveUseCase } from "@/src/application/use-cases/leaves/delete-leave.use-case";
import { getLeavesForUserUseCase } from "@/src/application/use-cases/leaves/get-leaves-for-user.use-case";

import { createLeaveController } from "@/src/interface-adapters/controllers/leaves/create-leave.controller";
import { getLeavesForUserController } from "@/src/interface-adapters/controllers/leaves/get-leaves-for-user.controller";

import { DI_SYMBOLS } from "@/di/types";
import { updateLeaveUseCase } from "@/src/application/use-cases/leaves/update-leave.use-case";
import { updateLeaveController } from "@/src/interface-adapters/controllers/leaves/update-leave.controller";
import { deleteLeaveController } from "@/src/interface-adapters/controllers/leaves/delete-leave.controller";

export function createLeavesModule() {
  const leavesModule = createModule();

  leavesModule
    .bind(DI_SYMBOLS.ILeavesRepository)
    .toClass(LeavesRepository, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.ICrashReporterService,
    ]);

  leavesModule
    .bind(DI_SYMBOLS.ICreateLeaveUseCase)
    .toHigherOrderFunction(createLeaveUseCase, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.ILeavesRepository,
    ]);

  leavesModule
    .bind(DI_SYMBOLS.IDeleteLeaveUseCase)
    .toHigherOrderFunction(deleteLeaveUseCase, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.ILeavesRepository,
    ]);

  leavesModule
    .bind(DI_SYMBOLS.IGetLeavesForUserUseCase)
    .toHigherOrderFunction(getLeavesForUserUseCase, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.ILeavesRepository,
    ]);

  leavesModule
    .bind(DI_SYMBOLS.IUpdateLeaveUseCase)
    .toHigherOrderFunction(updateLeaveUseCase, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.ILeavesRepository,
    ]);

  leavesModule
    .bind(DI_SYMBOLS.IUpdateLeaveController)
    .toHigherOrderFunction(updateLeaveController, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IAuthenticationService,
      DI_SYMBOLS.ITransactionManagerService,
      DI_SYMBOLS.IUpdateLeaveUseCase,
    ]);

  leavesModule
    .bind(DI_SYMBOLS.ICreateLeaveController)
    .toHigherOrderFunction(createLeaveController, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IAuthenticationService,
      DI_SYMBOLS.ITransactionManagerService,
      DI_SYMBOLS.ICreateLeaveUseCase,
    ]);

  leavesModule
    .bind(DI_SYMBOLS.IGetLeavesForUserController)
    .toHigherOrderFunction(getLeavesForUserController, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IAuthenticationService,
      DI_SYMBOLS.IGetLeavesForUserUseCase,
    ]);

  leavesModule
    .bind(DI_SYMBOLS.IDeleteLeaveController)
    .toHigherOrderFunction(deleteLeaveController, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IAuthenticationService,
      DI_SYMBOLS.IDeleteLeaveUseCase,
    ]);

  return leavesModule;
}

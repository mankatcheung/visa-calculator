import { createModule } from "@evyweb/ioctopus";

import { UsersRepository } from "@/src/infrastructure/repositories/users.repository";

import { DI_SYMBOLS } from "@/di/types";

export function createUsersModule() {
  const usersModule = createModule();

  usersModule
    .bind(DI_SYMBOLS.IUsersRepository)
    .toClass(UsersRepository, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.ICrashReporterService,
    ]);

  return usersModule;
}

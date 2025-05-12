import { createModule } from '@evyweb/ioctopus';

import { SessionsRepository } from '@/src/infrastructure/repositories/sessions.repository';

import { DI_SYMBOLS } from '../types';

export function createSessionModule() {
  const sessionsModule = createModule();

  sessionsModule
    .bind(DI_SYMBOLS.ISessionRepository)
    .toClass(SessionsRepository, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.ICrashReporterService,
    ]);

  return sessionsModule;
}

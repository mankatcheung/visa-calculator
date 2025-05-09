import { createModule } from '@evyweb/ioctopus';
import { DI_SYMBOLS } from '../types';
import { SessionsRepository } from '@/src/infrastructure/repositories/sessions.repository';
import { MockSessionsRepository } from '@/src/infrastructure/repositories/sessions.repository.mock';

export function createSessionModule() {
  const sessionsModule = createModule();

  if (process.env.NODE_ENV === 'test') {
    sessionsModule
      .bind(DI_SYMBOLS.ISessionRepository)
      .toClass(MockSessionsRepository);
  } else {
    sessionsModule
      .bind(DI_SYMBOLS.ISessionRepository)
      .toClass(SessionsRepository, [
        DI_SYMBOLS.IInstrumentationService,
        DI_SYMBOLS.ICrashReporterService,
      ]);
  }

  return sessionsModule;
}

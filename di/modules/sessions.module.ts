import { createModule } from '@evyweb/ioctopus';

import { CachedSessionsRepository } from '@/src/infrastructure/repositories/sessions.repository.cached';
import { SessionsRepository } from '@/src/infrastructure/repositories/sessions.repository';

import { DI_SYMBOLS } from '../types';

const SESSIONS_REPO_IMPL = Symbol('SessionsRepositoryImpl');

export function createSessionModule() {
  const sessionsModule = createModule();

  sessionsModule
    .bind(SESSIONS_REPO_IMPL)
    .toClass(SessionsRepository, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.ICrashReporterService,
    ]);

  sessionsModule
    .bind(DI_SYMBOLS.ISessionRepository)
    .toClass(CachedSessionsRepository, [
      DI_SYMBOLS.ICacheManager,
      SESSIONS_REPO_IMPL,
    ]);

  return sessionsModule;
}

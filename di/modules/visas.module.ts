import { createModule } from '@evyweb/ioctopus';

import { DI_SYMBOLS } from '@/di/types';
import { createVisaUseCase } from '@/src/application/use-cases/visas/create-visa.use-case';
import { deleteVisaUseCase } from '@/src/application/use-cases/visas/delete-visa.use-case';
import { getVisaUseCase } from '@/src/application/use-cases/visas/get-visa.use-case';
import { getVisasForUserUseCase } from '@/src/application/use-cases/visas/get-visas-for-user.use-case';
import { updateVisaUseCase } from '@/src/application/use-cases/visas/update-visa.use-case';
import { CachedVisasRepository } from '@/src/infrastructure/repositories/visas.repository.cached';
import { VisasRepository } from '@/src/infrastructure/repositories/visas.repository';
import { createVisaController } from '@/src/interface-adapters/controllers/visas/create-visa.controller';
import { deleteVisaController } from '@/src/interface-adapters/controllers/visas/delete-visa.controller';
import { getVisaController } from '@/src/interface-adapters/controllers/visas/get-visa.controller';
import { getVisasForUserController } from '@/src/interface-adapters/controllers/visas/get-visas-for-user.controller';
import { updateVisaController } from '@/src/interface-adapters/controllers/visas/update-visa.controller';

const VISAS_REPO_IMPL = Symbol('VisasRepositoryImpl');

export function createVisasModule() {
  const visasModule = createModule();

  visasModule
    .bind(VISAS_REPO_IMPL)
    .toClass(VisasRepository, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.ICrashReporterService,
    ]);

  visasModule
    .bind(DI_SYMBOLS.IVisasRepository)
    .toClass(CachedVisasRepository, [
      DI_SYMBOLS.ICacheManager,
      VISAS_REPO_IMPL,
    ]);

  visasModule
    .bind(DI_SYMBOLS.ICreateVisaUseCase)
    .toHigherOrderFunction(createVisaUseCase, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IVisasRepository,
    ]);

  visasModule
    .bind(DI_SYMBOLS.IDeleteVisaUseCase)
    .toHigherOrderFunction(deleteVisaUseCase, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IVisasRepository,
    ]);

  visasModule
    .bind(DI_SYMBOLS.IGetVisaUseCase)
    .toHigherOrderFunction(getVisaUseCase, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IVisasRepository,
    ]);

  visasModule
    .bind(DI_SYMBOLS.IGetVisasForUserUseCase)
    .toHigherOrderFunction(getVisasForUserUseCase, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IVisasRepository,
    ]);

  visasModule
    .bind(DI_SYMBOLS.IUpdateVisaUseCase)
    .toHigherOrderFunction(updateVisaUseCase, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IVisasRepository,
    ]);

  visasModule
    .bind(DI_SYMBOLS.ICreateVisaController)
    .toHigherOrderFunction(createVisaController, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IAuthenticationService,
      DI_SYMBOLS.ICreateVisaUseCase,
    ]);

  visasModule
    .bind(DI_SYMBOLS.IDeleteVisaController)
    .toHigherOrderFunction(deleteVisaController, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IAuthenticationService,
      DI_SYMBOLS.IDeleteVisaUseCase,
    ]);

  visasModule
    .bind(DI_SYMBOLS.IGetVisaController)
    .toHigherOrderFunction(getVisaController, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IAuthenticationService,
      DI_SYMBOLS.IGetVisaUseCase,
    ]);

  visasModule
    .bind(DI_SYMBOLS.IGetVisasForUserController)
    .toHigherOrderFunction(getVisasForUserController, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IAuthenticationService,
      DI_SYMBOLS.IGetVisasForUserUseCase,
    ]);

  visasModule
    .bind(DI_SYMBOLS.IUpdateVisaController)
    .toHigherOrderFunction(updateVisaController, [
      DI_SYMBOLS.IInstrumentationService,
      DI_SYMBOLS.IAuthenticationService,
      DI_SYMBOLS.IUpdateVisaUseCase,
    ]);

  return visasModule;
}

import { createModule } from '@evyweb/ioctopus';

import { DI_SYMBOLS } from '@/di/types';
import { TransactionManagerService } from '@/src/infrastructure/services/transaction-manager.service';

export function createTransactionManagerModule() {
  const transactionManagerModule = createModule();

  transactionManagerModule
    .bind(DI_SYMBOLS.ITransactionManagerService)
    .toClass(TransactionManagerService);

  return transactionManagerModule;
}

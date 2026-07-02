import { z } from 'zod';

import { SUPPORTED_LOCALES } from '@/config';

import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { ITransactionManagerService } from '@/src/application/services/transaction-manager.service.interface';
import { IRequestPasswordResetUseCase } from '@/src/application/use-cases/auth/request-password-reset.use-case';
import { InputParseError } from '@/src/entities/errors/common';

const inputSchema = z.object({
  email: z.string().email(),
  locale: z.enum(SUPPORTED_LOCALES),
});

export type IRequestPasswordResetController = ReturnType<
  typeof requestPasswordResetController
>;

export const requestPasswordResetController =
  (
    instrumentationService: IInstrumentationService,
    transactionManagerService: ITransactionManagerService,
    requestPasswordResetUseCase: IRequestPasswordResetUseCase
  ) =>
  async (input: Partial<z.infer<typeof inputSchema>>): Promise<void> => {
    return await instrumentationService.startSpan(
      { name: 'requestPasswordReset Controller' },
      async () => {
        const { data, error } = inputSchema.safeParse(input);
        if (error) {
          throw new InputParseError('Invalid data', { cause: error });
        }
        // Invalidating the old token(s) and creating the new one happens
        // atomically. No manual try/catch + tx.rollback(): Drizzle already
        // rolls back and rethrows the original error on any failure.
        await transactionManagerService.startTransaction((tx) =>
          requestPasswordResetUseCase(data.email, data.locale, tx)
        );
      }
    );
  };

import { z } from 'zod';

import { SUPPORTED_LOCALES } from '@/config';

import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { ITransactionManagerService } from '@/src/application/services/transaction-manager.service.interface';
import { IResendVerificationEmailUseCase } from '@/src/application/use-cases/auth/resend-verification-email.use-case';
import { InputParseError } from '@/src/entities/errors/common';

const inputSchema = z.object({
  userId: z.string().min(1),
  locale: z.enum(SUPPORTED_LOCALES),
});

export type IResendVerificationEmailController = ReturnType<
  typeof resendVerificationEmailController
>;

export const resendVerificationEmailController =
  (
    instrumentationService: IInstrumentationService,
    transactionManagerService: ITransactionManagerService,
    resendVerificationEmailUseCase: IResendVerificationEmailUseCase
  ) =>
  async (input: Partial<z.infer<typeof inputSchema>>): Promise<void> => {
    return await instrumentationService.startSpan(
      { name: 'resendVerificationEmail Controller' },
      async () => {
        const { data, error } = inputSchema.safeParse(input);
        if (error) {
          throw new InputParseError('Invalid data', { cause: error });
        }
        // Invalidating the old token(s) and creating the new one happens
        // atomically. No manual try/catch + tx.rollback(): Drizzle already
        // rolls back and rethrows the original error on any failure.
        await transactionManagerService.startTransaction((tx) =>
          resendVerificationEmailUseCase(data.userId, data.locale, tx)
        );
      }
    );
  };

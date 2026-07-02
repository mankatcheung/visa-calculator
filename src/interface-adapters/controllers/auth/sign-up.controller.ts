import { z } from 'zod';

import { SUPPORTED_LOCALES } from '@/config';

import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { ITransactionManagerService } from '@/src/application/services/transaction-manager.service.interface';
import { ISignUpUseCase } from '@/src/application/use-cases/auth/sign-up.use-case';
import { InputParseError } from '@/src/entities/errors/common';

const inputSchema = z
  .object({
    email: z.email(),
    password: z.string().min(6).max(31),
    confirmPassword: z.string().min(6).max(31),
    locale: z.enum(SUPPORTED_LOCALES),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'The passwords did not match',
        path: ['password'],
      });
      ctx.addIssue({
        code: 'custom',
        message: 'The passwords did not match',
        path: ['confirmPassword'],
      });
    }
  });

export type ISignUpController = ReturnType<typeof signUpController>;

export const signUpController =
  (
    instrumentationService: IInstrumentationService,
    transactionManagerService: ITransactionManagerService,
    signUpUseCase: ISignUpUseCase
  ) =>
  async (
    input: Partial<z.infer<typeof inputSchema>>
  ): Promise<ReturnType<typeof signUpUseCase>> => {
    return await instrumentationService.startSpan(
      { name: 'signUp Controller' },
      async () => {
        const { data, error: inputParseError } = inputSchema.safeParse(input);

        if (inputParseError) {
          throw new InputParseError('Invalid data', { cause: inputParseError });
        }

        // The user row, settings, verification token, and session are all
        // created atomically. No manual try/catch + tx.rollback() here:
        // Drizzle's transaction() already rolls back automatically on any
        // thrown error and rethrows it unchanged -- which matters, since
        // callers rely on AuthenticationError ('Email taken') surfacing
        // intact.
        return await transactionManagerService.startTransaction((tx) =>
          signUpUseCase(data, tx)
        );
      }
    );
  };

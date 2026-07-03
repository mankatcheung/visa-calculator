import { z } from 'zod';

import { SESSION_COOKIE } from '@/config';

import { IAuthenticationService } from '@/src/application/services/authentication.service.interface';
import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { ITransactionManagerService } from '@/src/application/services/transaction-manager.service.interface';
import { IDeleteAccountUseCase } from '@/src/application/use-cases/users/delete-account.use-case';
import { UnauthenticatedError } from '@/src/entities/errors/auth';
import { InputParseError } from '@/src/entities/errors/common';
import { Cookie } from '@/src/entities/models/cookie';

const inputSchema = z.object({
  currentPassword: z.string().min(1),
});

export type IDeleteAccountController = ReturnType<
  typeof deleteAccountController
>;

export const deleteAccountController =
  (
    instrumentationService: IInstrumentationService,
    authenticationService: IAuthenticationService,
    transactionManagerService: ITransactionManagerService,
    deleteAccountUseCase: IDeleteAccountUseCase
  ) =>
  async (
    input: Partial<z.infer<typeof inputSchema>>,
    token: string | undefined
  ): Promise<{ blankCookie: Cookie }> => {
    return await instrumentationService.startSpan(
      { name: 'deleteAccount Controller' },
      async () => {
        if (!token) {
          throw new UnauthenticatedError(
            'Must be logged in to delete your account'
          );
        }
        const { user } = await authenticationService.validateSession(token);

        const { data, error: inputParseError } = inputSchema.safeParse(input);
        if (inputParseError) {
          throw new InputParseError('Invalid data', { cause: inputParseError });
        }

        // Every write (leaves, settings, tokens, sessions, and finally the
        // user row itself) happens atomically. No manual try/catch +
        // tx.rollback() here: Drizzle already rolls back and rethrows the
        // original error (e.g. AuthenticationError for a wrong password) on
        // any failure, which we rely on for user-facing messaging.
        await transactionManagerService.startTransaction((tx) =>
          deleteAccountUseCase(
            {
              currentPassword: data.currentPassword,
              currentPasswordHash: user.passwordHash,
              email: user.email,
            },
            user.id,
            tx
          )
        );

        const blankCookie: Cookie = {
          name: SESSION_COOKIE,
          value: '',
          attributes: {},
        };

        return { blankCookie };
      }
    );
  };

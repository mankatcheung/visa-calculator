import { z } from 'zod';

import { UnauthenticatedError } from '@/src/entities/errors/auth';
import { InputParseError } from '@/src/entities/errors/common';
import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { IAuthenticationService } from '@/src/application/services/authentication.service.interface';
import { ITransactionManagerService } from '@/src/application/services/transaction-manager.service.interface';
import { IUpdateUserPasswordUseCase } from '@/src/application/use-cases/users/update-user-password.use-case';
import { User } from '@/src/entities/models/user';

function presenter(
  user: User,
  instrumentationService: IInstrumentationService
) {
  return instrumentationService.startSpan(
    { name: 'updateUserPassword Presenter', op: 'serialize' },
    () => {
      return {
        id: user.id,
        email: user.email,
      };
    }
  );
}

const inputSchema = z
  .object({
    currentPassword: z.string().min(6).max(31),
    newPassword: z.string().min(6).max(31),
    confirmPassword: z.string().min(6).max(31),
  })
  .superRefine(({ newPassword, confirmPassword }, ctx) => {
    if (confirmPassword !== newPassword) {
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
export type IUpdateUserPasswordController = ReturnType<
  typeof updateUserPasswordController
>;

export const updateUserPasswordController =
  (
    instrumentationService: IInstrumentationService,
    authenticationService: IAuthenticationService,
    transactionManagerService: ITransactionManagerService,
    updateUserPasswordUseCase: IUpdateUserPasswordUseCase
  ) =>
  async (
    input: Partial<z.infer<typeof inputSchema>>,
    token: string | undefined
  ): Promise<ReturnType<typeof presenter>> => {
    return await instrumentationService.startSpan(
      {
        name: 'updateUserEmail Controller',
      },
      async () => {
        if (!token) {
          throw new UnauthenticatedError('Must be logged in to update a leave');
        }
        const { user } = await authenticationService.validateSession(token);

        const { data, error: inputParseError } = inputSchema.safeParse(input);

        if (inputParseError) {
          throw new InputParseError('Invalid data', { cause: inputParseError });
        }
        const newUser = await instrumentationService.startSpan(
          { name: 'Update User Password Transaction' },
          async () =>
            transactionManagerService.startTransaction(async (tx) => {
              try {
                return await updateUserPasswordUseCase(
                  {
                    currentPassword: data.currentPassword,
                    newPassword: data.newPassword,
                    currentPasswordHash: user.passwordHash,
                  },
                  user.id,
                  tx
                );
              } catch (err) {
                console.error('Rolling back!');
                tx.rollback();
              }
            })
        );
        if (!newUser) throw new Error('no user is updated');
        return presenter(newUser!, instrumentationService);
      }
    );
  };

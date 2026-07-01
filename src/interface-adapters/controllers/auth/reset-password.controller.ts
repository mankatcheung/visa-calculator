import { z } from 'zod';

import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { IResetPasswordUseCase } from '@/src/application/use-cases/auth/reset-password.use-case';
import { InputParseError } from '@/src/entities/errors/common';

const inputSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(6).max(31),
    confirmPassword: z.string().min(6).max(31),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      });
    }
  });

export type IResetPasswordController = ReturnType<
  typeof resetPasswordController
>;

export const resetPasswordController =
  (
    instrumentationService: IInstrumentationService,
    resetPasswordUseCase: IResetPasswordUseCase
  ) =>
  async (input: Partial<z.infer<typeof inputSchema>>): Promise<void> => {
    return await instrumentationService.startSpan(
      { name: 'resetPassword Controller' },
      async () => {
        const { data, error } = inputSchema.safeParse(input);
        if (error) {
          throw new InputParseError('Invalid data', { cause: error });
        }
        await resetPasswordUseCase(data.token, data.password);
      }
    );
  };

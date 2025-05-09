import { z } from 'zod';

import { InputParseError } from '@/src/entities/errors/common';
import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { ISignUpUseCase } from '@/src/application/use-cases/auth/sign-up.use-case';

const inputSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6).max(31),
    confirmPassword: z.string().min(6).max(31),
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

        return await signUpUseCase(data);
      }
    );
  };

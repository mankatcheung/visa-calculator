import { z } from 'zod';

import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { IVerifyEmailUseCase } from '@/src/application/use-cases/auth/verify-email.use-case';
import { InputParseError } from '@/src/entities/errors/common';

const inputSchema = z.object({
  token: z.string().min(1),
});

export type IVerifyEmailController = ReturnType<typeof verifyEmailController>;

export const verifyEmailController =
  (
    instrumentationService: IInstrumentationService,
    verifyEmailUseCase: IVerifyEmailUseCase
  ) =>
  async (input: Partial<z.infer<typeof inputSchema>>): Promise<void> => {
    return await instrumentationService.startSpan(
      { name: 'verifyEmail Controller' },
      async () => {
        const { data, error } = inputSchema.safeParse(input);
        if (error) {
          throw new InputParseError('Invalid data', { cause: error });
        }
        await verifyEmailUseCase(data.token);
      }
    );
  };

import { z } from 'zod';

import { SUPPORTED_LOCALES } from '@/config';

import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
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
        await resendVerificationEmailUseCase(data.userId, data.locale);
      }
    );
  };

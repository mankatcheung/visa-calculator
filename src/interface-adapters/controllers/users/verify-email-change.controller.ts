import { z } from 'zod';

import { IAuthenticationService } from '@/src/application/services/authentication.service.interface';
import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { IVerifyEmailChangeUseCase } from '@/src/application/use-cases/users/verify-email-change.use-case';
import { UnauthenticatedError } from '@/src/entities/errors/auth';
import { InputParseError } from '@/src/entities/errors/common';

const inputSchema = z.object({
  otp: z.string().length(6),
});

export type IVerifyEmailChangeController = ReturnType<
  typeof verifyEmailChangeController
>;

export const verifyEmailChangeController =
  (
    instrumentationService: IInstrumentationService,
    authenticationService: IAuthenticationService,
    verifyEmailChangeUseCase: IVerifyEmailChangeUseCase
  ) =>
  async (
    input: Partial<z.infer<typeof inputSchema>>,
    token: string | undefined
  ): Promise<void> => {
    return await instrumentationService.startSpan(
      { name: 'verifyEmailChange Controller' },
      async () => {
        if (!token) {
          throw new UnauthenticatedError('Must be logged in to verify email change');
        }
        const { user } = await authenticationService.validateSession(token);

        const { data, error: inputParseError } = inputSchema.safeParse(input);
        if (inputParseError) {
          throw new InputParseError('Invalid data', { cause: inputParseError });
        }

        await verifyEmailChangeUseCase(data.otp, user.id);
      }
    );
  };

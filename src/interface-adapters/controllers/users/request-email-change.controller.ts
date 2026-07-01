import { z } from 'zod';

import { IAuthenticationService } from '@/src/application/services/authentication.service.interface';
import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { IRequestEmailChangeUseCase } from '@/src/application/use-cases/users/request-email-change.use-case';
import { UnauthenticatedError } from '@/src/entities/errors/auth';
import { InputParseError } from '@/src/entities/errors/common';

const inputSchema = z.object({
  email: z.email(),
});

export type IRequestEmailChangeController = ReturnType<
  typeof requestEmailChangeController
>;

export const requestEmailChangeController =
  (
    instrumentationService: IInstrumentationService,
    authenticationService: IAuthenticationService,
    requestEmailChangeUseCase: IRequestEmailChangeUseCase
  ) =>
  async (
    input: Partial<z.infer<typeof inputSchema>>,
    token: string | undefined
  ): Promise<{ pendingEmail: string }> => {
    return await instrumentationService.startSpan(
      { name: 'requestEmailChange Controller' },
      async () => {
        if (!token) {
          throw new UnauthenticatedError('Must be logged in to change email');
        }
        const { user } = await authenticationService.validateSession(token);

        const { data, error: inputParseError } = inputSchema.safeParse(input);
        if (inputParseError) {
          throw new InputParseError('Invalid data', { cause: inputParseError });
        }

        return await requestEmailChangeUseCase({ email: data.email }, user.id);
      }
    );
  };

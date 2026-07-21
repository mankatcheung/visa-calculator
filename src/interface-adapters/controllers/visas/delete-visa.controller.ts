import { z } from 'zod';

import { IAuthenticationService } from '@/src/application/services/authentication.service.interface';
import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { IDeleteVisaUseCase } from '@/src/application/use-cases/visas/delete-visa.use-case';
import { UnauthenticatedError } from '@/src/entities/errors/auth';
import { InputParseError } from '@/src/entities/errors/common';

const inputSchema = z.object({ id: z.coerce.number().int().positive() });

export type IDeleteVisaController = ReturnType<typeof deleteVisaController>;

export const deleteVisaController =
  (
    instrumentationService: IInstrumentationService,
    authenticationService: IAuthenticationService,
    deleteVisaUseCase: IDeleteVisaUseCase
  ) =>
  async (input: { id: number | string }, token: string | undefined): Promise<void> => {
    return await instrumentationService.startSpan(
      { name: 'deleteVisa Controller' },
      async () => {
        if (!token) {
          throw new UnauthenticatedError('Must be logged in to delete a visa');
        }
        const { user } = await authenticationService.validateSession(token);

        const { data, error: inputParseError } = inputSchema.safeParse(input);
        if (inputParseError) {
          throw new InputParseError('Invalid data', { cause: inputParseError });
        }

        await deleteVisaUseCase(data.id, user.id);
      }
    );
  };

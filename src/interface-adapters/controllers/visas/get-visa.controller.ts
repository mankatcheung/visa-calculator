import { z } from 'zod';

import { IAuthenticationService } from '@/src/application/services/authentication.service.interface';
import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { IGetVisaUseCase } from '@/src/application/use-cases/visas/get-visa.use-case';
import { UnauthenticatedError } from '@/src/entities/errors/auth';
import { InputParseError } from '@/src/entities/errors/common';
import {
  visaPresenter,
  VisaPresenterOutput,
} from '@/src/interface-adapters/presenters/visas/visa.presenter';

const inputSchema = z.object({ id: z.coerce.number().int().positive() });

export type IGetVisaController = ReturnType<typeof getVisaController>;

export const getVisaController =
  (
    instrumentationService: IInstrumentationService,
    authenticationService: IAuthenticationService,
    getVisaUseCase: IGetVisaUseCase
  ) =>
  async (
    input: { id: number | string },
    token: string | undefined
  ): Promise<VisaPresenterOutput | undefined> => {
    return await instrumentationService.startSpan(
      { name: 'getVisa Controller' },
      async () => {
        if (!token) {
          throw new UnauthenticatedError('Must be logged in to get a visa');
        }
        const { user } = await authenticationService.validateSession(token);

        const { data, error: inputParseError } = inputSchema.safeParse(input);
        if (inputParseError) {
          throw new InputParseError('Invalid data', { cause: inputParseError });
        }

        const visa = await getVisaUseCase(data.id, user.id);
        if (!visa) return undefined;
        return visaPresenter(visa, instrumentationService);
      }
    );
  };

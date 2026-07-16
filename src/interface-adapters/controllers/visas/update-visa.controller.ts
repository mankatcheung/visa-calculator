import { z } from 'zod';

import { IAuthenticationService } from '@/src/application/services/authentication.service.interface';
import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { IUpdateVisaUseCase } from '@/src/application/use-cases/visas/update-visa.use-case';
import { UnauthenticatedError } from '@/src/entities/errors/auth';
import { InputParseError } from '@/src/entities/errors/common';
import {
  visaPresenter,
  VisaPresenterOutput,
} from '@/src/interface-adapters/presenters/visas/visa.presenter';

const inputSchema = z.object({
  id: z.coerce.number().int().positive(),
  country: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  startDate: z.string().optional(),
  expiryDate: z.string().optional(),
  arrivalDate: z.string().optional(),
  maxStayDays: z.coerce.number().int().positive().optional().nullable(),
  rollingWindowDays: z.coerce.number().int().positive().optional().nullable(),
  qualifyingPeriodYears: z.coerce.number().int().positive().optional().nullable(),
  remarks: z.string().optional().nullable(),
});

export type IUpdateVisaController = ReturnType<typeof updateVisaController>;

export const updateVisaController =
  (
    instrumentationService: IInstrumentationService,
    authenticationService: IAuthenticationService,
    updateVisaUseCase: IUpdateVisaUseCase
  ) =>
  async (
    input: Partial<z.infer<typeof inputSchema>>,
    token: string | undefined
  ): Promise<VisaPresenterOutput> => {
    return await instrumentationService.startSpan(
      { name: 'updateVisa Controller' },
      async () => {
        if (!token) {
          throw new UnauthenticatedError('Must be logged in to update a visa');
        }
        const { user } = await authenticationService.validateSession(token);

        const { data, error: inputParseError } = inputSchema.safeParse(input);
        if (inputParseError) {
          throw new InputParseError('Invalid data', { cause: inputParseError });
        }

        const { id, startDate, expiryDate, arrivalDate, ...rest } = data;

        const visa = await updateVisaUseCase(id, user.id, {
          ...rest,
          ...(startDate ? { startDate: new Date(startDate) } : {}),
          ...(expiryDate ? { expiryDate: new Date(expiryDate) } : {}),
          ...(arrivalDate ? { arrivalDate: new Date(arrivalDate) } : {}),
        });

        return visaPresenter(visa, instrumentationService);
      }
    );
  };

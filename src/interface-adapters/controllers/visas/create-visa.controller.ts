import { z } from 'zod';

import { IAuthenticationService } from '@/src/application/services/authentication.service.interface';
import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { ICreateVisaUseCase } from '@/src/application/use-cases/visas/create-visa.use-case';
import { UnauthenticatedError } from '@/src/entities/errors/auth';
import { InputParseError } from '@/src/entities/errors/common';
import {
  visaPresenter,
  VisaPresenterOutput,
} from '@/src/interface-adapters/presenters/visas/visa.presenter';

const inputSchema = z.object({
  country: z.string().min(1),
  name: z.string().min(1),
  startDate: z.string(),
  expiryDate: z.string(),
  arrivalDate: z.string(),
  maxStayDays: z.coerce.number().int().positive().optional().nullable(),
  rollingWindowDays: z.coerce.number().int().positive().optional().nullable(),
  qualifyingPeriodYears: z.coerce.number().int().positive().optional().nullable(),
  remarks: z.string().optional().nullable(),
});

export type ICreateVisaController = ReturnType<typeof createVisaController>;

export const createVisaController =
  (
    instrumentationService: IInstrumentationService,
    authenticationService: IAuthenticationService,
    createVisaUseCase: ICreateVisaUseCase
  ) =>
  async (
    input: Partial<z.infer<typeof inputSchema>>,
    token: string | undefined
  ): Promise<VisaPresenterOutput> => {
    return await instrumentationService.startSpan(
      { name: 'createVisa Controller' },
      async () => {
        if (!token) {
          throw new UnauthenticatedError('Must be logged in to create a visa');
        }
        const { user } = await authenticationService.validateSession(token);

        const { data, error: inputParseError } = inputSchema.safeParse(input);
        if (inputParseError) {
          throw new InputParseError('Invalid data', { cause: inputParseError });
        }

        const visa = await createVisaUseCase(
          {
            country: data.country,
            name: data.name,
            startDate: new Date(data.startDate),
            expiryDate: new Date(data.expiryDate),
            arrivalDate: new Date(data.arrivalDate),
            maxStayDays: data.maxStayDays ?? null,
            rollingWindowDays: data.rollingWindowDays ?? null,
            qualifyingPeriodYears: data.qualifyingPeriodYears ?? null,
            remarks: data.remarks ?? null,
          },
          user.id
        );

        return visaPresenter(visa, instrumentationService);
      }
    );
  };

import { z } from 'zod';

import { IAuthenticationService } from '@/src/application/services/authentication.service.interface';
import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { ITransactionManagerService } from '@/src/application/services/transaction-manager.service.interface';
import { IUpdateLeaveUseCase } from '@/src/application/use-cases/leaves/update-leave.use-case';
import { UnauthenticatedError } from '@/src/entities/errors/auth';
import { InputParseError } from '@/src/entities/errors/common';
import { Leave } from '@/src/entities/models/leave';

function presenter(
  leave: Leave,
  instrumentationService: IInstrumentationService
) {
  return instrumentationService.startSpan(
    { name: 'updateLeave Presenter', op: 'serialize' },
    () => {
      return {
        id: leave.id,
        createdAt: leave.createdAt,
        startDate: leave.startDate,
        endDate: leave.endDate,
        color: leave.color,
        remarks: leave.remarks,
        userId: leave.userId,
      };
    }
  );
}

const inputSchema = z
  .object({
    id: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    color: z.string().optional(),
    remarks: z.string().optional(),
  })
  .superRefine(({ startDate, endDate }, ctx) => {
    if (new Date(startDate) > new Date(endDate)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Start date should not be after end date',
        path: ['startDate'],
      });
      ctx.addIssue({
        code: 'custom',
        message: 'End date should not be before start date',
        path: ['endDate'],
      });
    }
  });

export type IUpdateLeaveController = ReturnType<typeof updateLeaveController>;

export const updateLeaveController =
  (
    instrumentationService: IInstrumentationService,
    authenticationService: IAuthenticationService,
    transactionManagerService: ITransactionManagerService,
    updateLeaveUseCase: IUpdateLeaveUseCase
  ) =>
  async (
    input: Partial<z.infer<typeof inputSchema>>,
    token: string | undefined
  ): Promise<ReturnType<typeof presenter>> => {
    return await instrumentationService.startSpan(
      {
        name: 'updateLeave Controller',
      },
      async () => {
        if (!token) {
          throw new UnauthenticatedError('Must be logged in to update a leave');
        }
        const { user } = await authenticationService.validateSession(token);

        const { data, error: inputParseError } = inputSchema.safeParse(input);

        if (inputParseError) {
          throw new InputParseError('Invalid data', { cause: inputParseError });
        }

        const leave = await instrumentationService.startSpan(
          { name: 'Update Leave Transaction' },
          async () =>
            transactionManagerService.startTransaction(async (tx) => {
              try {
                return await updateLeaveUseCase(
                  {
                    id: Number(data.id),
                    startDate: new Date(data.startDate),
                    endDate: new Date(data.endDate),
                    color: data.color,
                    remarks: data.remarks,
                  },
                  user.id,
                  tx
                );
              } catch {
                console.error('Rolling back!');
                tx.rollback();
              }
            })
        );
        return presenter(leave!, instrumentationService);
      }
    );
  };

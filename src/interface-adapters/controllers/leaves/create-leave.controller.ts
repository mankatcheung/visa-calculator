import { z } from "zod";

import { ICreateLeaveUseCase } from "@/src/application/use-cases/leaves/create-leave.use-case";
import { UnauthenticatedError } from "@/src/entities/errors/auth";
import { InputParseError } from "@/src/entities/errors/common";
import { Leave } from "@/src/entities/models/leave";
import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import { IAuthenticationService } from "@/src/application/services/authentication.service.interface";
import { ITransactionManagerService } from "@/src/application/services/transaction-manager.service.interface";

function presenter(
  leave: Leave,
  instrumentationService: IInstrumentationService,
) {
  return instrumentationService.startSpan(
    { name: "createLeave Presenter", op: "serialize" },
    () => {
      return {
        id: leave.id,
        created_at: new Date(leave.created_at),
        start_date: new Date(leave.start_date),
        end_date: new Date(leave.end_date),
        color: leave.color,
        remarks: leave.remarks,
      };
    },
  );
}

const inputSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  color: z.string().optional(),
  remarks: z.string().optional(),
});

export type ICreateLeaveController = ReturnType<typeof createLeaveController>;

export const createLeaveController =
  (
    instrumentationService: IInstrumentationService,
    authenticationService: IAuthenticationService,
    transactionManagerService: ITransactionManagerService,
    createLeaveUseCase: ICreateLeaveUseCase,
  ) =>
  async (
    input: Partial<z.infer<typeof inputSchema>>,
    token: string | undefined,
  ): Promise<ReturnType<typeof presenter>> => {
    return await instrumentationService.startSpan(
      {
        name: "createLeave Controller",
      },
      async () => {
        if (!token) {
          throw new UnauthenticatedError("Must be logged in to create a leave");
        }
        const { user } = await authenticationService.validateSession(token);

        const { data, error: inputParseError } = inputSchema.safeParse(input);
        if (inputParseError) {
          throw new InputParseError("Invalid data", { cause: inputParseError });
        }

        const leave = await instrumentationService.startSpan(
          { name: "Create Leave Transaction" },
          async () =>
            transactionManagerService.startTransaction(async (tx) => {
              try {
                return await createLeaveUseCase(
                  {
                    start_date: new Date(data.startDate),
                    end_date: new Date(data.endDate),
                    color: data.color,
                    remarks: data.remarks,
                  },
                  user.id,
                  tx,
                );
              } catch (err) {
                console.error("Rolling back!");
                tx.rollback();
              }
            }),
        );
        return presenter(leave!, instrumentationService);
      },
    );
  };

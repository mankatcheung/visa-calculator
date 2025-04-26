import { z } from "zod";

import { UnauthenticatedError } from "@/src/entities/errors/auth";
import { InputParseError } from "@/src/entities/errors/common";
import { Leave } from "@/src/entities/models/leave";
import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import { IAuthenticationService } from "@/src/application/services/authentication.service.interface";
import { ITransactionManagerService } from "@/src/application/services/transaction-manager.service.interface";
import { IUpdateLeaveUseCase } from "@/src/application/use-cases/leaves/update-leave.use-case";

function presenter(
  leave: Leave,
  instrumentationService: IInstrumentationService,
) {
  return instrumentationService.startSpan(
    { name: "updateLeave Presenter", op: "serialize" },
    () => {
      return {
        id: leave.id,
        created_at: leave.created_at,
        start_date: leave.start_date,
        end_date: leave.end_date,
        color: leave.color,
        remarks: leave.remarks,
        user: leave.user,
      };
    },
  );
}

const inputSchema = z.object({
  id: z.number(),
  start_date: z.date(),
  end_date: z.date(),
  color: z.string().optional(),
  remarks: z.string().optional(),
});

export type IUpdateLeaveController = ReturnType<typeof updateLeaveController>;

export const updateLeaveController =
  (
    instrumentationService: IInstrumentationService,
    authenticationService: IAuthenticationService,
    transactionManagerService: ITransactionManagerService,
    updateLeaveUseCase: IUpdateLeaveUseCase,
  ) =>
  async (
    input: Partial<z.infer<typeof inputSchema>>,
    token: string | undefined,
  ): Promise<ReturnType<typeof presenter>> => {
    return await instrumentationService.startSpan(
      {
        name: "updateLeave Controller",
      },
      async () => {
        if (!token) {
          throw new UnauthenticatedError("Must be logged in to update a leave");
        }
        const { user } = await authenticationService.validateSession(token);

        const { data, error: inputParseError } = inputSchema.safeParse(input);

        if (inputParseError) {
          throw new InputParseError("Invalid data", { cause: inputParseError });
        }

        const leave = await instrumentationService.startSpan(
          { name: "Update Leave Transaction" },
          async () =>
            transactionManagerService.startTransaction(async (tx) => {
              try {
                return await updateLeaveUseCase(
                  {
                    id: data.id,
                    start_date: data.start_date.toString(),
                    end_date: data.end_date.toString(),
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

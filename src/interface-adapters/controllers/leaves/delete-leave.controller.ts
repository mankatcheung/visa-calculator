import { IAuthenticationService } from "@/src/application/services/authentication.service.interface";
import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import { ITransactionManagerService } from "@/src/application/services/transaction-manager.service.interface";
import { IDeleteLeaveUseCase } from "@/src/application/use-cases/leaves/delete-leave.use-case";
import { UnauthenticatedError } from "@/src/entities/errors/auth";
import { InputParseError } from "@/src/entities/errors/common";
import { z } from "zod";

const inputSchema = z.object({
  leaveId: z.number(),
});

export type IDeleteLeaveController = ReturnType<typeof deleteLeaveController>;

export const deleteLeaveController =
  (
    instrumentationService: IInstrumentationService,
    authenticationService: IAuthenticationService,
    transactionManagerService: ITransactionManagerService,
    deleteLeaveUseCase: IDeleteLeaveUseCase,
  ) =>
  async (
    input: z.infer<typeof inputSchema>,
    token: string | undefined,
  ): Promise<void> => {
    return await instrumentationService.startSpan(
      {
        name: "deleteLeave Controller",
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

        await instrumentationService.startSpan(
          { name: "Delete Leave Transaction" },
          async () =>
            transactionManagerService.startTransaction(async (tx) => {
              try {
                return await deleteLeaveUseCase(
                  {
                    leaveId: data.leaveId,
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
      },
    );
  };

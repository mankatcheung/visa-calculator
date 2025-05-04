import { z } from "zod";

import { UnauthenticatedError } from "@/src/entities/errors/auth";
import { InputParseError } from "@/src/entities/errors/common";
import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import { IAuthenticationService } from "@/src/application/services/authentication.service.interface";
import { ITransactionManagerService } from "@/src/application/services/transaction-manager.service.interface";
import { IUpdateUserEmailUseCase } from "@/src/application/use-cases/users/update-user-email.use-case";
import { User } from "@/src/entities/models/user";

function presenter(
  user: User,
  instrumentationService: IInstrumentationService,
) {
  return instrumentationService.startSpan(
    { name: "updateUserEmail Presenter", op: "serialize" },
    () => {
      return {
        id: user.id,
        email: user.email,
      };
    },
  );
}

const inputSchema = z.object({
  email: z.string().email(),
});

export type IUpdateUserEmailController = ReturnType<
  typeof updateUserEmailController
>;

export const updateUserEmailController =
  (
    instrumentationService: IInstrumentationService,
    authenticationService: IAuthenticationService,
    transactionManagerService: ITransactionManagerService,
    updateUserEmailUseCase: IUpdateUserEmailUseCase,
  ) =>
  async (
    input: Partial<z.infer<typeof inputSchema>>,
    token: string | undefined,
  ): Promise<ReturnType<typeof presenter>> => {
    return await instrumentationService.startSpan(
      {
        name: "updateUserEmail Controller",
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

        const newUser = await instrumentationService.startSpan(
          { name: "Update User Email Transaction" },
          async () =>
            transactionManagerService.startTransaction(async (tx) => {
              try {
                return await updateUserEmailUseCase(
                  {
                    email: data.email,
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
        return presenter(newUser!, instrumentationService);
      },
    );
  };

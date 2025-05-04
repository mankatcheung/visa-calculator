import { InputParseError } from "@/src/entities/errors/common";
import type { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import { IUsersRepository } from "../../repositories/users.repository.interface";
import { User } from "@/src/entities/models/user";

export type IUpdateUserEmailUseCase = ReturnType<typeof updateUserEmailUseCase>;

export const updateUserEmailUseCase =
  (
    instrumentationService: IInstrumentationService,
    usersRepository: IUsersRepository,
  ) =>
  (
    input: {
      email: string;
    },
    userId: string,
    tx?: any,
  ): Promise<User> => {
    return instrumentationService.startSpan(
      { name: "updateUserEmail Use Case", op: "function" },
      async () => {
        // HINT: this is where you'd do authorization checks - is this user authorized to create a leave
        // for example: free users are allowed only 5 leaves, throw an UnauthorizedError if more than 5
        const user = await usersRepository.getUserByEmail(input.email);

        // check if same email is being updated
        if (user) {
          throw new InputParseError("Email has been taken");
        }

        const newUser = await usersRepository.updateUser(
          userId,
          {
            email: input.email,
          },
          tx,
        );

        return newUser;
      },
    );
  };

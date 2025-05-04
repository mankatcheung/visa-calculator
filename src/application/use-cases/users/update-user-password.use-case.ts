import { InputParseError } from "@/src/entities/errors/common";
import type { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import { IUsersRepository } from "../../repositories/users.repository.interface";
import { User } from "@/src/entities/models/user";

export type IUpdateUserPasswordUseCase = ReturnType<
  typeof updateUserPasswordUseCase
>;

export const updateUserPasswordUseCase =
  (
    instrumentationService: IInstrumentationService,
    usersRepository: IUsersRepository,
  ) =>
  (
    input: {
      password: string;
    },
    userId: string,
    tx?: any,
  ): Promise<User> => {
    return instrumentationService.startSpan(
      { name: "updateUserPassword Use Case", op: "function" },
      async () => {
        // HINT: this is where you'd do authorization checks - is this user authorized to create a leave
        // for example: free users are allowed only 5 leaves, throw an UnauthorizedError if more than 5

        // check if same email is being updated
        if (input.password.length <= 6) {
          throw new InputParseError("Wrong password format");
        }

        const newUser = await usersRepository.updateUser(
          userId,
          {
            password: input.password,
          },
          tx,
        );

        return newUser;
      },
    );
  };

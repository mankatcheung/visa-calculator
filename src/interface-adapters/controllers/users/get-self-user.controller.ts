import { UnauthenticatedError } from "@/src/entities/errors/auth";
import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import { IAuthenticationService } from "@/src/application/services/authentication.service.interface";
import { IGetUserUseCase } from "@/src/application/use-cases/users/get-user.use-case";
import { User } from "@/src/entities/models/user";

function presenter(
  user: User,
  instrumentationService: IInstrumentationService,
) {
  return instrumentationService.startSpan(
    { name: "getSelfUser Presenter", op: "serialize" },
    () => ({
      id: user.id,
      email: user.email,
    }),
  );
}

export type IGetSelfUserController = ReturnType<typeof getSelfUserController>;

export const getSelfUserController =
  (
    instrumentationService: IInstrumentationService,
    authenticationService: IAuthenticationService,
    getUserUseCase: IGetUserUseCase,
  ) =>
  async (token: string | undefined): Promise<ReturnType<typeof presenter>> => {
    return await instrumentationService.startSpan(
      { name: "getSelfUser Controller" },
      async () => {
        if (!token) {
          throw new UnauthenticatedError("Must be logged in to create a leave");
        }

        const { session } = await authenticationService.validateSession(token);

        const user = await getUserUseCase(session.user_id);

        return presenter(user, instrumentationService);
      },
    );
  };

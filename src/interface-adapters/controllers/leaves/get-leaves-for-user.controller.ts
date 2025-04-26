import { IGetLeavesForUserUseCase } from "@/src/application/use-cases/leaves/get-leaves-for-user.use-case";
import { UnauthenticatedError } from "@/src/entities/errors/auth";
import { Leave } from "@/src/entities/models/leave";
import { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import { IAuthenticationService } from "@/src/application/services/authentication.service.interface";

function presenter(
  leaves: Leave[],
  instrumentationService: IInstrumentationService,
) {
  return instrumentationService.startSpan(
    { name: "getLeavesForUser Presenter", op: "serialize" },
    () =>
      leaves.map((t) => ({
        id: t.id,
        startDate: t.start_date,
        endDate: t.end_date,
        color: t.color,
        remarks: t.remarks,
        createdAt: t.created_at,
      })),
  );
}

export type IGetLeavesForUserController = ReturnType<
  typeof getLeavesForUserController
>;

export const getLeavesForUserController =
  (
    instrumentationService: IInstrumentationService,
    authenticationService: IAuthenticationService,
    getLeavesForUserUseCase: IGetLeavesForUserUseCase,
  ) =>
  async (token: string | undefined): Promise<ReturnType<typeof presenter>> => {
    return await instrumentationService.startSpan(
      { name: "getLeavesForUser Controller" },
      async () => {
        if (!token) {
          throw new UnauthenticatedError("Must be logged in to create a leave");
        }

        const { session } = await authenticationService.validateSession(token);

        const leaves = await getLeavesForUserUseCase(session.user_id);

        return presenter(leaves, instrumentationService);
      },
    );
  };

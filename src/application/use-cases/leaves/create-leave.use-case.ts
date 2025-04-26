import { InputParseError } from "@/src/entities/errors/common";
import type { Leave } from "@/src/entities/models/leave";
import type { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import type { ILeavesRepository } from "@/src/application/repositories/leaves.repository.interface";

export type ICreateLeaveUseCase = ReturnType<typeof createLeaveUseCase>;

export const createLeaveUseCase =
  (
    instrumentationService: IInstrumentationService,
    leavesRepository: ILeavesRepository,
  ) =>
  (
    input: {
      start_date: string;
      end_date: string;
      color?: string;
      remarks?: string;
    },
    userId: string,
    tx?: any,
  ): Promise<Leave> => {
    return instrumentationService.startSpan(
      { name: "createLeave Use Case", op: "function" },
      async () => {
        // HINT: this is where you'd do authorization checks - is this user authorized to create a leave
        // for example: free users are allowed only 5 leaves, throw an UnauthorizedError if more than 5

        // check start_date should be before end_date
        if (
          new Date(input.start_date).getTime() >
          new Date(input.end_date).getTime()
        ) {
          throw new InputParseError("Start date should not be after end date");
        }

        const newLeave = await leavesRepository.createLeave(
          {
            ...input,
            user: userId,
          },
          tx,
        );

        return newLeave;
      },
    );
  };

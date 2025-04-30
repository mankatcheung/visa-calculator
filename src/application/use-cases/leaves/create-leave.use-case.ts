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
      start_date: Date;
      end_date: Date;
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

        //TODO: validate the color string in hex string

        const newLeave = await leavesRepository.createLeave(
          {
            start_date: input.start_date,
            end_date: input.end_date,
            color: input.color,
            remarks: input.remarks,
            user_id: userId,
          },
          tx,
        );

        return newLeave;
      },
    );
  };

import { InputParseError, NotFoundError } from "@/src/entities/errors/common";
import type { Leave } from "@/src/entities/models/leave";
import type { IInstrumentationService } from "@/src/application/services/instrumentation.service.interface";
import type { ILeavesRepository } from "@/src/application/repositories/leaves.repository.interface";
import { UnauthorizedError } from "@/src/entities/errors/auth";

export type IUpdateLeaveUseCase = ReturnType<typeof updateLeaveUseCase>;

export const updateLeaveUseCase =
  (
    instrumentationService: IInstrumentationService,
    leavesRepository: ILeavesRepository,
  ) =>
  (
    input: {
      id: number;
      start_date: Date;
      end_date: Date;
      color?: string;
      remarks?: string;
    },
    userId: string,
    tx?: any,
  ): Promise<Leave> => {
    return instrumentationService.startSpan(
      { name: "updateLeave Use Case", op: "function" },
      async () => {
        // HINT: this is where you'd do authorization checks - is this user authorized to create a leave
        // for example: free users are allowed only 5 leaves, throw an UnauthorizedError if more than 5
        const leave = await leavesRepository.getLeave(input.id);

        if (!leave) {
          throw new NotFoundError("Leave does not exist");
        }

        if (leave.user_id !== userId) {
          throw new UnauthorizedError(
            "Cannot delete leave. Reason: unauthorized",
          );
        }

        // check start_date should be before end_date
        if (
          new Date(input.start_date).getTime() >
          new Date(input.end_date).getTime()
        ) {
          throw new InputParseError("Start date should not be after end date");
        }

        const newLeave = await leavesRepository.updateLeave(
          input.id,
          {
            start_date: input.start_date,
            end_date: input.end_date,
            color: input.color,
            remarks: input.remarks,
          },
          tx,
        );

        return newLeave;
      },
    );
  };

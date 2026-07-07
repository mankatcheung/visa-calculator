import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { getInjection } from '@/di/container';
import { InputParseError, NotFoundError } from '@/src/entities/errors/common';
import { UnauthorizedError } from '@/src/entities/errors/auth';

const createLeaveShape = {
  startDate: z.string().describe('ISO 8601 date, e.g. 2025-06-01'),
  endDate: z.string().describe('ISO 8601 date, e.g. 2025-06-10'),
  color: z.string().optional().describe('Hex color, e.g. #ff0000'),
  remarks: z.string().optional().describe('Optional notes'),
};

const updateLeaveShape = {
  id: z.number().int().describe('Leave record ID'),
  startDate: z.string().describe('ISO 8601 date'),
  endDate: z.string().describe('ISO 8601 date'),
  color: z.string().optional(),
  remarks: z.string().optional(),
};

const deleteLeaveShape = {
  id: z.number().int().describe('Leave record ID to delete'),
};

const getLeavesShape = {
  page: z.number().int().min(1).optional().describe('Page number, 1-based (default 1)'),
  limit: z.number().int().min(1).max(100).optional().describe('Records per page (default 20)'),
};

type McpResult = { content: { type: 'text'; text: string }[]; isError?: boolean };

function toText(data: unknown): McpResult {
  return { content: [{ type: 'text', text: JSON.stringify(data) }] };
}

function domainError(err: unknown): McpResult | undefined {
  if (
    err instanceof InputParseError ||
    err instanceof NotFoundError ||
    err instanceof UnauthorizedError
  ) {
    return {
      content: [{ type: 'text', text: (err as Error).message }],
      isError: true,
    };
  }
}

export async function getLeavesHandler(
  userId: string,
  page?: number,
  limit?: number
): Promise<McpResult> {
  if (page !== undefined || limit !== undefined) {
    const result = await getInjection('IGetPaginatedLeavesForUserUseCase')(
      userId,
      page ?? 1,
      limit ?? 20
    );
    return toText(result);
  }
  const leaves = await getInjection('IGetLeavesForUserUseCase')(userId);
  return toText(leaves);
}

export async function createLeaveHandler(
  userId: string,
  input: z.infer<z.ZodObject<typeof createLeaveShape>>
): Promise<McpResult> {
  if (new Date(input.startDate) > new Date(input.endDate)) {
    throw new InputParseError('startDate must not be after endDate');
  }
  try {
    const leave = await getInjection('ICreateLeaveUseCase')(
      {
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        color: input.color,
        remarks: input.remarks,
      },
      userId
    );
    return toText(leave);
  } catch (err) {
    return domainError(err) ?? (() => { throw err; })();
  }
}

export async function updateLeaveHandler(
  userId: string,
  input: z.infer<z.ZodObject<typeof updateLeaveShape>>
): Promise<McpResult> {
  if (new Date(input.startDate) > new Date(input.endDate)) {
    throw new InputParseError('startDate must not be after endDate');
  }
  try {
    const leave = await getInjection('IUpdateLeaveUseCase')(
      {
        id: input.id,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        color: input.color,
        remarks: input.remarks,
      },
      userId
    );
    return toText(leave);
  } catch (err) {
    return domainError(err) ?? (() => { throw err; })();
  }
}

export async function deleteLeaveHandler(
  userId: string,
  input: { id: number }
): Promise<McpResult> {
  try {
    await getInjection('IDeleteLeaveUseCase')({ leaveId: input.id }, userId);
    return { content: [{ type: 'text', text: 'deleted' }] };
  } catch (err) {
    return domainError(err) ?? (() => { throw err; })();
  }
}

export function registerLeaveTools(server: McpServer, userId: string): void {
  server.tool(
    'get_leaves',
    'List leave absence records for the current user. Omit page/limit for all records; provide both for a paginated response with total and totalPages.',
    getLeavesShape,
    (input) => getLeavesHandler(userId, input.page, input.limit)
  );

  server.tool(
    'create_leave',
    'Create a new leave absence record',
    createLeaveShape,
    (input) => createLeaveHandler(userId, input)
  );

  server.tool(
    'update_leave',
    'Update an existing leave record by ID',
    updateLeaveShape,
    (input) => updateLeaveHandler(userId, input)
  );

  server.tool(
    'delete_leave',
    'Delete a leave record by ID',
    deleteLeaveShape,
    (input) => deleteLeaveHandler(userId, input)
  );
}

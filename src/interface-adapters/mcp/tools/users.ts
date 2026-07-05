import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { getInjection } from '@/di/container';
import { NotFoundError } from '@/src/entities/errors/common';

type McpResult = { content: { type: 'text'; text: string }[]; isError?: boolean };

export async function getUserHandler(userId: string): Promise<McpResult> {
  try {
    const user = await getInjection('IGetUserUseCase')(userId);
    const { passwordHash: _, ...safeUser } = user;
    return { content: [{ type: 'text', text: JSON.stringify(safeUser) }] };
  } catch (err) {
    if (err instanceof NotFoundError) {
      return {
        content: [{ type: 'text', text: (err as Error).message }],
        isError: true,
      };
    }
    throw err;
  }
}

export function registerUserTools(server: McpServer, userId: string): void {
  server.tool(
    'get_user',
    'Get the current user profile (id, email, emailVerified) — passwordHash is omitted',
    {},
    () => getUserHandler(userId)
  );
}

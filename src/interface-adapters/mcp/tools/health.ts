import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { client } from '@/drizzle';
import { getInjection } from '@/di/container';

export async function healthCheckHandler() {
  try {
    await client.execute('select 1');
    return { content: [{ type: 'text' as const, text: 'ok' }] };
  } catch (err) {
    const crashReporterService = getInjection('ICrashReporterService');
    crashReporterService.report(err);
    return { content: [{ type: 'text' as const, text: 'error' }], isError: true };
  }
}

export function registerHealthTools(server: McpServer): void {
  server.tool('health_check', 'Ping the database', {}, healthCheckHandler);
}

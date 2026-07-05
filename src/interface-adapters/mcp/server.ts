import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { registerHealthTools } from './tools/health';
import { registerLeaveTools } from './tools/leaves';
import { registerUserSettingsTools } from './tools/user-settings';
import { registerUserTools } from './tools/users';

export function buildMcpServer(userId: string): McpServer {
  const server = new McpServer({ name: 'visa-calculator', version: '1.0.0' });

  registerHealthTools(server);
  registerLeaveTools(server, userId);
  registerUserSettingsTools(server, userId);
  registerUserTools(server, userId);

  return server;
}

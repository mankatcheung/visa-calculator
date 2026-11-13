import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { registerHealthTools } from './tools/health';
import { registerLeaveTools } from './tools/leaves';
import { registerUserSettingsTools } from './tools/user-settings';
import { registerUserTools } from './tools/users';

// Bound tool-call array elements/object keys (GHSA-46jr-4wx8-v453).
export const MCP_MAX_TOOL_INPUT_ELEMENTS = 1_000;

export function buildMcpServer(userId: string): McpServer {
  const server = new McpServer(
    { name: 'visa-calculator', version: '1.0.0' },
    { maxToolInputElements: MCP_MAX_TOOL_INPUT_ELEMENTS },
  );

  registerHealthTools(server);
  registerLeaveTools(server, userId);
  registerUserSettingsTools(server, userId);
  registerUserTools(server, userId);

  return server;
}

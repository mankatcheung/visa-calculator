export interface McpAuthContext {
  userId: string;
}

export function authenticateMcpRequest(
  request: Request
): McpAuthContext | null {
  const configuredKey = process.env.MCP_API_KEY;
  const userId = process.env.MCP_USER_ID;

  if (!configuredKey || !userId) return null;

  const provided = request.headers.get('x-mcp-api-key');
  if (!provided || provided !== configuredKey) return null;

  return { userId };
}

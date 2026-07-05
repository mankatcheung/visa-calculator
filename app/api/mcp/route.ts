import { type NextRequest } from 'next/server';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';

import { authenticateMcpRequest } from '@/src/interface-adapters/mcp/auth';
import { buildMcpServer } from '@/src/interface-adapters/mcp/server';

export async function POST(request: NextRequest): Promise<Response> {
  const auth = authenticateMcpRequest(request);
  if (!auth) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless — no session tracking needed
    enableJsonResponse: true,
  });

  const server = buildMcpServer(auth.userId);
  await server.connect(transport);

  return transport.handleRequest(request);
}

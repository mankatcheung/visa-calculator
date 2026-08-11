import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { getInjection } from '@/di/container';
import { getVisaStatus } from '@/lib/visa';

const createVisaShape = {
  country: z.string().describe('Country name, e.g. "United Kingdom"'),
  name: z.string().describe('Visa type/label, e.g. "Skilled Worker"'),
  startDate: z.string().describe('ISO 8601 date — visa valid from'),
  expiryDate: z.string().describe('ISO 8601 date — visa expires'),
  arrivalDate: z.string().describe('ISO 8601 date — when user arrived'),
  maxStayDays: z.number().int().positive().optional().describe('Max stay days for rolling-window rule'),
  rollingWindowDays: z.number().int().positive().optional().describe('Rolling window size in days'),
  qualifyingPeriodYears: z.number().int().positive().optional().describe('Years needed for PR/ILR/citizenship'),
  remarks: z.string().optional().describe('Free-text notes'),
};

const updateVisaShape = {
  id: z.number().int().positive().describe('Visa ID'),
  country: z.string().optional(),
  name: z.string().optional(),
  startDate: z.string().optional().describe('ISO 8601 date'),
  expiryDate: z.string().optional().describe('ISO 8601 date'),
  arrivalDate: z.string().optional().describe('ISO 8601 date'),
  maxStayDays: z.number().int().positive().optional().nullable(),
  rollingWindowDays: z.number().int().positive().optional().nullable(),
  qualifyingPeriodYears: z.number().int().positive().optional().nullable(),
  remarks: z.string().optional().nullable(),
};

type McpResult = { content: { type: 'text'; text: string }[]; isError?: boolean };

function toText(data: unknown): McpResult {
  return { content: [{ type: 'text', text: JSON.stringify(data) }] };
}

export async function listVisasHandler(userId: string): Promise<McpResult> {
  const visas = await getInjection('IGetVisasForUserUseCase')(userId);
  return toText(visas);
}

export async function createVisaHandler(
  userId: string,
  input: z.infer<z.ZodObject<typeof createVisaShape>>
): Promise<McpResult> {
  const visa = await getInjection('ICreateVisaUseCase')(
    {
      country: input.country,
      name: input.name,
      startDate: new Date(input.startDate),
      expiryDate: new Date(input.expiryDate),
      arrivalDate: new Date(input.arrivalDate),
      maxStayDays: input.maxStayDays ?? null,
      rollingWindowDays: input.rollingWindowDays ?? null,
      qualifyingPeriodYears: input.qualifyingPeriodYears ?? null,
      remarks: input.remarks ?? null,
    },
    userId
  );
  return toText(visa);
}

export async function updateVisaHandler(
  userId: string,
  input: z.infer<z.ZodObject<typeof updateVisaShape>>
): Promise<McpResult> {
  const { id, startDate, expiryDate, arrivalDate, ...rest } = input;
  const visa = await getInjection('IUpdateVisaUseCase')(id, userId, {
    ...rest,
    ...(startDate ? { startDate: new Date(startDate) } : {}),
    ...(expiryDate ? { expiryDate: new Date(expiryDate) } : {}),
    ...(arrivalDate ? { arrivalDate: new Date(arrivalDate) } : {}),
  });
  return toText(visa);
}

export async function deleteVisaHandler(userId: string, visaId: number): Promise<McpResult> {
  await getInjection('IDeleteVisaUseCase')(visaId, userId);
  return toText({ success: true });
}

export async function getVisaStatusMcpHandler(userId: string, visaId: number): Promise<McpResult> {
  const visa = await getInjection('IGetVisaUseCase')(visaId, userId);
  if (!visa) {
    return { content: [{ type: 'text', text: 'Visa not found' }], isError: true };
  }
  const status = getVisaStatus(visa, []);
  return toText({ visa, status });
}

export function registerUserSettingsTools(server: McpServer, userId: string): void {
  server.tool(
    'list_visas',
    'List all visas for the current user',
    {},
    () => listVisasHandler(userId)
  );

  server.tool(
    'create_visa',
    'Create a new visa record',
    createVisaShape,
    (input) => createVisaHandler(userId, input)
  );

  server.tool(
    'update_visa',
    'Update an existing visa by ID',
    updateVisaShape,
    (input) => updateVisaHandler(userId, input)
  );

  server.tool(
    'delete_visa',
    'Delete a visa by ID',
    { id: z.number().int().positive().describe('Visa ID') },
    ({ id }) => deleteVisaHandler(userId, id)
  );

  server.tool(
    'get_visa_status',
    'Compute full visa status for a specific visa: days until expiry, rolling-window usage, qualifying period progress',
    { id: z.number().int().positive().describe('Visa ID') },
    ({ id }) => getVisaStatusMcpHandler(userId, id)
  );
}

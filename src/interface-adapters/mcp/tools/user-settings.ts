import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { getInjection } from '@/di/container';
import { getVisaStatus } from '@/lib/visa';

const updateUserSettingsShape = {
  visaStartDate: z.string().optional().describe('ISO 8601 date'),
  visaExpiryDate: z.string().optional().describe('ISO 8601 date'),
  arrivalDate: z.string().optional().describe('ISO 8601 date'),
};

type McpResult = { content: { type: 'text'; text: string }[]; isError?: boolean };

function toText(data: unknown): McpResult {
  return { content: [{ type: 'text', text: JSON.stringify(data) }] };
}

export async function getUserSettingsHandler(userId: string): Promise<McpResult> {
  const settings = await getInjection('IGetUserSettingsForUserUseCase')(userId);
  return toText(settings ?? null);
}

export async function updateUserSettingsHandler(
  userId: string,
  input: z.infer<z.ZodObject<typeof updateUserSettingsShape>>
): Promise<McpResult> {
  const updateData: {
    visaStartDate?: Date;
    visaExpiryDate?: Date;
    arrivalDate?: Date;
  } = {};
  if (input.visaStartDate) updateData.visaStartDate = new Date(input.visaStartDate);
  if (input.visaExpiryDate) updateData.visaExpiryDate = new Date(input.visaExpiryDate);
  if (input.arrivalDate) updateData.arrivalDate = new Date(input.arrivalDate);

  const settings = await getInjection('IUpdateUserSettingsUseCase')(updateData, userId);
  return toText(settings);
}

export async function getVisaStatusHandler(userId: string): Promise<McpResult> {
  const settings = await getInjection('IGetUserSettingsForUserUseCase')(userId);

  if (!settings) {
    return {
      content: [{ type: 'text', text: 'No visa settings configured for this user' }],
      isError: true,
    };
  }

  const status = getVisaStatus({
    visaStartDate: settings.visaStartDate,
    visaExpiryDate: settings.visaExpiryDate,
    arrivalDate: settings.arrivalDate,
  });

  return toText(status);
}

export function registerUserSettingsTools(server: McpServer, userId: string): void {
  server.tool(
    'get_user_settings',
    'Get visa timeline dates (visaStartDate, visaExpiryDate, arrivalDate)',
    {},
    () => getUserSettingsHandler(userId)
  );

  server.tool(
    'update_user_settings',
    'Update visa timeline dates',
    updateUserSettingsShape,
    (input) => updateUserSettingsHandler(userId, input)
  );

  server.tool(
    'get_visa_status',
    'Compute full visa status from stored settings: ILR date, citizenship date, days remaining, expiry progress percentage',
    {},
    () => getVisaStatusHandler(userId)
  );
}

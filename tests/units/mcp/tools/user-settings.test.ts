import { expect, it } from 'vitest';

import {
  createVisaHandler,
  listVisasHandler,
  getVisaStatusMcpHandler,
} from '@/src/interface-adapters/mcp/tools/user-settings';

const USER_ID = '1';

it('list_visas returns seeded visas for the user', async () => {
  const result = await listVisasHandler(USER_ID);
  const visas = JSON.parse(result.content[0].text);
  expect(Array.isArray(visas)).toBe(true);
  expect(visas.length).toBeGreaterThan(0);
  expect(visas[0].userId).toBe(USER_ID);
  expect(visas[0].country).toBeDefined();
});

it('get_visa_status returns computed status for the first visa', async () => {
  const listResult = await listVisasHandler(USER_ID);
  const visas = JSON.parse(listResult.content[0].text);
  const visaId = visas[0].id;

  const result = await getVisaStatusMcpHandler(USER_ID, visaId);
  const { visa, status } = JSON.parse(result.content[0].text);
  expect(visa.id).toBe(visaId);
  expect(status).toMatchObject({
    isExpired: expect.any(Boolean),
    daysSinceArrival: expect.any(Number),
    totalVisaDurationDays: expect.any(Number),
  });
});

it('create_visa persists a new visa and it appears in list', async () => {
  await createVisaHandler(USER_ID, {
    country: 'Japan',
    name: 'Tourist',
    startDate: '2025-01-01',
    expiryDate: '2025-04-01',
    arrivalDate: '2025-01-15',
  });

  const result = await listVisasHandler(USER_ID);
  const visas = JSON.parse(result.content[0].text);
  const japan = visas.find((v: { country: string }) => v.country === 'Japan');
  expect(japan).toBeDefined();
  expect(japan.name).toBe('Tourist');
});

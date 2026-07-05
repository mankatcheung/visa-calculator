import { expect, it } from 'vitest';

import {
  getUserSettingsHandler,
  getVisaStatusHandler,
  updateUserSettingsHandler,
} from '@/src/interface-adapters/mcp/tools/user-settings';

const USER_ID = '1';

it('get_user_settings returns seeded settings', async () => {
  const result = await getUserSettingsHandler(USER_ID);
  const settings = JSON.parse(result.content[0].text);
  expect(settings).not.toBeNull();
  expect(settings.userId).toBe(USER_ID);
  expect(settings.visaStartDate).toBeDefined();
});

it('get_visa_status returns computed status shape', async () => {
  const result = await getVisaStatusHandler(USER_ID);
  const status = JSON.parse(result.content[0].text);
  expect(status).toMatchObject({
    applyILRDate: expect.any(String),
    applyCitizenshipDate: expect.any(String),
    progressPercentage: expect.any(Number),
    isExpired: expect.any(Boolean),
  });
});

it('update_user_settings persists new dates', async () => {
  await updateUserSettingsHandler(USER_ID, {
    visaStartDate: '2024-03-01',
    visaExpiryDate: '2029-03-01',
    arrivalDate: '2024-04-01',
  });

  const result = await getUserSettingsHandler(USER_ID);
  const settings = JSON.parse(result.content[0].text);
  expect(new Date(settings.visaStartDate).getFullYear()).toBe(2024);
  expect(new Date(settings.visaExpiryDate).getFullYear()).toBe(2029);
});

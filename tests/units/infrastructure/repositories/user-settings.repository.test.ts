import { expect, it } from 'vitest';

import { getInjection } from '@/di/container';

const userSettingsRepository = getInjection('IUserSettingsRepository');

// A great guide on test names
// https://www.epicweb.dev/talks/how-to-write-better-test-names
it('creates user settings', async () => {
  await expect(
    userSettingsRepository.createUserSettings('1')
  ).resolves.toMatchObject({
    userId: '1',
  });
});

it('update user settings', async () => {
  const startDate = new Date(2025, 5, 7);
  const expiryDate = new Date(2030, 5, 7);
  const arrivalDate = new Date(2025, 7, 7);

  await expect(
    userSettingsRepository.updateUserSettings('1', {
      visaStartDate: startDate,
      visaExpiryDate: expiryDate,
      arrivalDate,
    })
  ).resolves.toMatchObject({
    id: 1,
    visaStartDate: startDate,
    visaExpiryDate: expiryDate,
    arrivalDate,
    userId: '1',
  });
});

it('get user settings for user', async () => {
  await expect(
    userSettingsRepository.getUserSettingsForUser('1')
  ).resolves.toMatchObject({
    id: 1,
    userId: '1',
  });
});

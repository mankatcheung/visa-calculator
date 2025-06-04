import { expect, it } from 'vitest';

import { getInjection } from '@/di/container';

const updateUserSettingsUseCase = getInjection('IUpdateUserSettingsUseCase');
const getUserSettingsForUserUseCase = getInjection(
  'IGetUserSettingsForUserUseCase'
);

it('update user settings', async () => {
  const settings = await getUserSettingsForUserUseCase('1');
  if (!settings) {
    throw new Error('Test setup failed: User 1 should have existing settings');
  }
  const updateValue = {
    visaStartDate: new Date(2025, 6, 1),
  };

  await updateUserSettingsUseCase(updateValue, '1');
  await expect(getUserSettingsForUserUseCase('1')).resolves.toMatchObject({
    id: settings?.id,
    visaStartDate: new Date(2025, 6, 1),
    userId: '1',
  });
});

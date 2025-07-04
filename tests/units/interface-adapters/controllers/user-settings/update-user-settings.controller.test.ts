import { expect, it } from 'vitest';

import { getInjection } from '@/di/container';
import { UnauthenticatedError } from '@/src/entities/errors/auth';

const signInUseCase = getInjection('ISignInUseCase');
const updateUserSettingsController = getInjection(
  'IUpdateUserSettingsController'
);

// A great guide on test names
// https://www.epicweb.dev/talks/how-to-write-better-test-names
it('update settings', async () => {
  const { cookie } = await signInUseCase({
    email: 'one@test.com',
    password: 'password-one',
  });
  const updateData = {
    visaStartDate: new Date(2025, 5, 1).toUTCString(),
    visaExpiryDate: new Date(2030, 5, 1).toUTCString(),
    arrivalDate: new Date(2025, 7, 2).toUTCString(),
  };
  await expect(
    updateUserSettingsController(updateData, cookie.value)
  ).resolves.toMatchObject({
    id: 1,
    visaStartDate: new Date(2025, 5, 1),
    visaExpiryDate: new Date(2030, 5, 1),
    arrivalDate: new Date(2025, 7, 2),
    userId: '1',
  });
});

it('throws for unauthenticated', async () => {
  await expect(
    updateUserSettingsController(
      {
        visaStartDate: new Date(2025, 4, 3).toUTCString(),
      },
      undefined
    )
  ).rejects.toBeInstanceOf(UnauthenticatedError);
});

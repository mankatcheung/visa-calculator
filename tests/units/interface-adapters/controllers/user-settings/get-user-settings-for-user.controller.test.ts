import { expect, it } from 'vitest';

import { getInjection } from '@/di/container';
import { UnauthenticatedError } from '@/src/entities/errors/auth';

const signInUseCase = getInjection('ISignInUseCase');
const getUserSettingsForUserController = getInjection(
  'IGetUserSettingsForUserController'
);

// A great guide on test names
// https://www.epicweb.dev/talks/how-to-write-better-test-names
it('get settings for user', async () => {
  const { cookie } = await signInUseCase({
    email: 'one@test.com',
    password: 'password-one',
  });

  await expect(
    getUserSettingsForUserController(cookie.value)
  ).resolves.toMatchObject({
    id: 1,
    visaStartDate: new Date(2025, 5, 5),
    visaExpiryDate: new Date(2030, 5, 5),
    arrivalDate: new Date(2025, 6, 5),
    userId: '1',
  });
});

it('throws for unauthenticated', async () => {
  await expect(
    getUserSettingsForUserController(undefined)
  ).rejects.toBeInstanceOf(UnauthenticatedError);
});

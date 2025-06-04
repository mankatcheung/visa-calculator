import { expect, it } from 'vitest';

import { getInjection } from '@/di/container';

const signInUseCase = getInjection('ISignInUseCase');
const getUserSettingsForUserUseCase = getInjection(
  'IGetUserSettingsForUserUseCase'
);

// A great guide on test names
// https://www.epicweb.dev/talks/how-to-write-better-test-names
it('returns settings', async () => {
  const { session } = await signInUseCase({
    email: 'one@test.com',
    password: 'password-one',
  });
  await expect(getUserSettingsForUserUseCase('5')).resolves.toBeUndefined();

  await expect(
    getUserSettingsForUserUseCase(session.userId)
  ).resolves.toMatchObject({
    id: 1,
    visaStartDate: new Date(2025, 5, 5),
    userId: '1',
  });
});

import { expect, it } from 'vitest';

import { getInjection } from '@/di/container';

const signInUseCase = getInjection('ISignInUseCase');
const getVisasForUserUseCase = getInjection('IGetVisasForUserUseCase');

it('returns visas for user', async () => {
  const { session } = await signInUseCase({
    email: 'one@test.com',
    password: 'password-one',
  });

  await expect(getVisasForUserUseCase('non-existent-id')).resolves.toEqual([]);

  const visas = await getVisasForUserUseCase(session.userId);
  expect(visas).toHaveLength(1);
  expect(visas[0]).toMatchObject({
    country: 'United Kingdom',
    name: 'Skilled Worker',
    userId: '1',
    qualifyingPeriodYears: 5,
  });
});

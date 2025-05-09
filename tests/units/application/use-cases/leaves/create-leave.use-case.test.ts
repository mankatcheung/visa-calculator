import { expect, it } from 'vitest';

import { getInjection } from '@/di/container';

const signInUseCase = getInjection('ISignInUseCase');
const createLeaveUseCase = getInjection('ICreateLeaveUseCase');

// A great guide on test names
// https://www.epicweb.dev/talks/how-to-write-better-test-names
it('creates todo', async () => {
  const { session } = await signInUseCase({
    email: 'one@test.com',
    password: 'password-one',
  });

  const startDate = new Date(2025, 5, 7);
  const endDate = new Date(2025, 5, 10);

  await expect(
    createLeaveUseCase(
      {
        startDate,
        endDate,
        color: '#333333',
        remarks: 'Testing remarks',
      },
      session.userId
    )
  ).resolves.toMatchObject({
    startDate,
    endDate,
    color: '#333333',
    remarks: 'Testing remarks',
    userId: '1',
  });
});

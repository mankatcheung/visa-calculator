import { expect, it } from 'vitest';

import { getInjection } from '@/di/container';

const signInUseCase = getInjection('ISignInUseCase');
const createLeaveUseCase = getInjection('ICreateLeaveUseCase');
const getLeavesForUserUseCase = getInjection('IGetLeavesForUserUseCase');

// A great guide on test names
// https://www.epicweb.dev/talks/how-to-write-better-test-names
it('returns leaves', async () => {
  const { session } = await signInUseCase({
    email: 'one@test.com',
    password: 'password-one',
  });
  await expect(getLeavesForUserUseCase(session.userId)).resolves.toHaveLength(
    0
  );

  const startDate = new Date(2025, 5, 7);
  const endDate = new Date(2025, 5, 10);
  await createLeaveUseCase(
    {
      startDate,
      endDate,
      color: '#333333',
      remarks: 'Testing remarks',
    },
    session.userId
  );
  await createLeaveUseCase(
    {
      startDate,
      endDate,
      color: '#222222',
      remarks: 'Testing remarks',
    },
    session.userId
  );

  await expect(getLeavesForUserUseCase(session.userId)).resolves.toMatchObject([
    {
      startDate,
      endDate,
      color: '#333333',
      remarks: 'Testing remarks',
      userId: '1',
    },
    {
      startDate,
      endDate,
      color: '#222222',
      remarks: 'Testing remarks',
      userId: '1',
    },
  ]);
});

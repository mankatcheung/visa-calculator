import { expect, it } from 'vitest';

import { getInjection } from '@/di/container';
import { UnauthenticatedError } from '@/src/entities/errors/auth';

const signInUseCase = getInjection('ISignInUseCase');
const createLeaveController = getInjection('ICreateLeaveController');
const getLeavesForUserController = getInjection('IGetLeavesForUserController');

// A great guide on test names
// https://www.epicweb.dev/talks/how-to-write-better-test-names
it('get leaves for user', async () => {
  const { cookie } = await signInUseCase({
    email: 'one@test.com',
    password: 'password-one',
  });

  const startDate = new Date(2025, 5, 6).toUTCString();
  const endDate = new Date(2025, 5, 10).toUTCString();
  const leave = await createLeaveController(
    { startDate, endDate, color: '#333333', remarks: 'Testing remarks' },
    cookie.value
  );
  await expect(getLeavesForUserController(cookie.value)).resolves.toMatchObject(
    [
      {
        id: leave.id,
        startDate: new Date(2025, 5, 6),
        endDate: new Date(2025, 5, 10),
        color: '#333333',
        remarks: 'Testing remarks',
        userId: '1',
      },
    ]
  );
});

it('throws for unauthenticated', async () => {
  await expect(getLeavesForUserController(undefined)).rejects.toBeInstanceOf(
    UnauthenticatedError
  );
});

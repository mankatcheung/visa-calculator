import { expect, it } from 'vitest';

import { getInjection } from '@/di/container';
import { UnauthenticatedError } from '@/src/entities/errors/auth';

const signInUseCase = getInjection('ISignInUseCase');
const createLeaveController = getInjection('ICreateLeaveController');
const deleteLeaveController = getInjection('IDeleteLeaveController');

// A great guide on test names
// https://www.epicweb.dev/talks/how-to-write-better-test-names
it('delete leave', async () => {
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
  await expect(
    deleteLeaveController({ leaveId: leave.id }, cookie.value)
  ).resolves.not.toThrow();
});

it('throws for unauthenticated', async () => {
  await expect(
    deleteLeaveController({ leaveId: 3 }, undefined)
  ).rejects.toBeInstanceOf(UnauthenticatedError);
});

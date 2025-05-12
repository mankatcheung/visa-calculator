import { expect, it } from 'vitest';

import { getInjection } from '@/di/container';
import { UnauthorizedError } from '@/src/entities/errors/auth';
import { NotFoundError } from '@/src/entities/errors/common';

const signInUseCase = getInjection('ISignInUseCase');
const createLeaveUseCase = getInjection('ICreateLeaveUseCase');
const deleteLeaveUseCase = getInjection('IDeleteLeaveUseCase');
const getLeavesForUserUseCase = getInjection('IGetLeavesForUserUseCase');
const signOutUseCase = getInjection('ISignOutUseCase');
// A great guide on test names
// https://www.epicweb.dev/talks/how-to-write-better-test-names
it('deletes leave', async () => {
  const { session } = await signInUseCase({
    email: 'one@test.com',
    password: 'password-one',
  });

  const startDate = new Date(2025, 5, 7);
  const endDate = new Date(2025, 5, 10);
  const leave = await createLeaveUseCase(
    {
      startDate,
      endDate,
      color: '#333333',
      remarks: 'Testing remarks',
    },
    session.userId
  );

  // Deletion returns the deleted object
  await expect(
    deleteLeaveUseCase({ leaveId: leave.id }, session.userId)
  ).resolves.toMatchObject({
    startDate,
    endDate,
    color: '#333333',
    remarks: 'Testing remarks',
    userId: '1',
  });

  // Todos should be empty at this point
  await expect(getLeavesForUserUseCase(session.userId)).resolves.toMatchObject(
    []
  );
});

it('throws when unauthorized', async () => {
  const { session: sessionOne } = await signInUseCase({
    email: 'one@test.com',
    password: 'password-one',
  });

  const startDate = new Date(2025, 5, 7);
  const endDate = new Date(2025, 5, 10);
  const leave = await createLeaveUseCase(
    {
      startDate,
      endDate,
      color: '#333333',
      remarks: 'Testing remarks',
    },
    sessionOne.userId
  );

  await signOutUseCase(sessionOne.id);

  const { session: sessionTwo } = await signInUseCase({
    email: 'two@test.com',
    password: 'password-two',
  });

  await expect(
    deleteLeaveUseCase({ leaveId: leave.id }, sessionTwo.userId)
  ).rejects.toBeInstanceOf(UnauthorizedError);
});

it('throws for invalid input', async () => {
  const { session } = await signInUseCase({
    email: 'one@test.com',
    password: 'password-one',
  });

  await expect(
    deleteLeaveUseCase({ leaveId: 1234567890 }, session.userId)
  ).rejects.toBeInstanceOf(NotFoundError);
});

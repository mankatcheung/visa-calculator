import { expect, it } from 'vitest';

import { getInjection } from '@/di/container';
import { UnauthenticatedError } from '@/src/entities/errors/auth';
import { InputParseError } from '@/src/entities/errors/common';

const signInUseCase = getInjection('ISignInUseCase');
const createLeaveController = getInjection('ICreateLeaveController');
const updateLeaveController = getInjection('IUpdateLeaveController');

// A great guide on test names
// https://www.epicweb.dev/talks/how-to-write-better-test-names
it('update leave', async () => {
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
  const updateData = {
    id: leave.id.toString(),
    startDate: new Date(2025, 5, 1).toUTCString(),
    endDate: new Date(2025, 5, 3).toUTCString(),
    color: '#222222',
    remarks: 'New testing remarks',
  };
  await expect(
    updateLeaveController(updateData, cookie.value)
  ).resolves.toMatchObject({
    id: leave.id,
    startDate: new Date(2025, 5, 1),
    endDate: new Date(2025, 5, 3),
    color: '#222222',
    remarks: 'New testing remarks',
    userId: '1',
  });
});

it('throws for invalid input', async () => {
  const { cookie } = await signInUseCase({
    email: 'one@test.com',
    password: 'password-one',
  });

  await expect(createLeaveController({}, cookie.value)).rejects.toBeInstanceOf(
    InputParseError
  );

  const startDate = new Date(2025, 5, 6).toUTCString();
  const endDate = new Date(2025, 5, 1).toUTCString();
  await expect(
    updateLeaveController(
      {
        id: '1',
        startDate,
        endDate,
        color: '#333333',
        remarks: 'Testing remarks',
      },
      cookie.value
    )
  ).rejects.toBeInstanceOf(InputParseError);
});

it('throws for unauthenticated', async () => {
  const startDate = new Date(2025, 5, 6).toUTCString();
  const endDate = new Date(2025, 5, 1).toUTCString();
  await expect(
    updateLeaveController(
      {
        id: '123',
        startDate,
        endDate,
        color: '#333333',
        remarks: 'Testing remarks',
      },
      undefined
    )
  ).rejects.toBeInstanceOf(UnauthenticatedError);
});

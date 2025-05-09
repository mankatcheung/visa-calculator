import { expect, it } from 'vitest';

import { getInjection } from '@/di/container';
import { InputParseError } from '@/src/entities/errors/common';
import { UnauthenticatedError } from '@/src/entities/errors/auth';

const signInUseCase = getInjection('ISignInUseCase');
const createLeaveController = getInjection('ICreateLeaveController');

// A great guide on test names
// https://www.epicweb.dev/talks/how-to-write-better-test-names
it('creates leave', async () => {
  const { cookie } = await signInUseCase({
    email: 'one@test.com',
    password: 'password-one',
  });

  const startDate = new Date(2025, 5, 6).toUTCString();
  const endDate = new Date(2025, 5, 10).toUTCString();

  await expect(
    createLeaveController(
      { startDate, endDate, color: '#333333', remarks: 'Testing remarks' },
      cookie.value
    )
  ).resolves.toMatchObject({
    startDate: new Date(2025, 5, 6),
    endDate: new Date(2025, 5, 10),
    color: '#333333',
    remarks: 'Testing remarks',
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
    createLeaveController(
      { startDate, endDate, color: '#333333', remarks: 'Testing remarks' },
      cookie.value
    )
  ).rejects.toBeInstanceOf(InputParseError);
});

it('throws for unauthenticated', async () => {
  const startDate = new Date(2025, 5, 6).toUTCString();
  const endDate = new Date(2025, 5, 1).toUTCString();
  await expect(
    createLeaveController(
      { startDate, endDate, color: '#333333', remarks: 'Testing remarks' },
      undefined
    )
  ).rejects.toBeInstanceOf(UnauthenticatedError);
});

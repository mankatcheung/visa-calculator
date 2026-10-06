import { afterAll, beforeAll, expect, it, vi } from 'vitest';

import { getInjection } from '@/di/container';
import { NotFoundError } from '@/src/entities/errors/common';

const signUpUseCase = getInjection('ISignUpUseCase');
const createLeaveUseCase = getInjection('ICreateLeaveUseCase');
const createVisaUseCase = getInjection('ICreateVisaUseCase');
const getUserDataExportUseCase = getInjection('IGetUserDataExportUseCase');

beforeAll(() => {
  vi.spyOn(global, 'fetch').mockResolvedValue(
    new Response(null, { status: 200 })
  );
});

afterAll(() => {
  vi.restoreAllMocks();
});

it('returns the user, their visas, and their leaves', async () => {
  const { user } = await signUpUseCase({
    email: 'data-export-success@test.com',
    password: 'data-export-password',
    locale: 'en',
  });

  await createLeaveUseCase(
    {
      startDate: new Date(2025, 5, 1),
      endDate: new Date(2025, 5, 5),
      remarks: 'a note',
    },
    user.id
  );

  await createVisaUseCase(
    {
      country: 'United Kingdom',
      name: 'Skilled Worker',
      startDate: new Date(2025, 5, 5),
      expiryDate: new Date(2030, 5, 5),
      arrivalDate: new Date(2025, 6, 5),
      maxStayDays: null,
      rollingWindowDays: null,
      qualifyingPeriodYears: 5,
      remarks: null,
    },
    user.id
  );

  const result = await getUserDataExportUseCase(user.id);

  expect(result.user).toMatchObject({
    id: user.id,
    email: 'data-export-success@test.com',
  });
  expect(result.visas).toHaveLength(1);
  expect(result.visas[0]).toMatchObject({ userId: user.id, country: 'United Kingdom' });
  expect(result.leaves).toHaveLength(1);
  expect(result.leaves[0]).toMatchObject({ remarks: 'a note' });
});

it('throws for a non-existent user', async () => {
  await expect(
    getUserDataExportUseCase('non-existent-id')
  ).rejects.toBeInstanceOf(NotFoundError);
});

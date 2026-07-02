import { afterAll, beforeAll, expect, it, vi } from 'vitest';

import { getInjection } from '@/di/container';
import { NotFoundError } from '@/src/entities/errors/common';

const signUpUseCase = getInjection('ISignUpUseCase');
const createLeaveUseCase = getInjection('ICreateLeaveUseCase');
const getUserDataExportUseCase = getInjection('IGetUserDataExportUseCase');

beforeAll(() => {
  vi.spyOn(global, 'fetch').mockResolvedValue(
    new Response(null, { status: 200 })
  );
});

afterAll(() => {
  vi.restoreAllMocks();
});

it('returns the user, their settings, and their leaves', async () => {
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

  const result = await getUserDataExportUseCase(user.id);

  expect(result.user).toMatchObject({
    id: user.id,
    email: 'data-export-success@test.com',
  });
  expect(result.settings).toMatchObject({ userId: user.id });
  expect(result.leaves).toHaveLength(1);
  expect(result.leaves[0]).toMatchObject({ remarks: 'a note' });
});

it('throws for a non-existent user', async () => {
  await expect(
    getUserDataExportUseCase('non-existent-id')
  ).rejects.toBeInstanceOf(NotFoundError);
});

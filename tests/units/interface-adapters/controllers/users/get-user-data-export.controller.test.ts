import { afterAll, beforeAll, expect, it, vi } from 'vitest';

import { getInjection } from '@/di/container';
import { UnauthenticatedError } from '@/src/entities/errors/auth';

const signUpUseCase = getInjection('ISignUpUseCase');
const getUserDataExportController = getInjection(
  'IGetUserDataExportController'
);

beforeAll(() => {
  vi.spyOn(global, 'fetch').mockResolvedValue(
    new Response(null, { status: 200 })
  );
});

afterAll(() => {
  vi.restoreAllMocks();
});

it('returns a safe export excluding the password hash', async () => {
  const { cookie, user } = await signUpUseCase({
    email: 'data-export-controller-success@test.com',
    password: 'data-export-password',
    locale: 'en',
  });

  const result = await getUserDataExportController(cookie.value);

  expect(result).toMatchObject({
    account: { id: user.id, email: 'data-export-controller-success@test.com' },
    leaves: [],
  });
  expect(result).toHaveProperty('exportedAt');
  expect(result.account).not.toHaveProperty('passwordHash');
  expect(JSON.stringify(result)).not.toContain(user.passwordHash);
});

it('throws for unauthenticated', async () => {
  await expect(
    getUserDataExportController(undefined)
  ).rejects.toBeInstanceOf(UnauthenticatedError);
});

import { afterAll, beforeAll, expect, it, vi } from 'vitest';

import { getInjection } from '@/di/container';
import { AuthenticationError } from '@/src/entities/errors/auth';

const signInUseCase = getInjection('ISignInUseCase');
const signUpUseCase = getInjection('ISignUpUseCase');
const updateUserPasswordUseCase = getInjection('IUpdateUserPasswordUseCase');

const TEST_VERIFY_BASE_URL = 'http://localhost:3000/en/verify-email';

beforeAll(() => {
  vi.spyOn(global, 'fetch').mockResolvedValue(
    new Response(null, { status: 200 })
  );
});

afterAll(() => {
  vi.restoreAllMocks();
});

it('update user password', async () => {
  const { session, user } = await signUpUseCase({
    email: 'four@test.com',
    password: 'password-four',
    verifyBaseUrl: TEST_VERIFY_BASE_URL,
  });

  await updateUserPasswordUseCase(
    {
      currentPassword: 'password-four',
      newPassword: 'password-four-new',
      currentPasswordHash: user.passwordHash,
    },
    session.userId
  );

  const result = await signInUseCase({
    email: 'four@test.com',
    password: 'password-four-new',
  });
  expect(result).toHaveProperty('session');
  expect(result).toHaveProperty('cookie');
  expect(result.session.userId).toBe(session.userId);
});

it('throws authentication error', async () => {
  const { session, user } = await signUpUseCase({
    email: 'five@test.com',
    password: 'password-five',
    verifyBaseUrl: TEST_VERIFY_BASE_URL,
  });
  await expect(
    updateUserPasswordUseCase(
      {
        currentPassword: 'password-five-wrong',
        newPassword: 'doesntmatter',
        currentPasswordHash: user.passwordHash,
      },
      session.userId
    )
  ).rejects.toBeInstanceOf(AuthenticationError);
});

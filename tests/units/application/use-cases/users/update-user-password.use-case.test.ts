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
    email: 'six@test.com',
    password: 'password-six',
    verifyBaseUrl: TEST_VERIFY_BASE_URL,
  });

  await updateUserPasswordUseCase(
    {
      currentPassword: 'password-six',
      newPassword: 'password-six-new',
      currentPasswordHash: user.passwordHash,
    },
    session.userId
  );

  const result = await signInUseCase({
    email: 'six@test.com',
    password: 'password-six-new',
  });
  expect(result).toHaveProperty('session');
  expect(result).toHaveProperty('cookie');
  expect(result.session.userId).toBe(session.userId);
});

it('throws authentication error', async () => {
  const { session, user } = await signUpUseCase({
    email: 'seven@test.com',
    password: 'password-seven',
    verifyBaseUrl: TEST_VERIFY_BASE_URL,
  });
  await expect(
    updateUserPasswordUseCase(
      {
        currentPassword: 'password-seven-wrong',
        newPassword: 'doesntmatter',
        currentPasswordHash: user.passwordHash,
      },
      session.userId
    )
  ).rejects.toBeInstanceOf(AuthenticationError);
});

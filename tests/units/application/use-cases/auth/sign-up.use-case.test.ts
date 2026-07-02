import { afterAll, beforeAll, expect, it, vi } from 'vitest';

import { getInjection } from '@/di/container';
import { AuthenticationError } from '@/src/entities/errors/auth';

const signUpUseCase = getInjection('ISignUpUseCase');

beforeAll(() => {
  vi.spyOn(global, 'fetch').mockResolvedValue(
    new Response(null, { status: 200 })
  );
});

afterAll(() => {
  vi.restoreAllMocks();
});

// A great guide on test names
// https://www.epicweb.dev/talks/how-to-write-better-test-names
it('returns session and cookie', async () => {
  const result = await signUpUseCase({
    email: 'new@test.com',
    password: 'password-new',
    locale: 'en',
  });
  expect(result).toHaveProperty('session');
  expect(result).toHaveProperty('cookie');
  expect(result).toHaveProperty('user');
});

it('throws for invalid input', async () => {
  await expect(() =>
    signUpUseCase({
      email: 'one@test.com',
      password: 'doesntmatter',
      locale: 'en',
    })
  ).rejects.toBeInstanceOf(AuthenticationError);
});

import { expect, it } from 'vitest';

import { getInjection } from '@/di/container';
import { AuthenticationError } from '@/src/entities/errors/auth';

const signUpUseCase = getInjection('ISignUpUseCase');

// A great guide on test names
// https://www.epicweb.dev/talks/how-to-write-better-test-names
it('returns session and cookie', async () => {
  const result = await signUpUseCase({
    email: 'new@test.com',
    password: 'password-new',
  });
  expect(result).toHaveProperty('session');
  expect(result).toHaveProperty('cookie');
  expect(result).toHaveProperty('user');
});

it('throws for invalid input', async () => {
  await expect(() =>
    signUpUseCase({ email: 'one@test.com', password: 'doesntmatter' })
  ).rejects.toBeInstanceOf(AuthenticationError);
});

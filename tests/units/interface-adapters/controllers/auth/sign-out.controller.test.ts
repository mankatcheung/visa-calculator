import { expect, it } from 'vitest';

import { SESSION_COOKIE } from '@/config';

import { getInjection } from '@/di/container';
import { InputParseError } from '@/src/entities/errors/common';

const signInUseCase = getInjection('ISignInUseCase');
const signOutController = getInjection('ISignOutController');

// A great guide on test names
// https://www.epicweb.dev/talks/how-to-write-better-test-names
it('returns blank cookie', async () => {
  const { cookie } = await signInUseCase({
    email: 'one@test.com',
    password: 'password-one',
  });
  const token = cookie.value;

  await expect(signOutController(token)).resolves.toMatchObject({
    name: SESSION_COOKIE,
    value: '',
    attributes: {},
  });
});

it('throws for invalid input', async () => {
  await expect(signOutController(undefined)).rejects.toBeInstanceOf(
    InputParseError
  );
});

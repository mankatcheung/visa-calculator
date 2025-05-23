import { expect, it } from 'vitest';

import { SESSION_COOKIE } from '@/config';

import { getInjection } from '@/di/container';
import { AuthenticationError } from '@/src/entities/errors/auth';
import { InputParseError } from '@/src/entities/errors/common';

const signUpController = getInjection('ISignUpController');

// A great guide on test names
// https://www.epicweb.dev/talks/how-to-write-better-test-names
it('returns cookie', async () => {
  const { cookie, user } = await signUpController({
    email: 'newUser@test.com',
    password: 'password',
    confirmPassword: 'password',
  });

  expect(user).toBeDefined();
  expect(cookie).toMatchObject({
    name: SESSION_COOKIE,
    attributes: {},
  });
});

it('throws for invalid input', async () => {
  // empty object
  await expect(signUpController({})).rejects.toBeInstanceOf(InputParseError);

  // below min length
  await expect(
    signUpController({
      email: 'no',
      password: 'no',
      confirmPassword: 'nah',
    })
  ).rejects.toBeInstanceOf(InputParseError);

  // wrong passwords
  await expect(
    signUpController({
      email: 'nikolovlazar',
      password: 'password',
      confirmPassword: 'passwords',
    })
  ).rejects.toBeInstanceOf(InputParseError);
});

it('throws for existing email', async () => {
  await expect(
    signUpController({
      email: 'one@test.com',
      password: 'doesntmatter',
      confirmPassword: 'doesntmatter',
    })
  ).rejects.toBeInstanceOf(AuthenticationError);
});

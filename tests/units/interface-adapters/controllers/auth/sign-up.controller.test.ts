import { afterAll, beforeAll, expect, it, vi } from 'vitest';

import { SESSION_COOKIE } from '@/config';

import { getInjection } from '@/di/container';
import { AuthenticationError } from '@/src/entities/errors/auth';
import { InputParseError } from '@/src/entities/errors/common';

const signUpController = getInjection('ISignUpController');

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
it('returns cookie', async () => {
  const { cookie, user } = await signUpController({
    email: 'newUser@test.com',
    password: 'password',
    confirmPassword: 'password',
    locale: 'en',
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
      locale: 'en',
    })
  ).rejects.toBeInstanceOf(InputParseError);

  // wrong passwords
  await expect(
    signUpController({
      email: 'nikolovlazar',
      password: 'password',
      confirmPassword: 'passwords',
      locale: 'en',
    })
  ).rejects.toBeInstanceOf(InputParseError);

  // unsupported locale
  await expect(
    signUpController({
      email: 'someone@test.com',
      password: 'password',
      confirmPassword: 'password',
      // @ts-expect-error intentionally invalid locale
      locale: 'fr',
    })
  ).rejects.toBeInstanceOf(InputParseError);
});

it('throws for existing email', async () => {
  await expect(
    signUpController({
      email: 'one@test.com',
      password: 'doesntmatter',
      confirmPassword: 'doesntmatter',
      locale: 'en',
    })
  ).rejects.toBeInstanceOf(AuthenticationError);
});

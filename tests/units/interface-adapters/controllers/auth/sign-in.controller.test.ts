import { expect, it } from 'vitest';

import { getInjection } from '@/di/container';
import { SESSION_COOKIE } from '@/config';
import { InputParseError } from '@/src/entities/errors/common';
import { AuthenticationError } from '@/src/entities/errors/auth';

const signInController = getInjection('ISignInController');

// A great guide on test names
// https://www.epicweb.dev/talks/how-to-write-better-test-names
it('signs in with valid input', async () => {
  await expect(
    signInController({ email: 'one@test.com', password: 'password-one' })
  ).resolves.toMatchObject({
    name: SESSION_COOKIE,
    attributes: {},
  });
});

it('throws for invalid input', async () => {
  await expect(signInController({ email: '' })).rejects.toBeInstanceOf(
    InputParseError
  );
  await expect(signInController({ password: '' })).rejects.toBeInstanceOf(
    InputParseError
  );
  await expect(signInController({ email: 'no' })).rejects.toBeInstanceOf(
    InputParseError
  );
  await expect(signInController({ password: 'no' })).rejects.toBeInstanceOf(
    InputParseError
  );
  await expect(
    signInController({ email: 'one@test.com', password: 'short' })
  ).rejects.toBeInstanceOf(InputParseError);
  await expect(
    signInController({
      email: 'oneverylongemailthatmakesnosense',
      password: 'short',
    })
  ).rejects.toBeInstanceOf(InputParseError);
  await expect(
    signInController({
      email: 'one@test.com',
      password: 'oneverylongpasswordthatmakesnosense',
    })
  ).rejects.toBeInstanceOf(InputParseError);
  await expect(
    signInController({
      email: 'oneverylongemailthatmakesnosense',
      password: 'oneverylongpasswordthatmakesnosense',
    })
  ).rejects.toBeInstanceOf(InputParseError);
});

it('throws for invalid credentials', async () => {
  await expect(
    signInController({ email: 'one@test.com', password: 'wrongpass' })
  ).rejects.toBeInstanceOf(AuthenticationError);
});

import { expect, it } from 'vitest';

import { getInjection } from '@/di/container';
import { UnauthenticatedError } from '@/src/entities/errors/auth';
import { InputParseError } from '@/src/entities/errors/common';

const signInUseCase = getInjection('ISignInUseCase');
const updateUserEmailController = getInjection('IUpdateUserEmailController');

// A great guide on test names
// https://www.epicweb.dev/talks/how-to-write-better-test-names
it('update user email', async () => {
  const { cookie } = await signInUseCase({
    email: 'one@test.com',
    password: 'password-one',
  });

  await expect(
    updateUserEmailController(
      {
        email: 'one-new@test.com',
      },
      cookie.value
    )
  ).resolves.toMatchObject({
    id: '1',
    email: 'one-new@test.com',
  });
});

it('throws for invalid input', async () => {
  const { cookie } = await signInUseCase({
    email: 'two@test.com',
    password: 'password-two',
  });

  await expect(
    updateUserEmailController({ email: 'thisisnotanemail' }, cookie.value)
  ).rejects.toBeInstanceOf(InputParseError);

  await expect(
    updateUserEmailController({}, cookie.value)
  ).rejects.toBeInstanceOf(InputParseError);
});

it('throws for unauthenticated', async () => {
  await expect(
    updateUserEmailController(
      {
        email: 'one-new@test.com',
      },
      undefined
    )
  ).rejects.toBeInstanceOf(UnauthenticatedError);
});

import { expect, it } from 'vitest';

import { getInjection } from '@/di/container';
import { UnauthenticatedError } from '@/src/entities/errors/auth';
import { InputParseError } from '@/src/entities/errors/common';

const signInUseCase = getInjection('ISignInUseCase');
const updateUserPasswordController = getInjection(
  'IUpdateUserPasswordController'
);

// A great guide on test names
// https://www.epicweb.dev/talks/how-to-write-better-test-names
it('update user password', async () => {
  const { cookie } = await signInUseCase({
    email: 'one@test.com',
    password: 'password-one',
  });
  await expect(
    updateUserPasswordController(
      {
        currentPassword: 'password-one',
        newPassword: 'password-one-new',
        confirmPassword: 'password-one-new',
      },
      cookie.value
    )
  ).resolves.toMatchObject({
    id: '1',
    email: 'one@test.com',
  });
});

it('throws for invalid input', async () => {
  const { cookie } = await signInUseCase({
    email: 'two@test.com',
    password: 'password-two',
  });

  await expect(
    updateUserPasswordController(
      {
        currentPassword: 'password-two',
        newPassword: 'password-two-new',
        confirmPassword: 'password-two-new-new',
      },
      cookie.value
    )
  ).rejects.toBeInstanceOf(InputParseError);

  await expect(
    updateUserPasswordController({}, cookie.value)
  ).rejects.toBeInstanceOf(InputParseError);
});

it('throws for unauthenticated', async () => {
  await expect(
    updateUserPasswordController(
      {
        currentPassword: 'password-one',
        newPassword: 'password-one-new',
        confirmPassword: 'password-one-new',
      },
      undefined
    )
  ).rejects.toBeInstanceOf(UnauthenticatedError);
});

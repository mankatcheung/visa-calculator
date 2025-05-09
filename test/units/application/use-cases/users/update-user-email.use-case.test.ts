import { getInjection } from '@/di/container';
import { InputParseError } from '@/src/entities/errors/common';
import { expect, it } from 'vitest';

const signInUseCase = getInjection('ISignInUseCase');
const updateUserEmailUseCase = getInjection('IUpdateUserEmailUseCase');
const getUserUseCase = getInjection('IGetUserUseCase');

it('update user email', async () => {
  const { session } = await signInUseCase({
    email: 'one@test.com',
    password: 'password-one',
  });

  await updateUserEmailUseCase({ email: 'one-new@test.com' }, session.userId);
  await expect(getUserUseCase(session.userId)).resolves.toMatchObject({
    id: '1',
    email: 'one-new@test.com',
  });
});

it('throws when email is used', async () => {
  const { session } = await signInUseCase({
    email: 'two@test.com',
    password: 'password-two',
  });

  await expect(
    updateUserEmailUseCase({ email: 'three@test.com' }, session.userId)
  ).rejects.toBeInstanceOf(InputParseError);
});

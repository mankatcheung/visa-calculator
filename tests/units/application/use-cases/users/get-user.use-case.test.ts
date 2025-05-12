import { expect, it } from 'vitest';

import { getInjection } from '@/di/container';
import { NotFoundError } from '@/src/entities/errors/common';

const signInUseCase = getInjection('ISignInUseCase');
const getUserUseCase = getInjection('IGetUserUseCase');

it('get user', async () => {
  const { session } = await signInUseCase({
    email: 'one@test.com',
    password: 'password-one',
  });

  await expect(getUserUseCase(session.userId)).resolves.toMatchObject({
    id: '1',
    email: 'one@test.com',
  });
});

it('throws not found error', async () => {
  await expect(getUserUseCase('doesntmatter')).rejects.toBeInstanceOf(
    NotFoundError
  );
});

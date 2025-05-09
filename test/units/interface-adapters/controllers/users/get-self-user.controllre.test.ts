import { expect, it } from 'vitest';

import { getInjection } from '@/di/container';
import { UnauthenticatedError } from '@/src/entities/errors/auth';

const signInUseCase = getInjection('ISignInUseCase');
const getSelfUserController = getInjection('IGetSelfUserController');

// A great guide on test names
// https://www.epicweb.dev/talks/how-to-write-better-test-names
it('get self user', async () => {
  const { cookie } = await signInUseCase({
    email: 'one@test.com',
    password: 'password-one',
  });

  await expect(getSelfUserController(cookie.value)).resolves.toMatchObject({
    id: '1',
    email: 'one@test.com',
  });
});

it('throws for unauthenticated', async () => {
  await expect(getSelfUserController(undefined)).rejects.toBeInstanceOf(
    UnauthenticatedError
  );
});

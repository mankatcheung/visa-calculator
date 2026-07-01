import { afterAll, beforeAll, expect, it } from 'vitest';
import { vi } from 'vitest';

import { getInjection } from '@/di/container';
import { InputParseError } from '@/src/entities/errors/common';
import { UnauthenticatedError } from '@/src/entities/errors/auth';

const signInUseCase = getInjection('ISignInUseCase');
const requestEmailChangeController = getInjection(
  'IRequestEmailChangeController'
);

beforeAll(() => {
  vi.spyOn(global, 'fetch').mockResolvedValue(
    new Response(null, { status: 200 })
  );
});

afterAll(() => {
  vi.restoreAllMocks();
});

it('returns pendingEmail', async () => {
  const { cookie } = await signInUseCase({
    email: 'one@test.com',
    password: 'password-one',
  });

  await expect(
    requestEmailChangeController({ email: 'one-ctrl-new@test.com' }, cookie.value)
  ).resolves.toMatchObject({ pendingEmail: 'one-ctrl-new@test.com' });
});

it('throws for invalid email', async () => {
  const { cookie } = await signInUseCase({
    email: 'one@test.com',
    password: 'password-one',
  });

  await expect(
    requestEmailChangeController({ email: 'not-an-email' }, cookie.value)
  ).rejects.toBeInstanceOf(InputParseError);
});

it('throws for unauthenticated', async () => {
  await expect(
    requestEmailChangeController({ email: 'any@test.com' }, undefined)
  ).rejects.toBeInstanceOf(UnauthenticatedError);
});

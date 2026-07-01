import { afterAll, beforeAll, expect, it } from 'vitest';
import { vi } from 'vitest';

import { getInjection } from '@/di/container';
import { InputParseError } from '@/src/entities/errors/common';

const signInUseCase = getInjection('ISignInUseCase');
const requestEmailChangeUseCase = getInjection('IRequestEmailChangeUseCase');

beforeAll(() => {
  vi.spyOn(global, 'fetch').mockResolvedValue(
    new Response(null, { status: 200 })
  );
});

afterAll(() => {
  vi.restoreAllMocks();
});

it('returns pendingEmail on valid new address', async () => {
  const { session } = await signInUseCase({
    email: 'one@test.com',
    password: 'password-one',
  });

  await expect(
    requestEmailChangeUseCase({ email: 'one-new@test.com' }, session.userId)
  ).resolves.toMatchObject({ pendingEmail: 'one-new@test.com' });
});

it('throws when email is already taken', async () => {
  const { session } = await signInUseCase({
    email: 'two@test.com',
    password: 'password-two',
  });

  await expect(
    requestEmailChangeUseCase({ email: 'three@test.com' }, session.userId)
  ).rejects.toBeInstanceOf(InputParseError);
});

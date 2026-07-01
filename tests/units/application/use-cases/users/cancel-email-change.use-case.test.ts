import { afterAll, beforeAll, expect, it } from 'vitest';
import { vi } from 'vitest';

import { getInjection } from '@/di/container';

const signInUseCase = getInjection('ISignInUseCase');
const requestEmailChangeUseCase = getInjection('IRequestEmailChangeUseCase');
const cancelEmailChangeUseCase = getInjection('ICancelEmailChangeUseCase');

beforeAll(() => {
  vi.spyOn(global, 'fetch').mockResolvedValue(
    new Response(null, { status: 200 })
  );
});

afterAll(() => {
  vi.restoreAllMocks();
});

it('removes the pending token so a new request can be made', async () => {
  const { session } = await signInUseCase({
    email: 'one@test.com',
    password: 'password-one',
  });

  await requestEmailChangeUseCase(
    { email: 'cancel-target@test.com' },
    session.userId
  );

  await expect(cancelEmailChangeUseCase(session.userId)).resolves.toBeUndefined();

  // After cancel, a new request for the same email should succeed
  await expect(
    requestEmailChangeUseCase({ email: 'cancel-target@test.com' }, session.userId)
  ).resolves.toMatchObject({ pendingEmail: 'cancel-target@test.com' });
});

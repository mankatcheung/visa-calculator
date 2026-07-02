import { afterAll, beforeAll, expect, it, vi } from 'vitest';

import { getInjection } from '@/di/container';
import { InputParseError } from '@/src/entities/errors/common';

const signInUseCase = getInjection('ISignInUseCase');
const requestPasswordResetController = getInjection(
  'IRequestPasswordResetController'
);
const resetPasswordController = getInjection('IResetPasswordController');
const sessionsRepository = getInjection('ISessionRepository');

let capturedToken = '';

beforeAll(() => {
  vi.spyOn(global, 'fetch').mockImplementation(async (_url, options) => {
    const body = options?.body ? String(options.body) : '';
    const match = body.match(/token=([a-z0-9]+)/);
    if (match) capturedToken = match[1];
    return new Response(null, { status: 200 });
  });
});

afterAll(() => {
  vi.restoreAllMocks();
});

it('throws for invalid input', async () => {
  await expect(resetPasswordController({})).rejects.toBeInstanceOf(
    InputParseError
  );
});

it('rolls back the whole reset if a later step fails, leaving nothing committed', async () => {
  const { session } = await signInUseCase({
    email: 'reset-password-rollback-seed@test.com',
    password: 'reset-password-rollback-seed',
  });

  await requestPasswordResetController({
    email: 'reset-password-rollback-seed@test.com',
    locale: 'en',
  });
  expect(capturedToken).not.toBe('');

  // Force the last write in the transaction (session revocation) to fail,
  // simulating a transient infra error after the password/token writes
  // have already been queued but before the transaction commits.
  vi.spyOn(sessionsRepository, 'deleteUserSession').mockImplementationOnce(
    async () => {
      throw new Error('simulated failure');
    }
  );

  await expect(
    resetPasswordController({
      token: capturedToken,
      password: 'rollback-new-pw',
      confirmPassword: 'rollback-new-pw',
    })
  ).rejects.toThrow('simulated failure');

  // Nothing from the failed attempt should have been committed: the old
  // password still works...
  await expect(
    signInUseCase({
      email: 'reset-password-rollback-seed@test.com',
      password: 'reset-password-rollback-seed',
    })
  ).resolves.toHaveProperty('session');

  // ...and the pre-existing session was never revoked.
  await expect(sessionsRepository.getSession(session.id)).resolves.toBeTruthy();
});

import { afterAll, beforeAll, expect, it, vi } from 'vitest';

import { getInjection } from '@/di/container';
import { AuthenticationError } from '@/src/entities/errors/auth';

const signInUseCase = getInjection('ISignInUseCase');
const requestPasswordResetUseCase = getInjection(
  'IRequestPasswordResetUseCase'
);
const resetPasswordUseCase = getInjection('IResetPasswordUseCase');
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

it('revokes every existing session after a successful reset', async () => {
  const { session: sessionA } = await signInUseCase({
    email: 'password-reset-seed@test.com',
    password: 'password-reset-seed',
  });
  const { session: sessionB } = await signInUseCase({
    email: 'password-reset-seed@test.com',
    password: 'password-reset-seed',
  });

  await requestPasswordResetUseCase('password-reset-seed@test.com', 'en');
  expect(capturedToken).not.toBe('');

  await resetPasswordUseCase(capturedToken, 'password-reset-seed-new');

  // Both prior sessions must be gone: forgot-password is an
  // account-recovery flow and there is no "current" session to spare.
  await expect(
    sessionsRepository.getSession(sessionA.id)
  ).resolves.toBeUndefined();
  await expect(
    sessionsRepository.getSession(sessionB.id)
  ).resolves.toBeUndefined();

  // The new password works.
  await expect(
    signInUseCase({
      email: 'password-reset-seed@test.com',
      password: 'password-reset-seed-new',
    })
  ).resolves.toHaveProperty('session');
});

it('throws for an invalid or unknown token', async () => {
  await expect(
    resetPasswordUseCase('not-a-real-token', 'doesntmatter')
  ).rejects.toBeInstanceOf(AuthenticationError);
});
